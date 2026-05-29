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

// para reiniciar mazo en el POP-UP
const restartBtn =
    document.getElementById("restart-btn");
restartBtn.addEventListener("click", restartDeck);

const backDecksBtn =
    document.getElementById("back-decks-btn");

// =========================
// STATE
// =========================

let cards = [];

let currentIndex = 0;

let revealed = false;

let currentCard = null;

let repeatQueue = [];

// historial de navegacion
let historyStack = [];

// contadores globales para POP-UP de resultados
let rememberedCount = 0;
let forgottenCount = 0;

// contador independiente
let reviewedCount = 0;

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


let buttonSound =
    new Audio("sounds/good_bad.mp3"
);



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

        // =================
        // INICIALIZAR STATS
        // =================

        cards.forEach(card => {
            if (!card.stats) {
                card.stats = {
                    good: 0,
                    bad: 0
                };
            }
        });

        // ================
        // MEZCLAR TARJETAS
        // ================

        shuffleDeck(cards);

        // =====================
        // ASIGNAR PRIMERA TARJETA
        // =====================
        currentCard = cards[currentIndex];
        console.log(currentCard);
        renderCard();


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

    const card = currentCard;

    // V.2 UPDATE COUNTER
    progress.innerHTML =
        `Reviewed: ${reviewedCount}<br>
         Total: ${cards.length}`;


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

// ==================================
// NEXT CARD para clasificar tarjetas
// ==================================

function nextCard() {

    if (
        repeatQueue.length > 0 &&
        Math.random() < 0.5
    ) {

        currentCard =
            repeatQueue.shift();

    } else {

        currentIndex++;

        currentCard =
            cards[currentIndex];

    }

    renderCard();

}


// para POP-UP de resultados
function showResultsPopup() {

  const popup = document.getElementById("results-popup");

  const goodCount = document.getElementById("good-count");

  const badCount = document.getElementById("bad-count");

  goodCount.textContent = rememberedCount;

  badCount.textContent = forgottenCount;

  popup.classList.remove("hidden");
}

// para REINICIAR MAZO en el POP-UP
function restartDeck() {

    // Reiniciar contadores
    rememberedCount = 0;
    forgottenCount = 0;

    // Reiniciar cola de repetición
    repeatQueue = [];

    // Reiniciar índice
    currentIndex = 0;

    // RESET REVEAL
    revealed = false;

    // Mezclar mazo nuevamente
    shuffleDeck(cards);

    // Primera tarjeta
    currentCard = cards[currentIndex];

    // Ocultar popup
    document
        .getElementById("results-popup")
        .classList.add("hidden");

    // RESET CLASES ANIMACION
    const card =
        document.querySelector(".flashcard");

    card.classList.remove("card-next-out");
    card.classList.remove("card-next-in");
    card.classList.remove("card-prev-out");
    card.classList.remove("card-prev-in");

    // Renderizar
    renderCard();
}

// boton "Back to Decks" del POP-UP
backDecksBtn.addEventListener("click", () => {

    window.location.href =
        "index.html";
});

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
// V.3 nextBtn
nextBtn.addEventListener("click", () => {

  playNavClick();

  const card =
      document.querySelector(".flashcard");

  // =========================
  // ANIMACION SALIDA
  // =========================

  card.classList.add("card-next-out");

  setTimeout(() => {

      // para contador
      reviewedCount++;

      // guardar en historial
      historyStack.push(currentCard);

      // =========================
      // PRIORIDAD A REPETICIONES
      // =========================

      if (
          repeatQueue.length > 0 &&
          Math.random() < 0.5
      ) {

          currentCard =
            repeatQueue.shift();

      } else {

          currentIndex++;

          // =========================
          // FIN DEL MAZO
          // =========================

          if (
              currentIndex >= cards.length &&
              repeatQueue.length === 0
          ) {

              showResultsPopup();

              return;
          }

          // =========================
          // TARJETA NORMAL
          // =========================

          if (currentIndex < cards.length) {

              currentCard =
                  cards[currentIndex];

          } else if (repeatQueue.length > 0) {

              currentCard =
                  repeatQueue.shift();

          } else {

              showResultsPopup();

              return;
          }
      }

      revealed = false;

      // quitar salida
      card.classList.remove("card-next-out");

      // posicion inicial entrada
      card.classList.add("card-next-in");

      // render
      renderCard();

      // forzar reflow
      void card.offsetWidth;

      // entrada
      card.classList.remove("card-next-in");

  }, 150);
});

// =========================
// PREVIOUS CARD
// =========================
// V.3 prevBtn

prevBtn.addEventListener("click", () => {

  playNavClick();

  // No hay historial
  if (historyStack.length === 0) return;

  const card =
      document.querySelector(".flashcard");

  // salida
  card.classList.add("card-prev-out");

  setTimeout(() => {

      // Recuperar tarjeta anterior
      currentCard = historyStack.pop();

      revealed = false;

      // quitar salida
      card.classList.remove("card-prev-out");

      // entrada
      card.classList.add("card-prev-in");

      // render
      renderCard();

      // reflow
      void card.offsetWidth;

      // activar transición
      card.classList.remove("card-prev-in");

  }, 150);
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

    // V.2 audioBTN
    if (!currentCard) return;

    if (!currentCard.audio) return;

    const audio =
        new Audio(
            `decks/${deckId}/${currentCard.audio}`
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

// ================
// BOTON GOOD - BAD
// ================

document
  .getElementById("btn-good")
  .addEventListener("click", () => {

    buttonSound.currentTime = 0;
    buttonSound.play();

    currentCard.stats.good++;

    //para POP-UP de resultados
    rememberedCount++;

    //nextCard();

});

document
  .getElementById("btn-bad")
  .addEventListener("click", () => {

    buttonSound.currentTime = 0;
    buttonSound.play();

    currentCard.stats.bad++;

    if (!repeatQueue.includes(currentCard)) {

      repeatQueue.push(currentCard);

    }

    //para pop-up
    forgottenCount++;

    //nextCard();

});