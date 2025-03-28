<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import euler from 'cytoscape-euler';
import dagre from 'cytoscape-dagre';
import GraphControls from './GraphControls.vue';
import { useGraphStore } from '@/stores/graphStore';

// Register Cytoscape extensions
cytoscape.use(cola);
cytoscape.use(euler);
cytoscape.use(dagre);

// Props
const props = defineProps<{
  graphData: {
    entities: Array<{
      name: string;
      entityType: string;
      observations: string[];
    }>;
    relations: Array<{
      from: string;
      to: string;
      relationType: string;
    }>;
  }
}>();

// Store
const graphStore = useGraphStore();

// Refs
const cyEl = ref<HTMLElement | null>(null);
const cy = ref<any>(null);
const currentLayout = ref<any>(null);

// Check if a layout is physics-based
const isPhysicsLayout = (name: string) => {
  return ['cola', 'euler'].includes(name);
};

// Run layout
const runLayout = () => {
  if (!cy.value) return;
  
  try {
    // Stop any existing layout
    if (currentLayout.value && typeof currentLayout.value.stop === 'function') {
      console.log('Stopping previous layout');
      currentLayout.value.stop();
      currentLayout.value = null;
    }
    
    // Get layout options
    const layoutOptions = graphStore.layoutOptions;
    
    // For physics-based layouts, use a completely different approach based on animation setting
    if (isPhysicsLayout(graphStore.layoutName)) {
      if (!graphStore.animate) {
        // When animation is disabled, use a non-physics layout for initial positioning
        console.log('Animation disabled, using grid layout instead of physics');
        
        // Use grid layout for quick positioning without animation
        const gridLayout = cy.value.layout({
          name: 'grid',
          animate: false,
          fit: true
        });
        
        gridLayout.run();
        
        // Don't store this as the current layout since it's just for initial positioning
        return;
      }
      
      // For animated physics layouts, configure for continuous simulation
      if (graphStore.layoutName === 'cola') {
        // For cola layout, set reasonable values that won't freeze the UI
        layoutOptions.maxSimulationTime = 4000; // Limit simulation time
        layoutOptions.infinite = false; // Don't run infinitely
        layoutOptions.refresh = 1; // Refresh every frame
        layoutOptions.randomize = true; // Start with random positions
        layoutOptions.flow = false; // Disable flow layout which can cause issues
      } else if (graphStore.layoutName === 'euler') {
        // For euler layout, set reasonable values
        layoutOptions.maxIterations = 1000; // Limit iterations
        layoutOptions.infinite = false; // Don't run infinitely
        layoutOptions.timeStep = 20; // Smaller time step for smoother animation
        layoutOptions.refresh = 10; // Refresh every 10 iterations
      }
      
      // Ensure animation settings are respected
      layoutOptions.animate = true;
    }
    
    // Create the layout
    currentLayout.value = cy.value.layout(layoutOptions);
    
    // Run the layout
    currentLayout.value.run();
    
  } catch (error) {
    console.error('Error in runLayout:', error);
    // If layout fails, try to use a fallback layout
    try {
      console.log('Using fallback grid layout');
      currentLayout.value = cy.value.layout({ name: 'grid', animate: false });
      currentLayout.value.run();
    } catch (fallbackError) {
      console.error('Fallback layout also failed:', fallbackError);
    }
  }
};

// Reset view
const resetView = () => {
  if (cy.value) {
    graphStore.resetView(cy.value);
  }
};

// Initialize Cytoscape
const initCytoscape = () => {
  if (!cyEl.value) return;
  
  try {
    // Set graph data in store
    graphStore.setGraphData(props.graphData);
    
    // Initialize layout settings if not already initialized
    if (Object.keys(graphStore.layoutSettings).length === 0) {
      graphStore.initLayoutSettings();
    }

    // Get cytoscape elements
    const elements = graphStore.cytoscapeElements;
    
    // Create Cytoscape instance with performance optimizations
    cy.value = cytoscape({
      container: cyEl.value,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#fff',
            'font-size': 12,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap' as 'wrap',
            'text-max-width': '100px',
            'width': 35,
            'height': 35,
            'text-outline-width': 2,
            'text-outline-opacity': 0.9,
            'background-color': function(ele: any) { 
              const nodeType = ele.data('type');
              return nodeType && Object.prototype.hasOwnProperty.call(graphStore.nodeColors, nodeType) 
                ? graphStore.nodeColors[nodeType] 
                : '#999'; 
            },
            'text-outline-color': function(ele: any) { 
              const nodeType = ele.data('type');
              return nodeType && Object.prototype.hasOwnProperty.call(graphStore.nodeColors, nodeType) 
                ? graphStore.nodeColors[nodeType] 
                : '#999'; 
            }
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': function(ele: any) {
              const relationType = ele.data('label');
              return relationType && Object.prototype.hasOwnProperty.call(graphStore.relationTypes, relationType)
                ? graphStore.relationTypes[relationType]
                : '#999';
            },
            'target-arrow-color': function(ele: any) {
              const relationType = ele.data('label');
              return relationType && Object.prototype.hasOwnProperty.call(graphStore.relationTypes, relationType)
                ? graphStore.relationTypes[relationType]
                : '#999';
            },
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': 10,
            'text-rotation': 'autorotate',
            'text-background-color': '#333',
            'text-background-opacity': 0.7,
            'color': '#fff',
            'text-background-padding': 2,
            'text-background-shape': 'roundrectangle',
            'text-margin-y': 0,
            'text-margin-x': 0,
            'text-halign': 'center',
            'text-valign': 'center'
          }
        }
      ],
      minZoom: 0.05,
      maxZoom: 5,
      wheelSensitivity: 0.3,
      textureOnViewport: false,
      hideEdgesOnViewport: false,
      hideLabelsOnViewport: false,
      motionBlur: false,
      pixelRatio: 'auto',
      autoungrabify: false, // Allow nodes to be moved
      autounselectify: false, // Allow nodes to be selected
      boxSelectionEnabled: true, // Enable box selection
      panningEnabled: true, // Enable panning
      userPanningEnabled: true, // Enable user panning
      zoomingEnabled: true, // Enable zooming
      userZoomingEnabled: true, // Enable user zooming
      autolock: false // Don't lock node positions
    });

    // Show node info on click
    cy.value.on('tap', 'node', function(evt: any) {
      const node = evt.target;
      graphStore.selectNode({
        label: node.data('label'),
        type: node.data('type') || node.data('entityType'),
        observations: node.data('observations') || []
      });
    });

    // Clear selection when clicking on background
    cy.value.on('tap', function(evt: any) {
      if (evt.target === cy.value) {
        graphStore.clearSelectedNode();
      }
    });

    // Run the layout
    runLayout();
    
  } catch (error) {
    console.error('Error initializing Cytoscape:', error);
    alert('Error initializing graph visualization. Please check the console for details.');
  }
};

// Lifecycle hooks
onMounted(() => {
  initCytoscape();
});

onBeforeUnmount(() => {
  // Stop any running layout
  if (currentLayout.value && typeof currentLayout.value.stop === 'function') {
    currentLayout.value.stop();
    currentLayout.value = null;
  }
  
  // Destroy cytoscape instance
  if (cy.value) {
    cy.value.destroy();
    cy.value = null;
  }
});

// Watch for changes in graph data
watch(() => props.graphData, () => {
  if (cy.value) {
    cy.value.destroy();
    initCytoscape();
  }
}, { deep: true });

// Watch for changes in layout settings
watch(() => graphStore.layoutSettings, () => {
  if (cy.value) {
    runLayout();
  }
}, { deep: true });

// Watch for changes in layout name
watch(() => graphStore.layoutName, () => {
  if (cy.value) {
    runLayout();
  }
});
</script>

<template>
  <div class="knowledge-graph-viewer">
    <div class="sidebar">
      <div class="controls-container">
        <GraphControls @run-layout="runLayout" @reset-view="resetView" />
      </div>
      
      <div v-if="graphStore.selectedNode" class="node-info-panel">
        <h3 class="info-title">{{ graphStore.selectedNode?.label }}</h3>
        <div class="info-type">{{ graphStore.selectedNode?.type }}</div>
        <div class="info-observations" v-if="graphStore.selectedNode?.observations.length">
          <ul>
            <li v-for="(obs, index) in graphStore.selectedNode?.observations" :key="index">{{ obs }}</li>
          </ul>
        </div>
      </div>
    </div>
    
    <div id="cy" ref="cyEl"></div>
    
    <div class="legend" v-show="graphStore.showLegend">
      <h4 class="legend-title">Node Types</h4>
      <div id="node-types">
        <div class="legend-item" v-for="(color, type) in graphStore.nodeTypes" :key="type">
          <div class="legend-color" :style="{ backgroundColor: color }"></div>
          <span>{{ type }}</span>
        </div>
      </div>
      <h4 class="legend-title" style="margin-top: 10px;">Relation Types</h4>
      <div id="relation-types">
        <div class="legend-item" v-for="(color, type) in graphStore.relationTypes" :key="type">
          <div class="legend-color" :style="{ backgroundColor: color }"></div>
          <span>{{ type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-graph-viewer {
  display: flex;
  height: 100vh;
  position: relative;
}

.sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  z-index: 100;
  max-height: 100vh;
  overflow-y: auto;
}

.controls-container {
  margin-bottom: 20px;
}

#cy {
  flex-grow: 1;
  width: calc(100% - 320px);
}

.node-info-panel {
  background-color: #333;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  color: #fff;
  margin-top: auto;
  max-height: 40vh;
  overflow-y: auto;
}

.info-title {
  margin-top: 0;
  color: #4dabf7;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
}

.info-type {
  color: #adb5bd;
  font-style: italic;
  margin-bottom: 10px;
}

.info-observations {
  margin-top: 10px;
}

.info-observations ul {
  padding-left: 20px;
}

.legend {
  position: absolute;
  top: 10px;
  right: 15px;
  background-color: #333;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  color: #fff;
  max-width: 200px;
}

.legend-title {
  margin-top: 0;
  font-weight: bold;
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 5px;
}

:deep(.hidden) {
  display: none;
}
</style>
