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
					"numoutlets" : 2,
					"outlettype" : [ "signal", "signal" ],
					"patching_rect" : [ 40.0, 400.0, 62.0, 22.0 ],
					"text" : "plugin~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-2",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 450.0, 68.0, 22.0 ],
					"text" : "plugout~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "live.numbox",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"parameter_enable" : 1,
					"varname" : "Semitones",
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 40.0, 60.0, 22.0 ],
					"patching_rect" : [ 40.0, 120.0, 60.0, 22.0 ],
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
					"id" : "obj-4",
					"maxclass" : "live.numbox",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"parameter_enable" : 1,
					"varname" : "GroupID",
					"presentation" : 1,
					"presentation_rect" : [ 110.0, 40.0, 40.0, 22.0 ],
					"patching_rect" : [ 200.0, 120.0, 47.0, 22.0 ],
					"saved_attribute_attributes" : 					{
						"valueof" : 						{
							"parameter_longname" : "Group ID",
							"parameter_shortname" : "Group ID",
							"parameter_type" : 1,
							"parameter_mmin" : 1,
							"parameter_mmax" : 8,
							"parameter_initial_enable" : 1,
							"parameter_initial" : [ 1 ],
							"parameter_unitstyle" : 0
						}

					}

				}

			}
, 			{
				"box" : 				{
					"id" : "obj-8",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "bang", "int" ],
					"patching_rect" : [ 200.0, 180.0, 47.0, 22.0 ],
					"text" : "t b i"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "newobj",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 250.0, 66.0, 22.0 ],
					"text" : "pack 0 0"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 310.0, 154.0, 22.0 ],
					"text" : "send ___grouppitch___"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-7",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 300.0, 250.0, 182.0, 22.0 ],
					"text" : "receive ___grouppitch_req___"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-9",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 400.0, 120.0, 106.0, 22.0 ],
					"text" : "live.thisdevice"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lbl1",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 20.0, 200.0, 18.0 ],
					"patching_rect" : [ 40.0, 90.0, 200.0, 18.0 ],
					"text" : "Semitones            Group ID"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-lbl2",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"presentation" : 1,
					"presentation_rect" : [ 20.0, 66.0, 220.0, 18.0 ],
					"patching_rect" : [ 40.0, 350.0, 260.0, 18.0 ],
					"text" : "Drives all Nodes with the same Group ID"
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 1 ],
					"source" : [ "obj-1", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-3", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-8", 0 ],
					"source" : [ "obj-4", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 1 ],
					"source" : [ "obj-8", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-8", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-6", 0 ],
					"source" : [ "obj-5", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-7", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 0 ],
					"source" : [ "obj-9", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-9", 0 ]
				}

			}
 ]
	}

}
