// Group Pitch — single-device version.
// Sits on a Group track. The Semitones knob IS the pitch of every child MIDI
// track: its native Pitch device is set to the knob value, absolutely. Not an
// offset, not per-track baselines - one number, everything matches it.
//
// Audio clips work differently, and they have to. A Pitch device transposes
// live, so the device can own that number outright. Audio is already rendered:
// when you bounce a MIDI track to audio the transposition is baked into the
// samples, so setting the new clip's Transpose to the knob as well shifts it
// twice. A clip is therefore pitched RELATIVE to the knob position at the
// moment it first appeared - which is exactly what got baked into it - so a
// fresh bounce lands at 0 and stays in key, and still follows the knob after.
//
// It watches the group for changes and re-scans itself — adding a track, an
// instrument, a Pitch device or a clip is picked up without touching anything.

autowatch = 1;
inlets = 2;   // 0 = dial + messages, 1 = step buttons (bare ints)
outlets = 2;   // 0 = status text, 1 = new knob value (back into Semitones)

var entries = [];    // {kind:"param"|"clip", key, api, label, min, max, base, origin, offset, wrote}
var prevClips = {};  // clip key -> previous entry, so base/origin survive a rescan
var prevParams = {}; // param key -> previous entry, so hand-set offsets survive a rescan
var appliedKnob = 0; // knob at the last apply(), the anchor for spotting hand edits
var scanIsInitial = false;
var EPS = 0.0001;
var lastVal = 0;
var ready = false;
var verbose = false;   // `verbose 1` to this js re-enables the scan-log.txt trace
var myDeviceName = "";
var KNOB_RANGE = 24;   // matches the Semitones dial in the patch
var lastStatusText = "";
var jsthis = this;

var watchers = [];       // live observers, held in a global so they stay alive
var armed = false;       // observers ignore their own first callback
var scanning = false;
var rescanTask = null, armTask = null;
var lastApplyTime = 0;   // param callbacks inside this window are our own writes

// live.thisdevice bang -> device fully loaded. The patch bangs the knob first
// so lastVal already holds the restored knob value before we touch anything.
function bang() {
    scan(1);
}

// The knob is the only source of truth. Never trust the cached lastVal at scan
// time: this js instance's globals reset whenever the file is reloaded
// (autowatch), the device is duplicated, or the patcher is edited, while the
// knob on screen keeps its value.
function knobValue() {
    try {
        var n = jsthis.patcher.getnamed("Semitones");
        if (n) {
            var v = n.getvalueof();
            if (v instanceof Array) v = v[0];
            v = Number(v);
            if (!isNaN(v)) return v;
        }
    } catch (err) { /* fall back to the cached value */ }
    return lastVal;
}

// Every scan appends what it saw and why to scan-log.txt next to the device,
// so a misbehaving pitch can be read back afterwards instead of guessed at.
// Send this object `verbose 0` to switch it off, or just delete the file.
var LOGFILE = "/Users/imnotbink/Music/Ableton/User Library/!! imnotbink/my tools/GroupPitch/scan-log.txt";
var logBuf = [];

function log(s) {
    if (!verbose) return;
    post("GroupPitch: " + s + "\n");
    logBuf.push(s);
}

function flushLog() {
    if (!verbose || logBuf.length === 0) { logBuf = []; return; }
    try {
        var f = new File(LOGFILE, "readwrite", "TEXT");
        if (!f.isopen) f = new File(LOGFILE, "write", "TEXT");
        if (f.isopen) {
            f.position = (f.eof > 400000) ? 0 : f.eof;   // cap runaway growth
            for (var i = 0; i < logBuf.length; i++) f.writeline(logBuf[i]);
            f.close();
        }
    } catch (err) { post("GroupPitch: could not write scan-log.txt\n"); }
    logBuf = [];
}

function verbose_msg(v) { verbose = (Number(v) !== 0); }

function scan(initial) {
    if (scanning) return;
    scanning = true;
    try { doScan(initial === 1); }
    finally { scanning = false; }
}

function doScan(wasInitial) {
    log("--- scan (" + (wasInitial ? "device load" : "auto") + ") "
        + new Date().toLocaleTimeString() + " knob=" + knobValue()
        + " remembered=" + lastVal + " known=" + entries.length);
    checkHandEdits();      // catch anything moved by hand before we rebuild
    ready = false;
    scanIsInitial = wasInitial;
    prevClips = {};
    prevParams = {};
    for (var pc = 0; pc < entries.length; pc++) {
        if (entries[pc].kind === "clip") prevClips[entries[pc].key] = entries[pc];
        else prevParams[entries[pc].key] = entries[pc];
    }
    entries = [];
    lastVal = knobValue();

    var dev = new LiveAPI("this_device");
    if (!dev || dev.id == 0) {
        status("Load error - reload the set");
        flushLog();
        return;
    }

    var toks = dev.unquotedpath.split(" ");
    if (toks[1] !== "tracks") {
        status("Put me on a Group track");
        flushLog();
        return;
    }
    var track = new LiveAPI(toks.slice(0, 3).join(" "));
    if (Number(track.get("is_foldable")[0]) !== 1) {
        status("Put me on a Group track");
        flushLog();
        return;
    }
    var groupId = Number(track.id);
    var groupName = track.get("name").join(" ");
    myDeviceName = dev.get("name").join(" ");

    // Live's track list is flat; group_track points at the parent. Index it by
    // parent so we can walk the whole subtree under us - a group of groups is
    // just a deeper walk, and every instrument down there gets driven.
    var set = new LiveAPI("live_set");
    var nTracks = set.getcount("tracks");
    var kids = {};
    for (var i = 0; i < nTracks; i++) {
        var tPath = "live_set tracks " + i;
        var t = new LiveAPI(tPath);
        var gt = t.get("group_track");            // ["id", N]
        var parent = (gt && gt.length > 1) ? Number(gt[1]) : 0;
        if (!kids[parent]) kids[parent] = [];
        kids[parent].push({ path: tPath, api: t, id: Number(t.id) });
    }

    var midiKids = 0, midiDriven = 0, audioClips = 0;
    var subGroups = 0, delegated = 0;
    var childPaths = [];
    var stack = (kids[groupId] || []).slice();
    var guard = nTracks + 1;                      // can't visit more than every track

    while (stack.length > 0 && guard-- > 0) {
        var node = stack.shift();
        var t = node.api;

        if (Number(t.get("is_foldable")[0]) === 1) {
            // A sub-group. If it carries its own copy of this device, that copy
            // already drives everything below it - two of us writing the same
            // Pitch params would fight, each reading the other's writes as a
            // hand edit. Leave that subtree to it.
            if (hasOwnInstance(t, node.path)) {
                delegated++;
                log("  sub-group " + t.get("name").join(" ") + ": has its own Group Pitch, skipping subtree");
                continue;
            }
            subGroups++;
            childPaths.push(node.path);           // watch it for a device being added
            var below = kids[node.id] || [];
            for (var b = 0; b < below.length; b++) stack.push(below[b]);
            continue;
        }

        childPaths.push(node.path);
        if (Number(t.get("has_midi_input")[0]) === 1) {
            midiKids++;
            if (addPitchParam(t, node.path)) midiDriven++;
        } else {
            audioClips += addAudioClips(t, node.path);
        }
    }

    ready = true;
    var msg;
    if (midiKids === 0 && audioClips === 0) {
        msg = "nothing to drive";
    } else {
        msg = midiDriven + " trk";
        var offs = 0;
        for (var q = 0; q < entries.length; q++) {
            if (entries[q].kind === "param" && entries[q].offset !== 0) offs++;
        }
        if (offs > 0) msg += " (" + offs + " offset)";
        if (audioClips > 0) msg += ", " + audioClips + " clip" + (audioClips === 1 ? "" : "s");
        if (subGroups > 0) msg += ", " + subGroups + " sub";
        var missing = midiKids - midiDriven;
        if (missing > 0) msg += " - " + missing + " no Pitch";
        if (delegated > 0) msg += " - " + delegated + " own dev";
    }
    status(msg);
    apply();
    for (var e = 0; e < entries.length; e++) {
        log("  = " + entries[e].label + " now at " + targetFor(entries[e]));
    }
    watch(childPaths);
    flushLog();
}

// ---- change detection -------------------------------------------------
// Observe the set's track list, plus each child's device list and clip slots.
// Anything that could add or remove something we drive triggers a rescan, so
// the device keeps up on its own.

function watch(childPaths) {
    unwatch();
    armed = false;
    try {
        addWatcher("live_set", "tracks");
        for (var i = 0; i < childPaths.length; i++) {
            addWatcher(childPaths[i], "devices");
            addWatcher(childPaths[i], "clip_slots");
        }
        for (var p = 0; p < entries.length; p++) {
            if (entries[p].kind === "param") addParamWatcher(entries[p]);
        }
    } catch (err) { log("watch failed: " + err); }

    // Setting .property fires the callback once immediately; ignore that round.
    if (!armTask) armTask = new Task(function () { armed = true; });
    armTask.cancel();
    armTask.schedule(200);
}

// Broken out so each callback closes over its own entry.
function addParamWatcher(e) {
    try {
        var w = new LiveAPI(function (args) { onParamValue(e, args); }, "id " + e.api.id);
        if (!w || w.id == 0) return;
        w.property = "value";
        watchers.push(w);
    } catch (err) { log("param watch failed: " + err); }
}

function addWatcher(path, prop) {
    var w = new LiveAPI(onLiveChange, path);
    if (!w || w.id == 0) return;
    w.property = prop;
    watchers.push(w);
}

function unwatch() {
    for (var i = 0; i < watchers.length; i++) {
        try { watchers[i].property = ""; } catch (err) { /* already gone */ }
    }
    watchers = [];
}

function onLiveChange() {
    if (!armed || scanning) return;
    // Debounce: Live fires several of these for one user action.
    if (!rescanTask) rescanTask = new Task(function () { scan(0); });
    rescanTask.cancel();
    rescanTask.schedule(120);
}

// ---- enumeration ------------------------------------------------------

// Does this sub-group carry its own copy of this device?
function hasOwnInstance(t, tPath) {
    var n = t.getcount("devices");
    for (var j = 0; j < n; j++) {
        var d = new LiveAPI(tPath + " devices " + j);
        if (d.get("class_name")[0] !== "MxDeviceAudioEffect") continue;
        if (d.get("name").join(" ") === myDeviceName) return true;
    }
    return false;
}

// find the first native Pitch (MidiPitcher) on this child, cache its Pitch param
function addPitchParam(t, tPath) {
    var nDevs = t.getcount("devices");
    for (var j = 0; j < nDevs; j++) {
        var d = new LiveAPI(tPath + " devices " + j);
        if (d.get("class_name")[0] !== "MidiPitcher") continue;
        var nPar = d.getcount("parameters");
        for (var k = 0; k < nPar; k++) {
            var p = new LiveAPI(d.unquotedpath + " parameters " + k);
            if (p.get("name").join(" ") === "Pitch") {
                pushEntry("param", "p" + p.id, new LiveAPI("id " + p.id),
                          Number(p.get("value")[0]),
                          Number(p.get("min")[0]), Number(p.get("max")[0]),
                          t.get("name").join(" "));
                return true;
            }
        }
        return false;
    }
    return false;
}

// cache every audio clip on this child track (session + arrangement)
function addAudioClips(t, tPath) {
    var count = 0;
    var nSlots = t.getcount("clip_slots");
    for (var s = 0; s < nSlots; s++) {
        var slot = new LiveAPI(tPath + " clip_slots " + s);
        if (Number(slot.get("has_clip")[0]) !== 1) continue;
        if (addClip(new LiveAPI(tPath + " clip_slots " + s + " clip"))) count++;
    }
    var arr = t.get("arrangement_clips");     // ["id", 1, "id", 2, ...]
    if (arr) {
        for (var a = 0; a < arr.length - 1; a++) {
            if (arr[a] !== "id") continue;
            if (addClip(new LiveAPI("id " + arr[a + 1]))) count++;
        }
    }
    return count;
}

function addClip(c) {
    if (!c || c.id == 0) return false;
    var base = Number(c.get("pitch_coarse")[0]);   // clip Transpose, +-48 st
    pushEntry("clip", "c" + c.id, c, base, -48, 48,
              "clip " + c.get("name").join(" "));
    return true;
}

// A Pitch device carries an `offset`: how far the user has deliberately moved
// that one track away from the group. Normally 0, so the track just sits at
// the knob. Set a track's Pitch by hand and the offset is picked up (see
// checkHandEdits) and honoured from then on - knob -6 with offset -12 puts
// that track at -18, and the interval holds as the knob moves.
//
//   - a track discovered while running starts at offset 0 and joins the
//     group. That is what stops a duplicated track from keeping the pitch
//     that was copied into it.
//   - at device load the saved value already reads knob + offset, so the
//     offset is recovered as current - knob, restoring every interval.
//   - to clear an offset, set that Pitch device back to the knob value; the
//     offset lands on 0 by itself.
//
// A clip remembers two things, captured the first time it is ever seen: the
// Transpose it arrived with (base) and where the knob was at that moment
// (origin, i.e. how much pitch is already baked into the audio). It is then
// driven to base + (knob - origin). A clip bounced at knob -6 arrives with -6
// in the samples and 0 on the dial, and stays there until the knob moves.
function pushEntry(kind, key, api, current, min, max, label) {
    var e = { kind: kind, key: key, api: api, label: label, min: min, max: max,
              base: 0, origin: 0, offset: 0, wrote: null };
    if (kind === "param") {
        var pp = prevParams[key];
        if (pp !== undefined) {                // keep the interval across a rescan
            e.offset = pp.offset;
            e.wrote = pp.wrote;
        } else if (scanIsInitial) {            // saved value already reads knob + offset
            e.offset = current - lastVal;
        }
    }
    if (kind === "clip") {
        var prev = prevClips[key];
        if (prev !== undefined) {          // seen before: keep what it arrived with
            e.base = prev.base;
            e.origin = prev.origin;
        } else {                           // first sight: the knob is what is baked in
            e.base = current;
            e.origin = lastVal;
        }
    }
    entries.push(e);
    log("  [" + label + "] reads " + current + " -> will be set to " + targetFor(e)
        + (kind === "clip" ? " (base " + e.base + " from knob " + e.origin + ")"
                           : " (offset " + e.offset + ")"));
}

function targetFor(e) {
    var want = (e.kind === "clip") ? (e.base + (lastVal - e.origin)) : (lastVal + e.offset);
    return Math.max(e.min, Math.min(e.max, want));
}

function readValue(e) {
    try {
        return Number(e.api.get(e.kind === "param" ? "value" : "pitch_coarse")[0]);
    } catch (err) { return null; }
}

// Anything a Pitch device reads that is not what we last wrote to it was put
// there by hand, and that difference is a deliberate interval worth keeping.
// This runs on an idle timer rather than inside apply(): during a drag Live
// has not necessarily settled on the value we just set, and reading back too
// early would misread our own write as an edit.
function checkHandEdits() {
    if (!ready) return;
    var changed = 0;
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.kind !== "param" || e.wrote === null) continue;
        var cur = readValue(e);
        if (cur === null || Math.abs(cur - e.wrote) < EPS) continue;
        e.offset = cur - appliedKnob;
        e.wrote = cur;
        changed++;
        log("  hand edit [" + e.label + "]: now " + cur + ", offset " + e.offset);
    }
    if (changed > 0) { render(); flushLog(); }
}

// Live pushes us every value change on a watched Pitch parameter, our own
// writes included. A value that is not the one we just wrote came from the
// user, and the gap from the knob is the interval they want kept.
function onParamValue(e, args) {
    if (!armed || scanning || !ready) return;
    if (Date.now() - lastApplyTime < 300) return;   // our own write echoing back
    var v = Number(args[1]);
    if (isNaN(v) || e.wrote === null || Math.abs(v - e.wrote) < EPS) return;
    e.offset = v - lastVal;
    e.wrote = v;
    log("  hand edit [" + e.label + "]: now " + v + ", offset " + e.offset);
    render();
    flushLog();
}

// One semitone per click, for trackpads. Sends the new value back into the
// Semitones numbox (outlet 1), which re-enters through msg_int - so the knob,
// Live's automation and the children all stay in step exactly as if it had
// been dragged.
function step(n) {
    var v = knobValue() + Number(n);
    v = Math.max(-KNOB_RANGE, Math.min(KNOB_RANGE, v));
    outlet(1, v);
}

// Semitones knob
function msg_int(v) {
    if (inlet === 1) { step(v); return; }   // step button
    lastVal = v;
    render();
    apply();
}

function msg_float(v) {
    msg_int(v);
}

function apply() {
    if (!ready) return;
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var v = targetFor(e);
        try {
            if (e.kind === "param") e.api.set("value", v);
            else e.api.set("pitch_coarse", v);
            e.wrote = v;      // remember it, so a later difference reads as a hand edit
        } catch (err) { /* item deleted - the watchers will trigger a rescan */ }
    }
    appliedKnob = lastVal;
    lastApplyTime = Date.now();
}

// A dial shows its number only while you drag it, so the status line carries
// the current value at all times.
function status(s) {
    lastStatusText = s;
    render();
}

function render() {
    var v = (lastVal > 0 ? "+" : "") + lastVal;
    outlet(0, "set", v + " st  ·  " + lastStatusText);
}
