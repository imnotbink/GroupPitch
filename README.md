# Group Pitch — Max for Live

One knob on your **Group track** that sets the pitch of every instrument
under it — non-destructively. Clip notes don't move and no audio is
repitched. The knob **is** the pitch: whatever it reads, every child reads.
Knob at 0 = everything at 0.

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

- It detects the Group track it's sitting on and finds every track beneath
  it automatically, sub-groups included.
- **MIDI children:** it drives the native Ableton **Pitch** device on each —
  so each child MIDI track needs a stock Pitch dropped on it
  (Browser → MIDI Effects → Pitch).
- **Audio children:** it drives the Transpose of every audio clip on the
  track (session + arrangement) — the same semitone control you'd turn in
  clip view.

The knob is **absolute**, not an offset. Every Pitch device and clip
Transpose under the group is set to the knob value, so everything under the
group is always in the same key as everything else. A track you just added, a
track you duplicated from one that was already pitched, and a track whose
Pitch device you nudged by hand all land in exactly the same place.

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
4. Add or remove tracks, instruments, Pitch devices or clips freely — the
   device watches the group and picks the change up by itself. (The **scan**
   button is still there as a manual nudge; you shouldn't need it.)

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
- Works on nested groups: it walks the whole tree under the group it sits on,
  so a group of groups of instruments is driven all the way down. If a
  sub-group has its own copy of this device on it, that subtree is left to
  that copy — two of them writing the same Pitch params would fight.
- It finds Pitch devices at the top level of each child's chain (not buried
  inside racks).
- Knob range is ±48 st (same as the native Pitch device).
- API-driven changes land in Live's undo history, so twisting the knob a lot
  creates several undo steps — cosmetic, but worth knowing. The Master/Node
  pair avoids this if it ever bothers you.
- No per-track offsets: a child can't sit at its own interval (an octave
  below the rest, say) — that's the trade for everything always matching. Say
  the word if you want that back as a toggle.
- Audio specifics: new/recorded clips are picked up automatically.
  Clips warped in **Repitch** mode ignore Transpose (Live's own rule).
  Unwarped clips transpose with speed+pitch change (normal Live behavior).
- After updating `GroupPitch.js`: if you use the unfrozen device, reload the
  Live set so the new js loads cleanly. If you froze it into your User
  Library, re-do the freeze+save with the new js.
