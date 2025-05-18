// Realtime State Monitor - Utility & Data Access Helpers
// Relies on the State Governor (direct_state_connector.js) to keep its state properties updated.

(function() {
    console.log("🛠️ Initializing Realtime State Monitor (as a helper library)...");
    
    if (!window.msbStateMonitor) {
        window.msbStateMonitor = {
            selectedState: null,      // Expected to be updated by State Governor
            selectedStateData: null,  // Expected to be updated by State Governor
            allStates: (window.stateData || {}), // Initialize with global stateData if available
            statesList: window.stateData ? Object.values(window.stateData).map(s => s.name) : [],
            topStates: [], // Can be populated on demand or by an initial data processing step elsewhere
            lastUpdate: null,
            isInitialized: true // Mark as initialized as it's now a passive library
        };
    }
    
    // Helper to populate topStates if not already done (e.g., by data_store or visualization_loader)
    function ensureTopStatesPopulated() {
        if (window.msbStateMonitor.topStates.length === 0 && window.stateData) {
            const statesByCount = Object.keys(window.stateData).map(key => {
                const state = window.stateData[key];
                const totalCount = state.counts ? state.counts.reduce((sum, val) => sum + val, 0) : 0;
                return {
                    state: state.name,
                    count: totalCount
                };
            }).sort((a, b) => b.count - a.count);
            window.msbStateMonitor.topStates = statesByCount;
            console.log("🛠️ msbStateMonitor: Populated topStates list.");
        }
    }

    // Ensure allStates and statesList are populated if stateData becomes available later
    // This is a fallback, ideally stateData is present when this script runs.
    function ensureAllStatesPopulated() {
        if (Object.keys(window.msbStateMonitor.allStates).length === 0 && window.stateData) {
            window.msbStateMonitor.allStates = window.stateData;
            window.msbStateMonitor.statesList = Object.values(window.stateData).map(s => s.name);
            console.log("🛠️ msbStateMonitor: Populated allStates and statesList from global stateData.");
        }
    }

    // Call these on initialization or shortly after, in case stateData loads late.
    setTimeout(() => {
        ensureAllStatesPopulated();
        ensureTopStatesPopulated();
    }, 500); 

    window.msbStateMonitor.getStateData = function(stateName) {
        if (!stateName) return null;
        ensureAllStatesPopulated(); // Ensure local allStates is up-to-date

        // Prefer direct access to window.stateData for freshness
        if (window.stateData) {
            const normalizedName = stateName.toLowerCase();
            const stateKey = Object.keys(window.stateData).find(
                key => (window.stateData[key].name && window.stateData[key].name.toLowerCase() === normalizedName) || key.toLowerCase() === normalizedName
            );
            if (stateKey) return window.stateData[stateKey];
        }
        // Fallback to its own potentially stale allStates (populated from stateData earlier)
        const normalizedNameLower = stateName.toLowerCase();
        return Object.values(this.allStates).find(
            state => state.name.toLowerCase() === normalizedNameLower
        );
    };
    
    window.msbStateMonitor.getStateYearData = function(stateName, year) {
        const stateDataToUse = this.getStateData(stateName);
        if (!stateDataToUse) {
            return `I couldn't find data for ${stateName}. Please check the state name and try again.`;
        }
        if (!stateDataToUse.years || !stateDataToUse.counts) {
            return `I found ${stateName} in the data, but it doesn't have detailed yearly information.`;
        }
        const yearIndex = stateDataToUse.years.indexOf(parseInt(year)); // Ensure year is number
        if (yearIndex === -1) {
            return `I couldn't find data for ${stateName} in ${year}. Available years: ${stateDataToUse.years.join(', ')}.`;
        }
        const sarCount = stateDataToUse.counts[yearIndex];
        return `In ${year}, ${stateDataToUse.name} had ${sarCount.toLocaleString()} Suspicious Activity Reports (SARs) filed.`;
    };
    
    window.msbStateMonitor.getTopStatesAnswer = function() {
        ensureTopStatesPopulated();
        if (!this.topStates || this.topStates.length === 0) {
            return "I couldn't retrieve the top states data at this time. The data might still be loading or unavailable.";
        }
        const topFive = this.topStates.slice(0, 5).map((s, i) => 
            `${i+1}. ${s.state}: ${s.count.toLocaleString()} SARs`
        ).join('\n');
        return `Based on available data, the top 5 states by total SAR filings are:\n\n${topFive}`;
    };
    
    window.msbStateMonitor.getSelectedStateAnswer = function() {
        // This function now relies entirely on selectedStateData being set by the State Governor
        if (!this.selectedStateData) {
            return `${this.selectedState || 'A state'} is selected, but I couldn't access its detailed data. Try re-selecting or check console.`;
        }
        const stateDataToUse = this.selectedStateData;
        if (!stateDataToUse.years || !stateDataToUse.counts) {
            return `I found data for ${stateDataToUse.name}, but it doesn't have detailed yearly information.`;
        }
        const yearlyData = stateDataToUse.years.map((year, i) => 
            `${year}: ${stateDataToUse.counts[i].toLocaleString()} SARs`
        ).join('\n');
        const total = stateDataToUse.counts.reduce((sum, count) => sum + count, 0);
        return `Here's the SAR filing data for ${stateDataToUse.name}:\n\n${yearlyData}\n\nTotal across all years: ${total.toLocaleString()} SARs`;
    };
    
    // This answerQuestion function is a simple direct handler.
    // GroqAnalyzer.tryDirectDataAccess also calls this.
    window.msbStateMonitor.answerQuestion = function(question) {
        const q = question.toLowerCase();
        
        // Example: Hardcoded check for specific state/year if needed by msbDataPatch or other simple queries
        if (q.includes('florida') && q.includes('2020') && (q.includes('how many') || q.includes('sar'))) {
             // This specific hardcoded value might be better in msbDataPatch.js
            return this.getStateYearData("Florida", 2020); 
        }
        
        const stateYearMatch = q.match(/(how many|what|sar|filing).+?(in|for)\s+([a-z\s]+(?:\s[a-z\s]+)?)\s+in\s+(20\d\d)/i);
        if (stateYearMatch) {
            const stateName = stateYearMatch[3].trim();
            const year = parseInt(stateYearMatch[4]);
            return this.getStateYearData(stateName, year);
        }
        
        if (q.includes('top') && (q.includes('state') || q.includes('states'))) {
            return this.getTopStatesAnswer();
        }
        
        // Check if question pertains to the currently selected state by the Governor
        if (this.selectedState && this.selectedStateData && 
            (q.includes(this.selectedState.toLowerCase()) || q.includes("this state") || q.includes("current state") || q.includes("selected state"))) {
            return this.getSelectedStateAnswer();
        }
        
        return null; // No direct answer from this simple monitor
    };

    // Listener for master-state-change to keep its own selectedState/Data in sync
    // This ensures that getSelectedStateAnswer() works correctly if called.
    document.addEventListener('master-state-change', (event) => {
        if (event.detail) {
            const { stateName, stateData } = event.detail;
            console.log(`🛠️ msbStateMonitor received master-state-change: Name=${stateName}`);
            window.msbStateMonitor.selectedState = stateName || null;
            window.msbStateMonitor.selectedStateData = stateData || null;
            window.msbStateMonitor.lastUpdate = new Date();
        }
    });

    console.log("🛠️ Realtime State Monitor (helper library) is ready.");

})();