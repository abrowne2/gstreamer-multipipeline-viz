import type { Writable } from "svelte/store";
import { TracerRepository } from "../sockets";
import {
  type Bin,
  type Object,
  type Pipeline,
  MessageType,
  GType,
  type Pad,
  type BinAddMessage,
} from "../tracer_types";
import { get } from 'svelte/store';
import type { GstTracerRepository } from "./tracer_mgr";

enum ElementFactoryName {
  None = null,
  Pipeline = "pipeline"
}

export default class TracerReconciler {
    public tracerRepo: Writable<GstTracerRepository>;

    constructor(tracerRepo: Writable<GstTracerRepository>) {
        this.tracerRepo = tracerRepo;
    }
  
    public handleMessage(type: MessageType, message: any) {
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
                console.log('new pad msg', message)    
            // handle new pad
                break;
            case MessageType.PadLinked:
                console.log('pad linked msg', message)
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
                this.handleNewBinAdded(message);
                // handle bin added

                console.log("NEW STORE", get(this.tracerRepo))
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
            case MessageType.PropertyChanged:
                // property chaged -- update the object map.
                break;
            default:
                console.log(type, "invalid")
                throw new Error("Invalid general message type");
        }
    }

    public handleNewElement(message: any) {

        const factoryName = message.element_factory;
        
        // Create a new element based on the factory name
        switch(factoryName) {
            case ElementFactoryName.Pipeline.valueOf():
                console.log("recieved new pipeline", message)
                this.handleNewPipeline(message);  
                break;
            case ElementFactoryName.None:
                const gType = message.element_gtype;
                
                switch(gType) {
                    case GType.Pad.valueOf():
                        console.log('Received new pad message', message.element_name);
                        this.handleNewPad(message);
                        break;
                    default:
                        console.log('Received new element message', message);
                        break;
                }
                break;
            default:
                // New, not categorized object
                const objectId: number = message.object_id;
                
                let newObject: Object = {
                    ...message,
                };
                console.log("new ELE", newObject)
                this.tracerRepo.update(store => {
                    store.object_map.set(objectId, newObject);
                    return store;
                });
                break;
        }
    }

  public handleNewPipeline(message: any) {
    const objectId: number = message.object_id;

    let newPipeline: Pipeline = {
        ...message,
        bin: {
            polling: false,
            num_children: 0,
            children: [],
            messages: [],
        },
        stream_time: 0,
    };

    this.tracerRepo.update(store => {
        store.pipelines.set(objectId, newPipeline);

        store.object_map.set(objectId, newPipeline);

        return store;
    });
  }

  public handleNewBinAdded(message: any) {
    const objectId: number = message.object_id;
    
    let binAddMsg: BinAddMessage = {
        ...message,
    };

    const binId: number = binAddMsg.bin_id;
    const element_id: number = binAddMsg.element_id;
    
    let newBin: Bin = {
        ...message,
        polling: false,
        messages: [],
    };

    // for this bin, check if it gets added to another object in the area.
    this.tracerRepo.update(store => {
        
        // Check if this binId already exists inside the object map
        if (store.object_map.has(binId)) {
            // console.warn(`Bin with id ${binId} already exists in object map.`);
        } else {
            store.object_map.set(objectId, newBin);
        }

        // get the element that is being added to this bin
        let element = store.object_map.get(element_id);
        let bin_pipeline = store.pipelines.get(binId);
        let newStore = null;

        if (bin_pipeline) {
            // add the bin to the pipeline
            bin_pipeline.bin.children.push(element);
            bin_pipeline.bin.num_children++;
 
            let updatedPipeline = new Map(store.pipelines);
            updatedPipeline.set(binId, bin_pipeline);
    
            newStore = {
                ...store,
                pipelines: updatedPipeline
            };
        } else {
            // check if the object map has the element
            if (!store.object_map.has(binId)) {
                console.error(`Element with id ${element_id} not found in object map.`);

                newStore = store;
            } else {
                // get the element
                let binElement = store.object_map.get(binId) as Bin;
                
                // add the element to the bin
                binElement.children.push(element);
                binElement.num_children++;

                let newObjectMap = new Map(store.object_map);
                newObjectMap.set(binId, binElement);

                newStore = {
                    ...store,
                    object_map: newObjectMap
                }
            }
        }
        
        return newStore;
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
}