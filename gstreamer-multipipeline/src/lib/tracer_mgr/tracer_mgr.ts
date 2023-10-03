import type { Writable } from "svelte/store";
import { TracerRepository } from "../sockets";
import type {
  Object,
  Bin,
  Pipeline,
  MessageType,
  Pad,
} from "../tracer_types";
import TracerReconciler from "./reconciler";

export interface GstTracerRepository {
  pipelines: Pipeline[];
  bins: Bin[];
  object_map: Map<number, Object>;
  pads: Pad[];
}

export default class TracerManager {
  private tracerSocket: WebSocket;
  private messageReconciler: TracerReconciler;

  constructor(tracerSocket: WebSocket, tracerRepo: Writable<GstTracerRepository>) {
    this.tracerSocket = tracerSocket;
    this.messageReconciler = new TracerReconciler(tracerRepo);
    this.tracerSocket.onmessage = this.handleTracerMessage.bind(this);
  }

  public handleTracerMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      const type = this.parseMessageType(message);
      
      this.messageReconciler.handleMessage(type, message);
    } catch (e) {
      console.error("Issue parsing socket msg JSON", e);
    }
  }

  public parseMessageType(message: any): MessageType {
    const type: MessageType | null = message.type;
    if (!type) {
      throw new Error("No type msg, invalid");
    }
    return type;
  }
}