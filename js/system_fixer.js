// System Fixer for MSB Visualization
// This script provides emergency fixes and reload capabilities

(function() {
    console.log("🔧 Initializing System Fixer");
    
    // Create global system fixer object
    window.systemFixer = {
        // Reload all systems
        reloadAll: function() {
            console.log("🔄 Reloading all systems...");
            
            // Step 1: Reset state
            this.resetState();
            
            // Step 2: Reload data store
            this.reloadDataStore();
            
            // Step 3: Reinitialize components
            this.reinitializeComponents();
            
            console.log("✅ System reload complete");
            
            return true;
        },
        
        // Reset state
        resetState: function() {
            console.log("🔄 Resetting system state...");
            
            // Clear any selected state
            window.selectedState = null;
            
            if (window.msbDataStore) {
                window.msbDataStore.selectedState = null;
                window.msbDataStore.selectedStateData = null;
            }
            
            if (window.msbStateMonitor) {
                window.msbStateMonitor.selectedState = null;
                window.msbStateMonitor.selectedStateData = null;
            }
            
            return true;
        },
        
        // Reload data store
        reloadDataStore: function() {
            console.log("🔄 Reloading data store...");
            
            if (window.msbDataStore && window.stateData) {
                window.msbDataStore.loadStateData(window.stateData);
                
                if (window.monthlyData) {
                    window.msbDataStore.loadMonthlyData(window.monthlyData);
                }
                
                window.msbDataStore.initialized = true;
                
                console.log("✅ Data store reloaded");
                return true;
            } else {
                console.error("❌ Cannot reload data store - missing components");
                return false;
            }
        },
        
        // Reinitialize components
        reinitializeComponents: function() {
            console.log("🔄 Reinitializing components...");
            
            // Try to reinitialize visualization loader
            if (window.msbLoader && typeof window.msbLoader.initializeAll === 'function') {
                window.msbLoader.initializeAll();
                console.log("✅ Visualization loader reinitialized");
            } else {
                console.warn("⚠️ Visualization loader not found");
            }
            
            // Try to reinitialize state monitor
            if (window.msbStateMonitor) {
                console.log("✅ State monitor found");
            }
            
            // Try to reinitialize Groq analyzer
            if (window.groqAnalyzer && typeof window.groqAnalyzer.initialize === 'function') {
                window.groqAnalyzer.initialize();
                console.log("✅ Groq analyzer reinitialized");
            } else {
                console.warn("⚠️ Groq analyzer not found");
            }
            
            return true;
        },
        
        // Process a special command
        processCommand: function(command) {
            if (!command || typeof command !== 'string') return null;
            
            const cmd = command.trim().toLowerCase();
            
            if (cmd === '!reload' || cmd === '!reset') {
                this.reloadAll();
                return "✅ System reload complete. All components have been reinitialized.";
            }
            
            if (cmd === '!status' || cmd === '!debug') {
                if (window.msbDataTester && typeof window.msbDataTester.showPanel === 'function') {
                    window.msbDataTester.showPanel();
                    return "✅ Debug panel shown. Press Alt+T to toggle it.";
                } else {
                    return "⚠️ Debug panel not available.";
                }
            }
            
            if (cmd === '!test') {
                if (window.msbDataTester && typeof window.msbDataTester.runTests === 'function') {
                    window.msbDataTester.runTests();
                    return "✅ Running data access tests...";
                } else {
                    return "⚠️ Test runner not available.";
                }
            }
            
            if (cmd === '!context') {
                return this.getDataContext();
            }
            
            return null;
        },
        
        // Get data context information
        getDataContext: function() {
            let context = "📊 **Current Data Context:**\n\n";
            
            // Check if data store is available
            if (window.msbDataStore && window.msbDataStore.initialized) {
                const stateCount = Object.keys(window.msbDataStore.stateData).length;
                const selectedState = window.msbDataStore.selectedState;
                
                context += `- ${stateCount} states available in the dataset\n`;
                context += `- Years covered: 2020-2024\n`;
                context += `- Selected state: ${selectedState || 'None'}\n\n`;
                
                // Add information about top states
                const topStates = window.msbDataStore.getTopStates(5);
                if (topStates && topStates.length > 0) {
                    context += "**Top 5 states by SAR filings:**\n";
                    topStates.forEach((state, i) => {
                        context += `${i+1}. ${state.state}: ${state.count.toLocaleString()} SARs\n`;
                    });
                }
                
                // Add available commands
                context += "\n**Available commands:**\n";
                context += "- !reload - Reload all systems\n";
                context += "- !status - Show system status\n";
                context += "- !test - Run data access tests\n";
                context += "- !context - Show this information\n";
                
                return context;
            } else {
                return "⚠️ Data store not available or initialized. Try using !reload command.";
            }
        }
    };
    
    // Patch the chat interface to handle special commands
    function patchChatInterface() {
        if (!window.ChatInterface) {
            console.warn("⚠️ ChatInterface not found - cannot patch");
            setTimeout(patchChatInterface, 1000); // Try again in 1 second
            return;
        }
        
        // Patch the chat interface to handle special commands
        const originalHandleSubmit = window.ChatInterface.prototype.handleSubmit;
        
        window.ChatInterface.prototype.handleSubmit = function(event) {
            if (event) {
                event.preventDefault();
            }
            
            const userInput = this.userInput.value.trim();
            
            if (!userInput) return;
            
            // Check for special commands
            if (userInput.startsWith('!')) {
                console.log("🔧 Processing special command:", userInput);
                
                // Add user message
                this.addMessage(userInput, 'user');
                
                // Clear input
                this.userInput.value = '';
                
                // Process command
                const response = window.systemFixer.processCommand(userInput);
                
                if (response) {
                    // Add system message with response
                    this.addMessage(response, 'assistant');
                } else {
                    // Unknown command
                    this.addMessage("Unknown command. Try !help for a list of commands.", 'assistant');
                }
                
                return;
            }
            
            // Call original method for normal messages
            originalHandleSubmit.call(this, event);
        };
        
        console.log("✅ ChatInterface patched to handle special commands");
    }
    
    // Initialize when page is loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(patchChatInterface, 1000);
        });
    } else {
        setTimeout(patchChatInterface, 1000);
    }
    
    console.log("🔧 System Fixer initialized");
})(); 