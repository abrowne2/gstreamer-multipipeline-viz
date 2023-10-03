<script lang="ts">
    import { writable, type Writable } from 'svelte/store';
    import TracerManager from './tracer_mgr/tracer_mgr';
    import { type GstTracerRepository } from './tracer_mgr/tracer_mgr';

    const tracer_repo: Writable<GstTracerRepository> = writable({
        pipelines: [],
        object_map: new Map(),
        bins: [],
        pads: []
    });

    const tracer_server = new WebSocket('ws://localhost:8444');

    const tracer_mgr = new TracerManager(tracer_server, tracer_repo);
</script>