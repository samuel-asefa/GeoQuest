<script>
    import { gameState, gameControls } from '../stores.js';
</script>

<header>
    <div class="logo">
        <i class="fas fa-globe-americas"></i>
        <h1>GeoQuest</h1>
    </div>
    <div class="stats">
        <div class="stat correct">
            <i class="fas fa-check-circle"></i>
            <span id="correct-count">{$gameState.correct}</span>
        </div>
        <div class="stat incorrect">
            <i class="fas fa-times-circle"></i>
            <span id="incorrect-count">{$gameState.incorrect}</span>
        </div>
        <div class="stat progress">
            <span id="progress">{$gameState.correct + $gameState.incorrect} / {$gameState.totalQuestions}</span>
        </div>
    </div>
    <button class="menu-button" on:click={() => gameControls.update(controls => ({ ...controls, showModal: true }))}>
        <i class="fas fa-bars"></i>
        Menu
    </button>
</header>

<style>
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .logo i {
        color: var(--highlight-color);
        font-size: 24px;
    }

    .stats {
        display: flex;
        gap: 20px;
        align-items: center;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .correct {
        color: var(--success-color);
    }

    .incorrect {
        color: var(--error-color);
    }

    .progress {
        color: var(--highlight-color);
    }
    
    .menu-button {
        background-color: rgba(0, 0, 0, 0.7);
        color: var(--text-color);
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .menu-button:hover {
        background-color: rgba(0, 0, 0, 0.9);
    }
</style>