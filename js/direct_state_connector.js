// Direct State Connector - The Authoritative State Governor
// This script directly patches the state selection mechanism at the lowest level
// and is the single source of truth for UI-driven state changes.

(function() {
    console.log("👑 Initializing Authoritative State Governor (Direct State Connector)...");
    
    const UNIFIED_STATE_CHANGE_EVENT = 'master-state-change';

    // Main function to patch state selection at the DOM level
    function initializeStateGovernor() {
        console.log(" gobernando! ")
        // 1. Immediately check if a state is selected in the UI on load
        forceReadAndBroadcastState();
        
        // 2. Intercept all clicks on the map
        interceptMapClicks();
        
        // 3. Monitor DOM changes that might indicate state selection (dropdown, title)
        observeDOMChanges();
        
        // 4. Add emergency recovery check (can be simplified later if primary is robust)
        setupEmergencyRecovery();
        
        console.log("👑 State Governor initialized and monitoring.");
    }
    
    // Force read current state from visible UI elements and broadcast it
    function forceReadAndBroadcastState() {
        let detectedStateCode = null;
        let detectedStateName = null; // To store the actual name like "Missouri"

        const stateSelector = document.getElementById('state-selector');
        if (stateSelector && stateSelector.value) {
            detectedStateCode = stateSelector.value;
            detectedStateName = stateSelector.options[stateSelector.selectedIndex]?.text || detectedStateCode;
            console.log(`📌 Governor: State from dropdown: ${detectedStateName} (${detectedStateCode})`);
        }
        
        if (!detectedStateCode) {
            const stateTitleElement = document.getElementById('state-title');
            if (stateTitleElement && stateTitleElement.textContent) {
                const match = stateTitleElement.textContent.match(/^(.+?)\s+Analysis/);
                if (match && match[1]) {
                    detectedStateName = match[1].trim();
                    // Attempt to find the code for this name
                    detectedStateCode = findStateCodeByName(detectedStateName) || detectedStateName; // Fallback to name if code not found
                    console.log(`📌 Governor: State from title: ${detectedStateName} (${detectedStateCode})`);
                }
            }
        }
        
        // Add other detection logic if necessary (e.g., from data attributes on selected map paths)

        if (detectedStateCode) {
            console.log(`👑 Governor: Detected state ${detectedStateName} (${detectedStateCode}). Broadcasting...`);
            updateAndBroadcastState(detectedStateCode, detectedStateName);
        }
    }

    function findStateCodeByName(name) {
        if (!window.stateData) return null;
        const normalizedName = name.toLowerCase();
        for (const code in window.stateData) {
            if (window.stateData[code].name.toLowerCase() === normalizedName) {
                return code;
            }
        }
        // If not found by full name, check if the input *is* a code
        if(window.stateData[name]) return name; 
        return null;
    }

    function interceptMapClicks() {
        const mapElement = document.getElementById('choropleth-map');
        if (!mapElement) return;

        mapElement.addEventListener('click', function(e) {
            // Plotly click events on map often update the title or dropdown indirectly.
            // We wait for those primary UI elements to update, then read from them.
            setTimeout(forceReadAndBroadcastState, 250); // Increased delay slightly
        }, true); // Use capture to get event early
    }
    
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            // If title or details become visible/change, re-evaluate state
            console.log("👑 Governor: DOM mutation observed, re-evaluating state.");
            forceReadAndBroadcastState();
        });
        
        const stateTitleElement = document.getElementById('state-title');
        if (stateTitleElement) {
            observer.observe(stateTitleElement, { childList: true, characterData: true, subtree: true });
        }

        const stateDetailsElement = document.getElementById('state-details');
        if (stateDetailsElement) {
            observer.observe(stateDetailsElement, { attributes: true, attributeFilter: ['style'] });
        }

        const stateSelector = document.getElementById('state-selector');
        if (stateSelector) {
            stateSelector.addEventListener('change', function() {
                console.log("👑 Governor: Dropdown changed, re-evaluating state.");
                forceReadAndBroadcastState(); 
            });
        }
    }
    
    // Authoritative function to update all necessary places and dispatch the single event
    function updateAndBroadcastState(stateCode, stateName = null) {
        if (!stateCode) {
            console.warn("👑 Governor: Attempted to update state with no stateCode.");
            return;
        }

        const stateData = (window.stateData && window.stateData[stateCode]) 
            ? window.stateData[stateCode]
            : (stateName ? Object.values(window.stateData || {}).find(s => s.name.toLowerCase() === stateName.toLowerCase()) : null);

        if (!stateData) {
            console.warn(`👑 Governor: No comprehensive data found for state code/name: ${stateCode}/${stateName}. Broadcasting code only.`);
             // Still broadcast the code, as some systems might use it directly
        } else {
            stateName = stateData.name; // Ensure stateName is from the data object if found
        }

        console.log(`👑 BROADCASTING ${UNIFIED_STATE_CHANGE_EVENT}: Code='${stateCode}', Name='${stateName}'`);

        // 1. Update critical global selectedState (legacy, but some scripts might use it)
        window.selectedState = stateCode; 

        // 2. Update State Monitor (if it exists and is used for display/simple queries)
        if (window.msbStateMonitor) {
            window.msbStateMonitor.selectedState = stateName || stateCode; // Prefer name
            window.msbStateMonitor.selectedStateData = stateData || null;
            window.msbStateMonitor.lastUpdate = new Date();
        }

        // 3. Update Data Store (if used)
        if (window.msbDataStore && window.msbDataStore.setSelectedState) {
             // msbDataStore likely expects a state code that it can find in its own data
            window.msbDataStore.setSelectedState(stateCode); 
        }

        // 4. Directly update Groq Analyzer (it will also listen, but direct update is safer for init)
        if (window.groqAnalyzer) {
            window.groqAnalyzer.selectedState = stateName || stateCode;
            window.groqAnalyzer.currentState = stateData || null;
            window.groqAnalyzer.stateSelectionDetected = !!stateData;
        }
        
        // 5. Dispatch the unified event for all other listeners
        document.dispatchEvent(new CustomEvent(UNIFIED_STATE_CHANGE_EVENT, {
            detail: {
                stateCode: stateCode,
                stateName: stateName, // Actual name like "Missouri"
                stateData: stateData, // Full data object for the state
                timestamp: new Date()
            }
        }));

        // Ensure UI consistency (dropdown)
        const stateSelector = document.getElementById('state-selector');
        if (stateSelector && stateSelector.value !== stateCode) {
            // Check if an option with this stateCode exists
            const optionExists = Array.from(stateSelector.options).some(opt => opt.value === stateCode);
            if(optionExists){
                console.log(`👑 Governor: Syncing dropdown to ${stateCode}`);
                stateSelector.value = stateCode;
            } else {
                console.warn(`👑 Governor: stateCode ${stateCode} not found in dropdown options.`);
            }
        }
    }
    
    // Emergency recovery (can be simplified or removed if the above is robust)
    function setupEmergencyRecovery() {
        window.recoverStateSelection = function(nameOrCode) {
            if (!nameOrCode) return;
            console.log(`🚑 Governor: Emergency recovery triggered for: ${nameOrCode}`);
            let codeToRecover = findStateCodeByName(nameOrCode) || nameOrCode;
            let nameAssociated = (window.stateData && window.stateData[codeToRecover]) ? window.stateData[codeToRecover].name : nameOrCode;
            
            const stateSelector = document.getElementById('state-selector');
            if (stateSelector) {
                let foundInDropdown = false;
                for (let i = 0; i < stateSelector.options.length; i++) {
                    if (stateSelector.options[i].value === codeToRecover || stateSelector.options[i].text.toLowerCase() === nameOrCode.toLowerCase()) {
                        stateSelector.value = stateSelector.options[i].value; // Use the option's value
                        codeToRecover = stateSelector.value; // Update codeToRecover to match dropdown's value
                        nameAssociated = stateSelector.options[i].text;
                        console.log(`✅ Governor Recovery: Set dropdown to ${nameAssociated} (${codeToRecover})`);
                        foundInDropdown = true;
                        break;
                    }
                }
                if (!foundInDropdown) console.warn(`⚠️ Governor Recovery: State "${nameOrCode}" not directly found in dropdown options by value or text.`);
            }
            updateAndBroadcastState(codeToRecover, nameAssociated);
        };

        // Simplified interval check - primarily for logging or very basic recovery
        // setInterval(function() {
        //     const stateSelector = document.getElementById('state-selector');
        //     if (stateSelector && stateSelector.value && window.groqAnalyzer) {
        //         if (window.groqAnalyzer.selectedState !== stateSelector.value && 
        //             (window.stateData[stateSelector.value] && window.groqAnalyzer.selectedState !== window.stateData[stateSelector.value].name) ) {
        //             console.log(`🚨 Governor Watchdog: Discrepancy found. UI: ${stateSelector.value}, Groq: ${window.groqAnalyzer.selectedState}. Attempting re-sync.`);
        //             forceReadAndBroadcastState();
        //         }
        //     }
        // }, 7000);
    }

    // Expose the primary update function for external calls if absolutely needed (e.g. from a fully dynamic UI component)
    window.msbGlobalStateGovernor = {
        updateState: function(stateCode, stateName) {
            console.log("👑 Governor: External call to updateState.");
            updateAndBroadcastState(stateCode, stateName);
        },
        getCurrentState: function(){
            const stateSelector = document.getElementById('state-selector');
            if (stateSelector && stateSelector.value) {
                 const code = stateSelector.value;
                 const name = stateSelector.options[stateSelector.selectedIndex]?.text || code;
                 const data = (window.stateData && window.stateData[code]) ? window.stateData[code] : null;
                 return { stateCode: code, stateName: name, stateData: data };
            }
            return null;
        }
    };
    
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeStateGovernor);
    } else {
        initializeStateGovernor();
    }
})(); 