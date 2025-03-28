import { describe, it, expect } from 'vitest';
import layoutRegistry from '../layoutRegistry';
import type { LayoutConfig } from '../layoutRegistry';

describe('layoutRegistry', () => {
  it('contains all expected layout algorithms', () => {
    const expectedLayouts = [
      'cola',
      'euler',
      'cose',
      'concentric',
      'breadthfirst',
      'circle',
      'grid',
      'dagre'
    ];
    
    expectedLayouts.forEach(layout => {
      expect(layoutRegistry).toHaveProperty(layout);
    });
  });

  it('has properly structured layout configurations', () => {
    // Check each layout configuration
    Object.entries(layoutRegistry).forEach(([key, config]) => {
      // Check that the config has the required properties
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('options');
      expect(config).toHaveProperty('defaults');
      
      // Check that options and defaults are objects
      expect(typeof config.options).toBe('object');
      expect(typeof config.defaults).toBe('object');
      
      // Check that each option has the required properties
      Object.entries(config.options).forEach(([optionKey, option]) => {
        expect(option).toHaveProperty('type');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('default');
        
        // Check that the option type is valid
        expect(['slider', 'toggle', 'select', 'number', 'color']).toContain(option.type);
        
        // Check that the default value exists in the defaults object
        expect(config.defaults).toHaveProperty(optionKey);
        
        // For select options, check that the options property exists
        if (option.type === 'select') {
          expect(option).toHaveProperty('options');
          expect(typeof option.options).toBe('object');
        }
        
        // For slider and number options, check that min, max, and step properties exist
        if (option.type === 'slider' || option.type === 'number') {
          expect(option).toHaveProperty('min');
          expect(option).toHaveProperty('max');
          expect(option).toHaveProperty('step');
        }
      });
    });
  });

  it('has consistent defaults for each layout', () => {
    // Check that each layout's defaults match the option defaults
    Object.entries(layoutRegistry).forEach(([key, config]) => {
      Object.entries(config.options).forEach(([optionKey, option]) => {
        // Skip optional parameters that might not be in defaults
        if (option.optional) return;
        
        expect(config.defaults[optionKey]).toBeDefined();
        expect(config.defaults[optionKey]).toEqual(option.default);
      });
    });
  });

  it('has valid dependencies for options', () => {
    // Check that each option's dependency exists in the same layout
    Object.entries(layoutRegistry).forEach(([key, config]) => {
      Object.entries(config.options).forEach(([optionKey, option]) => {
        if (option.depends) {
          expect(config.options).toHaveProperty(option.depends);
        }
      });
    });
  });

  it('has valid min/max values for numeric options', () => {
    // Check that min is less than max for slider and number options
    Object.entries(layoutRegistry).forEach(([key, config]) => {
      Object.entries(config.options).forEach(([optionKey, option]) => {
        if ((option.type === 'slider' || option.type === 'number') && 
            typeof option.min === 'number' && 
            typeof option.max === 'number') {
          expect(option.min).toBeLessThan(option.max);
          
          // Check that default is within min/max range
          if (typeof option.default === 'number') {
            expect(option.default).toBeGreaterThanOrEqual(option.min);
            expect(option.default).toBeLessThanOrEqual(option.max);
          }
        }
      });
    });
  });
});
