import { writable } from 'svelte/store';
import { WebSocket } from 'ws';

export const TracerRepository = writable<string[]>([]);

// const socket = new WebSocket(import.meta.env.GSTREAMER_TRACER_URL);

