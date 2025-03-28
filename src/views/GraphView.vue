<script setup lang="ts">
import KnowledgeGraphViewer from '@/components/KnowledgeGraphViewer.vue';
import { useGraphStore } from '@/stores/graphStore';
import { onMounted, computed, ref } from 'vue';

// Store
const graphStore = useGraphStore();

// Default knowledge graph data from Memory MCP server
const defaultGraphData = {
  entities: [
    {
      name: "NixOS Config Repository",
      entityType: "Repository",
      observations: [
        "A NixOS configuration repository for both macOS (Darwin) and Linux (NixOS) systems",
        "Built off of https://github.com/dustinlyons/nixos-config",
        "Includes configurations for system packages, home-manager, YubiKey integration, and MCP servers",
        "Uses flakes for reproducible builds and easy deployment",
        "Supports secret management with YubiKey, GPG, and SOPS"
      ]
    },
    {
      name: "Darwin Configuration",
      entityType: "Configuration",
      observations: [
        "Configuration for macOS systems using nix-darwin",
        "Includes packages, casks, home-manager, and MCP server configurations",
        "Supports YubiKey integration for GPG and SSH authentication",
        "Uses SOPS for secret management",
        "Configured in modules/darwin/ directory"
      ]
    },
    {
      name: "NixOS Configuration",
      entityType: "Configuration",
      observations: [
        "Configuration for Linux systems using NixOS",
        "Includes packages, home-manager, and disk configuration",
        "Supports YubiKey integration for GPG and SSH authentication",
        "Uses SOPS for secret management",
        "Configured in modules/nixos/ directory"
      ]
    }
  ],
  relations: [
    {
      from: "NixOS Config Repository",
      to: "Darwin Configuration",
      relationType: "contains"
    },
    {
      from: "NixOS Config Repository",
      to: "NixOS Configuration",
      relationType: "contains"
    }
  ]
};

// Computed property to get current graph data from store
const graphData = computed(() => {
  // If store has data, use it; otherwise use default data
  if (graphStore.entities.length > 0 || graphStore.relations.length > 0) {
    return {
      entities: graphStore.entities,
      relations: graphStore.relations
    };
  }
  return defaultGraphData;
});

// Reference to the KnowledgeGraphViewer component
const knowledgeGraphViewer = ref(null);

// Run layout function
const runLayout = () => {
  if (knowledgeGraphViewer.value) {
    knowledgeGraphViewer.value.runLayout();
  }
};

// Reset view function
const resetView = () => {
  if (knowledgeGraphViewer.value) {
    knowledgeGraphViewer.value.resetView();
  }
};

// Initialize store with default data if empty
onMounted(() => {
  if (graphStore.entities.length === 0 && graphStore.relations.length === 0) {
    graphStore.setGraphData(defaultGraphData);
  }
});
</script>

<template>
  <div class="graph-view">
    <KnowledgeGraphViewer ref="knowledgeGraphViewer" :graph-data="graphData" />
  </div>
</template>

<style scoped>
.graph-view {
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
</style>
