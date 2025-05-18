// MSB Visualization Loader
// This script handles the initialization sequence to ensure data is loaded
// before visualization components and the AI interface are initialized.

(function() {
    console.log("📊 MSB Visualization Loader started");

    // Track initialization states
    const initState = {
        dataStoreReady: false,
        visualizationReady: false,
        chatReady: false
    };

    // Store raw data extracted from visualizations
    let extractedData = {
        stateData: null,
        monthlyData: null,
        years: null
    };

    // Extract visualization data from the page
    function extractPageData() {
        console.log("🔍 Extracting data from page...");
        try {
            // Try to get state data from window object
            if (window.stateData) {
                extractedData.stateData = window.stateData;
                console.log(`✅ Found state data for ${Object.keys(window.stateData).length} states`);
            }
            
            // Try to get monthly data
            if (window.monthlyData) {
                extractedData.monthlyData = window.monthlyData;
                console.log(`✅ Found monthly data for ${Object.keys(window.monthlyData).length} months`);
            }
            
            // Try to get years from the visualization
            if (window.yearMonths) {
                const years = [...new Set(window.yearMonths.map(ym => parseInt(ym.split('-')[0])))];
                extractedData.years = years;
                console.log(`✅ Found data spanning years: ${years.join(', ')}`);
            }
            
            return true;
        } catch (error) {
            console.error("❌ Error extracting data from page:", error);
            return false;
        }
    }

    // Initialize the data store
    function initializeDataStore() {
        console.log("🔄 Initializing data store...");
        
        // Create data store if it doesn't exist
        if (typeof window.MSBDataStore === 'function') {
            if (!window.msbDataStore) {
                window.msbDataStore = new window.MSBDataStore();
                console.log("✅ Created MSB Data Store instance");
            }
            
            // Load extracted data into the store
            if (extractedData.stateData) {
                window.msbDataStore.loadStateData(extractedData.stateData);
            }
            
            if (extractedData.monthlyData) {
                window.msbDataStore.loadMonthlyData(extractedData.monthlyData);
            }
            
            // Mark data store as initialized
            window.msbDataStore.initialized = true;
            initState.dataStoreReady = true;
            
            // Fire event
            document.dispatchEvent(new CustomEvent('msb-datastore-ready'));
            console.log("✅ Data store initialized and loaded with data");
            return true;
        } else {
            console.warn("⚠️ MSBDataStore class not found - data store will not be initialized");
            return false;
        }
    }
    
    // Initialize visualization components 
    function initializeVisualization() {
        console.log("🔄 Initializing visualization...");
        
        // Try to call the visualization init function if it exists
        if (typeof window.initializeVisualization === 'function') {
            try {
                window.initializeVisualization();
                console.log("✅ Visualization initialized via explicit function");
                initState.visualizationReady = true;
                return true;
            } catch (error) {
                console.error("❌ Error initializing visualization:", error);
            }
        } else {
            console.log("ℹ️ No explicit initialization function found for visualization");
            
            // Check if visualization appears to be already initialized
            if (document.querySelector('#choropleth') && extractedData.stateData) {
                console.log("✅ Visualization appears to be already initialized");
                initState.visualizationReady = true;
                return true;
            }
        }
        
        console.warn("⚠️ Could not initialize visualization");
        return false;
    }
    
    // Initialize chat interface
    function initializeChat() {
        console.log("🔄 Initializing chat interface...");
        
        // Check if we need to create the chat container
        if (!document.getElementById('chat-interface-container')) {
            console.log("🔄 Creating chat container");
            const container = document.createElement('div');
            container.id = 'chat-interface-container';
            document.body.appendChild(container);
        }
        
        // Check if we have the Groq analyzer
        if (window.GroqAnalyzer && typeof window.GroqAnalyzer === 'function') {
            try {
                console.log("🔄 Creating GroqAnalyzer");
                const groqAnalyzer = new window.GroqAnalyzer();
                window.groqAnalyzer = groqAnalyzer;
                
                // Initialize the analyzer
                groqAnalyzer.initialize();
                console.log("✅ Created and initialized Groq Analyzer");
                
                // If we have the ChatInterface
                if (window.ChatInterface && typeof window.ChatInterface === 'function') {
                    try {
                        console.log("🔄 Creating ChatInterface");
                        const chatInterface = new window.ChatInterface(groqAnalyzer);
                        window.chatInterface = chatInterface;
                        
                        // Initialize the chat interface
                        chatInterface.initialize();
                        console.log("✅ Created and initialized Chat Interface");
                        
                        initState.chatReady = true;
                        return true;
                    } catch (error) {
                        console.error("❌ Error initializing chat interface:", error);
                    }
                } else {
                    console.warn("⚠️ ChatInterface class not found");
                }
            } catch (error) {
                console.error("❌ Error initializing Groq analyzer:", error);
            }
        } else {
            console.warn("⚠️ GroqAnalyzer class not found");
        }
        
        return false;
    }
    
    // The main initialization sequence
    function initializeAll() {
        console.log("🚀 Starting complete initialization sequence");
        
        // Step 1: Extract data from page
        if (extractPageData()) {
            // Step 2: Initialize data store
            initializeDataStore();
            
            // Step 3: Initialize visualization (if not already)
            initializeVisualization();
            
            // Step 4: Initialize chat interface
            initializeChat();
            
            // Log final state
            console.log(`📊 Initialization complete:
                - Data Store: ${initState.dataStoreReady ? '✅' : '❌'}
                - Visualization: ${initState.visualizationReady ? '✅' : '❌'}
                - Chat Interface: ${initState.chatReady ? '✅' : '❌'}`);
                
            // Fire overall ready event
            document.dispatchEvent(new CustomEvent('msb-system-ready', { detail: initState }));
        } else {
            console.error("❌ Failed to extract data from page - initialization sequence halted");
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            // Wait a bit to ensure all scripts have loaded
            setTimeout(initializeAll, 500);
        });
    } else {
        // DOM already loaded, initialize now with a delay
        setTimeout(initializeAll, 500);
    }
    
    // Expose loader functions for testing and manual initialization
    window.msbLoader = {
        extractPageData,
        initializeDataStore,
        initializeVisualization,
        initializeChat,
        initializeAll,
        getState: () => ({ ...initState })
    };
    
    console.log("📊 MSB Visualization Loader setup complete");

    // Monitor map clicks and notify when state is selected
    
    // Function to handle state selection from map
    function trackStateSelection() {
        // Wait for map to be loaded
        const mapInterval = setInterval(() => {
            const map = document.getElementById('choropleth-map');
            if (map && map.children && map.children.length > 0) {
                clearInterval(mapInterval);
                
                console.log("👁️ Setting up visualization state selection tracker");
                
                // Look for state paths in the map
                const statePaths = document.querySelectorAll('#choropleth-map .choroplethlayer path');
                if (statePaths && statePaths.length > 0) {
                    statePaths.forEach(path => {
                        path.addEventListener('click', function(e) {
                            // Try to find the state name from various sources
                            let stateName = null;
                            
                            // Try data attribute
                            if (e.target.dataset && e.target.dataset.stateName) {
                                stateName = e.target.dataset.stateName;
                            } else if (e.target.dataset && e.target.dataset.location) {
                                stateName = e.target.dataset.location;
                            }
                            
                            // Try Plotly data (may not be directly accessible)
                            setTimeout(() => {
                                // Check if state title is updated
                                const stateTitle = document.getElementById('state-title');
                                if (stateTitle && stateTitle.textContent) {
                                    stateName = stateTitle.textContent.split('-')[0].trim();
                                    
                                    // Broadcast the state selection
                                    console.log(`🔍 Map click detected state: ${stateName}`);
                                    
                                    document.dispatchEvent(new CustomEvent('msb-state-changed', {
                                        detail: {
                                            state: stateName,
                                            source: 'map-click',
                                            timestamp: new Date()
                                        }
                                    }));
                                    
                                    // If we have the state monitor, update it
                                    if (window.msbStateMonitor) {
                                        window.msbStateMonitor.selectedState = stateName;
                                        const stateData = window.msbStateMonitor.getStateData(stateName);
                                        if (stateData) {
                                            window.msbStateMonitor.selectedStateData = stateData;
                                        }
                                    }
                                }
                            }, 200);
                        });
                    });
                    
                    console.log(`✅ Attached listeners to ${statePaths.length} state paths`);
                } else {
                    console.log("⚠️ No state paths found in map");
                }
            }
        }, 500);
    }
    
    // If the DOM is still loading, wait for it to finish
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            trackStateSelection();
        });
    } else {
        // DOM is already loaded, run the function
        setTimeout(trackStateSelection, 1000);
    }
})(); 