import { writable } from 'svelte/store';

export const gameState = writable({
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
});

export const gameControls = writable({
    showModal: true,
});