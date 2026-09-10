// Big knob face for Group Pitch Link, drawn here rather than by a stock UI
// object so the three things that matter can be exact: it snaps to whole
// semitones, it shows the number in the middle, and a double-click zeroes it.
//
// It is only the face. The real Live parameter is the hidden live.dial next to
// it in the patch, which keeps automation and MIDI mapping working: this sends
// it values, and it sends back "setval N" (which never re-outputs, so there is
// no feedback loop).

autowatch = 1;
inlets = 1;
outlets = 1;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var jsthis = this;
var RANGE = 12;            // matches the hidden live.dial
var val = 0;

// Trackpad feel: a fixed number of pixels buys exactly one semitone, so the
// knob detents instead of sliding. Nothing is scaled by the dial's size or by
// how far from the centre you grabbed it - drag distance is the only input.
var PX_PER_STEP = 11;
var accum = 0;
var lastY = 0;

var A0 = 0.75 * Math.PI;   // arc starts lower-left
var SWEEP = 1.5 * Math.PI; // and sweeps 270 degrees to lower-right

function paint() {
    var r = jsthis.box.rect;
    var w = r[2] - r[0], h = r[3] - r[1];
    var cx = w / 2, cy = h / 2;
    var rad = Math.min(w, h) / 2 - 6;
    if (rad < 4) return;

    var f = (val + RANGE) / (2 * RANGE);
    var aVal = A0 + f * SWEEP;
    var aMid = A0 + 0.5 * SWEEP;

    with (mgraphics) {
        set_line_width(Math.max(3, rad * 0.13));

        new_path();
        set_source_rgba(0.26, 0.26, 0.28, 1);
        arc(cx, cy, rad, A0, A0 + SWEEP);
        stroke();

        if (val !== 0) {                      // fill out from centre, not from zero
            new_path();
            set_source_rgba(1.0, 0.68, 0.18, 1);
            if (aVal >= aMid) arc(cx, cy, rad, aMid, aVal);
            else              arc(cx, cy, rad, aVal, aMid);
            stroke();
        }

        new_path();
        set_source_rgba(0.93, 0.93, 0.93, 1);
        set_line_width(Math.max(2, rad * 0.09));
        move_to(cx + Math.cos(aVal) * rad * 0.45, cy + Math.sin(aVal) * rad * 0.45);
        line_to(cx + Math.cos(aVal) * rad * 0.90, cy + Math.sin(aVal) * rad * 0.90);
        stroke();

        var label = (val > 0 ? "+" : "") + val;
        select_font_face("Arial Bold");
        set_font_size(Math.max(10, rad * 0.60));
        var tm = text_measure(label);
        new_path();
        set_source_rgba(0.95, 0.95, 0.95, 1);
        move_to(cx - tm[0] / 2, cy + tm[1] / 2.6);
        show_text(label);
    }
}

// A plain click parks the drag origin without changing anything - no jumping
// to wherever you happened to press.
function onclick(x, y) {
    lastY = y;
    accum = 0;
}

function ondrag(x, y, but, cmd, shift) {
    var stepPx = shift ? PX_PER_STEP * 3 : PX_PER_STEP;   // shift = finer still
    accum += (lastY - y);
    lastY = y;
    var moved = false;
    while (accum >= stepPx)  { accum -= stepPx; if (nudge(1))  moved = true; }
    while (accum <= -stepPx) { accum += stepPx; if (nudge(-1)) moved = true; }
    if (moved) {
        mgraphics.redraw();
        outlet(0, val);
    }
}

function ondblclick() {
    if (val === 0) return;
    val = 0;
    mgraphics.redraw();
    outlet(0, val);
}

function nudge(d) {
    var nv = Math.max(-RANGE, Math.min(RANGE, val + d));
    if (nv === val) return false;
    val = nv;
    return true;
}

// One semitone per press, from the +/- buttons. Debounced because a Live
// button can report both press and release, and a double step per click would
// be worse than no buttons at all.
var lastBump = 0;

function bump(n) {
    var now = Date.now();
    if (now - lastBump < 60) return;
    lastBump = now;
    if (!nudge(Number(n) > 0 ? 1 : -1)) return;
    mgraphics.redraw();
    outlet(0, val);
}

// from the hidden live.dial, via `prepend setval` - display only, never echoes
function setval(v) {
    var n = Number(v);
    if (isNaN(n)) return;
    n = Math.max(-RANGE, Math.min(RANGE, Math.round(n)));
    if (n === val) return;
    val = n;
    mgraphics.redraw();
}
