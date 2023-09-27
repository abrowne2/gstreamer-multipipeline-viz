<script lang="ts">
    import {Node} from 'svelvet';
    export let id: string;
    export let label: string;
    export let position: {x: number, y: number};
    export let width: number;
    export let height: number;
    export let children: any[] = [];
</script>

<Node id={id} label={label} position={position} width={width} height={height} LR={true}>
    {#each children as child (child.id)}
        <svelte:self 
            id={child.id} 
            label={child.label} 
            position={{x: position.x * 0.98, y: position.y * 0.98}} 
            width={width * 0.75} 
            height={height * 0.75} 
            children={child.children} />
    {/each}
</Node>