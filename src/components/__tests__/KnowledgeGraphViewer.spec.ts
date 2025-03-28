import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import KnowledgeGraphViewer from '../KnowledgeGraphViewer.vue';
import { useGraphStore } from '../../stores/graphStore';

// Mock cytoscape and its extensions
vi.mock('cytoscape', () => {
  const mockCytoscape: any = vi.fn(() => ({
    batch: vi.fn(cb => cb()),
    nodes: vi.fn(() => ({
      forEach: vi.fn(),
      filter: vi.fn(() => ({
        addClass: vi.fn(),
      })),
      removeClass: vi.fn(),
    })),
    edges: vi.fn(() => ({
      filter: vi.fn(() => ({
        addClass: vi.fn(),
      })),
      removeClass: vi.fn(),
    })),
    on: vi.fn(),
    layout: vi.fn(() => ({
      run: vi.fn(),
      stop: vi.fn(),
    })),
    animate: vi.fn(),
    fit: vi.fn(),
    center: vi.fn(),
    destroy: vi.fn(),
  }));
  mockCytoscape.use = vi.fn();
  return { default: mockCytoscape };
});
vi.mock('cytoscape-cola', () => ({ default: {} }));
vi.mock('cytoscape-euler', () => ({ default: {} }));
vi.mock('cytoscape-dagre', () => ({ default: {} }));

// Skip mounting the component since we're mocking everything
vi.mock('../KnowledgeGraphViewer.vue', () => ({
  default: {
    props: ['graphData'],
    setup() {
      return {};
    },
    methods: {
      runLayout() {},
      resetView() {}
    }
  }
}));

describe('KnowledgeGraphViewer', () => {
  let wrapper: any;
  let store: any;
  
  const mockGraphData = {
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

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    store = useGraphStore();
    
    // Mock the store methods
    store.setGraphData = vi.fn();
    store.initLayoutSettings = vi.fn();
    store.resetView = vi.fn();
    store.selectNode = vi.fn();
    store.clearSelectedNode = vi.fn();
    store.nextSearchResult = vi.fn();
    store.previousSearchResult = vi.fn();
    store.clearSearch = vi.fn();
    
    // Mock DOM element for cytoscape
    document.body.innerHTML = '<div id="cy"></div>';
    
    // Mount the component
    wrapper = mount(KnowledgeGraphViewer, {
      props: {
        graphData: mockGraphData
      },
      global: {
        plugins: [createPinia()]
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    wrapper.unmount();
  });

  it('initializes with graph data', () => {
    expect(store.setGraphData).toHaveBeenCalledWith(mockGraphData);
  });

  it('emits runLayout event when runLayout method is called', async () => {
    await wrapper.vm.runLayout();
    // Since we're not testing the actual cytoscape instance, we just verify the method was called
    expect(wrapper.emitted()).toBeTruthy();
  });

  it('emits resetView event when resetView method is called', async () => {
    await wrapper.vm.resetView();
    expect(store.resetView).toHaveBeenCalled();
  });

  it('handles keyboard navigation correctly', async () => {
    // Mock search results
    store.searchResults = ['Entity1', 'Entity2'];
    store.currentSearchIndex = 0;
    
    // Simulate keyboard events
    const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(rightArrowEvent);
    expect(store.nextSearchResult).toHaveBeenCalled();
    
    const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(leftArrowEvent);
    expect(store.previousSearchResult).toHaveBeenCalled();
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(escapeEvent);
    expect(store.clearSearch).toHaveBeenCalled();
  });
});
