import { defineStore } from 'pinia';
import layoutRegistry from './layoutRegistry';

export const useGraphStore = defineStore('graph', {
  state: () => {
    // Get default layout settings
    const defaultLayout = 'cola';
    const defaultSettings = layoutRegistry[defaultLayout]?.defaults || {};
    
    return {
      // Graph data
      entities: [] as Array<{
        name: string;
        entityType: string;
        observations: string[];
      }>,
      relations: [] as Array<{
        from: string;
        to: string;
        relationType: string;
      }>,
      
      // UI state
      layoutName: defaultLayout,
      layoutSettings: { ...defaultSettings } as Record<string, any>,
      showAdvancedOptions: false,
      animate: true,
      animationDuration: 800,
      showLegend: false,
      selectedNode: null as {
        label: string;
        type: string;
        observations: string[];
      } | null,
      searchQuery: '',
      searchHistory: [] as string[],
      currentSearchIndex: -1,
      searchResults: [] as string[],
      savedFilters: [] as string[],
      activeFilters: [] as string[],
      filterCombination: 'AND' as 'AND' | 'OR',
      
      // Node types and colors
      nodeTypes: {} as Record<string, string>,
      relationTypes: {} as Record<string, string>,
      nodeColors: {} as Record<string, string>,
      // Color palette for dynamic assignment
      colorPalette: [
        '#4285F4', // Blue
        '#34A853', // Green
        '#FBBC05', // Yellow
        '#EA4335', // Red
        '#8F44AD', // Purple
        '#3498DB', // Light Blue
        '#1ABC9C', // Teal
        '#F39C12', // Orange
        '#E74C3C', // Bright Red
        '#9B59B6', // Violet
        '#2ECC71', // Emerald
        '#16A085', // Dark Teal
        '#27AE60', // Dark Green
        '#D35400', // Dark Orange
        '#7F8C8D', // Gray
        '#C0392B', // Dark Red
        '#2980B9', // Dark Blue
        '#8E44AD', // Dark Purple
        '#F1C40F'  // Gold
      ]
    };
  },
  
  getters: {
    // Get elements in Cytoscape format
    cytoscapeElements: (state) => {
      console.time('Generate Cytoscape elements');
      const elements: any[] = [];
      
      // Create a map of entity names to check if they exist
      // This is more efficient than checking array includes for large datasets
      const entityMap = new Map();
      state.entities.forEach(entity => {
        entityMap.set(entity.name, true);
      });
      
      // Add nodes in batch for better performance
      console.log(`Processing ${state.entities.length} entities...`);
      state.entities.forEach(entity => {
        // Normalize entity type
        const entityType = entity.entityType;
        const entityTypeLower = entityType.toLowerCase();
        
        elements.push({
          data: {
            id: entity.name,
            label: entity.name,
            type: entityType,
            entityType: entityType,
            entityTypeLower: entityTypeLower,
            observations: entity.observations,
            color: state.nodeColors[entityType] || '#999'
          }
        });
        
        // Collect node types
        if (!state.nodeTypes[entityType]) {
          state.nodeTypes[entityType] = 
            Object.prototype.hasOwnProperty.call(state.nodeColors, entityType) 
              ? state.nodeColors[entityType] 
              : '#999';
        }
      });
      
      // Add edges in batch for better performance
      console.log(`Processing ${state.relations.length} relations...`);
      
      // Filter out relations with missing entities to prevent errors
      const validRelations = state.relations.filter(relation => 
        entityMap.has(relation.from) && entityMap.has(relation.to)
      );
      
      if (validRelations.length !== state.relations.length) {
        console.warn(`Filtered out ${state.relations.length - validRelations.length} relations with missing entities`);
      }
      
      validRelations.forEach(relation => {
        elements.push({
          data: {
            id: `${relation.from}-${relation.to}-${relation.relationType}`,
            source: relation.from,
            target: relation.to,
            label: relation.relationType
          }
        });
        
        // Collect relation types
        if (!state.relationTypes[relation.relationType]) {
          state.relationTypes[relation.relationType] = '#999'; // Default color for relation types
        }
      });
      
      console.timeEnd('Generate Cytoscape elements');
      return elements;
    },
    
    // Filtered nodes based on search query or active filters
    filteredNodes: (state) => {
      // Helper function to evaluate a single filter
      const evaluateFilter = (entity: {
        name: string;
        entityType: string;
        observations: string[];
      }, filter: string): boolean => {
        if (!filter.trim()) return true;
        
        const query = filter.trim();
        
        // Handle type: operator
        const typeMatch = query.match(/^type:(\w+)$/i);
        if (typeMatch) {
          const searchType = typeMatch[1].toLowerCase();
          const entityType = entity.entityType.toLowerCase();
          return entityType === searchType;
        }
        
        // Handle has: operator for observations
        const hasMatch = query.match(/^has:(.+)$/i);
        if (hasMatch) {
          const searchTerm = hasMatch[1].toLowerCase();
          return entity.observations.some((obs: string) => 
            obs.toLowerCase().includes(searchTerm)
          );
        }
        
        // Regular text search
        const searchTerms = query.toLowerCase().split(/\s+/);
        const searchText = [
          entity.name,
          entity.entityType,
          ...entity.observations
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchText.includes(term));
      };
      
      // If using active filters
      if (state.activeFilters.length > 0) {
        return state.entities.filter(entity => {
          // Evaluate each filter
          const filterResults = state.activeFilters.map(filter => 
            evaluateFilter(entity, filter)
          );
          
          // Combine results based on selected combination mode
          if (state.filterCombination === 'AND') {
            return filterResults.every(result => result);
          } else {
            return filterResults.some(result => result);
          }
        });
      }
      
      // If using search query
      if (state.searchQuery.trim()) {
        return state.entities.filter(entity => 
          evaluateFilter(entity, state.searchQuery)
        );
      }
      
      // No filters or search
      return [];
    },

    // Get search suggestions based on current input
    searchSuggestions: (state) => {
      const suggestions: string[] = [];
      
      // Add type suggestions
      Object.keys(state.nodeTypes).forEach(type => {
        suggestions.push(`type:${type}`);
      });

      // Add common operators
      suggestions.push('has:', 'type:');

      return suggestions;
    },
    
    // Get available layout algorithms
    availableLayouts: () => {
      return Object.keys(layoutRegistry).map(key => ({
        value: key,
        label: layoutRegistry[key].name
      }));
    },
    
    // Get current layout config
    currentLayoutConfig: (state) => {
      return layoutRegistry[state.layoutName] || null;
    },
    
    // Get current layout options based on layout name and settings
    layoutOptions: (state) => {
      const options: any = {
        name: state.layoutName,
        fit: true,
        animate: state.animate,
        animationDuration: state.animationDuration
      };
      
      // Add all settings from the layout settings object
      // Filter out undefined values (for optional parameters that have been unset)
      for (const key in state.layoutSettings) {
        if (state.layoutSettings[key] !== undefined) {
          // Special handling for concentric layout
          if (state.layoutName === 'concentric') {
            if (key === 'concentricMetric') {
              const metric = state.layoutSettings[key];
              options.concentric = (node: any) => {
                switch (metric) {
                  case 'degree':
                    return node.degree();
                  case 'indegree':
                    return node.indegree();
                  case 'outdegree':
                    return node.outdegree();
                  default:
                    return 0;
                }
              };
            } else if (key === 'levelSpacing') {
              // Use levelSpacing to determine distance between levels
              options.minNodeSpacing = state.layoutSettings.minNodeSpacing;
              options.levelWidth = (nodes: any[]) => {
                return state.layoutSettings.levelSpacing;
              };
            } else if (key === 'startAngle' || key === 'sweep') {
              // Convert angles from degrees to radians
              options[key] = (state.layoutSettings[key] * Math.PI) / 180;
            } else if (!['levelSpacing'].includes(key)) {
              // Add all other settings except those handled specially
              options[key] = state.layoutSettings[key];
            }
          }
          // Special handling for breadthfirst layout
          else if (state.layoutName === 'breadthfirst') {
            if (key === 'direction') {
              options[key] = state.layoutSettings[key];
              // Adjust roots based on direction
              options.roots = (nodes: any) => {
                if (state.layoutSettings[key] === 'LR' || state.layoutSettings[key] === 'RL') {
                  return nodes.roots(); // Use nodes with no incoming edges
                }
                return undefined; // Let Cytoscape decide
              };
            } else {
              options[key] = state.layoutSettings[key];
            }
          }
          // Default handling for other layouts
          else {
            options[key] = state.layoutSettings[key];
          }
        }
      }
      
      return options;
    }
  },
  
  actions: {
    // Set graph data
    setGraphData(data: {
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
    }) {
      this.entities = data.entities;
      this.relations = data.relations;
      
      // Reset node types and colors
      this.nodeTypes = {};
      this.nodeColors = {};
      this.relationTypes = {};
      
      // Collect unique entity types
      const entityTypes = new Set<string>();
      data.entities.forEach(entity => {
        entityTypes.add(entity.entityType);
      });
      
      // Assign colors to entity types
      Array.from(entityTypes).forEach((type, index) => {
        const colorIndex = index % this.colorPalette.length;
        this.nodeColors[type] = this.colorPalette[colorIndex];
        this.nodeTypes[type] = this.colorPalette[colorIndex];
      });
      
      // Collect unique relation types
      const relationTypes = new Set<string>();
      data.relations.forEach(relation => {
        relationTypes.add(relation.relationType);
      });
      
      // Assign colors to relation types (using a different starting point in the palette)
      Array.from(relationTypes).forEach((type, index) => {
        const colorIndex = (index + Math.floor(this.colorPalette.length / 2)) % this.colorPalette.length;
        this.relationTypes[type] = this.colorPalette[colorIndex];
      });
    },
    
    // Initialize layout settings from registry
    initLayoutSettings() {
      // Get the current layout config
      const layoutConfig = layoutRegistry[this.layoutName];
      if (!layoutConfig) return;
      
      // Initialize settings with defaults
      this.layoutSettings = { ...layoutConfig.defaults };
      
      // Ensure no NaN values
      for (const key in this.layoutSettings) {
        if (this.layoutSettings[key] !== this.layoutSettings[key]) { // Check for NaN
          if (layoutConfig.options[key]) {
            this.layoutSettings[key] = layoutConfig.options[key].default;
          } else {
            delete this.layoutSettings[key]; // Remove invalid settings
          }
        }
      }
    },
    
    // Layout actions
    setLayoutName(name: string) {
      if (this.layoutName === name) return;
      
      // Save the current layout name
      this.layoutName = name;
      
      // Get the new layout config
      const layoutConfig = layoutRegistry[name];
      if (!layoutConfig) return;
      
      // Clear existing settings to avoid conflicts between different layouts
      this.layoutSettings = {};
      
      // Initialize with new layout's defaults and ensure no NaN values
      const sanitizedDefaults = { ...layoutConfig.defaults };
      
      // Check for and fix any NaN values in the defaults
      for (const key in sanitizedDefaults) {
        if (typeof sanitizedDefaults[key] === 'number' && isNaN(sanitizedDefaults[key])) {
          // If a default value is NaN, set it to a reasonable value based on the option type
          const option = layoutConfig.options[key];
          if (option) {
            if (option.min !== undefined && option.max !== undefined) {
              // Use the middle value between min and max
              sanitizedDefaults[key] = (option.min + option.max) / 2;
            } else {
              // Use 0 as a fallback
              sanitizedDefaults[key] = 0;
            }
          }
        }
      }
      
      this.layoutSettings = sanitizedDefaults;
    },
    
    updateLayoutSettings(settings: Partial<typeof this.layoutSettings>) {
      this.layoutSettings = { ...this.layoutSettings, ...settings };
    },
    
    // Reset layout settings to defaults
    resetLayoutSettings() {
      this.initLayoutSettings();
    },
    
    // Unset a specific layout parameter
    unsetLayoutParameter(key: string) {
      if (Object.prototype.hasOwnProperty.call(this.layoutSettings, key)) {
        delete this.layoutSettings[key];
      }
    },
    
    // Toggle advanced options
    toggleAdvancedOptions() {
      this.showAdvancedOptions = !this.showAdvancedOptions;
    },
    
    // UI actions
    toggleLegend() {
      this.showLegend = !this.showLegend;
    },
    
    selectNode(node: {
      label: string;
      type: string;
      observations: string[];
    }) {
      this.selectedNode = node;
    },
    
    clearSelectedNode() {
      this.selectedNode = null;
    },
    
    setSearchQuery(query: string) {
      console.log('Setting search query:', query);
      this.searchQuery = query;
      
      // Get filtered nodes
      const filtered = this.filteredNodes;
      console.log('Filtered nodes:', filtered);
      
      // Update search results
      this.searchResults = filtered.map(node => node.name);
      console.log('Search results:', this.searchResults);
      
      // Update current index
      this.currentSearchIndex = this.searchResults.length > 0 ? 0 : -1;
      console.log('Current search index:', this.currentSearchIndex);
      
      // Add to search history if not empty and unique
      if (query && !this.searchHistory.includes(query)) {
        this.searchHistory = [query, ...this.searchHistory].slice(0, 10);
      }
      
      // Log final state
      console.log('Search state:', {
        query: this.searchQuery,
        results: this.searchResults,
        currentIndex: this.currentSearchIndex
      });
    },

    // Navigate through search results
    nextSearchResult() {
      if (this.searchResults.length === 0) return;
      this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
      this.selectNodeByName(this.searchResults[this.currentSearchIndex]);
    },

    previousSearchResult() {
      if (this.searchResults.length === 0) return;
      this.currentSearchIndex = this.currentSearchIndex <= 0 
        ? this.searchResults.length - 1 
        : this.currentSearchIndex - 1;
      this.selectNodeByName(this.searchResults[this.currentSearchIndex]);
    },

    // Select node by name
    selectNodeByName(nodeName: string) {
      const entity = this.entities.find(e => e.name === nodeName);
      if (entity) {
        this.selectNode({
          label: entity.name,
          type: entity.entityType,
          observations: entity.observations
        });
      }
    },

    // Clear search
    clearSearch() {
      console.log('Clearing search');
      this.searchQuery = '';
      this.searchResults = [];
      this.currentSearchIndex = -1;
      console.log('Search cleared');
    },
    
    // Saved filters actions
    saveFilter(filter: string) {
      if (filter && !this.savedFilters.includes(filter)) {
        this.savedFilters.push(filter);
      }
    },
    
    deleteFilter(filter: string) {
      const index = this.savedFilters.indexOf(filter);
      if (index !== -1) {
        this.savedFilters.splice(index, 1);
        
        // Also remove from active filters if present
        this.removeActiveFilter(filter);
      }
    },
    
    // Add a filter to active filters
    addActiveFilter(filter: string) {
      if (!this.activeFilters.includes(filter)) {
        this.activeFilters.push(filter);
        this.applyFilters();
      }
    },
    
    // Remove a filter from active filters
    removeActiveFilter(filter: string) {
      const index = this.activeFilters.indexOf(filter);
      if (index !== -1) {
        this.activeFilters.splice(index, 1);
        this.applyFilters();
      }
    },
    
    // Toggle filter combination mode
    toggleFilterCombination() {
      this.filterCombination = this.filterCombination === 'AND' ? 'OR' : 'AND';
      this.applyFilters();
    },
    
    // Apply all active filters
    applyFilters() {
      // Get filtered nodes
      const filtered = this.filteredNodes;
      
      // Update search results
      this.searchResults = filtered.map(node => node.name);
      
      // Update current index
      this.currentSearchIndex = this.searchResults.length > 0 ? 0 : -1;
      
      // Log final state
      console.log('Filter state:', {
        activeFilters: this.activeFilters,
        combination: this.filterCombination,
        results: this.searchResults,
        currentIndex: this.currentSearchIndex
      });
    },
    
    // Run layout with current settings
    runLayout(cy: any) {
      if (!cy) return;
      
      // Get layout options from getter
      const layoutOptions = this.layoutOptions;
      
      // For physics-based layouts, modify options to run continuously
      if (['cola', 'euler'].includes(this.layoutName)) {
        if (this.layoutName === 'cola') {
          // For cola layout, set simulation time based on animation setting
          if (this.animate) {
            layoutOptions.maxSimulationTime = Infinity;
            layoutOptions.infinite = true;
          } else {
            // For non-animated layouts, use a large but finite value
            layoutOptions.maxSimulationTime = 10000;
            layoutOptions.infinite = false;
          }
        } else if (this.layoutName === 'euler') {
          // For euler layout, set iterations based on animation setting
          if (this.animate) {
            layoutOptions.maxIterations = Infinity;
            layoutOptions.infinite = true;
          } else {
            // For non-animated layouts, use a large but finite number of iterations
            layoutOptions.maxIterations = 2000;
            layoutOptions.infinite = false;
          }
        }
        
        // Ensure animation settings are respected
        layoutOptions.animate = this.animate;
        
        console.log(`Physics layout with animation: ${this.animate}, infinite: ${layoutOptions.infinite}`);
      }
      
      // Run the layout
      const layout = cy.layout(layoutOptions);
      layout.run();
      
      // Log layout options for debugging
      console.log(`Running ${this.layoutName} layout with options:`, layoutOptions);
    },
    
    // Reset view to fit all nodes
    resetView(cy: any) {
      if (cy) {
        cy.fit();
        cy.center();
      }
    }
  }
});
