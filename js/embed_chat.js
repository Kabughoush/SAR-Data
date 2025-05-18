// Self-contained chat implementation for MSB visualization
(function() {
    console.log("Embedding chat interface...");
    
    // Create required elements
    function createChatElements() {
        // 1. Add CSS
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            /* Chat Toggle Button */
            .chat-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                align-items: center;
                padding: 10px 16px;
                background-color: #3b82f6;
                color: white;
                border: none;
                border-radius: 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 900;
            }
            
            .chat-toggle:hover {
                background-color: #2563eb;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            }
            
            .chat-toggle svg {
                margin-right: 8px;
                stroke: white;
            }
            
            .chat-toggle.hidden {
                display: none;
            }
            
            /* Chat Container */
            #chat-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 360px;
                height: 500px;
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                z-index: 1000;
                transform: scale(0.9);
                opacity: 0;
                pointer-events: none;
                transform-origin: bottom right;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }
            
            #chat-container.open {
                transform: scale(1);
                opacity: 1;
                pointer-events: all;
            }
            
            /* Chat Header */
            .chat-header {
                padding: 12px 16px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 12px 12px 0 0;
            }
            
            .chat-header h3 {
                margin: 0;
                font-weight: 600;
                font-size: 1rem;
            }
            
            .chat-controls {
                display: flex;
                gap: 8px;
            }
            
            .chat-controls button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                padding: 0;
                transition: background-color 0.2s;
            }
            
            .chat-controls button:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }
            
            /* Chat Messages */
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background-color: #f8fafc;
            }
            
            .chat-message {
                display: flex;
                gap: 8px;
                max-width: 90%;
                animation: message-fade-in 0.3s ease;
            }
            
            .chat-message.user {
                align-self: flex-end;
            }
            
            .chat-message.assistant, .chat-message.system {
                align-self: flex-start;
            }
            
            .avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }
            
            .avatar.user {
                background-color: #3b82f6;
                color: white;
            }
            
            .avatar.assistant {
                background-color: #10b981;
                color: white;
            }
            
            .avatar.system {
                background-color: #6b7280;
                color: white;
            }
            
            .message-content {
                padding: 10px 12px;
                border-radius: 12px;
                line-height: 1.5;
                font-size: 14px;
                max-width: calc(100% - 36px);
                word-break: break-word;
            }
            
            .user .message-content {
                background-color: #3b82f6;
                color: white;
                border-top-right-radius: 2px;
            }
            
            .assistant .message-content {
                background-color: white;
                color: #1e293b;
                border: 1px solid #e2e8f0;
                border-top-left-radius: 2px;
            }
            
            .system .message-content {
                background-color: #f1f5f9;
                color: #475569;
                border: 1px solid #e2e8f0;
                border-top-left-radius: 2px;
            }
            
            /* Settings Prompt */
            .settings-prompt {
                display: flex;
                justify-content: center;
                margin-top: 12px;
            }
            
            .open-settings-button {
                background-color: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }
            
            .open-settings-button:hover {
                background-color: #2563eb;
            }
            
            /* Chat Status */
            .chat-status {
                padding: 8px 12px;
                background-color: #f1f5f9;
                color: #475569;
                font-size: 13px;
                text-align: center;
                height: 0;
                overflow: hidden;
                transition: height 0.3s ease, padding 0.3s ease;
            }
            
            .chat-status.visible {
                height: auto;
                padding: 8px 12px;
            }
            
            .chat-status.error {
                background-color: #fee2e2;
                color: #b91c1c;
            }
            
            /* Chat Input */
            .chat-input-container {
                padding: 12px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                background-color: white;
            }
            
            .chat-input {
                flex: 1;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 10px 12px;
                font-family: inherit;
                font-size: 14px;
                resize: none;
                height: 24px;
                max-height: 120px;
                overflow-y: auto;
                transition: border-color 0.2s;
            }
            
            .chat-input:focus {
                outline: none;
                border-color: #3b82f6;
            }
            
            .chat-send-button {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #3b82f6;
                color: white;
                border: none;
                margin-left: 8px;
                cursor: pointer;
                transition: background-color 0.2s, transform 0.2s;
                padding: 0;
            }
            
            .chat-send-button:hover {
                background-color: #2563eb;
                transform: scale(1.05);
            }
            
            .chat-send-button svg {
                width: 18px;
                height: 18px;
                stroke: white;
            }
            
            /* Chat Footer */
            .chat-footer {
                padding: 8px 12px;
                background-color: #f8fafc;
                border-top: 1px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
                text-align: center;
            }
            
            /* Settings Modal */
            .settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1100;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            
            .settings-modal.open {
                opacity: 1;
                pointer-events: all;
            }
            
            .settings-content {
                background-color: white;
                border-radius: 12px;
                padding: 24px;
                width: 320px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                animation: modal-slide-in 0.3s ease;
            }
            
            .settings-content h3 {
                margin-top: 0;
                margin-bottom: 16px;
                color: #1e293b;
                font-size: 18px;
            }
            
            .settings-group {
                margin-bottom: 20px;
            }
            
            .settings-group label {
                display: block;
                margin-bottom: 8px;
                font-size: 14px;
                color: #475569;
                font-weight: 500;
            }
            
            .settings-group input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .settings-group input:focus {
                outline: none;
                border-color: #3b82f6;
            }
            
            .settings-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            
            .settings-actions button {
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .settings-save {
                background-color: #3b82f6;
                color: white;
                border: none;
            }
            
            .settings-save:hover {
                background-color: #2563eb;
            }
            
            .settings-cancel {
                background-color: white;
                color: #475569;
                border: 1px solid #cbd5e1;
            }
            
            .settings-cancel:hover {
                background-color: #f1f5f9;
            }
            
            /* Animations */
            @keyframes message-fade-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes modal-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Media Queries */
            @media (max-width: 480px) {
                #chat-container {
                    width: calc(100% - 40px);
                    height: 400px;
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                }
                
                .chat-toggle {
                    bottom: 15px;
                    right: 15px;
                }
            }
        `;
        document.head.appendChild(styleEl);
        
        // 2. Create chat toggle button
        const chatToggle = document.createElement('button');
        chatToggle.className = 'chat-toggle';
        chatToggle.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>Ask about the data</span>
        `;
        document.body.appendChild(chatToggle);
        
        // 3. Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
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
        document.body.appendChild(chatContainer);
        
        // 4. Create settings modal
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
        document.body.appendChild(settingsModal);
        
        return {
            chatToggle,
            chatContainer,
            settingsModal,
            messagesContainer: chatContainer.querySelector('.chat-messages'),
            chatInput: chatContainer.querySelector('.chat-input'),
            sendButton: chatContainer.querySelector('.chat-send-button'),
            minimizeButton: chatContainer.querySelector('.minimize-button'),
            settingsButton: chatContainer.querySelector('.settings-button'),
            statusContainer: chatContainer.querySelector('.chat-status'),
            apiKeyInput: settingsModal.querySelector('#api-key'),
            saveSettingsButton: settingsModal.querySelector('.settings-save'),
            cancelSettingsButton: settingsModal.querySelector('.settings-cancel')
        };
    }
    
    // GroqAnalyzer class
    class GroqAnalyzer {
        constructor() {
            this.apiKey = null;
            this.modelName = "llama3-70b-8192";
            this.baseUrl = "https://api.groq.com/openai/v1/chat/completions";
            this.stateData = null;
            this.currentState = null;
            this.requestInProgress = false;
            
            // Try to load API key
            this.loadApiKey();
        }
        
        // Initialize with data
        initialize(stateData, currentStateData) {
            this.stateData = stateData;
            this.currentState = currentStateData;
            console.log("Initialized with state data:", currentStateData?.name || "None");
        }
        
        // Update current state
        updateState(newStateData) {
            this.currentState = newStateData;
            console.log("Updated state data:", newStateData?.name || "None");
        }
        
        // Prepare context from current data
        prepareContext() {
            // First check if the debug data is available 
            if (window.msbDebugData && window.msbDebugData.initialized) {
                console.log("Using debug data for context preparation");
                return this.prepareContextFromDebugData();
            }
            
            // Fall back to the original method
            console.log("Using regular method for context preparation");
            return this.prepareContextOriginal();
        }
        
        // Prepare context using the debug data object
        prepareContextFromDebugData() {
            const debug = window.msbDebugData;
            
            let context = {
                currentState: debug.currentState ? debug.currentState.name : "No state selected",
                stateInfo: {},
                allStates: {},
                topStates: debug.topStates || [],
                dataSource: "FinCEN Money Services Business (MSB) Suspicious Activity Reports | 2020-2024"
            };
            
            // Add current state details if available
            if (debug.currentState) {
                const state = debug.currentState;
                
                // Add data from current state
                context.stateInfo.yearlyCounts = state.counts;
                context.stateInfo.years = state.years;
                context.stateInfo.totalCount = state.counts.reduce((sum, count) => sum + count, 0);
                
                // Add suspicious activities
                context.stateInfo.topSuspiciousActivities = {};
                if (state.sus_acts && state.sus_acts.labels) {
                    state.sus_acts.labels.forEach((label, i) => {
                        context.stateInfo.topSuspiciousActivities[label] = state.sus_acts.values[i];
                    });
                }
                
                // Add products
                context.stateInfo.products = {};
                if (state.products && state.products.labels) {
                    state.products.labels.forEach((label, i) => {
                        context.stateInfo.products[label] = state.products.values[i];
                    });
                }
                
                // Add instruments
                context.stateInfo.instruments = {};
                if (state.instruments && state.instruments.labels) {
                    state.instruments.labels.forEach((label, i) => {
                        context.stateInfo.instruments[label] = state.instruments.values[i];
                    });
                }
                
                // Add monthly data if available
                context.stateInfo.monthlyData = state.monthly;
            }
            
            // Add summary data for all states - limit to just the data we need
            // to avoid context length issues
            const allStates = debug.allStates;
            if (allStates) {
                // Get yearly totals across all states
                const nationalTrend = {};
                
                // Process up to 10 top states fully, summarize the rest
                let processedCount = 0;
                
                Object.keys(allStates).forEach(stateKey => {
                    const stateObj = allStates[stateKey];
                    const totalCount = stateObj.counts ? stateObj.counts.reduce((sum, count) => sum + count, 0) : 0;
                    
                    // Add to national trend
                    if (stateObj.counts && stateObj.years) {
                        stateObj.years.forEach((year, i) => {
                            if (!nationalTrend[year]) nationalTrend[year] = 0;
                            nationalTrend[year] += stateObj.counts[i] || 0;
                        });
                    }
                    
                    // For top states, include full yearly data
                    if (processedCount < 10) {
                        context.allStates[stateObj.name] = {
                            totalCount: totalCount,
                            yearlyTrend: stateObj.counts ? stateObj.counts.map((count, i) => ({
                                year: stateObj.years[i],
                                count
                            })) : []
                        };
                        processedCount++;
                    } else {
                        // For other states, just include the total
                        context.allStates[stateObj.name] = {
                            totalCount: totalCount
                        };
                    }
                });
                
                // Add national trend
                context.nationalTrend = Object.entries(nationalTrend)
                    .map(([year, count]) => ({ year: parseInt(year), count }))
                    .sort((a, b) => a.year - b.year);
            }
            
            return context;
        }
        
        // Original context preparation method (kept as fallback)
        prepareContextOriginal() {
            let context = {
                currentState: this.currentState ? this.currentState.name : "No state selected",
                stateInfo: {},
                allStates: {}
            };
            
            if (this.currentState) {
                // Add data from current state
                context.stateInfo.yearlyCounts = this.currentState.counts;
                context.stateInfo.years = this.currentState.years;
                
                // Add suspicious activities
                context.stateInfo.topSuspiciousActivities = {};
                if (this.currentState.sus_acts && this.currentState.sus_acts.labels) {
                    this.currentState.sus_acts.labels.forEach((label, i) => {
                        context.stateInfo.topSuspiciousActivities[label] = this.currentState.sus_acts.values[i];
                    });
                }
                
                // Add products
                context.stateInfo.products = {};
                if (this.currentState.products && this.currentState.products.labels) {
                    this.currentState.products.labels.forEach((label, i) => {
                        context.stateInfo.products[label] = this.currentState.products.values[i];
                    });
                }
                
                // Add instruments
                context.stateInfo.instruments = {};
                if (this.currentState.instruments && this.currentState.instruments.labels) {
                    this.currentState.instruments.labels.forEach((label, i) => {
                        context.stateInfo.instruments[label] = this.currentState.instruments.values[i];
                    });
                }
                
                // Add monthly data if available
                context.stateInfo.monthlyData = this.currentState.monthly;
            }
            
            // Add summary data for all states
            if (this.stateData) {
                // Get top 5 states by total SAR count
                const stateRankings = Object.keys(this.stateData)
                    .map(state => {
                        const stateObj = this.stateData[state];
                        const totalCount = stateObj.counts ? stateObj.counts.reduce((sum, count) => sum + count, 0) : 0;
                        return {
                            state: stateObj.name,
                            totalCount
                        };
                    })
                    .sort((a, b) => b.totalCount - a.totalCount);
                
                context.topStates = stateRankings.slice(0, 10);
                
                // Add summarized data for all states
                Object.keys(this.stateData).forEach(stateKey => {
                    const stateObj = this.stateData[stateKey];
                    context.allStates[stateObj.name] = {
                        totalCount: stateObj.counts ? stateObj.counts.reduce((sum, count) => sum + count, 0) : 0,
                        yearlyTrend: stateObj.counts ? stateObj.counts.map((count, i) => ({
                            year: stateObj.years[i],
                            count
                        })) : []
                    };
                });
                
                // Add overall national trend
                context.nationalTrend = Object.keys(this.stateData)
                    .reduce((years, stateKey) => {
                        const stateObj = this.stateData[stateKey];
                        if (stateObj.counts && stateObj.years) {
                            stateObj.years.forEach((year, i) => {
                                if (!years[year]) years[year] = 0;
                                years[year] += stateObj.counts[i] || 0;
                            });
                        }
                        return years;
                    }, {});
            }
            
            return context;
        }
        
        // Generate query to Groq API
        async generateQuery(userQuestion) {
            if (!this.apiKey) {
                return {
                    error: true,
                    message: "API key not set. Please set your Groq API key in the settings."
                };
            }
            
            if (this.requestInProgress) {
                return {
                    error: true,
                    message: "A request is already in progress. Please wait."
                };
            }
            
            this.requestInProgress = true;
            
            try {
                const context = this.prepareContext();
                
                // Prepare messages
                const messages = [
                    {
                        role: "system",
                        content: `You are a data analysis assistant specialized in Financial Crimes Enforcement Network (FinCEN) Money Services Business (MSB) Suspicious Activity Reports (SARs) data. 
                        You help users understand trends and patterns in SAR filings across different states in the US.
                        
                        You have access to:
                        1. Detailed data for the currently selected state (if any)
                        2. Summary data for all states in the dataset
                        3. Your general knowledge about financial crimes and regulatory requirements
                        
                        Use ALL available data to provide comprehensive answers. Compare states, identify trends, and explain the significance of the data when relevant.
                        
                        If asked about specific data that isn't available, clearly state what you don't know.
                        Keep responses concise and focused on insights. Format numbers with commas for thousands.
                        
                        Current visualization context: ${JSON.stringify(context)}`
                    },
                    {
                        role: "user",
                        content: userQuestion
                    }
                ];
                
                // Make API request
                const response = await fetch(this.baseUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.modelName,
                        messages: messages,
                        temperature: 0.2,
                        max_tokens: 1024
                    })
                });
                
                const data = await response.json();
                
                if (data.error) {
                    return {
                        error: true,
                        message: `API Error: ${data.error.message || "Unknown error occurred"}`
                    };
                }
                
                return {
                    error: false,
                    message: data.choices[0].message.content
                };
            } catch (error) {
                console.error("Error calling Groq API:", error);
                return {
                    error: true,
                    message: `Error connecting to Groq API: ${error.message}`
                };
            } finally {
                this.requestInProgress = false;
            }
        }
        
        // Set API key
        setApiKey(key) {
            this.apiKey = key;
            localStorage.setItem('groq_api_key', key);
            return true;
        }
        
        // Load API key from storage
        loadApiKey() {
            const key = localStorage.getItem('groq_api_key');
            if (key) {
                this.apiKey = key;
                return true;
            }
            return false;
        }
    }
    
    // Main Chat Interface
    class ChatInterface {
        constructor() {
            this.isOpen = false;
            this.elements = createChatElements();
            this.analyzer = new GroqAnalyzer();
            
            this.attachEventListeners();
            
            // Add instruction message
            setTimeout(() => {
                this.addMessage({
                    role: 'system',
                    content: 'Welcome to the MSB SAR Data Assistant! You can ask questions about SAR filings across all states or the currently selected state. Try "!context" to see what data is available.'
                });
            }, 500);
            
            // Ensure we have access to the full dataset
            this.initializeData();
            
            // Show API key prompt if needed
            if (!this.analyzer.apiKey) {
                this.showAPIKeyPrompt();
            }
            
            // Hook into visualization updates
            this.hookIntoVisualization();
        }
        
        // Initialize with visualization data
        initializeData() {
            console.log("Initializing chat with data...");
            
            // Access state data from window
            if (window.stateData) {
                console.log(`Found data for ${Object.keys(window.stateData).length} states`);
                
                // Initialize with all states
                this.analyzer.initialize(window.stateData, 
                    window.selectedState ? window.stateData[window.selectedState] : null);
                
                // If we have a selected state, log it
                if (window.selectedState) {
                    console.log(`Currently selected state: ${window.selectedState}`);
                } else {
                    console.log("No state currently selected");
                }
            } else {
                console.warn("No state data found in window object");
            }
        }
        
        // Attach event listeners
        attachEventListeners() {
            // Toggle chat open/closed
            this.elements.chatToggle.addEventListener('click', () => this.toggleChat());
            this.elements.minimizeButton.addEventListener('click', () => this.toggleChat());
            
            // Settings
            this.elements.settingsButton.addEventListener('click', () => this.toggleSettings(true));
            this.elements.cancelSettingsButton.addEventListener('click', () => this.toggleSettings(false));
            this.elements.saveSettingsButton.addEventListener('click', () => this.saveSettings());
            
            // Send message
            this.elements.sendButton.addEventListener('click', () => this.sendMessage());
            this.elements.chatInput.addEventListener('keydown', (e) => {
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
                this.elements.chatContainer.classList.add('open');
                this.elements.chatToggle.classList.add('hidden');
                setTimeout(() => this.elements.chatInput.focus(), 300);
            } else {
                this.elements.chatContainer.classList.remove('open');
                this.elements.chatToggle.classList.remove('hidden');
                this.toggleSettings(false);
            }
        }
        
        // Toggle settings modal
        toggleSettings(show) {
            if (show) {
                this.elements.settingsModal.classList.add('open');
                if (this.analyzer.apiKey) {
                    this.elements.apiKeyInput.value = this.analyzer.apiKey;
                }
            } else {
                this.elements.settingsModal.classList.remove('open');
            }
        }
        
        // Save settings
        saveSettings() {
            const apiKey = this.elements.apiKeyInput.value.trim();
            
            if (apiKey) {
                this.analyzer.setApiKey(apiKey);
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
            
            const settingsPrompt = document.createElement('div');
            settingsPrompt.className = 'settings-prompt';
            settingsPrompt.innerHTML = `
                <button class="open-settings-button">Open Settings</button>
            `;
            
            settingsPrompt.querySelector('.open-settings-button').addEventListener('click', () => {
                this.toggleSettings(true);
            });
            
            this.elements.messagesContainer.appendChild(settingsPrompt);
        }
        
        // Send message
        async sendMessage() {
            const message = this.elements.chatInput.value.trim();
            
            if (!message) return;
            
            // Special commands for debugging
            if (message.startsWith('!')) {
                this.handleSpecialCommand(message);
                return;
            }
            
            this.addMessage({
                role: 'user',
                content: message
            });
            
            this.elements.chatInput.value = '';
            
            if (!this.analyzer.apiKey) {
                this.showAPIKeyPrompt();
                return;
            }
            
            this.showStatus("Analyzing data...");
            
            const response = await this.analyzer.generateQuery(message);
            
            this.hideStatus();
            
            if (response.error) {
                this.addMessage({
                    role: 'system',
                    content: `Error: ${response.message}`
                });
            } else {
                this.addMessage({
                    role: 'assistant',
                    content: response.message
                });
            }
            
            this.scrollToBottom();
        }
        
        // Handle special commands
        handleSpecialCommand(message) {
            const cmd = message.toLowerCase();
            
            // Debug context
            if (cmd === '!context' || cmd === '!debug') {
                const context = this.analyzer.prepareContext();
                this.addMessage({
                    role: 'system',
                    content: `Current context data (summary):\n
- Selected state: ${context.currentState}
- Number of states in dataset: ${Object.keys(context.allStates).length}
- Top 5 states by SAR count: ${context.topStates?.slice(0, 5).map(s => `${s.state}: ${s.totalCount.toLocaleString()}`).join(', ') || 'None'}`
                });
            }
            // Show detailed state data for California
            else if (cmd === '!california' || cmd === '!ca') {
                // Try to get California data
                let caData = null;
                
                if (window.msbDebugData && window.msbDebugData.initialized) {
                    caData = window.msbDebugData.getStateData('California');
                } else if (window.stateData) {
                    const caKey = Object.keys(window.stateData).find(
                        key => window.stateData[key].name === 'California'
                    );
                    if (caKey) caData = window.stateData[caKey];
                }
                
                if (caData) {
                    // Show California data
                    const yearlyData = caData.years.map((year, i) => 
                        `${year}: ${caData.counts[i].toLocaleString()} SARs`
                    ).join('\n');
                    
                    this.addMessage({
                        role: 'system',
                        content: `California SAR Data:\n
${yearlyData}

Total: ${caData.counts.reduce((sum, count) => sum + count, 0).toLocaleString()} SARs`
                    });
                } else {
                    this.addMessage({
                        role: 'system',
                        content: `Could not find data for California`
                    });
                }
            }
            // Show all available commands
            else if (cmd === '!help') {
                this.addMessage({
                    role: 'system',
                    content: `Available commands:
- !context or !debug - Show summary of available data
- !california or !ca - Show detailed data for California
- !help - Show this help message`
                });
            }
            // Unknown command
            else {
                this.addMessage({
                    role: 'system',
                    content: `Unknown command: ${message}\nTry !help for a list of available commands`
                });
            }
            
            this.elements.chatInput.value = '';
        }
        
        // Add message to chat
        addMessage({ role, content }) {
            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${role}`;
            
            let avatar = '';
            if (role === 'user') {
                avatar = '<div class="avatar user">👤</div>';
            } else if (role === 'assistant') {
                avatar = '<div class="avatar assistant">🤖</div>';
            } else {
                avatar = '<div class="avatar system">ℹ️</div>';
            }
            
            messageEl.innerHTML = `
                ${avatar}
                <div class="message-content">${this.formatMessageContent(content)}</div>
            `;
            
            this.elements.messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
        }
        
        // Format message content
        formatMessageContent(content) {
            return content
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>');
        }
        
        // Show status message
        showStatus(message, isError = false) {
            this.elements.statusContainer.textContent = message;
            this.elements.statusContainer.classList.add('visible');
            
            if (isError) {
                this.elements.statusContainer.classList.add('error');
            } else {
                this.elements.statusContainer.classList.remove('error');
            }
        }
        
        // Hide status message
        hideStatus() {
            this.elements.statusContainer.classList.remove('visible');
        }
        
        // Scroll messages to bottom
        scrollToBottom() {
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
        
        // Hook into visualization updates
        hookIntoVisualization() {
            // Check if the updateVisualization function exists
            if (window.updateVisualization && typeof window.updateVisualization === 'function') {
                console.log("Found updateVisualization function, hooking into it");
                
                const originalUpdateVisualization = window.updateVisualization;
                
                window.updateVisualization = (state) => {
                    // Call original function
                    originalUpdateVisualization(state);
                    
                    // Update chat data
                    if (window.stateData && window.stateData[state]) {
                        console.log(`State changed to: ${state}, updating chat data`);
                        this.analyzer.updateState(window.stateData[state]);
                    }
                };
                
                console.log("Successfully hooked into visualization updates");
            } else {
                console.warn("Could not find updateVisualization function to hook into");
                
                // Alternative method: check periodically for state changes
                setInterval(() => {
                    if (window.selectedState && 
                        window.stateData && 
                        window.stateData[window.selectedState] && 
                        (!this.analyzer.currentState || 
                         this.analyzer.currentState.name !== window.stateData[window.selectedState].name)) {
                        
                        console.log(`Detected state change to: ${window.selectedState}, updating chat data`);
                        this.analyzer.updateState(window.stateData[window.selectedState]);
                    }
                }, 1000);
            }
        }
    }
    
    // Initialize when the page is loaded
    window.addEventListener('load', function() {
        console.log("Initializing embedded chat...");
        window.chatInterface = new ChatInterface();
    });
})(); 