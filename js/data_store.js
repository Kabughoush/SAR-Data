// MSB Data Store - Centralized Data Management for Visualization and API Access
// This script creates a central store for all data that both the visualization
// and the Groq API can access with consistent patterns.

class MSBDataStore {
    constructor() {
        this.stateData = {};
        this.allStatesList = [];
        this.selectedState = null;
        this.selectedStateData = null;
        this.monthlyData = {};
        this.aggregateData = {
            totalSARsByState: {},
            totalSARsByYear: {},
            topStates: [],
            topActivities: {},
            topProducts: {},
            topInstruments: {}
        };
        this.listeners = [];
        this.initialized = false;
    }

    // Initialize with the main data source
    initialize(stateData) {
        if (!stateData) {
            console.error("Failed to initialize data store: No data provided");
            return false;
        }

        this.stateData = stateData;
        this.processData();
        this.initialized = true;
        console.log("Data store initialized with", Object.keys(this.stateData).length, "states");
        return true;
    }

    // Load state data from visualization
    loadStateData(stateData) {
        if (!stateData) {
            console.error("Failed to load state data: No data provided");
            return false;
        }

        this.stateData = stateData;
        this.processData();
        
        // Notify listeners of the data load
        this.notifyListeners({
            type: 'data-loaded',
            dataType: 'stateData',
            count: Object.keys(stateData).length
        });
        
        return true;
    }
    
    // Load monthly data from visualization
    loadMonthlyData(monthlyData) {
        if (!monthlyData) {
            console.error("Failed to load monthly data: No data provided");
            return false;
        }
        
        this.monthlyData = monthlyData;
        
        // Notify listeners of the data load
        this.notifyListeners({
            type: 'data-loaded',
            dataType: 'monthlyData',
            count: Object.keys(monthlyData).length
        });
        
        return true;
    }

    // Process all data to create derived datasets
    processData() {
        // Extract all state names
        this.allStatesList = Object.values(this.stateData).map(state => state.name);

        // Calculate aggregate metrics
        const totalSARsByState = {};
        const totalSARsByYear = {};
        const allActivities = {};
        const allProducts = {};
        const allInstruments = {};

        Object.values(this.stateData).forEach(state => {
            const total = state.counts.reduce((sum, count) => sum + count, 0);
            totalSARsByState[state.name] = total;

            // Aggregate by year
            state.years.forEach((year, i) => {
                totalSARsByYear[year] = (totalSARsByYear[year] || 0) + state.counts[i];
            });

            // Collect top activities
            if (state.sus_acts && state.sus_acts.labels) {
                state.sus_acts.labels.forEach((label, i) => {
                    allActivities[label] = (allActivities[label] || 0) + state.sus_acts.values[i];
                });
            }

            // Collect top products
            if (state.products && state.products.labels) {
                state.products.labels.forEach((label, i) => {
                    allProducts[label] = (allProducts[label] || 0) + state.products.values[i];
                });
            }

            // Collect top instruments
            if (state.instruments && state.instruments.labels) {
                state.instruments.labels.forEach((label, i) => {
                    allInstruments[label] = (allInstruments[label] || 0) + state.instruments.values[i];
                });
            }
        });

        // Calculate top states
        this.aggregateData.topStates = Object.entries(totalSARsByState)
            .map(([state, count]) => ({ state, count }))
            .sort((a, b) => b.count - a.count);

        // Sort and store top activities
        this.aggregateData.topActivities = Object.entries(allActivities)
            .map(([activity, count]) => ({ activity, count }))
            .sort((a, b) => b.count - a.count);

        // Sort and store top products
        this.aggregateData.topProducts = Object.entries(allProducts)
            .map(([product, count]) => ({ product, count }))
            .sort((a, b) => b.count - a.count);

        // Sort and store top instruments
        this.aggregateData.topInstruments = Object.entries(allInstruments)
            .map(([instrument, count]) => ({ instrument, count }))
            .sort((a, b) => b.count - a.count);

        this.aggregateData.totalSARsByState = totalSARsByState;
        this.aggregateData.totalSARsByYear = totalSARsByYear;
    }

    // Set the currently selected state
    setSelectedState(stateCode) {
        if (!this.stateData[stateCode]) {
            console.error("State not found:", stateCode);
            return false;
        }

        this.selectedState = stateCode;
        this.selectedStateData = this.stateData[stateCode];
        
        // Notify listeners
        this.notifyListeners({
            type: 'state-changed',
            state: stateCode,
            stateData: this.selectedStateData
        });
        
        return true;
    }

    // Get data for specific state by name or code
    getStateData(stateNameOrCode) {
        // Direct code lookup
        if (this.stateData[stateNameOrCode]) {
            return this.stateData[stateNameOrCode];
        }

        // Name lookup
        const normalizedName = stateNameOrCode.toLowerCase();
        const state = Object.values(this.stateData).find(
            s => s.name.toLowerCase() === normalizedName
        );
        return state || null;
    }

    // Get aggregate data for analysis
    getAggregateData() {
        return this.aggregateData;
    }

    // Compare two states
    compareStates(state1, state2) {
        const data1 = this.getStateData(state1);
        const data2 = this.getStateData(state2);
        
        if (!data1 || !data2) {
            return null;
        }
        
        return {
            state1: {
                name: data1.name,
                totalSARs: data1.counts.reduce((a, b) => a + b, 0),
                years: data1.years,
                counts: data1.counts,
                topActivities: data1.sus_acts || {},
                topProducts: data1.products || {},
                topInstruments: data1.instruments || {}
            },
            state2: {
                name: data2.name,
                totalSARs: data2.counts.reduce((a, b) => a + b, 0),
                years: data2.years,
                counts: data2.counts,
                topActivities: data2.sus_acts || {},
                topProducts: data2.products || {},
                topInstruments: data2.instruments || {}
            }
        };
    }

    // Get historical data for a state in a specific year
    getStateYearData(stateName, year) {
        const stateData = this.getStateData(stateName);
        if (!stateData || !stateData.years) return null;
        
        const yearIndex = stateData.years.indexOf(year);
        if (yearIndex === -1) return null;
        
        return {
            state: stateData.name,
            year: year,
            count: stateData.counts[yearIndex],
            monthlyData: stateData.monthly ? 
                Object.entries(stateData.monthly)
                    .filter(([month]) => month.startsWith(year.toString()))
                    .map(([month, count]) => ({ month, count })) : 
                []
        };
    }

    // Get top states data
    getTopStates(limit = 10) {
        return this.aggregateData.topStates.slice(0, limit);
    }

    // Get complete context for API
    getCompleteContext() {
        return {
            selectedState: this.selectedStateData ? this.selectedStateData.name : null,
            selectedStateData: this.selectedStateData,
            aggregateData: this.aggregateData,
            totalStates: this.allStatesList.length,
            availableYears: Object.keys(this.aggregateData.totalSARsByYear).map(Number).sort(),
            timestamp: new Date().toISOString()
        };
    }

    // Add event listener for data changes
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
            return true;
        }
        return false;
    }

    // Remove event listener
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index !== -1) {
            this.listeners.splice(index, 1);
            return true;
        }
        return false;
    }

    // Notify all listeners of changes
    notifyListeners(event) {
        this.listeners.forEach(callback => {
            try {
                callback(event);
            } catch (e) {
                console.error("Error in data store listener:", e);
            }
        });
    }
}

// Create and expose the data store instance
window.msbDataStore = new MSBDataStore();

console.log("MSB Data Store initialized and ready"); 