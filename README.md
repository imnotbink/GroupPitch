# Group Pitch — Max for Live

**One knob that transposes a whole group of layered instruments.**

The problem it solves: you build a sound out of several MIDI tracks stacked in
a group — a bass layer, a sub, a saturated top — and each one has Ableton's
stock **Pitch** device on it. Move the song to a different key and you have to
open every track and set every Pitch device by hand, keeping them in sync.

Drop this on the group instead. One dial, and every Pitch device under it
follows — non-destructively. Clip notes never move and no audio is repitched.

| File | What it is |
|---|---|
| `Group Pitch (Group).amxd` | Drag onto a **group** track |
| `Group Pitch Link.amxd` | Drag onto the **Master** — moves every group at once |
| `GroupPitch.js`, `GroupPitchKnob.js` | The brains. Keep next to the `.amxd` files |

## How it works

A Group track carries no MIDI of its own — it only sums its children's audio —
so nothing on the group can transpose MIDI directly. This device uses the Live
API instead:

- **MIDI children:** it drives the stock **Pitch** device on each, so every
  child MIDI track needs one (Browser → MIDI Effects → Pitch).
- **Audio children:** it drives the Transpose of every audio clip on the track,
  session and arrangement both.
- **Nested groups:** it walks the whole tree beneath it, so a group of groups
  of instruments is driven all the way down.

The dial is **absolute**: every Pitch device under the group is set to its
value. Set one track's Pitch by hand and that becomes its own interval, kept
on top of the dial from then on — dial at -6 with a track offset of -12 puts
that track at -18, and it holds that interval as the dial moves.

When it meets a track for the first time it reads the Pitch device to decide.
A stock Pitch device sits at 0, which means "no opinion", so a genuinely new
track joins the group's key. Any other value was put there on purpose or
copied from a track that had it — duplicate a track sitting at -18 and it
stays at -18, interval intact.

Audio clips are the exception, and have to be. A Pitch device transposes live,
but audio is already rendered: bounce a MIDI track to audio and the group's
transposition is baked into the samples. Setting the new clip's Transpose to
the dial as well would shift it twice. So a clip is pitched relative to the
dial position at the moment it first appeared — a fresh bounce lands in key and
still follows the dial afterwards.

**It keeps up on its own.** Adding or removing tracks, instruments, Pitch
devices or clips is picked up automatically — there's no rescan to remember.
That includes splitting or duplicating clips in the Arrangement, and dropping
or recording a clip into a Session slot.

## The panel

The dial, two step buttons (`-1` / `1`, one semitone per click — easier than
dragging on a trackpad), and a status line showing the current value and what's
being driven: `+3 st · 4 trk`. Warnings appear only when something's off, e.g.
`- 1 no Pitch` for a child MIDI track with no Pitch device on it.

## Linking several groups

`Group Pitch Link.amxd` on the Master nudges the Semitones dial of **every**
Group Pitch device in the set by however far you move it — you watch the group
dials move. Your 808 group can sit at -2 and your melody group at 0; both drop
together and keep the gap. Because it turns the real dials, there's no hidden
layer: what each device shows is what it's doing.

Its knob snaps to whole semitones (11px of drag each, shift-drag for finer),
shows the value in the middle, and double-clicks back to 0. The **+ / -**
buttons beside it step one semitone per press.

**Arrow-key control:** Live owns the keyboard — arrow keys go to Live's own
navigation and never reach a device — so this goes through Live's Key Map
rather than by clicking the knob first. Hit **Cmd-K**, click the **+** button,
press the key you want, then the same for **-**, and Cmd-K again to exit. Any
key works; note that a key mapped this way is taken over globally, so binding
the actual arrow keys costs you arrow-key navigation everywhere in Live.
Something like `=` and `-` avoids that.

## Install

Keep the `.js` files next to the `.amxd` files. The simplest arrangement is to
put the whole folder in your User Library and drag the devices from there.

To make a device work from anywhere, open its Max editor (pencil), click
**Freeze** (snowflake), and File → Save As into
`~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/`.
Freezing embeds the scripts inside the `.amxd`. Note that a frozen device stops
tracking edits to the `.js` files — re-freeze after changing them.

## Notes / limits

- Needs Max for Live (Live Suite, or the M4L add-on).
- Pitch devices are found at the top level of each child's chain, not inside
  racks.
- Group dial range is ±24 st, Link ±12. Both are narrower than the Pitch
  device's own ±48 so that a trackpad drag covers fewer values per pixel.
- A group dial stops at ±24, so if one group hits the end while others keep
  going, moving Link back won't restore the gap.
- If a sub-group has its own copy of this device, that subtree is left to it —
  two instances driving the same Pitch params would fight.
- An audio loop you *drag in* while the dial is off zero is assumed to already
  be in the group's key, so it won't be pulled into it. Drop loops in with the
  dial at 0, or set that clip's Transpose once by hand.
- API-driven changes land in Live's undo history, so twisting the dial a lot
  creates several undo steps. Cosmetic, but worth knowing.
- The Link bus is global to Max, not per Live set: two sets open at once, both
  with a Link device, will hear each other.
- After editing `GroupPitch.js`, reload the set so it loads cleanly. Editing
  a `.amxd` means re-dragging the device — a Live set stores its own copy of
  the patch.
- `verbose 1` sent to the `js GroupPitch.js` object writes a `scan-log.txt`
  next to the device recording every scan: what it read, what it decided, and
  what it wrote. Useful when a pitch lands somewhere unexpected.
