document.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    const hostnameInput = document.getElementById('hostname');
    const targetInput = document.getElementById('target');
    const saveButton = document.getElementById('saveMapping');
    const mappingList = document.getElementById('mappingList');
  
    // Load existing mappings from chrome storage
    chrome.storage.local.get(['mappings'], ({ mappings }) => {
      if (mappings) {
        renderMappings(mappings);
      }
    });
  
    // Save new mapping
    saveButton.addEventListener('click', () => {
      const hostname = hostnameInput.value;
      const target = targetInput.value;
  
      if (hostname && target) {
        chrome.storage.local.get(['mappings'], ({ mappings = {} }) => {
          mappings[hostname] = target;
          chrome.storage.local.set({ mappings }, () => {
            renderMappings(mappings);
            hostnameInput.value = '';
            targetInput.value = '';
          });
        });
      }
    });
  
    // Render mappings to the list
    function renderMappings(mappings) {
      mappingList.innerHTML = '';
      Object.entries(mappings).forEach(([hostname, target]) => {
        const listItem = document.createElement('li');
        listItem.classList.add('mappingItem');
        listItem.innerHTML = `
          <span>${hostname} => ${target}</span>
          <button class="editBtn" data-hostname="${hostname}">Edit</button>
          <button class="deleteBtn" data-hostname="${hostname}">Delete</button>
        `;
        mappingList.appendChild(listItem);
      });
  
      // Attach edit and delete handlers
      document.querySelectorAll('.editBtn').forEach(button => {
        button.addEventListener('click', () => {
          const hostname = button.dataset.hostname;
          const target = mappings[hostname];
          hostnameInput.value = hostname;
          targetInput.value = target;
        });
      });
  
      document.querySelectorAll('.deleteBtn').forEach(button => {
        button.addEventListener('click', () => {
          const hostname = button.dataset.hostname;
          delete mappings[hostname];
          chrome.storage.local.set({ mappings }, () => {
            renderMappings(mappings);
          });
        });
      });
    }
  });
  