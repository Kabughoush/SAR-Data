// DOM Inspector Script
// This script helps analyze the DOM structure and issues with the visualization

function inspectSankeyDiagram() {
    console.log('==== DOM INSPECTOR STARTED ====');
    
    // Check if Plotly is loaded
    console.log('Plotly loaded:', typeof Plotly !== 'undefined');
    
    // Check relationship chart container
    const container = document.getElementById('relationship-chart');
    console.log('Container exists:', !!container);
    if (container) {
        console.log('Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
        console.log('Container visibility:', getComputedStyle(container).display);
        console.log('Container HTML:', container.innerHTML.substring(0, 200) + '...');
    }
    
    // Check state data
    console.log('State data exists:', typeof stateData !== 'undefined');
    if (typeof stateData !== 'undefined') {
        console.log('Number of states:', Object.keys(stateData).length);
        const sampleState = Object.keys(stateData)[0];
        console.log('First state:', sampleState);
        console.log('Has relationships:', !!stateData[sampleState].relationships);
    }
    
    // Check relationship data
    if (typeof relationshipData !== 'undefined') {
        console.log('Relationship data:', {
            hasProducts: !!relationshipData.products,
            productsLength: relationshipData.products ? relationshipData.products.length : 0,
            hasInstruments: !!relationshipData.instruments,
            instrumentsLength: relationshipData.instruments ? relationshipData.instruments.length : 0,
            hasCounts: !!relationshipData.counts,
            countsLength: relationshipData.counts ? relationshipData.counts.length : 0
        });
    } else {
        console.log('Relationship data not defined');
    }
    
    console.log('==== DOM INSPECTOR FINISHED ====');
}

// Function to fix common issues with the Sankey diagram
function fixSankeyDiagram() {
    console.log('Attempting to fix Sankey diagram issues...');
    
    try {
        // 1. Check if we're trying to fix before the chart exists
        const container = document.getElementById('relationship-chart');
        if (!container) {
            console.error('Container not found!');
            return;
        }
        
        // 2. Force visibility of the container
        container.style.display = 'block';
        container.style.height = '400px';
        
        // 3. Try to manually create the relationship visualization
        if (typeof selectedState !== 'undefined' && stateData[selectedState]) {
            const stateInfo = stateData[selectedState];
            if (stateInfo.relationships) {
                console.log('Creating manual Sankey diagram for', selectedState);
                
                // Basic chart data setup
                const relationshipData = stateInfo.relationships;
                const uniqueProducts = [...new Set(relationshipData.products)];
                const uniqueInstruments = [...new Set(relationshipData.instruments)];
                const labels = [];
                const source = [];
                const target = [];
                const value = [];
                
                // Create source-target pairs
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
                    source.push(labels.indexOf(product));
                    target.push(labels.indexOf(instrument));
                    value.push(count);
                }
                
                // Create Sankey diagram
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
                        color: labels.map((_, i) => i < uniqueProducts.length ? 'rgba(31, 119, 180, 0.9)' : 'rgba(44, 160, 44, 0.9)')
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
                        text: 'Product-Instrument Relationships',
                        font: {size: 16}
                    },
                    margin: {t: 40, r: 20, l: 20, b: 20},
                    height: 400
                };
                
                Plotly.newPlot('relationship-chart', [sankeyData], layout, {responsive: true});
                console.log('Manual Sankey diagram created');
            }
        }
    } catch (error) {
        console.error('Error fixing Sankey diagram:', error);
    }
}

// Add a button to the page to run the inspection
function addInspectorButton() {
    const button = document.createElement('button');
    button.innerText = 'Inspect DOM';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 16px';
    button.style.backgroundColor = '#3498db';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.onclick = inspectSankeyDiagram;
    document.body.appendChild(button);
    
    const fixButton = document.createElement('button');
    fixButton.innerText = 'Fix Sankey';
    fixButton.style.position = 'fixed';
    fixButton.style.bottom = '10px';
    fixButton.style.right = '110px';
    fixButton.style.zIndex = '9999';
    fixButton.style.padding = '8px 16px';
    fixButton.style.backgroundColor = '#e74c3c';
    fixButton.style.color = 'white';
    fixButton.style.border = 'none';
    fixButton.style.borderRadius = '4px';
    fixButton.style.cursor = 'pointer';
    fixButton.onclick = fixSankeyDiagram;
    document.body.appendChild(fixButton);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Inspector loaded');
    addInspectorButton();
}); 