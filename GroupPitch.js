// Group Pitch — single-device version, ABSOLUTE mode.
// Sits on a Group track. The Semitones knob IS the pitch of everything under
// it: every child MIDI track's native Pitch device and every child audio
// clip's Transpose is set to the knob value. Not an offset, not per-track
// baselines - one number, everything matches it, always.
//
// It watches the group for changes and re-scans itself — adding a track, an
// instrument, a Pitch device or a clip is picked up without touching anything.

autowatch = 1;
inlets = 1;
outlets = 1;

var entries = [];    // {kind:"param"|"clip", key, api, label, min, max}
var lastVal = 0;
var ready = false;
var verbose = false;   // `verbose 1` to this js re-enables the scan-log.txt trace
var myDeviceName = "";
var jsthis = this;

var watchers = [];       // live observers, held in a global so they stay alive
var armed = false;       // observers ignore their own first callback
var scanning = false;
var rescanTask = null, armTask = null;

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
    ready = false;
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
        msg = '"' + groupName + '": nothing to drive in this group';
    } else {
        msg = '"' + groupName + '": ' + midiDriven + "/" + midiKids + " MIDI trk, "
            + audioClips + " audio clip" + (audioClips === 1 ? "" : "s");
        if (subGroups > 0) msg += " (across " + subGroups + " sub-group"
                                 + (subGroups === 1 ? "" : "s") + ")";
        var missing = midiKids - midiDriven;
        if (missing > 0) msg += " - " + missing + " missing Pitch";
        if (delegated > 0) msg += " - " + delegated + " sub-group"
                               + (delegated === 1 ? "" : "s") + " on its own device";
    }
    status(msg);
    apply();
    for (var e = 0; e < entries.length; e++) {
        log("  = " + entries[e].label + " now at " + clampFor(entries[e].min, entries[e].max));
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
    } catch (err) { log("watch failed: " + err); }

    // Setting .property fires the callback once immediately; ignore that round.
    if (!armTask) armTask = new Task(function () { armed = true; });
    armTask.cancel();
    armTask.schedule(200);
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

// Absolute mode means there is nothing to remember about an item: whatever it
// reads right now is irrelevant, it is going to the knob value like everything
// else. That is the whole point - a new track, a duplicated track and a track
// someone nudged by hand all end up in exactly the same place.
function pushEntry(kind, key, api, current, min, max, label) {
    entries.push({ kind: kind, key: key, api: api, label: label, min: min, max: max });
    log("  [" + label + "] reads " + current + " -> will be set to " + clampFor(min, max));
}

function clampFor(min, max) {
    return Math.max(min, Math.min(max, lastVal));
}

// Semitones knob
function msg_int(v) {
    lastVal = v;
    apply();
}

function msg_float(v) {
    msg_int(v);
}

function apply() {
    if (!ready) return;
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var v = clampFor(e.min, e.max);
        try {
            if (e.kind === "param") e.api.set("value", v);
            else e.api.set("pitch_coarse", v);
        } catch (err) { /* item deleted - the watchers will trigger a rescan */ }
    }
}

function status(s) {
    outlet(0, "set", s);
}
