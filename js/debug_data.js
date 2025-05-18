// Debug script to expose visualization data
(function() {
    console.log("Initializing data debug script...");
    
    // Create a global object to store data for easy access
    window.msbDebugData = {
        allStates: {},
        currentState: null,
        summary: {},
        initialized: false
    };
    
    // Function to collect all available data
    function collectAllData() {
        console.log("Collecting all MSB data...");
        
        // Check if stateData is available
        if (!window.stateData) {
            console.error("No stateData found in window object");
            return false;
        }
        
        // Calculate total counts per state
        const stateTotals = {};
        Object.keys(window.stateData).forEach(stateKey => {
            const stateObj = window.stateData[stateKey];
            const stateTotal = stateObj.counts?.reduce((sum, count) => sum + count, 0) || 0;
            stateTotals[stateKey] = {
                name: stateObj.name,
                total: stateTotal
            };
        });
        
        // Store top states by SAR count
        const topStates = Object.keys(stateTotals)
            .sort((a, b) => stateTotals[b].total - stateTotals[a].total)
            .slice(0, 10)
            .map(key => ({
                state: stateTotals[key].name,
                totalCount: stateTotals[key].total
            }));
        
        // Store all data
        window.msbDebugData.allStates = window.stateData;
        window.msbDebugData.topStates = topStates;
        window.msbDebugData.stateKeys = Object.keys(window.stateData);
        window.msbDebugData.initialized = true;
        
        // If we have a selected state, save that too
        if (window.selectedState && window.stateData[window.selectedState]) {
            window.msbDebugData.currentState = window.stateData[window.selectedState];
        }
        
        // Create a summary
        window.msbDebugData.summary = {
            stateCount: Object.keys(window.stateData).length,
            topStates: topStates,
            hasSelectedState: !!window.msbDebugData.currentState,
            selectedState: window.msbDebugData.currentState?.name || 'None'
        };
        
        console.log("Data collection complete", window.msbDebugData.summary);
        return true;
    }
    
    // Watch for changes in the selected state
    function watchForStateChanges() {
        let lastState = window.selectedState;
        
        setInterval(() => {
            // Check for state change
            if (window.selectedState !== lastState) {
                console.log(`State changed from ${lastState} to ${window.selectedState}`);
                lastState = window.selectedState;
                
                // Update current state data
                if (window.selectedState && window.stateData[window.selectedState]) {
                    window.msbDebugData.currentState = window.stateData[window.selectedState];
                    window.msbDebugData.summary.hasSelectedState = true;
                    window.msbDebugData.summary.selectedState = window.msbDebugData.currentState.name;
                    
                    // Broadcast the change event
                    const event = new CustomEvent('msb-state-changed', { 
                        detail: { 
                            state: window.selectedState,
                            data: window.msbDebugData.currentState
                        } 
                    });
                    document.dispatchEvent(event);
                }
            }
        }, 500);
    }
    
    // Initialize when the document is ready
    function initialize() {
        // Check if data is already available
        if (window.stateData) {
            const success = collectAllData();
            if (success) {
                watchForStateChanges();
                console.log("MSB Data debug initialized successfully");
            }
        } else {
            console.log("stateData not found, waiting for it to be loaded...");
            
            // Wait for data to be available
            const checkInterval = setInterval(() => {
                if (window.stateData) {
                    clearInterval(checkInterval);
                    const success = collectAllData();
                    if (success) {
                        watchForStateChanges();
                        console.log("MSB Data debug initialized successfully (delayed)");
                    }
                }
            }, 500);
            
            // Give up after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.error("Timed out waiting for stateData to be available");
            }, 10000);
        }
    }
    
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
    
    // Expose utility functions for debugging
    window.msbDebugData.refreshData = collectAllData;
    window.msbDebugData.getStateData = (stateName) => {
        const stateKey = Object.keys(window.stateData).find(
            key => window.stateData[key].name.toLowerCase() === stateName.toLowerCase()
        );
        return stateKey ? window.stateData[stateKey] : null;
    };
    window.msbDebugData.getCurrentStateData = () => window.msbDebugData.currentState;
})(); 