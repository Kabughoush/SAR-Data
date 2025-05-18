// Sample Configuration File
// Rename to config.js and add your API keys

// Groq API Configuration
window.GROQ_API_CONFIG = {
  api_key: "YOUR_GROQ_API_KEY_HERE", // Required for chat functionality
  model: "llama3-70b-8192"           // Default model
};

// Instructions:
// 1. Rename this file to config.js
// 2. Replace "YOUR_GROQ_API_KEY_HERE" with your actual Groq API key
// 3. Include config.js in your HTML files before the groq_integration.js script

console.log("🔑 Config file loaded"); 