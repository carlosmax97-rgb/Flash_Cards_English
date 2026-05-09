fetch("decks/index.json")

const clickSound = new Audio("sounds/click.mp3");

const deckCards = document.querySelectorAll(".deck-card");

deckCards.forEach(card => {

    card.addEventListener("click", (event) => {

        event.preventDefault();

        clickSound.currentTime = 0;

        clickSound.play();

        const url = card.href;

        setTimeout(() => {

            window.location.href = url;

        }, 150);

    });

});