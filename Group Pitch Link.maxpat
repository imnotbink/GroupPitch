{
 "patcher": {
  "fileversion": 1,
  "appversion": {
   "major": 8,
   "minor": 6,
   "revision": 0,
   "architecture": "x64",
   "modernui": 1
  },
  "classnamespace": "box",
  "rect": [
   80.0,
   80.0,
   640.0,
   520.0
  ],
  "bglocked": 0,
  "openinpresentation": 1,
  "default_fontsize": 12.0,
  "default_fontface": 0,
  "default_fontname": "Ableton Sans Book",
  "gridonopen": 1,
  "gridsize": [
   15.0,
   15.0
  ],
  "gridsnaponopen": 1,
  "toolbarvisible": 1,
  "boxanimatetime": 200,
  "enablehscroll": 1,
  "enablevscroll": 1,
  "devicewidth": 176.0,
  "description": "Group Pitch Link",
  "digest": "Transpose every Group Pitch group together",
  "tags": "pitch group transpose",
  "style": "",
  "subpatcher_template": "",
  "boxes": [
   {
    "box": {
     "id": "obj-1",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "bang"
     ],
     "patching_rect": [
      40.0,
      40.0,
      106.0,
      22.0
     ],
     "text": "live.thisdevice"
    }
   },
   {
    "box": {
     "id": "obj-2",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "bang"
     ],
     "patching_rect": [
      40.0,
      75.0,
      180.0,
      22.0
     ],
     "text": "r ___grouppitchlink_req___"
    }
   },
   {
    "box": {
     "id": "obj-3",
     "maxclass": "live.dial",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "parameter_enable": 1,
     "varname": "Link",
     "annotation": "Group Pitch Link - nudges the Semitones dial of every Group Pitch device in the set by the same amount, so all your groups transpose together while each keeps its own setting.",
     "patching_rect": [
      40.0,
      115.0,
      56.0,
      56.0
     ],
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Link",
       "parameter_shortname": "Link",
       "parameter_type": 1,
       "parameter_mmin": -12,
       "parameter_mmax": 12,
       "parameter_info": "Group Pitch Link - nudges the Semitones dial of every Group Pitch device in the set by the same amount, so all your groups transpose together while each keeps its own setting.",
       "parameter_initial_enable": 1,
       "parameter_initial": [
        0
       ],
       "parameter_unitstyle": 0
      }
     }
    }
   },
   {
    "box": {
     "id": "obj-4",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 0,
     "patching_rect": [
      40.0,
      260.0,
      160.0,
      22.0
     ],
     "text": "s ___grouppitchlink___"
    }
   },
   {
    "box": {
     "id": "obj-5",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "signal",
      "signal"
     ],
     "patching_rect": [
      420.0,
      115.0,
      60.0,
      22.0
     ],
     "text": "plugin~"
    }
   },
   {
    "box": {
     "id": "obj-6",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 0,
     "patching_rect": [
      420.0,
      260.0,
      60.0,
      22.0
     ],
     "text": "plugout~"
    }
   },
   {
    "box": {
     "id": "obj-7",
     "maxclass": "jsui",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "filename": "GroupPitchKnob.js",
     "parameter_enable": 0,
     "presentation": 1,
     "presentation_rect": [
      8.0,
      6.0,
      124.0,
      124.0
     ],
     "patching_rect": [
      240.0,
      40.0,
      124.0,
      124.0
     ]
    }
   },
   {
    "box": {
     "id": "obj-11",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      240.0,
      190.0,
      100.0,
      22.0
     ],
     "text": "prepend setval"
    }
   },
   {
    "box": {
     "id": "obj-12",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "mode": 0,
     "parameter_enable": 1,
     "presentation": 1,
     "text": "+",
     "varname": "Up",
     "presentation_rect": [
      138.0,
      26.0,
      24.0,
      24.0
     ],
     "patching_rect": [
      560.0,
      66.0,
      40.0,
      20.0
     ],
     "annotation": "Nudge the Group Pitch Link one semitone. Map a key to this with Cmd-K.",
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Up",
       "parameter_shortname": "Up",
       "parameter_type": 2,
       "parameter_mmin": 0,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_info": "Nudge the Group Pitch Link one semitone. Map a key to this with Cmd-K.",
       "parameter_initial_enable": 0
      }
     }
    }
   },
   {
    "box": {
     "id": "obj-13",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      ""
     ],
     "mode": 0,
     "parameter_enable": 1,
     "presentation": 1,
     "text": "-",
     "varname": "Down",
     "presentation_rect": [
      138.0,
      62.0,
      24.0,
      24.0
     ],
     "patching_rect": [
      560.0,
      102.0,
      40.0,
      20.0
     ],
     "annotation": "Nudge the Group Pitch Link one semitone. Map a key to this with Cmd-K.",
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Down",
       "parameter_shortname": "Down",
       "parameter_type": 2,
       "parameter_mmin": 0,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_info": "Nudge the Group Pitch Link one semitone. Map a key to this with Cmd-K.",
       "parameter_initial_enable": 0
      }
     }
    }
   },
   {
    "box": {
     "id": "obj-14",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      560.0,
      110.0,
      60.0,
      22.0
     ],
     "text": "bump 1"
    }
   },
   {
    "box": {
     "id": "obj-15",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      630.0,
      110.0,
      60.0,
      22.0
     ],
     "text": "bump -1"
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "destination": [
      "obj-3",
      0
     ],
     "source": [
      "obj-1",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-3",
      0
     ],
     "source": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-3",
      0
     ],
     "source": [
      "obj-7",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-11",
      0
     ],
     "source": [
      "obj-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-7",
      0
     ],
     "source": [
      "obj-11",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-6",
      0
     ],
     "source": [
      "obj-5",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-6",
      1
     ],
     "source": [
      "obj-5",
      1
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-14",
      0
     ],
     "source": [
      "obj-12",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-15",
      0
     ],
     "source": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-7",
      0
     ],
     "source": [
      "obj-14",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-7",
      0
     ],
     "source": [
      "obj-15",
      0
     ]
    }
   },
   {
    "patchline": {
     "destination": [
      "obj-4",
      0
     ],
     "source": [
      "obj-7",
      1
     ]
    }
   }
  ]
 }
}