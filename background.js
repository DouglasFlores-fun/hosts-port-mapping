chrome.runtime.onInstalled.addListener(async () => {
    let { ruleIdCounter = 1, mappings = {} } = await chrome.storage.local.get(['ruleIdCounter', 'mappings']);
    
    // Apply rules on installation or update
    updateMappings(mappings);
  });
  
  // Function to update the dynamic rules with the current mappings
  function updateMappings(mappings) {
    chrome.storage.local.get('ruleIdCounter', ({ ruleIdCounter = 1 }) => {
      const rules = Object.entries(mappings).map(([hostname, target]) => {
        if (!target.startsWith("http://") && !target.startsWith("https://")) {
          target = "http://" + target;
        }
  
        const ruleId = ruleIdCounter++; // Increment rule ID for each new rule
  
        // Save the updated ruleIdCounter to storage
        chrome.storage.local.set({ ruleIdCounter });
  
        return {
          id: ruleId, // Use unique, incremented ID for each rule
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
        removeRuleIds: [] // Optionally, you could track and remove old rules
      });
    });
  }
  
  // Listen for changes in the mappings and update the rules accordingly
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.mappings) {
      const newMappings = changes.mappings.newValue;
      updateMappings(newMappings);
    }
  });
  