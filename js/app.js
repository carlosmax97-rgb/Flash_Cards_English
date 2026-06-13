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


//Nro de tarjetas automatico
deckCards.forEach(async card => {

    const deckId =
        card.dataset.deck;

    const counter =
        card.querySelector(".card-count");

    try {

        const response =
            await fetch(
                `decks/${deckId}/cards.json`
            );

        const cards =
            await response.json();

        counter.textContent =
            `${cards.length} tarjetas`;

    } catch (error) {

        console.error(error);

        counter.textContent =
            "0 tarjetas";
    }

});