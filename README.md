# Group Pitch — Max for Live

One knob on your **Group track** that transposes the MIDI of all its child
tracks at once — non-destructively. Clip notes don't move and no audio is
repitched; knob back to 0 and everything returns to its own setting.

## The main device (use this one)

| File | What it is |
|---|---|
| `Group Pitch (Group).amxd` | Drag this onto a **group** track |
| `GroupPitch.js` | Its brain — keep it in the same folder as the `.amxd` (or freeze the device once, see below) |

### Alternative two-device design (also ready to drag in)

| File | What it is |
|---|---|
| `Group Pitch Master.amxd` | Audio Effect, broadcaster |
| `Group Pitch Node.amxd` | MIDI Effect, one per track |

Only needed if you want to link tracks that are *not* in the same group, or
want the cleanest possible automation. The `.maxpat` files are the editable
sources for all of the above — you don't need them to use the devices.

## How the main device works

A Group track carries no MIDI (it only sums its children's audio), so nothing
on the group can transpose MIDI directly. Instead this device uses the Live
API:

- It detects the Group track it's sitting on and finds its child tracks
  automatically.
- **MIDI children:** it drives the native Ableton **Pitch** device on each —
  so each child MIDI track needs a stock Pitch dropped on it
  (Browser → MIDI Effects → Pitch).
- **Audio children:** it drives the Transpose of every audio clip on the
  track (session + arrangement) — the same semitone control you'd turn in
  clip view.

The knob is an **offset**, not an absolute value: it adds to whatever each
Pitch device / clip Transpose was already set to. Dial a child's own Pitch or
clip Transpose where you want it, then Rescan — that becomes its new baseline.

The status line tells you what it's driving, e.g.:

```
"Drums": 3/4 MIDI trk, 12 audio clips - 1 missing Pitch
```

## Using it

1. Drag `Group Pitch (Group).amxd` from this folder onto a **group** track.
   (First time, Live may take a moment to load the Max editor runtime.)
2. Drop Ableton's stock **Pitch** on each child MIDI track.
3. Turn **Semitones**. Every child transposes together, live. Clips look
   untouched; nothing is repitched as audio.
4. Added/removed tracks, clips, or Pitch devices? Click **scan** (Rescan).

### Install permanently (recommended)

With the device loaded, click its Edit (pencil) button, then in the Max
editor click **Freeze** (snowflake, bottom toolbar) and File → Save As into:

```
~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/
```

Freezing embeds `GroupPitch.js` inside the `.amxd` so the device works from
anywhere. Until you freeze, keep `GroupPitch.js` next to the `.amxd`.

## If an .amxd refuses to load (unlikely but possible)

These `.amxd` files were generated programmatically from Ableton's own device
templates. If Live ever rejects one:

1. Drag an empty "Max Audio Effect" (or "Max MIDI Effect" for the Node) onto
   a track, click Edit.
2. In Max: File → Open the matching `.maxpat` from this folder, Select All,
   Copy.
3. In the device editor window: Select All, Delete, Paste, Save. Same result,
   built by Live itself.

## Notes / limits

- Needs Max for Live (Live Suite, or the M4L add-on).
- Direct children only — tracks inside a nested sub-group need a copy of the
  device on *that* sub-group instead.
- It finds Pitch devices at the top level of each child's chain (not buried
  inside racks).
- Knob range is ±48 st (same as the native Pitch device).
- API-driven changes land in Live's undo history, so twisting the knob a lot
  creates several undo steps — cosmetic, but worth knowing. The Master/Node
  pair avoids this if it ever bothers you.
- Relative-mode details: each Pitch device / clip keeps its own baseline and
  the knob adds to it. Change a child's setting by hand? Click Rescan so the
  new value is captured as its baseline (rescanning keeps already-known
  items' baselines, so it's always safe). Values clamp at the ends (±48 st).
- Audio specifics: new/recorded clips aren't picked up until you Rescan.
  Clips warped in **Repitch** mode ignore Transpose (Live's own rule).
  Unwarped clips transpose with speed+pitch change (normal Live behavior).
- After updating `GroupPitch.js`: if you use the unfrozen device, reload the
  Live set so the new js loads cleanly. If you froze it into your User
  Library, re-do the freeze+save with the new js.
