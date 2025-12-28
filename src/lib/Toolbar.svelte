<script>
    import { gameState } from '../stores.js';

    function resetView() {
        // This needs to be implemented by communicating with the Map component
        // For now, we just log it
        console.log("Reset View");
    }

    function toggleLabels() {
        gameState.update(state => ({...state, showLabels: !state.showLabels}));
    }

    function giveHint() {
        // This also needs to communicate with the Map component
        console.log("Hint");
    }

    function skipQuestion() {
        gameState.update(state => ({...state, incorrect: state.incorrect + 1}));
        // We'll need a way to trigger nextQuestion in the Map component
    }

</script>

<div class="toolbar">
    <button id="reset-view" on:click={resetView}><i class="fas fa-compress-arrows-alt"></i></button>
    <button id="toggle-labels" on:click={toggleLabels}><i class="fas fa-font"></i></button>
    <button id="hint" on:click={giveHint}><i class="fas fa-lightbulb"></i></button>
    <button id="skip" on:click={skipQuestion}><i class="fas fa-forward"></i></button>
</div>

<style>
    .toolbar {
        display: flex;
        justify-content: center;
        gap: 10px;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .toolbar button {
        background-color: transparent;
        border: none;
        color: var(--text-color);
        font-size: 20px;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .toolbar button:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
</style>