/* GES related pieces */

import type { Bin, Pipeline } from "./tracer_types";

/* A GES pipeline's bin is the encodebin. */
export interface GESPipeline extends Pipeline {
  urisink: Object;
  encodebin: Bin;
  playsink: Object;
  timeline: GESTimeline;
}

export interface GESTimeline extends Bin {
  parent: Bin;
  layers: GESLayer[];
  tracks: GESTrack[];
}

export interface GESLayer {
  parent: Object;
  timeline: GESTimeline;
  min_priority: number;
  max_priority: number;
  priority: number;
  auto_transition: boolean;
  sorted_clips: GESClip[];
}

export enum GESTrackType {
  Audio = "GES_TRACK_TYPE_AUDIO",
  Video = "GES_TRACK_TYPE_VIDEO",
  Text = "GES_TRACK_TYPE_TEXT",
  Unknown = "GES_TRACK_TYPE_UNKNOWN",
  Custom = "GES_TRACK_TYPE_CUSTOM",
}

/* There is a distinguishing difference between audio and video tracks. */
export interface GESTrack extends Bin {
  parent: Bin;
  track_type: GESTrackType;
  caps: string;
}

export interface GESTimelineElement {
  parent: Object;
  timeline: GESTimeline;
  start: number;
  inpoint: number;
  duration: number;
  maxduration: number;
  name: string;
}

export enum GESChildrenControlMode {
  Update = "GES_CHILDREN_UPDATE",
  Ignore = "GES_CHILDREN_IGNORE_NOTIFIES",
  UpdateOffsets = "GES_CHILDREN_UPDATE_OFFSETS",
  UpdateAllValues = "GES_CHILDREN_UPDATE_ALL_VALUES",
  Last = "GES_CHILDREN_LAST",
}

export interface GESContainer extends GESTimelineElement {
  parent_element: GESTimelineElement;
  children: GESTimelineElement[];
  height: number;
}

export interface GESClip extends GESContainer {
  parent_container: GESContainer;
}
