// Chat component debug script
(function() {
    console.log("Chat debug script running");
    
    // Function to check if chat components are loaded
    function checkChatComponents() {
        console.log("Checking chat components...");
        
        // Check if chat styles are loaded
        const styleSheets = Array.from(document.styleSheets);
        const chatStylesLoaded = styleSheets.some(sheet => {
            try {
                return sheet.href && sheet.href.includes('chat_styles.css');
            } catch (e) {
                return false;
            }
        });
        console.log("Chat styles loaded:", chatStylesLoaded);
        
        // Check if GroqAnalyzer class is available
        const groqAvailable = typeof window.GroqAnalyzer === 'function';
        console.log("GroqAnalyzer available:", groqAvailable);
        
        // Check if ChatInterface class is available
        const chatInterfaceAvailable = typeof window.ChatInterface === 'function';
        console.log("ChatInterface available:", chatInterfaceAvailable);
        
        // Check if container exists
        const containerExists = document.querySelector('#chat-interface-container') !== null;
        console.log("Chat container exists:", containerExists);
        
        // Check if chat toggle button exists
        const toggleExists = document.querySelector('.chat-toggle') !== null;
        console.log("Chat toggle button exists:", toggleExists);
        
        return {
            chatStylesLoaded,
            groqAvailable,
            chatInterfaceAvailable,
            containerExists,
            toggleExists
        };
    }
    
    // Wait for page to fully load
    window.addEventListener('load', function() {
        console.log("Page fully loaded");
        
        // Check components after a slight delay
        setTimeout(function() {
            const status = checkChatComponents();
            
            // If any components are missing, try to fix
            if (!status.containerExists) {
                console.log("Creating missing chat container");
                const container = document.createElement('div');
                container.id = 'chat-interface-container';
                document.body.appendChild(container);
            }
            
            if (!status.toggleExists && status.groqAvailable && status.chatInterfaceAvailable) {
                console.log("Manually initializing chat");
                try {
                    // Create Groq analyzer
                    const groqAnalyzer = new GroqAnalyzer();
                    
                    // Create chat interface
                    const chatInterface = new ChatInterface('#chat-interface-container', groqAnalyzer);
                    chatInterface.initialize();
                    
                    console.log("Chat manually initialized");
                } catch (error) {
                    console.error("Error manually initializing chat:", error);
                }
            }
        }, 1000);
    });
})(); 