<template>
  <div class="graph-controls">
    <!-- Tweakpane controls will be mounted here -->
  </div>
</template>

<script setup lang="ts">
import { Pane } from 'tweakpane';
import * as TweakpaneTextInput from '@tweakpane/plugin-essentials';
import { onMounted, onBeforeUnmount, watch, ref, reactive } from 'vue';
import { useGraphStore } from '@/stores/graphStore';
import layoutRegistry from '@/stores/layoutRegistry';

const graphStore = useGraphStore();
const emit = defineEmits(['runLayout', 'resetView']);
let pane: any = null;
const layoutFolder = ref<any>(null);
const layoutControls = ref<any[]>([]);
let filtersFolder: any = null;

// Generate layout options for dropdown
const generateLayoutOptions = () => {
  const options: Record<string, string> = {};
  Object.entries(layoutRegistry).forEach(([key, config]) => {
    options[config.name] = key;
  });
  return options;
};

// Create filters UI
const createFiltersUI = (parentFolder: any) => {
  if (filtersFolder) {
    filtersFolder.dispose();
    filtersFolder = null;
  }
  
  if (graphStore.savedFilters.length > 0) {
    filtersFolder = parentFolder.addFolder({
      title: 'Saved Filters',
      expanded: true
    });
    
    const combinationState = reactive({
      get combination() { return graphStore.filterCombination; },
      set combination(value) { 
        graphStore.filterCombination = value as 'AND' | 'OR';
        graphStore.applyFilters();
      }
    });
    
    filtersFolder.addBinding(combinationState, 'combination', {
      label: 'Combine with',
      options: { 'AND': 'AND', 'OR': 'OR' }
    });
    
    graphStore.savedFilters.forEach((filter) => {
      const filterRow = filtersFolder.addFolder({
        title: filter,
        expanded: false
      });
      
      const activeState = reactive({
        get active() { return graphStore.activeFilters.includes(filter); },
        set active(value) {
          if (value) {
            graphStore.addActiveFilter(filter);
          } else {
            graphStore.removeActiveFilter(filter);
          }
        }
      });
      
      filterRow.addBinding(activeState, 'active', {
        label: 'Active'
      });
      
      filterRow.addButton({
        title: 'Apply'
      }).on('click', () => {
        graphStore.setSearchQuery(filter);
      });
      
      filterRow.addButton({
        title: '🗑️',
        label: 'Delete'
      }).on('click', () => {
        graphStore.deleteFilter(filter);
        createFiltersUI(parentFolder);
      });
    });
    
    if (graphStore.activeFilters.length > 0) {
      filtersFolder.addButton({
        title: 'Clear All Filters'
      }).on('click', () => {
        graphStore.activeFilters.slice().forEach(filter => {
          graphStore.removeActiveFilter(filter);
        });
        createFiltersUI(parentFolder);
      });
    }
  }
};

// Initialize search navigation buttons
const initSearchNavigationButtons = (parentFolder: any) => {
  const navFolder = parentFolder.addFolder({
    title: 'Navigation',
    expanded: true
  });

  navFolder.addButton({
    title: '◀ Previous'
  }).on('click', () => {
    graphStore.previousSearchResult();
  });

  navFolder.addButton({
    title: 'Next ▶'
  }).on('click', () => {
    graphStore.nextSearchResult();
  });

  navFolder.addButton({
    title: 'Clear Search'
  }).on('click', () => {
    graphStore.clearSearch();
  });
};

// Create controls for the current layout
const createLayoutControls = () => {
  if (layoutControls.value.length > 0) {
    layoutControls.value.forEach(control => {
      if (control && typeof control.dispose === 'function') {
        control.dispose();
      }
    });
    layoutControls.value = [];
  }
  
  const layoutConfig = graphStore.currentLayoutConfig;
  if (!layoutConfig) return;
  
  // Ensure all required properties exist in layoutSettings
  // This prevents "No matching controller" errors when switching layouts
  Object.entries(layoutConfig.options).forEach(([key, option]) => {
    // Check if the property is undefined or NaN
    if (graphStore.layoutSettings[key] === undefined || 
        (typeof graphStore.layoutSettings[key] === 'number' && isNaN(graphStore.layoutSettings[key]))) {
      graphStore.layoutSettings[key] = option.default;
    }
  });
  
  Object.entries(layoutConfig.options).forEach(([key, option]) => {
    if (option.advanced && !graphStore.showAdvancedOptions) return;
    if (option.depends && !graphStore.layoutSettings[option.depends]) return;
    
    let control;
    
    switch (option.type) {
      case 'slider':
        control = layoutFolder.value.addBinding(graphStore.layoutSettings, key, {
          label: option.label,
          min: option.min,
          max: option.max,
          step: option.step
        });
        break;
      case 'toggle':
        control = layoutFolder.value.addBinding(graphStore.layoutSettings, key, {
          label: option.label
        });
        break;
      case 'select':
        control = layoutFolder.value.addBinding(graphStore.layoutSettings, key, {
          label: option.label,
          options: option.options
        });
        break;
      case 'number':
        control = layoutFolder.value.addBinding(graphStore.layoutSettings, key, {
          label: option.label,
          min: option.min,
          max: option.max,
          step: option.step
        });
        break;
      case 'color':
        control = layoutFolder.value.addBinding(graphStore.layoutSettings, key, {
          label: option.label
        });
        break;
    }
    
    if (control) {
      control.on('change', (ev: any) => {
        // Update the layout setting in the store
        graphStore.updateLayoutSettings({ [key]: ev.value });
        
        // Run the layout with the updated settings
        emit('runLayout');
        
        console.log(`Layout setting changed: ${key} = ${ev.value}`);
      });
      layoutControls.value.push(control);
    }
  });
};

// Initialize layout controls section
const initLayoutControls = () => {
  layoutFolder.value = pane.addFolder({ 
    title: 'Layout Settings',
    expanded: true
  });
  
  const layoutOptions = generateLayoutOptions();
  layoutFolder.value.addBinding(graphStore, 'layoutName', {
    label: 'Layout Algorithm',
    options: layoutOptions,
    view: 'list'
  }).on('change', (ev: { value: string }) => {
    // When layout type changes, initialize settings for the new layout
    graphStore.setLayoutName(ev.value);
    // Recreate the layout controls with the new settings
    createLayoutControls();
    emit('runLayout');
  });
  
  layoutFolder.value.addBinding(graphStore, 'showAdvancedOptions', {
    label: 'Show Advanced Options'
  }).on('change', () => {
    createLayoutControls();
  });
};

// Initialize animation controls section
const initAnimationControls = () => {
  const animationFolder = pane.addFolder({
    title: 'Animation',
    expanded: false
  });
  
  animationFolder.addBinding(graphStore, 'animate', {
    label: 'Enable Animation'
  }).on('change', () => {
    emit('runLayout');
  });
  
  animationFolder.addBinding(graphStore, 'animationDuration', {
    label: 'Duration (ms)',
    min: 200,
    max: 2000,
    step: 100
  }).on('change', () => {
    emit('runLayout');
  });
};

// Initialize action buttons section
const initActionButtons = () => {
  const actionsFolder = pane.addFolder({ title: 'Actions' });
  
  actionsFolder.addButton({ title: 'Apply Layout' }).on('click', () => {
    emit('runLayout');
  });
  
  actionsFolder.addButton({ title: 'Reset Layout Settings' }).on('click', () => {
    graphStore.resetLayoutSettings();
    createLayoutControls();
    emit('runLayout');
  });
  
  actionsFolder.addButton({ title: 'Reset View' }).on('click', () => {
    emit('resetView');
  });
  
  actionsFolder.addButton({ title: 'Toggle Legend' }).on('click', () => {
    graphStore.toggleLegend();
  });
  
  // Add JSON data upload button
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  
  actionsFolder.addButton({ title: 'Upload JSON Data' }).on('click', () => {
    fileInput.click();
  });
  
  fileInput.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    console.log(`Loading file: ${file.name}, size: ${(file.size / 1024).toFixed(2)} KB`);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        console.log(`File content loaded, length: ${content.length} characters`);
        
        const jsonData = JSON.parse(content);
        console.log(`JSON parsed successfully. Entities: ${jsonData.entities?.length || 0}, Relations: ${jsonData.relations?.length || 0}`);
        
        // Validate the JSON structure
        if (validateGraphData(jsonData)) {
          console.log('Graph data validation successful, setting data in store');
          
          // Set the graph data in the store
          graphStore.setGraphData(jsonData);
          
          // Reset the file input
          input.value = '';
          
          // Add a small delay before running the layout to ensure the data is processed
          setTimeout(() => {
            console.log('Running layout after data load');
            emit('runLayout');
          }, 100);
        } else {
          console.error('Invalid JSON format');
          alert('Invalid JSON format. Please upload a file with the correct structure.');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        alert('Error parsing JSON file. Please ensure it is a valid JSON file.');
      }
    };
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Error reading the file. Please try again.');
    };
    
    reader.readAsText(file);
  });
  
  // Add sample JSON download button
  actionsFolder.addButton({ title: 'Download Sample JSON' }).on('click', () => {
    window.open('/sample-graph-data.json', '_blank');
  });
};

// Validate graph data structure
const validateGraphData = (data: any): boolean => {
  console.log('Validating graph data:', data);
  
  // Check if data has entities and relations arrays
  if (!data || !Array.isArray(data.entities) || !Array.isArray(data.relations)) {
    console.error('Invalid data structure: missing entities or relations arrays');
    return false;
  }
  
  // Check if entities have the required properties
  for (const entity of data.entities) {
    if (!entity.name || !entity.entityType || !Array.isArray(entity.observations)) {
      console.error('Invalid entity:', entity);
      return false;
    }
  }
  
  // Check if relations have the required properties
  for (const relation of data.relations) {
    if (!relation.from || !relation.to || !relation.relationType) {
      console.error('Invalid relation:', relation);
      return false;
    }
  }
  
  console.log('Graph data validation successful');
  return true;
};

// Initialize search controls section
const initSearchControls = () => {
  const searchFolder = pane.addFolder({ 
    title: 'Search',
    expanded: true 
  });

  const searchState = reactive({
    query: graphStore.searchQuery || '',
    get results() {
      const count = graphStore.searchResults.length;
      const index = graphStore.currentSearchIndex;
      return count > 0 ? `${index + 1}/${count} found` : '0 found';
    }
  });

  const searchInput = searchFolder.addBinding(searchState, 'query', {
    label: 'Search Nodes',
    view: 'text',
    format: (v: string) => v || '',
    parse: (v: string) => v
  });

  const resultsBinding = searchFolder.addBinding({
    get results() { return searchState.results; }
  }, 'results', {
    label: 'Results',
    readonly: true,
    view: 'text'
  });

  let searchTimeout: any = null;
  const updateSearch = (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      graphStore.setSearchQuery(value);
    }, 300);
  };

  searchInput.on('change', (ev: any) => {
    const value = ev.value?.trim() || '';
    updateSearch(value);
  });

  watch(() => graphStore.searchQuery, (newQuery) => {
    if (searchState.query !== newQuery) {
      searchState.query = newQuery || '';
      searchInput.refresh();
    }
  });

  watch([() => graphStore.searchResults.length, () => graphStore.currentSearchIndex], () => {
    resultsBinding.refresh();
  });

  searchFolder.addButton({
    title: 'Save as Filter'
  }).on('click', () => {
    if (searchState.query.trim()) {
      graphStore.saveFilter(searchState.query.trim());
      createFiltersUI(searchFolder);
    }
  });

  searchFolder.addBinding({
    tips: 'Search by:\n• Node type: type:Feature\n• Content: has:configuration\n• Text: kubernetes service\n\nPress Enter to search'
  }, 'tips', {
    label: 'Search Help',
    readonly: true,
    multiline: true
  });

  createFiltersUI(searchFolder);
  initSearchNavigationButtons(searchFolder);

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
      const value = searchState.query.trim();
      graphStore.setSearchQuery(value);
    }
  };
  
  watch(() => graphStore.savedFilters, () => {
    createFiltersUI(searchFolder);
  }, { deep: true });

  window.addEventListener('keydown', handleSearchKeyDown);
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleSearchKeyDown);
  });
};

// Initialize the pane
const initPane = () => {
  pane = new Pane({
    title: 'Graph Controls',
    expanded: true,
    container: document.querySelector('.graph-controls') as HTMLElement,
  });
  pane.registerPlugin(TweakpaneTextInput);

  initLayoutControls();
  initAnimationControls();
  initActionButtons();
  initSearchControls();
  
  createLayoutControls();
};

// Watch for changes in layout settings that might affect dependent options
watch(() => graphStore.layoutSettings, () => {
  const layoutConfig = graphStore.currentLayoutConfig;
  if (!layoutConfig) return;
  
  let hasDependencies = false;
  Object.values(layoutConfig.options).forEach(option => {
    if (option.depends) hasDependencies = true;
  });
  
  if (hasDependencies) {
    createLayoutControls();
  }
}, { deep: true });

onMounted(() => {
  if (Object.keys(graphStore.layoutSettings).length === 0) {
    graphStore.initLayoutSettings();
  }
  
  initPane();
});

onBeforeUnmount(() => {
  if (pane) {
    pane.dispose();
  }
});
</script>

<style scoped>
.graph-controls {
  width: 100%;
}
</style>
