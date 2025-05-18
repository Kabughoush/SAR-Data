image.png// Auto-fix script for state_trends_monthly.html
// This automatically repairs issues with the visualization

document.addEventListener('DOMContentLoaded', function() {
    console.log('Auto-fix script loaded');
    
    // Listen for state selection events
    const stateSelector = document.getElementById('state-selector');
    if (stateSelector) {
        const originalOnChange = stateSelector.onchange;
        stateSelector.addEventListener('change', function(event) {
            // Let the original handler work first
            if (originalOnChange) {
                originalOnChange.call(this, event);
            }
            
            // Then run our fix with a delay to ensure original handlers complete
            setTimeout(fixVisualization, 1000);
        });
    }
    
    // Add click handler to map
    const mapElement = document.getElementById('choropleth-map');
    if (mapElement) {
        mapElement.addEventListener('plotly_click', function() {
            // Run our fix with a delay
            setTimeout(fixVisualization, 1000);
        });
    }
    
    // Fix toggling between relationship visualizations
    const toggleButton = document.getElementById('toggle-relationship-viz');
    if (toggleButton) {
        const originalOnClick = toggleButton.onclick;
        toggleButton.addEventListener('click', function(event) {
            // Let the original handler work first
            if (originalOnClick) {
                originalOnClick.call(this, event);
            }
            
            // Then run our fix with a delay
            setTimeout(fixVisualization, 1000);
        });
    }
    
    // Automatically fix the visualization on page load
    setTimeout(fixVisualization, 2000);
});

// Fix the visualization issues
function fixVisualization() {
    console.log('Running auto-fix for visualization');
    
    try {
        // Fix 1: Ensure the state details container is visible
        const stateDetails = document.getElementById('state-details');
        if (stateDetails) {
            stateDetails.style.display = 'block';
        }
        
        // Fix 2: Initialize state selection if not already done
        if (typeof selectedState === 'undefined' || !selectedState) {
            // Find a state with good data
            const goodStates = ['NY', 'CA', 'TX', 'FL'];
            
            for (const state of goodStates) {
                if (stateData && stateData[state]) {
                    console.log('Auto-selecting state:', state);
                    
                    // Try to use the existing select state function
                    if (typeof selectState === 'function') {
                        selectState(state);
                        break;
                    }
                }
            }
        }
        
        // Fix 3: Ensure relationship chart is properly initialized
        const relationshipChart = document.getElementById('relationship-chart');
        if (relationshipChart && selectedState && stateData && stateData[selectedState]) {
            const stateInfo = stateData[selectedState];
            
            // Make sure the container is visible
            relationshipChart.style.display = 'block';
            
            // If the chart is empty or showing an error, create a Sankey diagram
            if (relationshipChart.innerHTML.includes('Error') || 
                relationshipChart.innerHTML.includes('No data') || 
                relationshipChart.innerHTML.length < 100) {
                
                if (stateInfo.relationships) {
                    console.log('Fixing relationship chart for', selectedState);
                    
                    // Create a Sankey diagram from scratch
                    const relationshipData = stateInfo.relationships;
                    const labels = [];
                    const source = [];
                    const target = [];
                    const value = [];
                    
                    // Populate the arrays
                    for (let i = 0; i < relationshipData.products.length; i++) {
                        const product = relationshipData.products[i];
                        const instrument = relationshipData.instruments[i];
                        const count = relationshipData.counts[i];
                        
                        // Add to labels if not already there
                        if (!labels.includes(product)) {
                            labels.push(product);
                        }
                        if (!labels.includes(instrument)) {
                            labels.push(instrument);
                        }
                        
                        // Add to source, target, value arrays
                        source.push(labels.indexOf(instrument));
                        target.push(labels.indexOf(product));
                        value.push(count);
                    }
                    
                    // Create the Sankey diagram
                    const sankeyData = {
                        type: "sankey",
                        orientation: "h",
                        valueformat: ",d",
                        valuesuffix: " reports",
                        node: {
                            pad: 20,
                            thickness: 30,
                            line: { color: "black", width: 0.5 },
                            label: labels,
                            color: labels.map(() => 'rgba(31, 119, 180, 0.8)')
                        },
                        link: {
                            source: source,
                            target: target,
                            value: value,
                            color: source.map(() => 'rgba(128, 128, 128, 0.4)')
                        }
                    };
                    
                    const layout = {
                        title: {
                            text: 'Instrument-Product Relationships',
                            font: {size: 16}
                        },
                        margin: {t: 40, r: 20, l: 20, b: 20},
                        height: 400
                    };
                    
                    Plotly.newPlot('relationship-chart', [sankeyData], layout, {responsive: true});
                    console.log('Relationship chart fixed');
                    
                    // Update button text appropriately
                    const toggleButton = document.getElementById('toggle-relationship-viz');
                    if (toggleButton) {
                        toggleButton.textContent = 'Switch to Chord Diagram';
                    }
                }
            }
        }
        
        console.log('Auto-fix completed');
    } catch (error) {
        console.error('Error in auto-fix:', error);
    }
} 