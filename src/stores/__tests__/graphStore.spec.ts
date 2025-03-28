import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGraphStore } from '../graphStore';
import layoutRegistry from '../layoutRegistry';

describe('graphStore', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
  });

  it('initializes with default state', () => {
    const store = useGraphStore();
    expect(store.entities).toEqual([]);
    expect(store.relations).toEqual([]);
    expect(store.layoutName).toBe('cola');
    expect(store.showAdvancedOptions).toBe(false);
    expect(store.animate).toBe(true);
    expect(store.showLegend).toBe(false);
    expect(store.selectedNode).toBe(null);
    expect(store.searchQuery).toBe('');
    expect(store.searchResults).toEqual([]);
    expect(store.savedFilters).toEqual([]);
    expect(store.activeFilters).toEqual([]);
    expect(store.filterCombination).toBe('AND');
  });

  it('sets graph data correctly', () => {
    const store = useGraphStore();
    const testData = {
      entities: [
        {
          name: 'Entity1',
          entityType: 'Type1',
          observations: ['Observation1']
        }
      ],
      relations: [
        {
          from: 'Entity1',
          to: 'Entity2',
          relationType: 'relates-to'
        }
      ]
    };
    
    store.setGraphData(testData);
    expect(store.entities).toEqual(testData.entities);
    expect(store.relations).toEqual(testData.relations);
  });

  it('initializes layout settings correctly', () => {
    const store = useGraphStore();
    store.initLayoutSettings();
    
    // Check that layout settings are initialized from the registry
    const defaultLayout = 'cola';
    const defaultSettings = layoutRegistry[defaultLayout]?.defaults || {};
    expect(store.layoutSettings).toEqual(defaultSettings);
  });

  it('sets layout name and updates settings', () => {
    const store = useGraphStore();
    const newLayout = 'dagre';
    
    store.setLayoutName(newLayout);
    expect(store.layoutName).toBe(newLayout);
    
    // Check that layout settings are updated
    const defaultSettings = layoutRegistry[newLayout]?.defaults || {};
    expect(store.layoutSettings).toEqual(defaultSettings);
  });

  it('updates layout settings correctly', () => {
    const store = useGraphStore();
    const newSettings = { nodeSpacing: 150 };
    
    store.updateLayoutSettings(newSettings);
    expect(store.layoutSettings.nodeSpacing).toBe(150);
  });

  it('resets layout settings to defaults', () => {
    const store = useGraphStore();
    const newSettings = { nodeSpacing: 150 };
    
    store.updateLayoutSettings(newSettings);
    store.resetLayoutSettings();
    
    // Check that layout settings are reset to defaults
    const defaultLayout = store.layoutName;
    const defaultSettings = layoutRegistry[defaultLayout]?.defaults || {};
    expect(store.layoutSettings).toEqual(defaultSettings);
  });

  it('toggles advanced options', () => {
    const store = useGraphStore();
    const initialValue = store.showAdvancedOptions;
    
    store.toggleAdvancedOptions();
    expect(store.showAdvancedOptions).toBe(!initialValue);
  });

  it('toggles legend', () => {
    const store = useGraphStore();
    const initialValue = store.showLegend;
    
    store.toggleLegend();
    expect(store.showLegend).toBe(!initialValue);
  });

  it('selects and clears node', () => {
    const store = useGraphStore();
    const testNode = {
      label: 'Test Node',
      type: 'Test Type',
      observations: ['Test Observation']
    };
    
    store.selectNode(testNode);
    expect(store.selectedNode).toEqual(testNode);
    
    store.clearSelectedNode();
    expect(store.selectedNode).toBe(null);
  });

  it('sets search query and updates results', () => {
    const store = useGraphStore();
    
    // Add test entities
    store.setGraphData({
      entities: [
        {
          name: 'Entity1',
          entityType: 'Type1',
          observations: ['Observation1']
        },
        {
          name: 'Entity2',
          entityType: 'Type2',
          observations: ['Observation2']
        }
      ],
      relations: []
    });
    
    // Search for Type1
    store.setSearchQuery('type:Type1');
    
    // Check that search results include only Entity1
    expect(store.searchResults).toContain('Entity1');
    expect(store.searchResults).not.toContain('Entity2');
    
    // Check that search history is updated
    expect(store.searchHistory).toContain('type:Type1');
  });

  it('navigates through search results', () => {
    const store = useGraphStore();
    
    // Add test entities and set search results
    store.setGraphData({
      entities: [
        {
          name: 'Entity1',
          entityType: 'Type1',
          observations: ['Observation1']
        },
        {
          name: 'Entity2',
          entityType: 'Type1',
          observations: ['Observation2']
        }
      ],
      relations: []
    });
    
    store.setSearchQuery('type:Type1');
    expect(store.searchResults.length).toBe(2);
    expect(store.currentSearchIndex).toBe(0);
    
    // Navigate to next result
    store.nextSearchResult();
    expect(store.currentSearchIndex).toBe(1);
    
    // Navigate to next result (should wrap around)
    store.nextSearchResult();
    expect(store.currentSearchIndex).toBe(0);
    
    // Navigate to previous result (should wrap around)
    store.previousSearchResult();
    expect(store.currentSearchIndex).toBe(1);
  });

  it('clears search', () => {
    const store = useGraphStore();
    
    // Set up search state
    store.setSearchQuery('test');
    store.searchResults = ['Entity1', 'Entity2'];
    store.currentSearchIndex = 0;
    
    // Clear search
    store.clearSearch();
    
    // Check that search state is reset
    expect(store.searchQuery).toBe('');
    expect(store.searchResults).toEqual([]);
    expect(store.currentSearchIndex).toBe(-1);
  });

  it('manages filters correctly', () => {
    const store = useGraphStore();
    
    // Save a filter
    store.saveFilter('type:Type1');
    expect(store.savedFilters).toContain('type:Type1');
    
    // Add active filter
    store.addActiveFilter('type:Type1');
    expect(store.activeFilters).toContain('type:Type1');
    
    // Remove active filter
    store.removeActiveFilter('type:Type1');
    expect(store.activeFilters).not.toContain('type:Type1');
    
    // Delete filter
    store.deleteFilter('type:Type1');
    expect(store.savedFilters).not.toContain('type:Type1');
  });

  it('toggles filter combination mode', () => {
    const store = useGraphStore();
    const initialMode = store.filterCombination;
    
    store.toggleFilterCombination();
    expect(store.filterCombination).toBe(initialMode === 'AND' ? 'OR' : 'AND');
  });
});
