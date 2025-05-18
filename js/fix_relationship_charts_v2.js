// Comprehensive fix for MSB visualization
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, applying fixes...");
    
    // First check if the choropleth map is visible
    const mapContainer = document.getElementById('choropleth-map');
    if (!mapContainer || !mapContainer.innerHTML) {
        console.log("Map container empty, initializing visualization...");
        
        // Try to initialize the main visualization
        try {
            if (typeof createChoroplethMap === 'function') {
                createChoroplethMap();
                console.log("Map created successfully");
                
                // If we have state data, show the first state
                if (stateDataChoropleth && Object.keys(stateDataChoropleth).length > 0) {
                    setTimeout(function() {
                        const firstState = Object.keys(stateDataChoropleth)[0];
                        console.log("Auto-selecting first state:", firstState);
                        selectState(firstState);
                    }, 1000);
                }
            } else {
                console.error("createChoroplethMap function not found");
                showError("Map creation function not found");
            }
        } catch (error) {
            console.error("Error initializing map:", error);
            showError("Error initializing visualization: " + error.message);
        }
    }
    
    // Fix for relationship charts
    fixRelationshipCharts();
    
    function showError(message) {
        if (mapContainer) {
            mapContainer.innerHTML = 
                '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                '<h3>Error creating visualization</h3>' +
                '<p>' + message + '</p>' +
                '</div>';
        }
        
        // Show debug panel automatically on error
        const debugPanel = document.getElementById('debug-panel');
        if (debugPanel) {
            debugPanel.style.display = 'block';
        }
    }
});

// Fix for relationship charts
function fixRelationshipCharts() {
    console.log("Applying relationship chart fixes...");
    
    // Replace the createSankeyDiagram function with a more robust version
    window.createSankeyDiagram = function() {
        console.log('Creating Sankey diagram...');
        const chartContainer = document.getElementById('relationship-chart');
        
        if (!chartContainer) {
            console.error("Relationship chart container not found");
            return;
        }
        
        // Add visual loading indicator
        chartContainer.innerHTML = '<div style="text-align:center;padding:20px;"><p>Loading Sankey diagram...</p></div>';
        
        // Small delay to ensure container is visible and sized
        setTimeout(function() {
            try {
                // Check if relationship data is available
                if (!window.relationshipData || !window.relationshipData.products || window.relationshipData.products.length === 0) {
                    console.warn('No relationship data available');
                    showNoDataPlaceholder();
                    return;
                }
                
                console.log('Relationship data available:', window.relationshipData.products.length, 'items');
                
                // Check if the container is visible
                const containerVisible = chartContainer && 
                    chartContainer.offsetParent !== null && 
                    (chartContainer.offsetWidth > 0 || chartContainer.offsetHeight > 0);
                    
                console.log('Chart container visible:', containerVisible, 
                    'Size:', chartContainer.offsetWidth, 'x', chartContainer.offsetHeight);
                
                if (!containerVisible) {
                    console.error('Container not visible, cannot render chart');
                    chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                        '<h3>Error: Container not visible</h3>' +
                        '<p>Try clicking a different state or refreshing the page.</p>' +
                        '</div>';
                    return;
                }
                
                // Create Sankey diagram data
                const source = [];
                const target = [];
                const value = [];
                const labels = [];
                
                // Create unique product and instrument lists
                const uniqueProducts = [...new Set(window.relationshipData.products)];
                const uniqueInstruments = [...new Set(window.relationshipData.instruments)];
                
                console.log('Unique products:', uniqueProducts.length, 'Unique instruments:', uniqueInstruments.length);
                
                // Create source-target pairs
                for (let i = 0; i < window.relationshipData.products.length; i++) {
                    const product = window.relationshipData.products[i];
                    const instrument = window.relationshipData.instruments[i];
                    const count = window.relationshipData.counts[i];
                    
                    // Add product and instrument to labels if not already there
                    if (!labels.includes(product)) {
                        labels.push(product);
                    }
                    if (!labels.includes(instrument)) {
                        labels.push(instrument);
                    }
                    
                    // Add source (product), target (instrument), and value (count)
                    source.push(labels.indexOf(product));
                    target.push(labels.indexOf(instrument));
                    value.push(count);
                }
                
                // Define vibrant color palette for products and instruments
                const productColors = [
                    'rgba(31, 119, 180, 0.9)',  // Blue
                    'rgba(255, 127, 14, 0.9)',  // Orange
                    'rgba(44, 160, 44, 0.9)',   // Green
                    'rgba(214, 39, 40, 0.9)',   // Red
                    'rgba(148, 103, 189, 0.9)'  // Purple
                ];
                
                const instrumentColors = [
                    'rgba(140, 86, 75, 0.9)',   // Brown
                    'rgba(227, 119, 194, 0.9)', // Pink
                    'rgba(188, 189, 34, 0.9)',  // Lime
                    'rgba(23, 190, 207, 0.9)',  // Cyan
                    'rgba(127, 127, 127, 0.9)'  // Gray
                ];
                
                // Create color arrays first to avoid reference issues
                const nodeColors = labels.map((label, i) => {
                    const productIndex = uniqueProducts.indexOf(label);
                    if (productIndex >= 0) {
                        return productColors[productIndex % productColors.length];
                    } else {
                        const instrumentIndex = uniqueInstruments.indexOf(label);
                        return instrumentColors[instrumentIndex % instrumentColors.length];
                    }
                });
                
                // Create link colors based on source node
                const linkColors = source.map((s) => {
                    // Semi-transparent links with color derived from source node
                    const nodeColor = nodeColors[s];
                    return nodeColor.replace('0.9', '0.4'); // More transparent for links
                });
                
                // Create Sankey diagram
                const sankeyData = {
                    type: "sankey",
                    orientation: "h",
                    valueformat: ",d", // Format numbers with commas
                    valuesuffix: " reports", // Add a suffix to values
                    node: {
                        pad: 20,
                        thickness: 30,
                        line: {
                            color: "black",
                            width: 0.5
                        },
                        label: labels,
                        color: nodeColors,
                        hoverlabel: {
                            bgcolor: 'white',
                            bordercolor: '#333',
                            font: { size: 14, color: 'black' }
                        }
                    },
                    link: {
                        source: source,
                        target: target,
                        value: value,
                        color: linkColors,
                        hoverlabel: {
                            bgcolor: 'white',
                            bordercolor: '#333',
                            font: { size: 14 }
                        },
                        hovertemplate: '<b>%{source.label} → %{target.label}</b><br>' +
                                     'SARs: %{value:,}<extra></extra>'
                    }
                };
                
                const layout = {
                    title: {
                        text: 'Product-Instrument Relationships',
                        font: {size: 18, color: '#333', family: 'Arial, sans-serif'}
                    },
                    font: {
                        size: 12,
                        family: 'Arial, sans-serif'
                    },
                    paper_bgcolor: 'rgba(248,248,248,0.8)',
                    plot_bgcolor: 'rgba(248,248,248,0.8)',
                    margin: {t: 50, r: 50, l: 50, b: 50},
                    height: 500,
                    annotations: [
                        {
                            x: 0.01,
                            y: 1.05,
                            text: 'Products',
                            showarrow: false,
                            font: {size: 14, color: '#333', family: 'Arial, sans-serif'},
                            xref: 'paper',
                            yref: 'paper'
                        },
                        {
                            x: 0.99,
                            y: 1.05,
                            text: 'Instruments',
                            showarrow: false,
                            font: {size: 14, color: '#333', family: 'Arial, sans-serif'},
                            xref: 'paper',
                            yref: 'paper'
                        }
                    ]
                };
                
                const config = {
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['select2d', 'lasso2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
                    displaylogo: false
                };
                
                // Render the chart
                Plotly.newPlot('relationship-chart', [sankeyData], layout, config)
                    .then(() => {
                        console.log('Sankey diagram rendered successfully');
                        // Update button text
                        const btn = document.getElementById('toggle-relationship-viz');
                        if (btn) btn.textContent = 'Switch to Chord Diagram';
                    })
                    .catch(err => {
                        console.error('Error plotting Sankey diagram:', err);
                        chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                            '<h3>Error plotting Sankey diagram</h3>' +
                            '<p>' + (err.message || 'Unknown error') + '</p>' +
                            '</div>';
                    });
            } catch (error) {
                console.error('Error creating Sankey diagram:', error);
                chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                    '<h3>Error creating Sankey diagram</h3>' +
                    '<p>' + error.message + '</p>' +
                    '</div>';
            }
        }, 500); // 500ms delay to ensure DOM is updated
    };
    
    // Fix for chord diagram visualization
    window.createChordDiagram = function() {
        console.log('Creating chord diagram...');
        const chartContainer = document.getElementById('relationship-chart');
        
        if (!chartContainer) {
            console.error("Relationship chart container not found");
            return;
        }
        
        // Add visual loading indicator
        chartContainer.innerHTML = '<div style="text-align:center;padding:20px;"><p>Loading chord diagram...</p></div>';
        
        setTimeout(function() {
            try {
                if (!window.relationshipData || !window.relationshipData.products || window.relationshipData.products.length === 0) {
                    console.warn('No relationship data available');
                    showNoDataPlaceholder();
                    return;
                }
                
                // Create a sunburst chart as a better alternative to chord diagram
                const uniqueProducts = [...new Set(window.relationshipData.products)];
                const uniqueInstruments = [...new Set(window.relationshipData.instruments)];
                const labels = [...uniqueProducts, ...uniqueInstruments];
                
                // Calculate total value for each node
                const nodeValues = labels.map((label) => {
                    if (uniqueProducts.includes(label)) {
                        return window.relationshipData.counts.filter((_, idx) => 
                            window.relationshipData.products[idx] === label).reduce((a, b) => a + b, 0);
                    } else {
                        return window.relationshipData.counts.filter((_, idx) => 
                            window.relationshipData.instruments[idx] === label).reduce((a, b) => a + b, 0);
                    }
                });
                
                const data = [{
                    type: 'sunburst',
                    labels: labels,
                    parents: labels.map(() => ''),
                    values: nodeValues,
                    textinfo: 'label',
                    insidetextorientation: 'radial',
                    hovertemplate: '%{label}<br>Total: %{value}<extra></extra>'
                }];
                
                const layout = {
                    title: {
                        text: 'Product-Instrument Relationships (Sunburst)',
                        font: {size: 16}
                    },
                    margin: {t: 40, r: 20, l: 20, b: 40},
                    height: 400
                };
                
                Plotly.newPlot('relationship-chart', data, layout, {responsive: true})
                    .then(() => {
                        console.log('Chord diagram rendered successfully');
                        // Update button text
                        const btn = document.getElementById('toggle-relationship-viz');
                        if (btn) btn.textContent = 'Switch to Network Graph';
                    })
                    .catch(err => {
                        console.error('Error plotting chord diagram:', err);
                        chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                            '<h3>Error plotting chord diagram</h3>' +
                            '<p>' + (err.message || 'Unknown error') + '</p>' +
                            '</div>';
                    });
            } catch (error) {
                console.error('Error creating chord diagram:', error);
                chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                    '<h3>Error creating chord diagram</h3>' +
                    '<p>' + error.message + '</p>' +
                    '</div>';
            }
        }, 500);
    };
    
    // Fix for network graph visualization
    window.createNetworkGraph = function() {
        console.log('Creating network graph...');
        const chartContainer = document.getElementById('relationship-chart');
        
        if (!chartContainer) {
            console.error("Relationship chart container not found");
            return;
        }
        
        // Add visual loading indicator
        chartContainer.innerHTML = '<div style="text-align:center;padding:20px;"><p>Loading network graph...</p></div>';
        
        setTimeout(function() {
            try {
                if (!window.relationshipData || !window.relationshipData.products || window.relationshipData.products.length === 0) {
                    console.warn('No relationship data available');
                    showNoDataPlaceholder();
                    return;
                }
                
                // Create nodes and links for network graph
                const uniqueProducts = [...new Set(window.relationshipData.products)];
                const uniqueInstruments = [...new Set(window.relationshipData.instruments)];
                
                // Calculate node sizes based on total connections
                const nodeSizes = {};
                uniqueProducts.forEach(product => {
                    nodeSizes[product] = window.relationshipData.counts.filter((_, idx) => 
                        window.relationshipData.products[idx] === product).reduce((a, b) => a + b, 0) / 1000 + 10;
                });
                
                uniqueInstruments.forEach(instrument => {
                    nodeSizes[instrument] = window.relationshipData.counts.filter((_, idx) => 
                        window.relationshipData.instruments[idx] === instrument).reduce((a, b) => a + b, 0) / 1000 + 10;
                });
                
                // Position nodes in a circle
                const xPositions = {};
                const yPositions = {};
                const nodeTrace = {
                    x: [],
                    y: [],
                    text: [],
                    hovertemplate: '%{text}<br>Total: %{marker.size:.0f}<extra></extra>',
                    mode: 'markers+text',
                    textposition: 'middle center',
                    marker: {
                        size: [],
                        color: [],
                        line: { width: 0.5, color: '#000' }
                    },
                    type: 'scatter'
                };
                
                // Place nodes in two circles - products inner, instruments outer
                [...uniqueProducts, ...uniqueInstruments].forEach((node, i) => {
                    let angle, radius;
                    if (i < uniqueProducts.length) {
                        // Products in inner circle
                        angle = (2 * Math.PI * i) / uniqueProducts.length;
                        radius = 0.7;
                    } else {
                        // Instruments in outer circle
                        angle = (2 * Math.PI * (i - uniqueProducts.length)) / uniqueInstruments.length;
                        radius = 1.3;
                    }
                    
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);
                    
                    xPositions[node] = x;
                    yPositions[node] = y;
                    
                    nodeTrace.x.push(x);
                    nodeTrace.y.push(y);
                    nodeTrace.text.push(node);
                    nodeTrace.marker.size.push(nodeSizes[node]);
                    nodeTrace.marker.color.push(i < uniqueProducts.length ? 
                        'rgba(52, 152, 219, 0.8)' : 'rgba(46, 204, 113, 0.8)');
                });
                
                // Create link traces
                const linkTraces = [];
                for (let i = 0; i < window.relationshipData.products.length; i++) {
                    const product = window.relationshipData.products[i];
                    const instrument = window.relationshipData.instruments[i];
                    const count = window.relationshipData.counts[i];
                    
                    if (xPositions[product] && xPositions[instrument]) {
                        linkTraces.push({
                            type: 'scatter',
                            mode: 'lines',
                            x: [xPositions[product], xPositions[instrument]],
                            y: [yPositions[product], yPositions[instrument]],
                            line: {
                                width: Math.log(count) / 2 + 1,
                                color: 'rgba(128, 128, 128, 0.4)'
                            },
                            hoverinfo: 'text',
                            hovertemplate: product + ' → ' + instrument + ': ' + count + '<extra></extra>',
                            showlegend: false
                        });
                    }
                }
                
                const data = [nodeTrace, ...linkTraces];
                
                const layout = {
                    title: {
                        text: 'Product-Instrument Network',
                        font: {size: 16}
                    },
                    showlegend: false,
                    hovermode: 'closest',
                    margin: {t: 40, r: 20, l: 20, b: 20},
                    xaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false,
                        range: [-1.5, 1.5]
                    },
                    yaxis: {
                        showgrid: false,
                        zeroline: false,
                        showticklabels: false,
                        range: [-1.5, 1.5]
                    },
                    height: 400
                };
                
                Plotly.newPlot('relationship-chart', data, layout, {responsive: true})
                    .then(() => {
                        console.log('Network graph rendered successfully');
                        // Update button text
                        const btn = document.getElementById('toggle-relationship-viz');
                        if (btn) btn.textContent = 'Switch to Sankey Diagram';
                    })
                    .catch(err => {
                        console.error('Error plotting network graph:', err);
                        chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                            '<h3>Error plotting network graph</h3>' +
                            '<p>' + (err.message || 'Unknown error') + '</p>' +
                            '</div>';
                    });
            } catch (error) {
                console.error('Error creating network graph:', error);
                chartContainer.innerHTML = '<div style="padding:20px;background:#fee;border:1px solid #f00;color:#900">' + 
                    '<h3>Error creating network graph</h3>' +
                    '<p>' + error.message + '</p>' +
                    '</div>';
            }
        }, 500);
    };
    
    // No data placeholder function
    if (!window.showNoDataPlaceholder) {
        window.showNoDataPlaceholder = function() {
            const chartContainer = document.getElementById('relationship-chart');
            if (!chartContainer) return;
            
            Plotly.newPlot('relationship-chart', [{
                type: 'scatter',
                x: [0],
                y: [0],
                mode: 'text',
                text: ['No relationship data available'],
                textposition: 'middle center',
                textfont: {
                    size: 16,
                    color: '#7f8c8d'
                }
            }], {
                title: {
                    text: 'Product-Instrument Relationships',
                    font: {size: 16}
                },
                xaxis: {
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false
                },
                yaxis: {
                    showgrid: false,
                    zeroline: false,
                    showticklabels: false
                }
            }, {responsive: true});
        };
    }
    
    // Fix for state selection
    const originalSelectState = window.selectState;
    window.selectState = function(stateCode) {
        console.log('Enhanced state selection:', stateCode);
        
        // Call the original function if it exists
        if (typeof originalSelectState === 'function') {
            try {
                originalSelectState(stateCode);
            } catch (error) {
                console.error('Error in original selectState:', error);
            }
        } else {
            console.error('Original selectState function not found');
        }
        
        // Get state info directly from the data
        const stateInfo = window.stateDataChoropleth[stateCode];
        if (!stateInfo) {
            console.error('No data found for state:', stateCode);
            return;
        }
        
        // Make window.relationshipData available
        window.relationshipData = stateInfo.relationships;
        console.log('Updated global relationshipData for state:', stateCode);
        
        // Add a delay before initializing relationship charts
        setTimeout(function() {
            console.log('Initializing relationship chart after state selection...');
            window.createSankeyDiagram();
        }, 800);
    };
    
    // Fix toggle button event listener
    const originalToggleBtn = document.getElementById('toggle-relationship-viz');
    if (originalToggleBtn) {
        // Remove old listeners by cloning and replacing
        const newToggleBtn = originalToggleBtn.cloneNode(true);
        originalToggleBtn.parentNode.replaceChild(newToggleBtn, originalToggleBtn);
        
        // Add fixed event listener
        newToggleBtn.addEventListener('click', function() {
            console.log('Toggle button clicked, current viz:', window.currentRelationshipViz);
            
            if (!window.currentRelationshipViz || window.currentRelationshipViz === 'sankey') {
                window.currentRelationshipViz = 'chord';
                window.createChordDiagram();
            } else if (window.currentRelationshipViz === 'chord') {
                window.currentRelationshipViz = 'network';
                window.createNetworkGraph();
            } else {
                window.currentRelationshipViz = 'sankey';
                window.createSankeyDiagram();
            }
        });
    }
    
    // Fix choropleth map creation if it's empty
    if (typeof window.createChoroplethMap === 'function' && 
        document.getElementById('choropleth-map') && 
        !document.getElementById('choropleth-map').innerHTML) {
        console.log('Initializing empty choropleth map...');
        setTimeout(function() {
            try {
                window.createChoroplethMap();
            } catch (e) {
                console.error('Error initializing map:', e);
            }
        }, 500);
    }
    
    console.log("All relationship chart fixes applied.");
} 