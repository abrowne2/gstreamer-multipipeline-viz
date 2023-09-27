<script lang="ts">
  import { Node, Svelvet, Group, Controls } from 'svelvet';
  import ParentNode from './lib/tracer_mgr/ParentNode.svelte';
  let width: number = window.innerWidth * 0.90;
  let height: number = window.innerHeight * 0.95;
</script>

<!-- cosmetic: When rendering nodes here, we want the root node and the last node to have their inputs and outputs set to 0, respectively. -->
<Svelvet id="graph" {width} {height} TD>
  <Group color="lightblue" groupName="my-group" position={{x: 10, y: 10}} width={width * 0.98 } height={height * 0.96}>
    <ParentNode 
      id="parent"
      label="Parent"
      position={{x: 100, y: 100}}
      width={300}
      height={200}
      children={[
        {
          id: "child",
          label: "Child",
          position: {x: 100, y: 100},
          width: 300,
          height: 200
        },
        // {
        //   id: "child2",
        //   label: "Child2",
        //   position: {x: 100, y: 100},
        //   width: 300,
        //   height: 200
        // }

      ]}
    />
    <Node id="pipeline" useDefaults label="GESPipeline"  connections={["node1"]} position={{x: 100, y: 100}} width={150} height={50} LR={true} inputs={0}>
    </Node>
    <Node id="node1" useDefaults label="Node1" connections={["node2"]} position={{x: 300, y: 100}} width={150} height={50} LR={true}>
    </Node>
    <Node id="node2" label="Node2" useDefaults connections={["node3"]} position={{x: 500, y: 100}} width={150} height={50} LR={true}>
    </Node>
    <Node id="node3" label="Node3" useDefaults connections={[""]} position={{x: 700, y: 100}} width={150} height={50} LR={true} outputs={0}>
    </Node>
  </Group>
</Svelvet>

<style>

</style>