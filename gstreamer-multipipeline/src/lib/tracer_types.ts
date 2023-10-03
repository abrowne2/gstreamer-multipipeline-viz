export interface BaseMessage {
    source: string;
    ts: number;
    type: MessageType;
    object_id?: number;
}

export interface PadLinkMessage extends BaseMessage {
    sink_id: number;
    src_id: number;
    was_linked: boolean;
}

export interface BinAddMessage extends BaseMessage {
    bin_id: number;
    element_id: number;
}

export interface ElementStateMessage extends BaseMessage {
    state_change: ElementState;
    object_id?: number;
}

export interface Object extends BaseMessage {
    element_id?: number;
    element_gtype?: string;
    element_factory?: string; 
    element_name?: string;
    state_change?: ElementState;
    sink_pads?: Pad[];
    src_pads?: Pad[];
};

export enum GType {
    Pipeline = "GstPipeline",
    Bin = "GstBin",
    Pad = "GstPad"
}

export enum MessageType {
    NewPad = "add-pad",
    PadLinked = "pad-linked",
    PadUnlinked = "pad-unlinked",
    PadRemoved = "remove-pad",
    BinAdded = "bin-add",
    BinRemoved = "bin-remove",
    NewObject = "new-object",
    PropertyChanged = 'property-changed',
    ElementChangedState = "state-change",
    ObjectDestroyed="object-destroyed", //when pipelines are destroyed and auto elements
}

export enum PadDirection {
    Unknown = "GST_PAD_UNKNOWN",
    Src = "GST_PAD_SRC",
    Sink = "GST_PAD_SINK",
}

export interface Pad extends BaseMessage {
    direction?: PadDirection;
    pad_id?: number;
    pad_name?: string;
    pad_gtype?: string;
    src_id?: number;
    sink_id?: number;
}

export enum ElementState {
    Null = "null",
    Ready = "ready",
    Paused = "paused",
    Playing = "playing",
}

export interface Pipeline extends BaseMessage {
    bin: Bin;
    stream_time: number;
};

export interface Bin extends BaseMessage {
    polling: boolean;
    messages?: string[];
    num_children: number;
    children: Element[];
    pads: Pad[];
};