// =========================
// PARAMS
// =========================

const params =
    new URLSearchParams(window.location.search);

const deckId =
    params.get("deck");


// =========================
// ELEMENTS
// =========================

const flashcard =
    document.getElementById("flashcard");

const cardText =
    document.getElementById("cardText");

const cardHint =
    document.getElementById("cardHint");

const audioBtn =
    document.getElementById("audioBtn");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");

const progress =
    document.getElementById("progress");

const backBtn =
    document.getElementById("backBtn");

// =========================
// STATE
// =========================

let cards = [];

let currentIndex = 0;

let revealed = false;


// =========================
// UI SOUNDS
// =========================

const navClickSound =
    new Audio("sounds/click.mp3");

function playNavClick() {

    navClickSound.currentTime = 0;

    navClickSound.play().catch(() => {});
}

const tapSound =
    new Audio("sounds/tap_flip.mp3");

// =========================
// DECK LEVEL THEME
// =========================

async function loadDeckLevel() {

    if (!deckId || !flashcard) return;

    try {

        const response =
            await fetch("decks/index.json");

        const list = await response.json();

        const entry =
            list.find((d) => d.id === deckId);

        if (!entry?.level) {

            flashcard.removeAttribute("data-level");

            return;
        }

        const slug =
            String(entry.level).trim().toLowerCase();

        flashcard.dataset.level = slug;

    } catch (error) {

        console.error(
            "Error loading deck level:",
            error
        );

        flashcard.removeAttribute("data-level");
    }
}


// =========================
// LOAD CARDS
// =========================

async function loadCards() {

    try {

        const response =
            await fetch(
                `decks/${deckId}/cards.json`
            );

        cards = await response.json();

        console.log(cards);

        renderCard();

    } catch (error) {

        console.error(
            "Error loading cards:",
            error
        );
    }
}


// =========================
// RENDER CARD
// =========================

function renderCard() {

    if (cards.length === 0) return;

    const card = cards[currentIndex];


    // UPDATE COUNTER
    progress.textContent =
        `${currentIndex + 1} / ${cards.length}`;


    if (revealed) {

        cardText.textContent =
            card.es;

        cardHint.style.display =
            "none";

    } else {

        cardText.textContent =
            card.en;

        cardHint.style.display =
            "block";
    }
}

// =========================
// REVEAL CARD
// =========================

flashcard.addEventListener("click", () => {

    revealed = !revealed;

    // sonido al revelar y volver
    tapSound.pause();

    tapSound.currentTime = 0;

    tapSound.play();

    renderCard();
});


// =========================
// NEXT CARD
// =========================

nextBtn.addEventListener("click", () => {

    playNavClick();

    currentIndex++;

    if (currentIndex >= cards.length) {

        currentIndex = 0;
    }

    revealed = false;

    renderCard();
});


// =========================
// PREVIOUS CARD
// =========================

prevBtn.addEventListener("click", () => {

    playNavClick();

    currentIndex--;

    if (currentIndex < 0) {

        currentIndex =
            cards.length - 1;
    }

    revealed = false;

    renderCard();
});

// =========================
// BACK BUTTON
// =========================

backBtn.addEventListener("click", () => {

    window.location.href =
        "index.html";
});

// =========================
// AUDIO
// =========================

audioBtn.addEventListener("click", () => {

    if (cards.length === 0) return;

    const card = cards[currentIndex];

    if (!card.audio) return;

    const audio =
        new Audio(
            `decks/${deckId}/${card.audio}`
        );

    audio.play();
});


// =========================
// INIT
// =========================

Promise.all([
    loadDeckLevel(),
    loadCards(),
]);