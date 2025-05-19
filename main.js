document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map
    const map = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        zoomControl: false,
        attributionControl: false
    });
    
    // Add a dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    
    // Game state
    let gameState = {
        correct: 0,
        incorrect: 0,
        totalQuestions: 0,
        currentCountry: null,
        countries: [],
        gameMode: 'countries',
        showLabels: false,
        timer: null,
        startTime: null,
        hintUsed: false
    };
    
    // Store GeoJSON data for countries
    let countriesGeoJSON;
    let countryLayers = {};
    
    // DOM elements
    const correctCount = document.getElementById('correct-count');
    const incorrectCount = document.getElementById('incorrect-count');
    const progressDisplay = document.getElementById('progress');
    const countryName = document.getElementById('country-name');
    const countryFlag = document.getElementById('country-flag');
    const tooltip = document.getElementById('tooltip');
    const feedback = document.getElementById('feedback');
    const modal = document.getElementById('modal');
    const timer = document.getElementById('timer');
    
    // Show modal on start
    modal.style.display = 'flex';
    
    // Close modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        modal.style.display = 'none';
        startGame('countries');
    });
    
    // Game mode selection
    document.querySelectorAll('.game-mode').forEach(mode => {
        mode.addEventListener('click', function() {
            const selectedMode = this.getAttribute('data-mode');
            modal.style.display = 'none';
            startGame(selectedMode);
        });
    });
    
    // Menu button
    document.querySelector('.menu-button').addEventListener('click', function() {
        modal.style.display = 'flex';
        stopTimer();
    });
    
    // Control buttons
    document.getElementById('zoom-in').addEventListener('click', function() {
        map.zoomIn();
    });
    
    document.getElementById('zoom-out').addEventListener('click', function() {
        map.zoomOut();
    });
    
    document.getElementById('reset-view').addEventListener('click', function() {
        map.setView([20, 0], 2);
    });
    
    document.getElementById('toggle-labels').addEventListener('click', function() {
        gameState.showLabels = !gameState.showLabels;
        updateMap();
    });
    
    document.getElementById('hint').addEventListener('click', function() {
        if (gameState.currentCountry && countryLayers[gameState.currentCountry.id]) {
            const bounds = countryLayers[gameState.currentCountry.id].getBounds();
            map.fitBounds(bounds, { padding: [100, 100] });
            gameState.hintUsed = true;
        }
    });
    
    document.getElementById('skip').addEventListener('click', function() {
        gameState.incorrect++;
        updateStats();
        nextQuestion();
    });
    
    // Fullscreen toggle
    document.querySelector('.fullscreen-button').addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    });
    
    // Fetch country data
    async function fetchCountryData() {
        try {
            // Fetch countries from REST Countries API
            const response = await fetch('https://restcountries.com/v3.1/all');
            const data = await response.json();
            
            // Process country data
            gameState.countries = data.map(country => ({
                id: country.cca3,
                name: country.name.common,
                officialName: country.name.official,
                capital: country.capital ? country.capital[0] : "N/A",
                region: country.region,
                subregion: country.subregion,
                population: country.population,
                flag: country.flags.svg,
                flagAlt: country.flags.alt || `Flag of ${country.name.common}`
            }));
            
            // Fetch GeoJSON for world countries
            const geoResponse = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            countriesGeoJSON = await geoResponse.json();
            
            // Add countries to map
            addCountriesToMap();
            
        } catch (error) {
            console.error("Error fetching country data:", error);
        }
    }
    
    // Add countries to map
    function addCountriesToMap() {
        // Default style for countries
        const defaultStyle = {
            fillColor: '#78909c',
            weight: 1,
            opacity: 0.7,
            color: '#263238',
            fillOpacity: 0.7
        };
        
        // Add GeoJSON layer
        L.geoJSON(countriesGeoJSON, {
            style: function(feature) {
                return defaultStyle;
            },
            onEachFeature: function(feature, layer) {
                const countryCode = feature.id;
                countryLayers[countryCode] = layer;
                
                // Add interaction
                layer.on({
                    mouseover: function(e) {
                        const country = gameState.countries.find(c => c.id === countryCode);
                        if (country) {
                            showTooltip(e, country.name);
                        }
                        
                        layer.setStyle({
                            fillOpacity: 0.9,
                            weight: 2
                        });
                    },
                    mouseout: function(e) {
                        hideTooltip();
                        layer.setStyle({
                            fillOpacity: 0.7,
                            weight: 1
                        });
                    },
                    click: function(e) {
                        checkAnswer(countryCode);
                    }
                });
            }
        }).addTo(map);
        
        // Start game
        startGame(gameState.gameMode);
    }
    
    // Start game
    function startGame(mode) {
        gameState.gameMode = mode;
        gameState.correct = 0;
        gameState.incorrect = 0;
        gameState.totalQuestions = 0;
        gameState.hintUsed = false;
        
        updateStats();
        updateMap();
        nextQuestion();
        startTimer();
    }
    
    // Update map colors
    function updateMap() {
        // Reset all countries to default color
        Object.values(countryLayers).forEach(layer => {
            layer.setStyle({
                fillColor: '#78909c',
                weight: 1,
                opacity: 0.7,
                color: '#263238',
                fillOpacity: 0.7
            });
            
            // Add or remove labels based on setting
            if (gameState.showLabels) {
                const countryId = layer.feature.id;
                const country = gameState.countries.find(c => c.id === countryId);
                if (country) {
                    layer.bindTooltip(country.name, {
                        permanent: true,
                        direction: 'center',
                        className: 'country-label'
                    }).openTooltip();
                }
            } else {
                if (layer.getTooltip()) {
                    layer.unbindTooltip();
                }
            }
        });
    }
    
    // Next question
    function nextQuestion() {
        // Select a random country
        const randomIndex = Math.floor(Math.random() * gameState.countries.length);
        gameState.currentCountry = gameState.countries[randomIndex];
        gameState.totalQuestions++;
        gameState.hintUsed = false;
        
        // Update UI
        countryName.textContent = gameState.currentCountry.name;
        progressDisplay.textContent = `${gameState.correct + gameState.incorrect} / ${gameState.totalQuestions}`;
        
        // Add flag if in flags mode
        if (gameState.gameMode === 'flags') {
            countryFlag.innerHTML = `<img class="flag" src="${gameState.currentCountry.flag}" alt="${gameState.currentCountry.flagAlt}">`;
        } else {
            countryFlag.innerHTML = '';
        }
        
        // If in capitals mode, show the capital instead of country name
        if (gameState.gameMode === 'capitals') {
            countryName.textContent = `Country with capital: ${gameState.currentCountry.capital}`;
        }
    }
    
    // Check answer
    function checkAnswer(selectedCountryId) {
        if (selectedCountryId === gameState.currentCountry.id) {
            // Correct answer
            gameState.correct++;
            showFeedback(true);
            
            // Highlight correct country
            const layer = countryLayers[selectedCountryId];
            if (layer) {
                layer.setStyle({
                    fillColor: '#4caf50',
                    fillOpacity: 0.8
                });
            }
            
            // Move to next question after delay
            setTimeout(() => {
                nextQuestion();
                updateMap();
            }, 1500);
        } else {
            // Incorrect answer
            gameState.incorrect++;
            showFeedback(false);
            
            // Highlight incorrect selection
            const layer = countryLayers[selectedCountryId];
            if (layer) {
                layer.setStyle({
                    fillColor: '#f44336',
                    fillOpacity: 0.8
                });
            }
        }
        
        updateStats();
    }
    
    // Show tooltip
    function showTooltip(event, countryName) {
        const x = event.originalEvent.pageX;
        const y = event.originalEvent.pageY;
        
        tooltip.textContent = countryName;
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y + 10) + 'px';
        tooltip.style.display = 'block';
    }
    
    // Hide tooltip
    function hideTooltip() {
        tooltip.style.display = 'none';
    }
    
    // Show feedback
    function showFeedback(isCorrect) {
        feedback.textContent = isCorrect ? 'Correct!' : 'Wrong!';
        feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedback.style.display = 'block';
        
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 1500);
    }
    
    // Update statistics
    function updateStats() {
        correctCount.textContent = gameState.correct;
        incorrectCount.textContent = gameState.incorrect;
        progressDisplay.textContent = `${gameState.correct + gameState.incorrect} / ${gameState.totalQuestions}`;
    }
    
    // Timer functions
    function startTimer() {
        stopTimer();
        gameState.startTime = Date.now();
        gameState.timer = setInterval(updateTimer, 1000);
        updateTimer();
    }
    
    function updateTimer() {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timer.textContent = `${minutes}:${seconds}`;
    }
    
    function stopTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
    }
    
    // Move the tooltip with the mouse
    document.addEventListener('mousemove', function(e) {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
        }
    });
    
    // Initialize the game
    fetchCountryData();
});