// Layout Registry
// This file defines all available layout algorithms and their options

export interface LayoutOption {
  type: 'slider' | 'toggle' | 'select' | 'number' | 'color';
  label: string;
  description?: string;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Record<string, any>;
  depends?: string; // Option this depends on (only shown if that option is enabled)
  advanced?: boolean; // Whether this is an advanced option (hidden by default)
  optional?: boolean; // Whether this option can be undefined/unset
}

export interface LayoutConfig {
  name: string;
  description: string;
  options: Record<string, LayoutOption>;
  defaults: Record<string, any>;
}

export type LayoutRegistry = Record<string, LayoutConfig>;

// Define the layout registry
const layoutRegistry: LayoutRegistry = {
  'cola': {
    name: 'Cola (Force-Directed)',
    description: 'Physics-based layout with constraints',
    options: {
      // Basic options
      nodeSpacing: {
        type: 'slider',
        label: 'Node Spacing',
        description: 'Factor for node repulsion (higher = more space between nodes)',
        default: 120,
        min: 50,
        max: 500,
        step: 10
      },
      edgeLength: {
        type: 'slider',
        label: 'Edge Length',
        description: 'Ideal length of edges',
        default: 180,
        min: 50,
        max: 500,
        step: 10
      },
      avoidOverlap: {
        type: 'toggle',
        label: 'Avoid Overlap',
        description: 'Prevent node overlap',
        default: true
      },
      // Advanced options
      maxSimulationTime: {
        type: 'number',
        label: 'Max Simulation Time',
        description: 'Maximum time to run the simulation (ms)',
        default: 4000,
        min: 1000,
        max: 10000,
        step: 500,
        advanced: true,
        optional: true
      },
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      randomize: {
        type: 'toggle',
        label: 'Randomize',
        description: 'Randomize node positions on init',
        default: false,
        advanced: true,
        optional: true
      },
      unconstrIter: {
        type: 'number',
        label: 'Unconstrained Iterations',
        description: 'Number of iterations with no constraints',
        default: 20,
        min: 0,
        max: 100,
        step: 5,
        advanced: true,
        optional: true
      },
      userConstIter: {
        type: 'number',
        label: 'User Constraint Iterations',
        description: 'Number of iterations with user-specified constraints',
        default: 10,
        min: 0,
        max: 100,
        step: 5,
        advanced: true,
        optional: true
      },
      allConstIter: {
        type: 'number',
        label: 'All Constraints Iterations',
        description: 'Number of iterations with all constraints',
        default: 20,
        min: 0,
        max: 100,
        step: 5,
        advanced: true,
        optional: true
      },
      flow: {
        type: 'toggle',
        label: 'Flow Layout',
        description: 'Use flow layout for directed graphs',
        default: false,
        advanced: true,
        optional: true
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        description: 'Alignment constraint',
        default: 'none',
        options: {
          'None': 'none',
          'Vertical': 'vertical',
          'Horizontal': 'horizontal'
        },
        depends: 'flow',
        advanced: true
      }
    },
    defaults: {
      nodeSpacing: 120,
      edgeLength: 180,
      avoidOverlap: true,
      maxSimulationTime: 4000,
      padding: 50,
      randomize: false,
      unconstrIter: 20,
      userConstIter: 10,
      allConstIter: 20,
      flow: false,
      alignment: 'none'
    }
  },
  'euler': {
    name: 'Euler (Physics)',
    description: 'Physics simulation with spring forces',
    options: {
      // Basic options
      springLength: {
        type: 'slider',
        label: 'Spring Length',
        description: 'Rest length of springs (edges)',
        default: 120,
        min: 30,
        max: 300,
        step: 10
      },
      springCoeff: {
        type: 'slider',
        label: 'Spring Coefficient',
        description: 'Spring coefficient (higher = stiffer)',
        default: 0.0005,
        min: 0.0001,
        max: 0.01,
        step: 0.0001
      },
      gravity: {
        type: 'slider',
        label: 'Gravity',
        description: 'Gravitational strength (higher = more compact)',
        default: -2.0,
        min: -10,
        max: 0,
        step: 0.1
      },
      // Advanced options
      pull: {
        type: 'slider',
        label: 'Pull Strength',
        description: 'Pull strength for connected nodes',
        default: 0.001,
        min: 0.0001,
        max: 0.01,
        step: 0.0001,
        advanced: true,
        optional: true
      },
      theta: {
        type: 'slider',
        label: 'Theta',
        description: 'Barnes-Hut approximation theta (lower = more accurate but slower)',
        default: 0.5,
        min: 0.1,
        max: 1,
        step: 0.05,
        advanced: true
      },
      dragCoeff: {
        type: 'slider',
        label: 'Drag Coefficient',
        description: 'Drag coefficient (higher = more damping)',
        default: 0.05,
        min: 0,
        max: 0.5,
        step: 0.01,
        advanced: true
      },
      timeStep: {
        type: 'slider',
        label: 'Time Step',
        description: 'Integration time step',
        default: 25,
        min: 5,
        max: 50,
        step: 1,
        advanced: true
      },
      maxIterations: {
        type: 'number',
        label: 'Max Iterations',
        description: 'Maximum number of iterations',
        default: 2000,
        min: 500,
        max: 10000,
        step: 100,
        advanced: true
      },
      randomize: {
        type: 'toggle',
        label: 'Randomize',
        description: 'Randomize node positions on init',
        default: false,
        advanced: true,
        optional: true
      },
      avoidOverlap: {
        type: 'toggle',
        label: 'Avoid Overlap',
        description: 'Prevent node overlap',
        default: true,
        advanced: true
      }
    },
    defaults: {
      springLength: 120,
      springCoeff: 0.0005,
      gravity: -2.0,
      pull: 0.001,
      theta: 0.5,
      dragCoeff: 0.05,
      timeStep: 25,
      maxIterations: 2000,
      randomize: false,
      avoidOverlap: true
    }
  },
  'cose': {
    name: 'CoSE (Compound Spring Embedder)',
    description: 'Force-directed layout for compound graphs',
    options: {
      // Basic options
      idealEdgeLength: {
        type: 'slider',
        label: 'Ideal Edge Length',
        description: 'Ideal length of edges',
        default: 180,
        min: 50,
        max: 500,
        step: 10
      },
      nodeOverlap: {
        type: 'slider',
        label: 'Node Overlap',
        description: 'Node repulsion based on overlap (higher = less overlap)',
        default: 30,
        min: 5,
        max: 100,
        step: 5
      },
      nodeRepulsion: {
        type: 'slider',
        label: 'Node Repulsion',
        description: 'Node repulsion strength (higher = more spacing)',
        default: 6000,
        min: 1000,
        max: 15000,
        step: 500
      },
      // Advanced options
      refresh: {
        type: 'number',
        label: 'Refresh Rate',
        description: 'Refresh rate during animation',
        default: 30,
        min: 1,
        max: 100,
        step: 1,
        advanced: true
      },
      fit: {
        type: 'toggle',
        label: 'Fit to Viewport',
        description: 'Whether to fit the graph to the viewport after layout',
        default: true,
        advanced: true
      },
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      randomize: {
        type: 'toggle',
        label: 'Randomize',
        description: 'Randomize node positions on init',
        default: true,
        advanced: true
      },
      componentSpacing: {
        type: 'slider',
        label: 'Component Spacing',
        description: 'Space between disconnected components',
        default: 150,
        min: 50,
        max: 500,
        step: 10,
        advanced: true
      },
      nodeElasticity: {
        type: 'slider',
        label: 'Node Elasticity',
        description: 'Elasticity of nodes during overlap removal',
        default: 0.45,
        min: 0.1,
        max: 1.0,
        step: 0.05,
        advanced: true
      },
      nestingFactor: {
        type: 'slider',
        label: 'Nesting Factor',
        description: 'Nesting factor for compound nodes',
        default: 1.5,
        min: 0.1,
        max: 5,
        step: 0.1,
        advanced: true
      },
      gravity: {
        type: 'slider',
        label: 'Gravity',
        description: 'Gravitational strength (higher = more compact)',
        default: 0.8,
        min: 0,
        max: 5,
        step: 0.1,
        advanced: true
      },
      numIter: {
        type: 'number',
        label: 'Number of Iterations',
        description: 'Maximum number of iterations',
        default: 2500,
        min: 500,
        max: 10000,
        step: 100,
        advanced: true
      },
      initialTemp: {
        type: 'slider',
        label: 'Initial Temperature',
        description: 'Initial temperature (higher = more movement)',
        default: 1000,
        min: 100,
        max: 5000,
        step: 100,
        advanced: true
      },
      coolingFactor: {
        type: 'slider',
        label: 'Cooling Factor',
        description: 'Cooling factor (how quickly temperature drops)',
        default: 0.99,
        min: 0.5,
        max: 0.999,
        step: 0.001,
        advanced: true
      }
    },
    defaults: {
      idealEdgeLength: 180,
      nodeOverlap: 30,
      nodeRepulsion: 6000,
      refresh: 30,
      fit: true,
      padding: 50,
      randomize: true,
      componentSpacing: 150,
      nodeElasticity: 0.45,
      nestingFactor: 1.5,
      gravity: 0.8,
      numIter: 2500,
      initialTemp: 1000,
      coolingFactor: 0.99
    }
  },
  'concentric': {
    name: 'Concentric',
    description: 'Nodes in concentric circles based on metric',
    options: {
      // Basic options
      radius: {
        type: 'slider',
        label: 'Circle Radius',
        description: 'Base radius for the concentric circles',
        default: 200,
        min: 100,
        max: 500,
        step: 50
      },
      startAngle: {
        type: 'slider',
        label: 'Start Angle',
        description: 'Starting angle in degrees (0 = right, 90 = bottom)',
        default: 90,
        min: 0,
        max: 360,
        step: 0.01
      },
      // Advanced options
      minNodeSpacing: {
        type: 'slider',
        label: 'Min Node Spacing',
        description: 'Minimum spacing between nodes on the same level',
        default: 60,
        min: 30,
        max: 200,
        step: 10,
        advanced: true
      },
      levelSpacing: {
        type: 'slider',
        label: 'Level Spacing',
        description: 'Distance between concentric levels',
        default: 100,
        min: 50,
        max: 300,
        step: 25,
        advanced: true
      },
      sweep: {
        type: 'slider',
        label: 'Sweep',
        description: 'Sweep angle in degrees (determines arc length)',
        default: 360,
        min: 0,
        max: 360,
        step: 0.01,
        advanced: true
      },
      equidistant: {
        type: 'toggle',
        label: 'Equidistant',
        description: 'Whether levels should be spaced evenly',
        default: true,
        advanced: true
      },
      clockwise: {
        type: 'toggle',
        label: 'Clockwise',
        description: 'Whether to arrange nodes clockwise',
        default: true,
        advanced: true
      },
      concentricMetric: {
        type: 'select',
        label: 'Concentric Metric',
        description: 'Metric to determine node levels',
        default: 'degree',
        options: {
          'Degree': 'degree',
          'In-Degree': 'indegree',
          'Out-Degree': 'outdegree'
        },
        advanced: true
      }
    },
    defaults: {
      radius: 200,
      startAngle: 90,
      minNodeSpacing: 60,
      levelSpacing: 100,
      sweep: 360,
      equidistant: true,
      clockwise: true,
      concentricMetric: 'degree'
    }
  },
  'breadthfirst': {
    name: 'Breadth First',
    description: 'Hierarchical layout in levels',
    options: {
      // Basic options
      spacingFactor: {
        type: 'slider',
        label: 'Spacing Factor',
        description: 'Factor to scale spacing between nodes',
        default: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1
      },
      direction: {
        type: 'select',
        label: 'Direction',
        description: 'Direction of the layout',
        default: 'TB',
        options: {
          'Top to Bottom': 'TB',
          'Bottom to Top': 'BT',
          'Left to Right': 'LR',
          'Right to Left': 'RL'
        }
      },
      // Advanced options
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      avoidOverlap: {
        type: 'toggle',
        label: 'Avoid Overlap',
        description: 'Prevent node overlap',
        default: true,
        advanced: true
      },
      circle: {
        type: 'toggle',
        label: 'Circle',
        description: 'Put roots in a circle',
        default: false,
        advanced: true
      },
      grid: {
        type: 'toggle',
        label: 'Grid',
        description: 'Use grid for positioning',
        default: true,
        advanced: true
      },
      maximal: {
        type: 'toggle',
        label: 'Maximal',
        description: 'Whether to shift nodes down their BFS levels',
        default: false,
        advanced: true
      },
      depthSpace: {
        type: 'slider',
        label: 'Depth Spacing',
        description: 'Spacing between depths (levels)',
        default: 100,
        min: 20,
        max: 300,
        step: 10,
        advanced: true
      }
    },
    defaults: {
      spacingFactor: 2.0,
      direction: 'TB',
      padding: 50,
      avoidOverlap: true,
      circle: false,
      grid: true,
      maximal: false,
      depthSpace: 100
    }
  },
  'circle': {
    name: 'Circle',
    description: 'Nodes in a circle',
    options: {
      // Basic options
      radius: {
        type: 'slider',
        label: 'Radius',
        description: 'Circle radius',
        default: 250,
        min: 50,
        max: 800,
        step: 10
      },
      startAngle: {
        type: 'slider',
        label: 'Start Angle',
        description: 'Starting angle in degrees',
        default: 0,
        min: 0,
        max: 360,
        step: 0.01
      },
      // Advanced options
      sweep: {
        type: 'slider',
        label: 'Sweep',
        description: 'Sweep angle in degrees',
        default: 360,
        min: 0,
        max: 360,
        step: 0.01,
        advanced: true
      },
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      avoidOverlap: {
        type: 'toggle',
        label: 'Avoid Overlap',
        description: 'Prevent node overlap',
        default: true,
        advanced: true
      },
      spacingFactor: {
        type: 'slider',
        label: 'Spacing Factor',
        description: 'Factor to scale spacing between nodes',
        default: 1.0,
        min: 0.5,
        max: 2.0,
        step: 0.1,
        advanced: true
      }
    },
    defaults: {
      radius: 250,
      startAngle: 0,
      sweep: 360,
      padding: 50,
      avoidOverlap: true,
      spacingFactor: 1.0
    }
  },
  'grid': {
    name: 'Grid',
    description: 'Nodes in a grid pattern',
    options: {
      // Basic options
      spacingFactor: {
        type: 'slider',
        label: 'Spacing Factor',
        description: 'Factor to scale spacing between nodes',
        default: 2.0,
        min: 0.5,
        max: 5,
        step: 0.1
      },
      nodeSpacing: {
        type: 'slider',
        label: 'Node Spacing',
        description: 'Spacing between adjacent nodes',
        default: 100,
        min: 10,
        max: 300,
        step: 10
      },
      // Advanced options
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      avoidOverlap: {
        type: 'toggle',
        label: 'Avoid Overlap',
        description: 'Prevent node overlap',
        default: true,
        advanced: true
      },
      rows: {
        type: 'number',
        label: 'Rows',
        description: 'Number of rows (0 = auto)',
        default: 0,
        min: 0,
        max: 50,
        step: 1,
        advanced: true
      },
      cols: {
        type: 'number',
        label: 'Columns',
        description: 'Number of columns (0 = auto)',
        default: 0,
        min: 0,
        max: 50,
        step: 1,
        advanced: true
      },
      condense: {
        type: 'toggle',
        label: 'Condense',
        description: 'Condense the grid',
        default: true,
        advanced: true
      }
    },
    defaults: {
      spacingFactor: 2.0,
      nodeSpacing: 100,
      padding: 50,
      avoidOverlap: true,
      rows: 0,
      cols: 0,
      condense: true
    }
  },
  'dagre': {
    name: 'Dagre (Directed)',
    description: 'Directed acyclic graph layout',
    options: {
      // Basic options
      nodeSep: {
        type: 'slider',
        label: 'Node Separation',
        description: 'Separation between adjacent nodes in the same rank',
        default: 80,
        min: 10,
        max: 300,
        step: 10
      },
      edgeSep: {
        type: 'slider',
        label: 'Edge Separation',
        description: 'Separation between adjacent edges in the same rank',
        default: 20,
        min: 1,
        max: 100,
        step: 5
      },
      rankSep: {
        type: 'slider',
        label: 'Rank Separation',
        description: 'Separation between ranks',
        default: 120,
        min: 30,
        max: 500,
        step: 10
      },
      rankDir: {
        type: 'select',
        label: 'Rank Direction',
        description: 'Direction of the layout',
        default: 'TB',
        options: {
          'Top to Bottom': 'TB',
          'Bottom to Top': 'BT',
          'Left to Right': 'LR',
          'Right to Left': 'RL'
        }
      },
      // Advanced options
      padding: {
        type: 'number',
        label: 'Padding',
        description: 'Padding around the graph',
        default: 50,
        min: 0,
        max: 200,
        step: 10,
        advanced: true,
        optional: true
      },
      spacingFactor: {
        type: 'slider',
        label: 'Spacing Factor',
        description: 'Factor to scale spacing between nodes',
        default: 1.5,
        min: 0.5,
        max: 3.0,
        step: 0.1,
        advanced: true
      },
      ranker: {
        type: 'select',
        label: 'Ranker',
        description: 'Algorithm to determine node ranking',
        default: 'network-simplex',
        options: {
          'Network Simplex': 'network-simplex',
          'Tight Tree': 'tight-tree',
          'Longest Path': 'longest-path'
        },
        advanced: true
      }
    },
    defaults: {
      nodeSep: 80,
      edgeSep: 20,
      rankSep: 120,
      rankDir: 'TB',
      padding: 50,
      spacingFactor: 1.5,
      ranker: 'network-simplex'
    }
  }
};

export default layoutRegistry;
