{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 8,
			"minor" : 6,
			"revision" : 0,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 80.0, 80.0, 640.0, 520.0 ],
		"bglocked" : 0,
		"openinpresentation" : 1,
		"default_fontsize" : 12.0,
		"default_fontface" : 0,
		"default_fontname" : "Ableton Sans Book",
		"gridonopen" : 1,
		"gridsize" : [ 15.0, 15.0 ],
		"gridsnaponopen" : 1,
		"toolbarvisible" : 1,
		"boxanimatetime" : 200,
		"enablehscroll" : 1,
		"enablevscroll" : 1,
		"devicewidth" : 0.0,
		"description" : "",
		"digest" : "",
		"tags" : "",
		"style" : "",
		"subpatcher_template" : "",
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 40.0, 60.0, 106.0, 22.0 ],
					"text" : "live.thisdevice"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "bang" ],
					"patching_rect" : [ 40.0, 105.0, 47.0, 22.0 ],
					"text" : "t b b"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "live.numbox",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"parameter_enable" : 1,
					"varname" : "Semitones",
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 38.0, 60.0, 22.0 ],
					"patching_rect" : [ 200.0, 60.0, 60.0, 22.0 ],
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "Semitones",
							"parameter_shortname" : "Semitones",
							"parameter_type" : 1,
							"parameter_mmin" : -48,
							"parameter_mmax" : 48,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 0 ],
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"presentation" : 1,
					"presentation_rect" : [ 100.0, 38.0, 55.0, 22.0 ],
					"patching_rect" : [ 320.0, 60.0, 55.0, 22.0 ],
					"text" : "scan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 160.0, 96.0, 22.0 ],
					"text" : "js GroupPitch.js"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 68.0, 300.0, 22.0 ],
					"patching_rect" : [ 40.0, 230.0, 300.0, 22.0 ],
					"text" : "click Rescan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 460.0, 60.0, 62.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-7",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 460.0, 120.0, 68.0, 22.0 ],
					"text" : "plugout~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lbl1",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 16.0, 80.0, 18.0 ],
					"patching_rect" : [ 200.0, 36.0, 80.0, 18.0 ],
					"text" : "Semitones"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lbl2",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 100.0, 16.0, 60.0, 18.0 ],
					"patching_rect" : [ 320.0, 36.0, 60.0, 18.0 ],
					"text" : "Rescan"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lbl3",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 120.0, 340.0, 20.0 ],
					"text" : "Offsets child Pitch devices + audio clip Transpose from their own settings"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-8", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-8", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-8", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-2", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-4", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 0 ],
					"source" : [ "obj-6", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-7", 1 ],
					"source" : [ "obj-6", 1 ]
				}

			}
 ]
	}

}
