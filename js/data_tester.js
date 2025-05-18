// MSB Data Tester
// Simple utility to test the data access mechanisms

(function() {
    console.log("🧪 Initializing MSB Data Tester");
    
    // Test commands/questions to run
    const TEST_QUERIES = [
        "How many SARs did California have in 2020?",
        "What were the total SARs filed in 2020?",
        "Which state had the most SARs?",
        "Show me data for New York"
    ];
    
    // Function to add the test panel
    function addTestPanel() {
        // Create the panel if it doesn't exist
        if (!document.getElementById('msb-data-test-panel')) {
            const panel = document.createElement('div');
            panel.id = 'msb-data-test-panel';
            panel.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 400px;
                max-height: 500px;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.8);
                color: #4afa9c;
                font-family: monospace;
                font-size: 12px;
                padding: 10px;
                border-radius: 5px;
                z-index: 9999;
                display: none;
            `;
            
            // Add header
            const header = document.createElement('div');
            header.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <h3 style="margin: 0; color: #4afa9c;">MSB Data Tester</h3>
                    <button id="msb-data-test-close" style="background: none; border: none; color: #ff6b6b; cursor: pointer;">✕</button>
                </div>
                <div style="margin-bottom: 10px;">
                    <button id="msb-run-tests" style="background: #2d6a4f; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Run Tests</button>
                    <button id="msb-clear-results" style="background: #5c5c5c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 10px;">Clear</button>
                </div>
                <div id="msb-data-status" style="margin-bottom: 10px; padding: 5px; background-color: rgba(0,0,0,0.3);"></div>
            `;
            panel.appendChild(header);
            
            // Add results container
            const results = document.createElement('div');
            results.id = 'msb-data-test-results';
            results.style.cssText = `
                padding: 5px;
                background-color: rgba(0,0,0,0.3);
            `;
            panel.appendChild(results);
            
            // Add to body
            document.body.appendChild(panel);
            
            // Add event listeners
            document.getElementById('msb-data-test-close').addEventListener('click', function() {
                panel.style.display = 'none';
            });
            
            document.getElementById('msb-run-tests').addEventListener('click', runTests);
            document.getElementById('msb-clear-results').addEventListener('click', function() {
                document.getElementById('msb-data-test-results').innerHTML = '';
            });
            
            // Add keyboard shortcut (Alt+T)
            document.addEventListener('keydown', function(e) {
                if (e.altKey && e.key === 't') {
                    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                }
            });
            
            console.log("🧪 Test panel added (Press Alt+T to toggle)");
        }
        
        return document.getElementById('msb-data-test-panel');
    }
    
    // Function to update the status panel
    function updateStatus() {
        const status = document.getElementById('msb-data-status');
        if (!status) return;
        
        let html = '<b>System Status:</b><br>';
        
        // Check data store
        if (window.msbDataStore) {
            html += `✅ Data Store: ${window.msbDataStore.initialized ? 'Initialized' : 'Not initialized'}<br>`;
            if (window.msbDataStore.initialized) {
                html += ` - States: ${Object.keys(window.msbDataStore.stateData).length}<br>`;
                html += ` - Selected: ${window.msbDataStore.selectedState || 'None'}<br>`;
            }
        } else {
            html += '❌ Data Store: Not found<br>';
        }
        
        // Check direct data
        if (window.msbDirectData) {
            html += '✅ Direct Data: Available<br>';
            const ca2020 = window.msbDirectData.getHardCodedValue('california_2020');
            if (ca2020) {
                html += ` - CA 2020: ${ca2020.toLocaleString()}<br>`;
            }
        } else {
            html += '❌ Direct Data: Not found<br>';
        }
        
        // Check Groq analyzer
        if (window.groqAnalyzer) {
            html += '✅ Groq Analyzer: Available<br>';
            html += ` - API Key: ${window.groqAnalyzer.apiKey ? 'Set' : 'Not set'}<br>`;
            html += ` - Direct access: ${window.groqAnalyzer.tryDirectDataAccess ? 'Available' : 'Not available'}<br>`;
        } else {
            html += '❌ Groq Analyzer: Not found<br>';
        }
        
        status.innerHTML = html;
    }
    
    // Function to run the tests
    async function runTests() {
        const results = document.getElementById('msb-data-test-results');
        if (!results) return;
        
        // Update status first
        updateStatus();
        
        // Clear previous results
        results.innerHTML = '<div style="color: #4afa9c; font-weight: bold;">Running tests...</div>';
        
        let html = '';
        
        // Run each test query
        for (const query of TEST_QUERIES) {
            html += `<div style="margin-top: 10px; border-left: 2px solid #4afa9c; padding-left: 10px;">`;
            html += `<div style="color: #ffcc00; font-weight: bold;">Query: ${query}</div>`;
            
            try {
                let answer = null;
                
                // Try direct data first if available
                if (window.msbDirectData) {
                    const directResponse = await window.msbDirectData.getDirectResponse(query);
                    if (directResponse && !directResponse.error && directResponse.message) {
                        answer = directResponse.message;
                        html += `<div style="color: #4afa9c; margin-top: 5px;">Direct Data: ✓</div>`;
                    } else {
                        html += `<div style="color: #ff6b6b; margin-top: 5px;">Direct Data: ✗</div>`;
                    }
                }
                
                // Try Groq analyzer if available
                if (window.groqAnalyzer && window.groqAnalyzer.tryDirectDataAccess) {
                    const groqResponse = window.groqAnalyzer.tryDirectDataAccess(query);
                    if (groqResponse) {
                        answer = groqResponse;
                        html += `<div style="color: #4afa9c; margin-top: 5px;">Groq Analyzer: ✓</div>`;
                    } else {
                        html += `<div style="color: #ff6b6b; margin-top: 5px;">Groq Analyzer: ✗</div>`;
                    }
                }
                
                // Display the answer if we have one
                if (answer) {
                    html += `<div style="color: #ffffff; margin-top: 5px; padding: 5px; background-color: rgba(255,255,255,0.1);">${answer}</div>`;
                } else {
                    html += `<div style="color: #ff6b6b; margin-top: 5px;">No answer available</div>`;
                }
            } catch (error) {
                html += `<div style="color: #ff6b6b; margin-top: 5px;">Error: ${error.message}</div>`;
            }
            
            html += `</div>`;
        }
        
        results.innerHTML = html;
    }
    
    // Initialize when ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            // Wait for everything else to initialize
            setTimeout(function() {
                const panel = addTestPanel();
                updateStatus();
                
                // Listen for the system ready event
                document.addEventListener('msb-system-ready', function() {
                    console.log("🧪 System ready event received, updating status");
                    updateStatus();
                });
            }, 1000);
        });
    } else {
        // Page already loaded
        setTimeout(function() {
            const panel = addTestPanel();
            updateStatus();
        }, 1000);
    }
    
    // Expose test functions
    window.msbDataTester = {
        showPanel: function() {
            const panel = document.getElementById('msb-data-test-panel');
            if (panel) {
                panel.style.display = 'block';
                updateStatus();
            } else {
                const newPanel = addTestPanel();
                newPanel.style.display = 'block';
                updateStatus();
            }
        },
        runTests: runTests
    };
    
    console.log("🧪 MSB Data Tester initialized (Alt+T to show panel)");
})(); 