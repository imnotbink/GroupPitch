// Group Pitch — single-device version, RELATIVE mode.
// Sits on a Group track. The Semitones knob is an OFFSET added to:
//   - each child MIDI track's native Pitch device (from its own setting)
//   - each child audio track's clip Transpose (pitch_coarse, from its own setting)
// Knob back at 0 = everything returns to its own baseline.

autowatch = 1;
inlets = 1;
outlets = 1;

var entries = [];    // {kind:"param"|"clip", key, api, baseline, min, max}
var lastVal = 0;
var ready = false;

// live.thisdevice bang -> device fully loaded. The patch bangs the knob
// first so lastVal already holds the restored knob value; our previous
// offset is baked into the saved values, so baseline = current - lastVal.
function bang() {
    scan(1);
}

function scan(initial) {
    var wasInitial = (initial === 1);
    var old = {};
    for (var i = 0; i < entries.length; i++) old[entries[i].key] = entries[i];
    ready = false;
    entries = [];

    var dev = new LiveAPI("this_device");
    if (!dev || dev.id == 0) {
        status("Load error - click Rescan");
        return;
    }

    var toks = dev.unquotedpath.split(" ");
    if (toks[1] !== "tracks") {
        status("Put me on a Group track");
        return;
    }
    var track = new LiveAPI(toks.slice(0, 3).join(" "));
    if (Number(track.get("is_foldable")[0]) !== 1) {
        status("Put me on a Group track");
        return;
    }
    var groupId = Number(track.id);
    var groupName = track.get("name").join(" ");

    var set = new LiveAPI("live_set");
    var nTracks = set.getcount("tracks");
    var midiKids = 0, midiDriven = 0, audioClips = 0;

    for (var i = 0; i < nTracks; i++) {
        var tPath = "live_set tracks " + i;
        var t = new LiveAPI(tPath);
        var gt = t.get("group_track");            // ["id", N]
        if (!gt || Number(gt[1]) !== groupId) continue;      // not our direct child
        if (Number(t.get("is_foldable")[0]) === 1) continue; // nested sub-group: skip

        if (Number(t.get("has_midi_input")[0]) === 1) {
            midiKids++;
            if (addPitchParam(t, tPath, old, wasInitial)) midiDriven++;
        } else {
            audioClips += addAudioClips(t, tPath, old, wasInitial);
        }
    }

    ready = true;
    var msg;
    if (midiKids === 0 && audioClips === 0) {
        msg = '"' + groupName + '": nothing to drive in this group';
    } else {
        msg = '"' + groupName + '": ' + midiDriven + "/" + midiKids + " MIDI trk, "
            + audioClips + " audio clip" + (audioClips === 1 ? "" : "s");
        var missing = midiKids - midiDriven;
        if (missing > 0) msg += " - " + missing + " missing Pitch";
    }
    status(msg);
    apply();
}

// find the first native Pitch (MidiPitcher) on this child, cache its Pitch param
function addPitchParam(t, tPath, old, wasInitial) {
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
                          old, wasInitial);
                return true;
            }
        }
        return false;
    }
    return false;
}

// cache every audio clip on this child track (session + arrangement)
function addAudioClips(t, tPath, old, wasInitial) {
    var count = 0;
    var nSlots = t.getcount("clip_slots");
    for (var s = 0; s < nSlots; s++) {
        var slot = new LiveAPI(tPath + " clip_slots " + s);
        if (Number(slot.get("has_clip")[0]) !== 1) continue;
        if (addClip(new LiveAPI(tPath + " clip_slots " + s + " clip"), old, wasInitial)) count++;
    }
    var arr = t.get("arrangement_clips");     // ["id", 1, "id", 2, ...]
    if (arr) {
        for (var a = 0; a < arr.length - 1; a++) {
            if (arr[a] !== "id") continue;
            if (addClip(new LiveAPI("id " + arr[a + 1]), old, wasInitial)) count++;
        }
    }
    return count;
}

function addClip(c, old, wasInitial) {
    if (!c || c.id == 0) return false;
    var base = Number(c.get("pitch_coarse")[0]);   // clip Transpose, +-48 st
    pushEntry("clip", "c" + c.id, c, base, -48, 48, old, wasInitial);
    return true;
}

// baseline = the item's OWN setting, before our offset:
//  - device load: current has our saved offset baked in -> subtract lastVal
//  - rescan, known item: keep its original baseline (don't re-absorb our offset)
//  - rescan, new item: its current setting IS its baseline (it then follows the knob)
function pushEntry(kind, key, api, current, min, max, old, wasInitial) {
    var baseline;
    if (wasInitial) baseline = current - lastVal;
    else if (old[key] !== undefined) baseline = old[key].baseline;
    else baseline = current;
    entries.push({ kind: kind, key: key, api: api, baseline: baseline, min: min, max: max });
}

// Semitones knob
function msg_int(v) {
    lastVal = v;
    apply();
}

function apply() {
    if (!ready) return;
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var v = Math.max(e.min, Math.min(e.max, e.baseline + lastVal));
        try {
            if (e.kind === "param") e.api.set("value", v);
            else e.api.set("pitch_coarse", v);
        } catch (err) { /* item deleted since last scan - Rescan fixes */ }
    }
}

function status(s) {
    outlet(0, "set", s);
}
