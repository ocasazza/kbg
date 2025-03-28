<template>
  <div class="action-controls">
    <h3 class="action-title">Data Actions</h3>
    <div class="action-buttons">
      <!-- File upload button -->
      <div class="file-upload">
        <label for="json-upload" class="upload-button">
          📤 Upload JSON Data
          <input 
            type="file" 
            id="json-upload" 
            accept=".json"
            @change="handleFileUpload" 
            class="file-input"
          />
        </label>
      </div>
      
      <!-- Sample data download link -->
      <div class="sample-data">
        <a href="/sample-graph-data.json" download="sample-graph-data.json" class="sample-link">
          📥 Download Sample JSON
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGraphStore } from '@/stores/graphStore';

const graphStore = useGraphStore();
const emit = defineEmits(['runLayout', 'resetView']);


// Handle file upload
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const jsonData = JSON.parse(content);
      
      // Validate the JSON structure
      if (validateGraphData(jsonData)) {
        // Set the graph data in the store
        graphStore.setGraphData(jsonData);
        
        // Reset the file input
        input.value = '';
        
        // Run layout to visualize the new data
        emit('runLayout');
      } else {
        alert('Invalid JSON format. Please upload a file with the correct structure.');
      }
    } catch (error) {
      console.error('Error parsing JSON file:', error);
      alert('Error parsing JSON file. Please ensure it is a valid JSON file.');
    }
  };
  
  reader.readAsText(file);
};

// Validate graph data structure
const validateGraphData = (data: any): boolean => {
  // Check if data has entities and relations arrays
  if (!data || !Array.isArray(data.entities) || !Array.isArray(data.relations)) {
    return false;
  }
  
  // Check if entities have the required properties
  for (const entity of data.entities) {
    if (!entity.name || !entity.entityType || !Array.isArray(entity.observations)) {
      return false;
    }
  }
  
  // Check if relations have the required properties
  for (const relation of data.relations) {
    if (!relation.from || !relation.to || !relation.relationType) {
      return false;
    }
  }
  
  return true;
};
</script>

<style scoped>
.action-controls {
  margin: 15px 0;
  background-color: #333;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  width: 300px;
}

.action-title {
  margin-top: 0;
  color: #4dabf7;
  border-bottom: 1px solid #555;
  padding-bottom: 5px;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button, .upload-button {
  background-color: #333;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: background-color 0.2s;
}

.action-button:hover, .upload-button:hover {
  background-color: #444;
}

.file-upload {
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-button {
  display: block;
  background-color: #2c3e50;
  width: 100%;
}

.upload-button:hover {
  background-color: #34495e;
}

.sample-data {
  margin-top: 8px;
}

.sample-link {
  display: block;
  background-color: #2c3e50;
  color: white;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: background-color 0.2s;
  text-decoration: none;
}

.sample-link:hover {
  background-color: #34495e;
}
</style>
