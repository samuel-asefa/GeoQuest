<script>
    import { onMount } from 'svelte';
    // We only import the CSS here. The JS will be imported dynamically.
    import 'leaflet/dist/leaflet.css';
    import { gameState } from '../stores.js';

    let mapElement;
    let map;
    let countriesGeoJSON;
    let countryLayers = {};
    let tooltipElement;
    let feedbackElement;
    let feedbackMessage = '';
    let feedbackClass = '';
    let L; // Will hold the Leaflet library object

    // onMount only runs on the client (in the browser)
    onMount(async () => {
        // --- FIX: Dynamically import Leaflet on the client ---
        L = await import('leaflet');
        // ----------------------------------------------------

        map = L.map(mapElement, {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: false,
            attributionControl: false
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        await fetchCountryData();
        
        // Cleanup when the component is destroyed
        return () => {
            if (map) {
                map.remove();
            }
        };
    });

    async function fetchCountryData() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            const data = await response.json();
            
            const countries = data.map(country => ({
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
            gameState.update(state => ({ ...state, countries }));
            
            const geoResponse = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            countriesGeoJSON = await geoResponse.json();
            
            addCountriesToMap();
            
        } catch (error) {
            console.error("Error fetching country data:", error);
        }
    }

    function addCountriesToMap() {
        if (!L) return; // Guard against running before Leaflet is loaded
        const defaultStyle = {
            fillColor: '#78909c',
            weight: 1,
            opacity: 0.7,
            color: '#263238',
            fillOpacity: 0.7
        };

        L.geoJSON(countriesGeoJSON, {
            style: feature => defaultStyle,
            onEachFeature: (feature, layer) => {
                const countryCode = feature.id;
                countryLayers[countryCode] = layer;
                
                layer.on({
                    mouseover: e => {
                        const country = $gameState.countries.find(c => c.id === countryCode);
                        if (country) {
                            showTooltip(e, country.name);
                        }
                        layer.setStyle({ fillOpacity: 0.9, weight: 2 });
                    },
                    mouseout: () => {
                        hideTooltip();
                        layer.setStyle({ fillOpacity: 0.7, weight: 1 });
                    },
                    click: () => {
                        checkAnswer(countryCode);
                    }
                });
            }
        }).addTo(map);
    }

    function checkAnswer(selectedCountryId) {
        if (!$gameState.currentCountry) return;

        if (selectedCountryId === $gameState.currentCountry.id) {
            gameState.update(state => ({ ...state, correct: state.correct + 1 }));
            showFeedback('Correct!', true);
            
            const layer = countryLayers[selectedCountryId];
            if (layer) {
                layer.setStyle({ fillColor: '#4caf50', fillOpacity: 0.8 });
            }
            
            setTimeout(() => {
                nextQuestion();
                updateMap();
            }, 1500);
        } else {
            gameState.update(state => ({ ...state, incorrect: state.incorrect + 1 }));
            showFeedback('Wrong!', false);
            
            const layer = countryLayers[selectedCountryId];
            if (layer) {
                layer.setStyle({ fillColor: '#f44336', fillOpacity: 0.8 });
            }
        }
    }

    function nextQuestion() {
        if ($gameState.countries.length === 0) return;
        const randomIndex = Math.floor(Math.random() * $gameState.countries.length);
        const currentCountry = $gameState.countries[randomIndex];
        gameState.update(state => ({
            ...state,
            currentCountry,
            totalQuestions: state.totalQuestions + 1,
            hintUsed: false
        }));
    }

    function updateMap() {
        Object.values(countryLayers).forEach(layer => {
            layer.setStyle({
                fillColor: '#78909c',
                weight: 1,
                opacity: 0.7,
                color: '#263238',
                fillOpacity: 0.7
            });
        });
    }

    function showTooltip(event, countryName) {
        const x = event.originalEvent.pageX;
        const y = event.originalEvent.pageY;
        
        tooltipElement.textContent = countryName;
        tooltipElement.style.left = (x + 10) + 'px';
        tooltipElement.style.top = (y + 10) + 'px';
        tooltipElement.style.display = 'block';
    }

    function hideTooltip() {
        tooltipElement.style.display = 'none';
    }

    function showFeedback(message, isCorrect) {
        feedbackMessage = message;
        feedbackClass = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedbackElement.style.display = 'block';
        
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 1500);
    }
</script>

<div id="map" bind:this={mapElement}></div>

<div class="target-country">
    <span>Find:</span>
    {#if $gameState.currentCountry}
        {#if $gameState.gameMode === 'flags'}
            <div id="country-flag">
                <img class="flag" src={$gameState.currentCountry.flag} alt={$gameState.currentCountry.flagAlt}>
            </div>
        {/if}
        <span id="country-name">
            {#if $gameState.gameMode === 'capitals'}
                Country with capital: {$gameState.currentCountry.capital}
            {:else}
                {$gameState.currentCountry.name}
            {/if}
        </span>
    {/if}
</div>

<div class="country-tooltip" bind:this={tooltipElement}></div>
<div class="{feedbackClass}" bind:this={feedbackElement} style="display: none;">{feedbackMessage}</div>

<style>
    .target-country {
        position: absolute;
        top: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .target-country .flag {
        width: 30px;
        height: 20px;
        object-fit: cover;
    }
    
    .country-tooltip {
        position: absolute;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        z-index: 1500;
        pointer-events: none;
        display: none;
    }

    .feedback {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1600;
        display: none;
    }

    .feedback.correct {
        background-color: rgba(76, 175, 80, 0.8);
    }

    .feedback.incorrect {
        background-color: rgba(244, 67, 54, 0.8);
    }
</style>