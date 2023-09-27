export interface Element {
    source: string;
    ts: number;
    type: MessageType;
    element_id?: number;
    element_gtype?: string;
    element_factory?: string; 
    object_id?: number;
    state_change?: ElementState;
};

export enum MessageType {
    NewPad = "add-pad",
    PadLinked = "pad-linked",
    PadUnlinked = "pad-unlinked",
    NewElement = "new-element",
    ElementChangedState = "new-element-state",
    ObjectDestroyed="object-destroyed", //when pipelines are destroyed and auto elements
}

export enum PadDirection {
    Unknown = "GST_PAD_UNKNOWN",
    Src = "GST_PAD_SRC",
    Sink = "GST_PAD_SINK",
}

export interface Pad extends Element {
    direction: PadDirection;
    pad_id: number;
    pad_name: string;
    pad_gtype: string;
}

export enum ElementState {
    Null = "null",
    Ready = "ready",
    Paused = "paused",
    Playing = "playing",
}

export interface Pipeline extends Element {
    bin: Bin;
    stream_time: number;
};

export interface Bin extends Element {
    polling: boolean;
    messages?: string[];
    num_children: number;
    children: Element[];
};