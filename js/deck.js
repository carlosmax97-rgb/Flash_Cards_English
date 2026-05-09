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

    renderCard();
});


// =========================
// NEXT CARD
// =========================

nextBtn.addEventListener("click", () => {

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

loadCards();