// Chat Interface for MSB Data Visualization
// This file handles the chat UI and interactions

class ChatInterface {
    constructor(containerSelector, groqAnalyzer) {
        this.containerElement = document.querySelector(containerSelector);
        this.groqAnalyzer = groqAnalyzer;
        this.isOpen = false;
        this.initialized = false;
        this.lastSelectedState = null; // Track last selected state
        // Add special commands
        this.commands = {
            "!help": this.showHelp.bind(this),
            "!refresh": this.refreshData.bind(this),
            "!context": this.showContext.bind(this),
            "!debug": this.toggleDebug.bind(this),
            "!test": this.runTests.bind(this),
            "!status": this.showDebugInfo.bind(this)
        };
    }

    // Initialize the chat interface
    initialize() {
        if (this.initialized) return;
        
        // Create chat elements
        this.createChatElements();
        
        // Attempt to load API key
        const keyLoaded = this.groqAnalyzer.loadApiKey();
        if (keyLoaded) {
            this.showStatus("API key loaded from storage");
        } else {
            this.showAPIKeyPrompt();
        }
        
        // Add event listeners
        this.attachEventListeners();
        
        // Add state selection listener
        this.listenForStateSelection();
        
        this.initialized = true;
        
        // Show welcome message
        this.addMessage({
            role: 'system',
            content: 'Welcome to the MSB SAR Data Assistant! You can ask questions about SAR filings across all states or the currently selected state. Try "!context" to see what data is available.'
        });
    }

    // Create chat UI elements
    createChatElements() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <h3>Data Analysis Assistant</h3>
                <div class="chat-controls">
                    <button class="settings-button" title="Settings"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
                    <button class="minimize-button" title="Minimize">−</button>
                </div>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-status"></div>
            <div class="chat-input-container">
                <textarea class="chat-input" placeholder="Ask questions about the visualization data..."></textarea>
                <button class="chat-send-button" title="Send">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                </button>
            </div>
            <div class="chat-footer">
                <span>Powered by Groq Llama3-70b</span>
            </div>
        `;
        
        // Create settings modal
        const settingsModal = document.createElement('div');
        settingsModal.className = 'settings-modal';
        settingsModal.innerHTML = `
            <div class="settings-content">
                <h3>Settings</h3>
                <div class="settings-group">
                    <label for="api-key">Groq API Key:</label>
                    <input type="password" id="api-key" placeholder="Enter your Groq API key">
                </div>
                <div class="settings-actions">
                    <button class="settings-save">Save</button>
                    <button class="settings-cancel">Cancel</button>
                </div>
            </div>
        `;
        
        // Create chat toggle button
        const chatToggle = document.createElement('button');
        chatToggle.className = 'chat-toggle';
        chatToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>Ask about the data</span>
        `;
        
        // Add elements to the DOM
        this.containerElement.appendChild(chatContainer);
        this.containerElement.appendChild(settingsModal);
        this.containerElement.appendChild(chatToggle);
        
        // Store references to elements
        this.chatToggle = chatToggle;
        this.chatContainer = chatContainer;
        this.messagesContainer = chatContainer.querySelector('.chat-messages');
        this.inputContainer = chatContainer.querySelector('.chat-input-container');
        this.chatInput = chatContainer.querySelector('.chat-input');
        this.sendButton = chatContainer.querySelector('.chat-send-button');
        this.minimizeButton = chatContainer.querySelector('.minimize-button');
        this.settingsButton = chatContainer.querySelector('.settings-button');
        this.statusContainer = chatContainer.querySelector('.chat-status');
        this.settingsModal = settingsModal;
        this.apiKeyInput = settingsModal.querySelector('#api-key');
        this.saveSettingsButton = settingsModal.querySelector('.settings-save');
        this.cancelSettingsButton = settingsModal.querySelector('.settings-cancel');
    }

    // Attach event listeners to elements
    attachEventListeners() {
        // Toggle chat open/closed
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Minimize chat
        this.minimizeButton.addEventListener('click', () => this.toggleChat());
        
        // Open settings
        this.settingsButton.addEventListener('click', () => this.toggleSettings(true));
        
        // Close settings
        this.cancelSettingsButton.addEventListener('click', () => this.toggleSettings(false));
        
        // Save settings
        this.saveSettingsButton.addEventListener('click', () => this.saveSettings());
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key (but allow new lines with Shift+Enter)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    // Toggle chat visibility
    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.chatContainer.classList.add('open');
            this.chatToggle.classList.add('hidden');
            // Focus the input field
            setTimeout(() => this.chatInput.focus(), 300);
        } else {
            this.chatContainer.classList.remove('open');
            this.chatToggle.classList.remove('hidden');
            // Close settings if open
            this.toggleSettings(false);
        }
    }

    // Toggle settings visibility
    toggleSettings(show) {
        if (show) {
            this.settingsModal.classList.add('open');
            // Get current API key
            if (this.groqAnalyzer.apiKey) {
                this.apiKeyInput.value = this.groqAnalyzer.apiKey;
            }
        } else {
            this.settingsModal.classList.remove('open');
        }
    }

    // Save settings
    saveSettings() {
        const apiKey = this.apiKeyInput.value.trim();
        
        if (apiKey) {
            this.groqAnalyzer.setApiKey(apiKey);
            this.showStatus("API key saved successfully");
        } else {
            this.showStatus("Please enter a valid API key", true);
            return;
        }
        
        this.toggleSettings(false);
    }

    // Show API key prompt
    showAPIKeyPrompt() {
        this.addMessage({
            role: 'system',
            content: 'Please set your Groq API key in the settings to use the chat functionality.'
        });
        
        // Add a button to open settings
        const settingsPrompt = document.createElement('div');
        settingsPrompt.className = 'settings-prompt';
        settingsPrompt.innerHTML = `
            <button class="open-settings-button">Open Settings</button>
        `;
        
        settingsPrompt.querySelector('.open-settings-button').addEventListener('click', () => {
            this.toggleSettings(true);
        });
        
        this.messagesContainer.appendChild(settingsPrompt);
    }

    // Send user message
    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage({
            role: 'user',
            content: message
        });
        
        // Clear input
        this.chatInput.value = '';
        
        // Check for special commands
        if (message.startsWith("!")) {
            this.handleCommand(message);
            return;
        }
        
        // Check if API key is set
        if (!this.groqAnalyzer.apiKey) {
            this.showAPIKeyPrompt();
            return;
        }
        
        // Show loading indicator
        this.showStatus("Analyzing data...");
        
        // Get response from Groq
        const response = await this.groqAnalyzer.generateQuery(message);
        
        // Hide loading indicator
        this.hideStatus();
        
        if (response.error) {
            // Show error
            this.addMessage({
                role: 'system',
                content: `Error: ${response.message}`
            });
        } else {
            // Add assistant response
            this.addMessage({
                role: 'assistant',
                content: response.message
            });
        }
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    // Handle special commands
    handleCommand(message) {
        const command = message.split(' ')[0].toLowerCase();
        
        if (this.commands[command]) {
            this.commands[command](message);
        } else {
            this.addMessage({
                role: 'system',
                content: `Unknown command: ${command}\nType !help for available commands.`
            });
        }
        
        this.scrollToBottom();
    }
    
    // Command: Show help
    showHelp() {
        const helpText = `
        Available commands:
        - !help - Show this help message
        - !refresh - Refresh data connections and state selection
        - !context - Show current data context
        - !debug - Toggle debug panel
        - !test - Run data tests
        - !status - Show system status
        `;
        
        this.addMessage({
            role: 'system',
            content: helpText
        });
    }
    
    // Command: Refresh data
    refreshData() {
        try {
            // Force state monitor refresh
            if (window.msbStateMonitor) {
                // Check current state
                const currentState = window.msbStateMonitor.selectedState;
                
                // Force it to update the data
                if (window.msbDataStore && window.msbDataStore.initialized) {
                    window.msbStateMonitor.selectedStateData = window.msbDataStore.getStateData(currentState);
                    window.msbStateMonitor.lastUpdate = new Date();
                }
                
                // Force the Groq analyzer to recognize the state
                if (this.groqAnalyzer && currentState) {
                    this.groqAnalyzer.stateSelectionDetected = true;
                    this.groqAnalyzer.selectedState = currentState;
                }
            }
            
            this.addMessage({
                role: 'system',
                content: 'MSB data refreshed. Try your query again.'
            });
        } catch (error) {
            console.error("Error refreshing data:", error);
            this.addMessage({
                role: 'system',
                content: 'Error refreshing data. Try reloading the page.'
            });
        }
    }
    
    // Command: Show context
    showContext() {
        let contextText = "Current Data Context:\n\n";
        
        // Check for selected state
        if (window.msbStateMonitor && window.msbStateMonitor.selectedState) {
            contextText += `Selected State: ${window.msbStateMonitor.selectedState}\n`;
            
            // Add state data if available
            if (window.msbStateMonitor.selectedStateData) {
                const stateData = window.msbStateMonitor.selectedStateData;
                contextText += `Years available: ${stateData.years.join(", ")}\n`;
                contextText += `Total SARs: ${stateData.counts.reduce((a, b) => a + b, 0).toLocaleString()}\n\n`;
            }
        } else {
            contextText += "No state currently selected.\n\n";
        }
        
        // Add information about overall data
        if (window.msbDataPatch && window.msbDataPatch.commonData) {
            contextText += "Overall Data Available:\n";
            contextText += `- Total SARs in 2020: ${window.msbDataPatch.commonData.total_sars_2020.toLocaleString()}\n`;
            contextText += `- Top state: ${window.msbDataPatch.commonData.top_states[0].state} with ${window.msbDataPatch.commonData.top_states[0].count.toLocaleString()} SARs\n\n`;
        }
        
        // Add information about available questions
        contextText += "You can ask questions about:\n";
        contextText += "- SAR counts for specific states in specific years\n";
        contextText += "- Top states by SAR filings\n";
        contextText += "- Overall SAR trends across years\n";
        contextText += "- Details about the currently selected state";
        
        this.addMessage({
            role: 'system',
            content: contextText
        });
    }
    
    // Command: Toggle debug panel
    toggleDebug() {
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            if (debugPanel.style.display === 'block') {
                debugPanel.style.display = 'none';
                this.addMessage({
                    role: 'system',
                    content: "Debug panel hidden"
                });
            } else {
                debugPanel.style.display = 'block';
                this.addMessage({
                    role: 'system',
                    content: "Debug panel shown"
                });
            }
        } else {
            this.addMessage({
                role: 'system',
                content: "Debug panel not available"
            });
        }
    }
    
    // Command: Run tests
    runTests() {
        this.showStatus("Running data tests...");
        
        try {
            // Create a test result
            let testResults = "Data Access Tests:\n\n";
            
            // Test 1: California 2020
            const californiaTest = "How many SARs did California have in 2020?";
            const californiaResult = window.msbDataPatch ? 
                window.msbDataPatch.answerQuestion(californiaTest) : 
                "Data patch not available";
            
            testResults += `Test 1: California 2020\n${californiaResult || "No answer"}\n\n`;
            
            // Test 2: Overall data
            const overallTest = "How many SARs were filed in 2020 overall?";
            const overallResult = window.msbDataPatch ? 
                window.msbDataPatch.answerQuestion("overall in 2020") : 
                "Data patch not available";
            
            testResults += `Test 2: Overall 2020\n${overallResult || "No answer"}\n\n`;
            
            // Test 3: Top states
            const topStatesTest = "What are the top states for SAR filings?";
            const topStatesResult = window.msbDataPatch ? 
                window.msbDataPatch.answerQuestion("top states") : 
                "Data patch not available";
            
            testResults += `Test 3: Top states\n${topStatesResult || "No answer"}\n\n`;
            
            // Test 4: UI state detection
            const stateFromUI = window.msbStateMonitor ? 
                window.msbStateMonitor.readStateFromUI() : 
                "State monitor not available";
            
            testResults += `Test 4: UI State Detection\nDetected state: ${stateFromUI || "None"}\n\n`;
            
            // Report results
            this.hideStatus();
            this.addMessage({
                role: 'system',
                content: testResults
            });
        } catch (error) {
            this.hideStatus();
            this.addMessage({
                role: 'system',
                content: `Error running tests: ${error.message}`
            });
        }
    }
    
    // Command: Show debug info
    showDebugInfo() {
        let status = "System Status:\n\n";
        
        // Check data patch
        status += `Data Patch Module: ${window.msbDataPatch ? "Available" : "Not available"}\n`;
        if (window.msbDataPatch) {
            status += `- Initialized: ${window.msbDataPatch.initialized}\n`;
        }
        
        // Check state monitor
        status += `State Monitor: ${window.msbStateMonitor ? "Available" : "Not available"}\n`;
        if (window.msbStateMonitor) {
            status += `- Initialized: ${window.msbStateMonitor.isInitialized}\n`;
            status += `- Selected State: ${window.msbStateMonitor.selectedState || "None"}\n`;
            status += `- Last Update: ${window.msbStateMonitor.lastUpdate ? window.msbStateMonitor.lastUpdate.toLocaleTimeString() : "Never"}\n`;
        }
        
        // Check groq analyzer
        status += `Groq Analyzer: ${this.groqAnalyzer ? "Available" : "Not available"}\n`;
        if (this.groqAnalyzer) {
            status += `- API Key: ${this.groqAnalyzer.apiKey ? "Set" : "Not set"}\n`;
        }
        
        // State data
        status += `\nState Data: ${window.stateData ? `Available (${Object.keys(window.stateData).length} states)` : "Not available"}\n`;
        
        this.addMessage({
            role: 'system',
            content: status
        });
    }

    // Add a message to the chat
    addMessage({ role, content }) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}`;
        
        // Add avatar or icon based on role
        const avatarElement = document.createElement('div');
        avatarElement.className = 'avatar';
        
        if (role === 'assistant') {
            avatarElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14l4-4m4 6.5c0 2.5-2 4.5-4.5 4.5h-5C5.5 21 3.5 19 3.5 16.5v-9C3.5 5 5.5 3 8 3h5c2.5 0 4.5 2 4.5 4.5v9z"></path><circle cx="8.5" cy="8.5" r="1.5"></circle><circle cx="15.5" cy="8.5" r="1.5"></circle></svg>`;
        } else if (role === 'user') {
            avatarElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>`;
        } else { // system
            avatarElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path></svg>`;
        }
        
        // Add message content
        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.innerHTML = this.formatMessageContent(content);
        
        // Combine elements
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
        
        // Add to container
        this.messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    // Format message content with markdown-like syntax
    formatMessageContent(content) {
        // Convert line breaks to <br>
        return content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    // Show status message
    showStatus(message, isError = false) {
        this.statusContainer.textContent = message;
        this.statusContainer.classList.add('visible');
        
        if (isError) {
            this.statusContainer.classList.add('error');
        } else {
            this.statusContainer.classList.remove('error');
        }
    }

    // Hide status message
    hideStatus() {
        this.statusContainer.classList.remove('visible');
        this.statusContainer.classList.remove('error');
    }

    // Scroll messages to bottom
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // Listen for state selection changes
    listenForStateSelection() {
        // Listen for custom state change event
        document.addEventListener('msb-state-changed', (event) => {
            if (event.detail && event.detail.state) {
                const stateName = event.detail.state;
                
                // Only announce if it's a different state
                if (this.lastSelectedState !== stateName) {
                    this.lastSelectedState = stateName;
                    this.addStateSelectionMessage(stateName);
                }
            }
        });
        
        // Also check for state changes directly
        const stateCheckInterval = setInterval(() => {
            if (window.msbStateMonitor && window.msbStateMonitor.selectedState) {
                const stateName = window.msbStateMonitor.selectedState;
                
                // Only announce if it's a different state
                if (this.lastSelectedState !== stateName) {
                    this.lastSelectedState = stateName;
                    this.addStateSelectionMessage(stateName);
                    
                    // Also update the Groq analyzer
                    if (this.groqAnalyzer) {
                        this.groqAnalyzer.stateSelectionDetected = true;
                        this.groqAnalyzer.selectedState = stateName;
                    }
                }
            }
        }, 2000);
    }

    // Add state selection message
    addStateSelectionMessage(stateName) {
        this.addMessage({
            role: 'system',
            content: `State selected: ${stateName}`
        });
        
        // Show status and add an explanatory message
        this.showStatus(`Now analyzing data for ${stateName}`);
        
        // CRITICAL FIX: Force state selection to propagate to all components
        this.forceStateSelectionUpdate(stateName);
        
        // If the chat isn't open, make it blink to attract attention
        if (!this.isOpen) {
            this.chatToggle.classList.add('blink');
            setTimeout(() => {
                this.chatToggle.classList.remove('blink');
            }, 3000);
        }
    }
    
    // NEW FUNCTION: Force state selection to update across all components
    forceStateSelectionUpdate(stateName) {
        console.log(`🔄 CRITICAL FIX: Forcing state selection update to ${stateName}`);
        
        // Update the Groq analyzer
        if (this.groqAnalyzer) {
            this.groqAnalyzer.stateSelectionDetected = true;
            this.groqAnalyzer.selectedState = stateName;
            
            // If it has state data available, copy it
            if (window.msbStateMonitor && window.msbStateMonitor.selectedStateData) {
                this.groqAnalyzer.selectedStateData = window.msbStateMonitor.selectedStateData;
            }
        }
        
        // Update global selected state variable used by visualization
        if (window.selectedState !== undefined) {
            window.selectedState = stateName;
        }
        
        // Update the data store if available
        if (window.msbDataStore && typeof window.msbDataStore.setSelectedState === 'function') {
            window.msbDataStore.setSelectedState(stateName);
        }
        
        // Broadcast state selection event in case other components are listening
        document.dispatchEvent(new CustomEvent('msb-state-forced-update', {
            detail: {
                state: stateName,
                timestamp: new Date()
            }
        }));
        
        // Force a small timeout before allowing new queries to ensure state propagation
        setTimeout(() => {
            console.log("✅ State selection update complete");
        }, 500);
    }
}

// Export the ChatInterface class
window.ChatInterface = ChatInterface; 