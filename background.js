chrome.runtime.onInstalled.addListener(async () => {
    // Initialize rule ID counter and mappings
    let { ruleIdCounter = 1, mappings = {} } = await chrome.storage.local.get(['ruleIdCounter', 'mappings']);
  
    const rules = Object.entries(mappings).map(([hostname, target]) => {
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "http://" + target;
      }
  
      const ruleId = ruleIdCounter++; // Increment rule ID for each new rule
  
      // Save the updated rule ID counter back to storage
      chrome.storage.local.set({ ruleIdCounter });
  
      return {
        id: ruleId, // Use unique, incremented ID
        action: {
          type: 'redirect',
          redirect: { url: target }
        },
        condition: {
          urlFilter: `*://${hostname}/*`,
          resourceTypes: ['main_frame']
        }
      };
    });
  
    // Apply dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
      removeRuleIds: [] // Optionally remove old rules if necessary
    });
  });
  
  // Function to update rules dynamically with new mappings
  function updateMappings(mappings) {
    let { ruleIdCounter } = chrome.storage.local.get('ruleIdCounter') || { ruleIdCounter: 1 };
  
    const rules = Object.entries(mappings).map(([hostname, target]) => {
      if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = "http://" + target;
      }
  
      const ruleId = ruleIdCounter++; // Increment rule ID for each new rule
  
      // Save the updated rule ID counter back to storage
      chrome.storage.local.set({ ruleIdCounter });
  
      return {
        id: ruleId, // Use unique, incremented ID
        action: {
          type: 'redirect',
          redirect: { url: target }
        },
        condition: {
          urlFilter: `*://${hostname}/*`,
          resourceTypes: ['main_frame']
        }
      };
    });
  
    // Apply dynamic rules
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: rules,
      removeRuleIds: [] // Optionally remove old rules if necessary
    });
  }
  
  // Listen for changes in the mappings (you could call this function from the popup)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.mappings) {
      updateMappings(changes.mappings.newValue);
    }
  });
  