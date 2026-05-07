// ==============================
// CARDS
// ==============================
let cards = [];

let currentCard = 0;

// ==============================
// MAP LEVELS
// ==============================

function getDifficulty(level) {
    switch (level) {
        case "A1":
        case "A2":
            return "Fácil";

        case "B1":
        case "B2":
            return "Intermedio";

        case "C1":
        case "C2":
            return "Difícil";

        default:
            return "Intermedio";
    }
}

// ==============================
// AUDIO
// ==============================

const audioPlayer = document.getElementById("player");

function playAudio() {
    if (!cards.length) return;
    const data = cards[currentCard];
    if (!data || !data.audio) return;
    audioPlayer.src = data.audio;
    audioPlayer.play().catch(() => {});
}

// ==============================
// UPDATE CARD
// ==============================

function updateCard() {
    const cardElem = document.getElementById("card");

    cardElem.classList.remove("is-flipped");

    setTimeout(() => {
        const diffElem = document.getElementById("diff");
        const frontEl = document.getElementById("front-text");
        const backEl = document.getElementById("back-text");
        const counterEl = document.getElementById("counter");

        if (!cards.length) {
            diffElem.innerText = "";
            diffElem.className = "difficulty";
            frontEl.innerText =
                "No hay tarjetas. Abre el proyecto con un servidor local para cargar data/phrases.json.";
            backEl.innerHTML = "";
            counterEl.innerText = "0 / 0";
            return;
        }

        if (currentCard < 0 || currentCard >= cards.length) {
            currentCard = 0;
        }

        const data = cards[currentCard];
        const difficulty = getDifficulty(data.level);

        diffElem.innerText = difficulty;

        diffElem.className =
            "difficulty " +
            (difficulty === "Fácil"
                ? "easy"
                : difficulty === "Intermedio"
                  ? "inter"
                  : "hard");

        frontEl.innerText = data.en;

        backEl.innerHTML = "";
        const translation = document.createElement("div");
        translation.className = "translation";
        translation.textContent = data.es;
        backEl.appendChild(translation);

        const meta = document.createElement("div");
        meta.className = "meta";
        const levelSpan = document.createElement("span");
        levelSpan.className = "level";
        levelSpan.textContent = `Nivel: ${data.level}`;
        const tagsSpan = document.createElement("span");
        tagsSpan.className = "tags";
        tagsSpan.textContent = Array.isArray(data.tags)
            ? data.tags.join(", ")
            : "";
        meta.appendChild(levelSpan);
        meta.appendChild(tagsSpan);
        backEl.appendChild(meta);

        counterEl.innerText = `${currentCard + 1} / ${cards.length}`;
    }, 150);
}

// ==============================
// NAVIGATION
// ==============================

function nextCard() {
    if (!cards.length) return;
    currentCard = (currentCard + 1) % cards.length;
    updateCard();
}

function prevCard() {
    if (!cards.length) return;
    currentCard = (currentCard - 1 + cards.length) % cards.length;
    updateCard();
}

// ==============================
// LOAD
// ==============================

async function loadCards() {
    try {
        const res = await fetch("data/phrases.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();
        cards = Array.isArray(payload.phrases) ? payload.phrases : [];
        currentCard = 0;
    } catch (err) {
        console.error(err);
        cards = [];
    }
    updateCard();
}

// ==============================
// FLIP CARD
// ==============================

const card = document.getElementById("card");

card.addEventListener("click", () => {
    card.classList.toggle("is-flipped");
});

loadCards();
