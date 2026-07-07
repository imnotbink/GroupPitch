========================================================
GROUP PITCH  —  Max for Live
One knob on your Group track that transposes the MIDI of
all its child tracks at once — non-destructively (clip
notes don't move, no audio is repitched).
========================================================

THE MAIN DEVICE (single device — use this one)
  Group Pitch (Group).amxd     -> drag this onto a GROUP track
  GroupPitch.js                -> its brain. KEEP IT IN THE SAME
                                  FOLDER as the .amxd (or freeze
                                  the device once — see below)

ALTERNATIVE (two-device design, also ready to drag in)
  Group Pitch Master.amxd      -> Audio Effect, broadcaster
  Group Pitch Node.amxd        -> MIDI Effect, one per track
  (Only needed if you want to link tracks that are NOT in the
   same group, or want the cleanest possible automation.)

  The .maxpat files are the editable sources for all of the
  above — you don't need them to use the devices.

--------------------------------------------------------
HOW THE MAIN DEVICE WORKS
--------------------------------------------------------
  A Group track carries no MIDI (it only sums its children's
  audio), so nothing on the group can transpose MIDI
  directly. Instead this device uses the Live API:

   - It detects the Group track it's sitting on.
   - It finds that group's child tracks automatically.
   - MIDI children: it drives the native Ableton "Pitch"
     device on each (so each child MIDI track needs a stock
     Pitch dropped on it — Browser > MIDI Effects > Pitch).
   - AUDIO children: it drives the Transpose of every audio
     clip on the track (session + arrangement) — the same
     semitone control you'd turn in the clip view.

  The knob is an OFFSET, not an absolute value: it adds to
  whatever each Pitch device / clip Transpose was already
  set to, and knob back at 0 returns everything to its own
  setting. Dial a child's own Pitch or clip Transpose where
  you want it, then rescan — that becomes its new baseline.

  The status line tells you what it's driving, e.g.:
    "Drums": 3/4 MIDI trk, 12 audio clips - 1 missing Pitch

--------------------------------------------------------
USING IT
--------------------------------------------------------
   1. Drag "Group Pitch (Group).amxd" from this folder onto
      a GROUP track. (First time, Live may take a moment to
      load the Max editor runtime.)
   2. Drop Ableton's stock Pitch on each child MIDI track.
   3. Turn Semitones. Every child transposes together, live.
      Clips look untouched; nothing is repitched as audio.
   4. Status line shows: 'GroupName': driving X of Y MIDI
      tracks (and warns if a child has no Pitch device).
   5. Added/removed tracks or Pitch devices? Click "scan"
      (Rescan) on the device.

  TO INSTALL PERMANENTLY (recommended):
   With the device loaded, click its Edit (pencil) button,
   then in the Max editor click the FREEZE button (snowflake,
   bottom toolbar) and File > Save As into:
     ~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/
   Freezing embeds GroupPitch.js inside the .amxd so the
   device works from anywhere, forever. (Until you freeze,
   keep GroupPitch.js next to the .amxd.)

--------------------------------------------------------
IF AN .AMXD REFUSES TO LOAD (unlikely but possible)
--------------------------------------------------------
  These .amxd files were generated programmatically from
  Ableton's own device templates. If Live ever rejects one:
   1. Drag an empty "Max Audio Effect" (or "Max MIDI Effect"
      for the Node) onto a track, click Edit.
   2. In Max: File > Open the matching .maxpat from this
      folder, Select All, Copy.
   3. In the device editor window: Select All, Delete, Paste,
      Save. Same result, built by Live itself.

--------------------------------------------------------
NOTES / LIMITS
--------------------------------------------------------
  - Needs Max for Live enabled in Live (Suite / M4L add-on).
  - Direct children only — tracks inside a nested sub-group
    need a copy of the device on THAT sub-group instead.
  - It finds Pitch devices at the top level of each child's
    chain (not buried inside racks).
  - Knob range is ±48 st (same as the native Pitch device).
  - API-driven changes land in Live's undo history, so
    twisting the knob a lot creates several undo steps —
    cosmetic, but worth knowing. The Master/Node pair
    avoids this if it ever bothers you.
  - RELATIVE mode details:
     * Each Pitch device / clip keeps its own baseline; the
       knob adds to it. Change a child's own setting by hand?
       Click Rescan while you're at it so the new value is
       captured as that child's baseline (rescanning keeps
       already-known items' baselines, so it's always safe).
     * Values clamp at the ends (Pitch ±48 st, clip
       Transpose ±48 st): a clip already at +40 can only go
       8 more up.
  - Audio specifics:
     * New/recorded clips aren't picked up until you Rescan.
     * Clips warped in REPITCH mode ignore Transpose — that's
       Live's own rule (transpose is disabled in Repitch).
     * Unwarped clips: Transpose works, changes speed+pitch
       (normal Live behavior).
  - After UPDATING GroupPitch.js (new version): if you use
    the unfrozen device, reload the Live set so the new js
    loads cleanly. If you froze the device into your User
    Library earlier, re-do the freeze+save with the new js.
  - If the status line shows something odd or a track doesn't
    follow, note the exact status text and report back.
