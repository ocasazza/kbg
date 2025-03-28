declare module 'cytoscape-cola';
declare module 'cytoscape-euler';
declare module 'cytoscape-dagre';

// Declare cytoscape as a module with a namespace
declare module 'cytoscape' {
  namespace cytoscape {
    function use(extension: any): void;
  }
  
  function cytoscape(options: any): any;
  
  interface Stylesheet {
    selector: string;
    style: any; // Using 'any' to bypass strict type checking for styles
  }
  
  export = cytoscape;
}
