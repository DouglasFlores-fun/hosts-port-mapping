document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve existing mappings from storage
    const { mappings = {} } = await chrome.storage.local.get('mappings');
    
    // Display the existing mappings
    displayMappings(mappings);
  });
  
  // Save a new or edited mapping
  document.getElementById('saveMappingBtn').addEventListener('click', async () => {
    const hostname = document.getElementById('hostnameInput').value;
    const target = document.getElementById('targetInput').value;
  
    if (!hostname || !target) {
      alert('Please enter both hostname and target URL!');
      return;
    }
  
    // Retrieve existing mappings
    const { mappings = {} } = await chrome.storage.local.get('mappings');
  
    // Add or update the mapping
    mappings[hostname] = target;
  
    // Save the updated mappings to storage
    await chrome.storage.local.set({ mappings });
  
    // Reapply the rules immediately
    chrome.runtime.sendMessage({ action: 'updateMappings', mappings });
  
    // Display updated mappings
    displayMappings(mappings);
  
    // Clear input fields
    document.getElementById('hostnameInput').value = '';
    document.getElementById('targetInput').value = '';
  });
  
  // Display existing mappings in the popup
  function displayMappings(mappings) {
    const mappingsList = document.getElementById('mappingsList');
    mappingsList.innerHTML = ''; // Clear the list before re-rendering
  
    for (const [hostname, target] of Object.entries(mappings)) {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <strong>${hostname}</strong> → ${target}
        <button class="editBtn" data-hostname="${hostname}">Edit</button>
        <button class="deleteBtn" data-hostname="${hostname}">Delete</button>
      `;
      mappingsList.appendChild(listItem);
    }
  
    // Attach event listeners for edit and delete buttons
    document.querySelectorAll('.editBtn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const hostname = event.target.dataset.hostname;
        const target = mappings[hostname];
  
        // Populate input fields for editing
        document.getElementById('hostnameInput').value = hostname;
        document.getElementById('targetInput').value = target;
  
        // Remove the mapping from the list for re-saving
        delete mappings[hostname];
        await chrome.storage.local.set({ mappings });
  
        // Reapply the rules immediately after editing
        chrome.runtime.sendMessage({ action: 'updateMappings', mappings });
      });
    });
  
    document.querySelectorAll('.deleteBtn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const hostname = event.target.dataset.hostname;
  
        // Delete the mapping
        delete mappings[hostname];
        await chrome.storage.local.set({ mappings });
  
        // Reapply the rules immediately after deletion
        chrome.runtime.sendMessage({ action: 'updateMappings', mappings });
  
        // Update the UI
        displayMappings(mappings);
      });
    });
  }
  