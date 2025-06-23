<script>
    import { onMount } from 'svelte';
    import { gameState, gameControls } from '../stores.js';
    import Header from '../lib/Header.svelte';
    import Map from '../lib/Map.svelte';
    import Toolbar from '../lib/Toolbar.svelte';
    import Modal from '../lib/Modal.svelte';
    import '../app.css';

    let timerDisplay = '00:00';

    onMount(() => {
        const unsubscribe = gameState.subscribe(state => {
            if (state.startTime) {
                const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                timerDisplay = `${minutes}:${seconds}`;
            }
        });

        // Fullscreen toggle
        document.addEventListener('fullscreenchange', () => {
            const fullscreenButton = document.querySelector('.fullscreen-button');
            if (fullscreenButton) {
                if (!document.fullscreenElement) {
                    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
                } else {
                    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>';
                }
            }
        });

        return () => {
            unsubscribe();
        };
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
</script>

<svelte:head>
    <title>GeoQuest</title>
</svelte:head>

<div class="app-container">
    <Header />

    <main id="map-container">
        <Map />
    </main>

    <Toolbar />

    {#if $gameControls.showModal}
        <Modal />
    {/if}

    <button class="fullscreen-button" on:click={toggleFullscreen}>
        <i class="fas fa-expand"></i>
    </button>

    <div class="time-display">
        Time: <span id="timer">{timerDisplay}</span>
    </div>
</div>

<style>
    .app-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }

    #map-container {
        position: relative;
        flex: 1;
        overflow: hidden;
    }
    
    .fullscreen-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--text-color);
        border: none;
        width: 40px;
        height: 40px;
        font-size: 18px;
        cursor: pointer;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .time-display {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--text-color);
        padding: 5px 10px;
        border-radius: 5px;
        z-index: 1000;
    }
</style>