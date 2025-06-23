<script>
    import { gameState, gameControls } from '../stores.js';

    function startGame(mode) {
        gameState.update(state => ({
            ...state,
            gameMode: mode,
            correct: 0,
            incorrect: 0,
            totalQuestions: 0,
            hintUsed: false,
            startTime: Date.now()
        }));
        gameControls.update(controls => ({ ...controls, showModal: false }));
    }
</script>

<div id="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>GeoQuest</h2>
            <button class="close-modal" on:click={() => gameControls.update(controls => ({...controls, showModal: false}))}>&times;</button>
        </div>
        <p>Test your geography knowledge! Find countries on the map as quickly as you can.</p>
        <div class="game-modes">
            <div class="game-mode" data-mode="countries" on:click={() => startGame('countries')}>
                <h3>Find Countries</h3>
                <p>Locate the highlighted country on the world map</p>
            </div>
            <div class="game-mode" data-mode="capitals" on:click={() => startGame('capitals')}>
                <h3>Capital Cities</h3>
                <p>Find the country where the capital city is located</p>
            </div>
            <div class="game-mode" data-mode="flags" on:click={() => startGame('flags')}>
                <h3>Flag Challenge</h3>
                <p>Match flags to their countries</p>
            </div>
            <div class="game-mode" data-mode="regions" on:click={() => startGame('regions')}>
                <h3>Region Master</h3>
                <p>Identify all countries in a specific region</p>
            </div>
        </div>
    </div>
</div>

<style>
    #modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .modal-content {
        background-color: var(--bg-color);
        padding: 30px;
        border-radius: 10px;
        width: 500px;
        max-width: 90%;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-header h2 {
        color: var(--highlight-color);
    }

    .close-modal {
        background: none;
        border: none;
        color: var(--text-color);
        font-size: 24px;
        cursor: pointer;
    }

    .game-modes {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-top: 20px;
    }

    .game-mode {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
    }

    .game-mode:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .game-mode h3 {
        margin-bottom: 10px;
        color: var(--highlight-color);
    }
</style>