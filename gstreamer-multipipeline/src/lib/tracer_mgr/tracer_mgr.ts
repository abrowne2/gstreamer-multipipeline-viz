import { TracerRepository } from "../sockets";
import type {
  Element,
  Bin,
  Pipeline,
} from "../tracer_types";

export interface GstTracerRepository {
  element_queue: Element[];
  pipelines: Pipeline[];
  bins: Bin[];
}

export default class TracerManager {
  private tracerSocket: WebSocket;

  constructor(tracerSocket: WebSocket) {
    this.tracerSocket = tracerSocket;
    this.tracerSocket.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      const type = this.parseMessageType(message);

      // TracerRepository.update(messages => [...messages, event.data]);
    } catch (e) {
      console.error("Issue parsing socket msg JSON", e);
    }
  }

  private parseMessageType(message: any) {
    try {
      // switch(message.element_gtype) {
      //     case ElementType.NewPad:
      // }
    } catch (e) {
      console.error(
        "[Message Error] Potential issue with structure of message",
        e
      );
    }
  }
}

// In source tests for tracer manager
if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should build pipeline messages as it receives them ", () => {

  });
}
