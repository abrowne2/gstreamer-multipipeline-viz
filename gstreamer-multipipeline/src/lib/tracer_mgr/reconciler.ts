import type { Writable } from "svelte/store";
import { TracerRepository } from "../sockets";
import {
  type Bin,
  type Object,
  type Pipeline,
  MessageType,
  GType,
  type Pad,
} from "../tracer_types";
import type { GstTracerRepository } from "./tracer_mgr";

enum ElementFactoryName {
  None = "",
}
export default class TracerReconciler {
    public tracerRepo: Writable<GstTracerRepository>;

    constructor(tracerRepo: Writable<GstTracerRepository>) {
        this.tracerRepo = tracerRepo;
    }
  
    public handleMessage(type: MessageType, message: any) {
        console.log(type)
        if (type.toString().includes("pad")) {
            this.handlePadMessage(type, message);
        } else if (type.toString().includes("bin")) {
            this.handleBinMessage(type, message);
        } else {
            this.handleGeneralMessage(type, message);
        }
    }

    private handlePadMessage(type: MessageType, message: any) {
        switch (type) {
            case MessageType.NewPad:
                // handle new pad
                break;
            case MessageType.PadLinked:
                // handle pad linked
                break;
            case MessageType.PadUnlinked:
                // handle pad unlinked
                break;
            case MessageType.PadRemoved:
                // handle pad removed
                break;
            default:
                throw new Error("Invalid pad message type");
        }
    }

    private handleBinMessage(type: MessageType, message: any) {
        switch (type) {
            case MessageType.BinAdded:
                // handle bin added
                break;
            case MessageType.BinRemoved:
                // handle bin removed
                break;
            default:
                throw new Error("Invalid bin message type");
        }
    }

    private handleGeneralMessage(type: MessageType, message: any) {
        switch (type) {
            case MessageType.NewObject:
                this.handleNewElement(message);
                break;
            case MessageType.ElementChangedState:
                // handle element changed state
                break;
            case MessageType.ObjectDestroyed:
                // handle object destroyed
                break;
            default:
                throw new Error("Invalid general message type");
        }
    }

  public handleNewElement(message: any) {
    // Extract the factory name, gtype and objectid from the message
    const factoryName = message.element_factory;

    // Create a new element based on the factory name
    switch(factoryName) {
        case ElementFactoryName.None.valueOf():
            const gType = message.element_gtype;
            console.log('gType msg type', gType)
            switch(gType) {
                case GType.Pipeline.valueOf():
                    console.log('Received new pipeline message', message.element_name)
                    this.handleNewPipeline(message);
                    break;
                case GType.Bin.valueOf():
                    console.log('Received new bin message', message.element_name)
                    this.handleNewBin(message);
                    break;
                default:
                    console.log('Received new element message', message.element_name);
                    break;
            }
            break;
        default:
            break;
    }
  }

  public handleNewPipeline(message: any) {
    const objectId: number = message.object_id;

    let newPipeline: Pipeline = {
        ...message,
        bin: null,
        stream_time: 0,
    };

    this.tracerRepo.update(store => {
        store.pipelines.push(newPipeline);

        store.object_map.set(objectId, newPipeline);

        return store;
    });
  }

  public handleNewBin(message: any) {
    const objectId: number = message.object_id;
    let newBin: Bin = {
        ...message,
        polling: false,
        messages: [],
    };

    this.tracerRepo.update(store => {
        store.bins.push(newBin);

        store.object_map.set(objectId, newBin);

        return store;
    });
  }

  public handleNewPad(message: any) {
    const objectId: number = message.object_id;

    let newPad: Pad = {
        ...message,
        direction: message.direction,
        pad_id: message.pad_id,
        pad_name: message.pad_name,
        pad_gtype: message.pad_gtype,
    };

    this.tracerRepo.update(store => {
        store.pads.push(newPad);

        store.object_map.set(objectId, newPad);

        return store;
    });
  }

  public handlePadLink(message: any) {
    const was_linked: boolean = message.was_linked;

    if(was_linked) {
        this.tracerRepo.update(store => {
            // get the pad
            // get the pad's source element
            // get the pad's destination element
            // link the source and destination elements
        
            let currentPad = store.object_map.get(message.object_id);
            
            if(currentPad) {
                let sourceElement = store.object_map.get(message.source);
                let destElement = store.object_map.get(message.destination);
                
                if(sourceElement && destElement) {
                    // link the source and destination elements
                    // sourceElement.link(destElement);
                }
            }
            
            return store;
        })
    }
  }
//   public handlePadLinked(message: any) {
//     // Extract the source and destination pads from the message
//     const sourcePadId = message.source;
//     const destPadId = message.destination;

//     // Get the source and destination pads from your data structure
//     const sourcePad = this.getPadById(sourcePadId);
//     const destPad = this.getPadById(destPadId);

//     // Link the source pad to the destination pad
//     sourcePad.link(destPad);
//   }

//   public handlePadUnlinked(message: any) {
//     // Extract the source and destination pads from the message
//     const sourcePadId = message.source;
//     const destPadId = message.destination;

//     // Get the source and destination pads from your data structure
//     const sourcePad = this.getPadById(sourcePadId);
//     const destPad = this.getPadById(destPadId);

//     // Unlink the source pad from the destination pad
//     sourcePad.unlink(destPad);
//   }

//   public handlePadRemoved(message: any) {
//     // Extract the pad id from the message
//     const padId = message.padId;

//     // Get the pad from your data structure
//     const pad = this.getPadById(padId);

//     // Remove the pad from its source and destination elements
//     pad.sourceElement.removePad(pad);
//     pad.destElement.unlinkPad(pad);

//     // Remove the pad from your data structure
//     this.removePadById(padId);
//   }

//   public handleBinAdded(message: any) {
//     // Extract the bin id from the message
//     const binId = message.binId;

//     // Create a new bin
//     const newBin = new Bin(binId);

//     // Add the new bin to your data structure
//     this.tracerRepo.bins.push(newBin);
//   }

//   public handleBinRemoved(message: any) {
//     // Extract the bin id from the message
//     const binId = message.binId;

//     // Get the bin from your data structure
//     const bin = this.getBinById(binId);

//     // Remove the bin from your data structure
//     this.tracerRepo.bins = this.tracerRepo.bins.filter(b => b.id !== binId);
//   }

//   public handleElementChangedState(message: any) {
//     // Extract the element id and the new state from the message
//     const elementId = message.elementId;
//     const newState = message.newState;

//     // Get the element from your data structure
//     const element = this.getElementById(elementId);

//     // Update the state of the element
//     element.state = newState;
//   }

//   public handleObjectDestroyed(message: any) {
//     // Extract the object id from the message
//     const objectId = message.objectId;

//     // Remove the object from your data structure
//     delete this.tracerRepo.elements[objectId];
//   }
  
//   public handleNewPad(message: any) {
//     // what happens with a new pad?
//     // Get its source and destination element
//     // establish the new pad
//     // link and add it
    
// //     // Extract the source and destination elements from the message
// //     const sourceElementId = message.source;
// //     const destElementId = message.destination;

// //     // Get the source and destination elements from your data structure
// //     const sourceElement = this.getElementById(sourceElementId);
// //     const destElement = this.getElementById(destElementId);

// //     // Create a new pad
// //     const newPad = new Pad(message.padId, sourceElement, destElement);

// //     // Add the new pad to the source element
// //     sourceElement.addPad(newPad);

// //     // Link the new pad to the destination element
// //     destElement.linkPad(newPad);
    
//   }


}