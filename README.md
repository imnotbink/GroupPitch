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
  clip view — but *relative to where the knob was when the clip first
  appeared*. Bounced audio already has the group's transposition rendered
  into it, so it lands at 0 and stays in key, then follows the knob from
  there.

The knob is **absolute** for MIDI: every Pitch device under the group is set
to the knob value, so a track you just added, a track you duplicated from one
that was already pitched, and a track whose Pitch device you nudged by hand
all land in exactly the same place.

Audio clips can't work that way. A Pitch device transposes live, but audio is
already rendered — bounce a MIDI track to audio and the transposition is
baked into the samples. Setting the new clip's Transpose to the knob as well
would shift it twice. So a clip is pitched **relative to the knob position at
the moment it first appeared**, which is precisely what's baked into it.

The status line tells you what it's driving, e.g.:

```
"Drums": 3/4 MIDI trk, 12 audio clips - 1 missing Pitch
```

## Using it

1. Drag `Group Pitch (Group).amxd` from this folder onto a **group** track.
   (First time, Live may take a moment to load the Max editor runtime.)
2. Drop Ableton's stock **Pitch** on each child MIDI track.
3. Turn the **Semitones** dial, or click **-1** / **1** for one semitone at a
   time. Every child transposes together, live. Clips look untouched; nothing
   is repitched as audio. The status line shows the current value and what's
   being driven.
4. Add or remove tracks, instruments, Pitch devices or clips freely — the
   device watches the group and picks the change up by itself. There's no
   Rescan button on the panel any more; it isn't needed.

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
- Knob range is ±24 st. Narrower than the Pitch device's own ±48, so that
  a trackpad drag covers 49 values instead of 97 and each step is reachable.
  The **-1 / 1** buttons move exactly one semitone per click.
- API-driven changes land in Live's undo history, so twisting the knob a lot
  creates several undo steps — cosmetic, but worth knowing. The Master/Node
  pair avoids this if it ever bothers you.
- Per-track offsets: set one child's Pitch device by hand and that interval
  is remembered. Knob at -6 with a track you dropped an octave sits at -18,
  and it keeps that gap as you turn the knob. The status line counts how many
  tracks have one, e.g. `4 trk (1 offset)`. To clear an offset, set that Pitch
  device back to the knob value — it lands on 0 by itself.
- Offsets belong to tracks you set by hand, not to new ones: a track you add
  or duplicate while the knob is off zero starts at offset 0 and joins the
  group, so a duplicate never inherits the pitch that was copied into it.
- Audio specifics: new/recorded clips are picked up automatically. Bounce to
  New Track / Freeze+Flatten inside the group lands in key and is not
  re-shifted. The flip side: an audio loop you drag in while the knob is off
  zero is assumed to already be in the group's key, so it won't be pulled
  into it — drop loops in with the knob at 0, or set that clip's Transpose
  once by hand.
  Clips warped in **Repitch** mode ignore Transpose (Live's own rule).
  Unwarped clips transpose with speed+pitch change (normal Live behavior).
- After updating `GroupPitch.js`: if you use the unfrozen device, reload the
  Live set so the new js loads cleanly. If you froze it into your User
  Library, re-do the freeze+save with the new js.
