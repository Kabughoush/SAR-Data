# SAR Data Visualization

This repository contains a visualization tool for Money Services Business (MSB) Suspicious Activity Reports (SAR) data.

## Features

- Interactive choropleth map for state-level visualization
- Yearly and monthly trend analysis
- Detailed state statistics including:
  - Yearly SAR trends with year-over-year percentage changes
  - Monthly filing patterns
  - Top suspicious activities
  - Product and instrument breakdowns
  - Relationship visualizations

## Technologies

- JavaScript
- Plotly.js for data visualization
- HTML/CSS for interface
- Groq API for chat functionality

## Getting Started

To view the visualization, simply open the `index.html` file in a browser or visit the GitHub Pages site.

### API Key Setup (for Chat Functionality)

To use the chat features:

1. Rename `config_sample.js` to `config.js`
2. Add your Groq API key to the configuration
3. Make sure `config.js` is included in your HTML files before the groq_integration.js script

**Note:** The `config.js` file is ignored by Git to prevent committing your API key.

## Data

This visualization uses synthetic data for demonstration purposes. All SAR statistics shown are simulated and do not represent actual financial activity. 