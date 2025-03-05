document.addEventListener("DOMContentLoaded", async () => {
    const fumoCards = document.querySelectorAll(".fumo"); // Sélectionne toutes les cartes
    const panier = document.querySelector(".panier"); // Sélectionne le panier

    async function fetchFumo() {
        try {
            const response = await fetch("http://localhost:8081/fumos/random");
            if (!response.ok) throw new Error("Erreur lors du chargement des données.");

            return await response.json(); // Retourne un Fumo
        } catch (error) {
            console.error("Erreur lors de la récupération du Fumo :", error);
            return null; // Retourne null en cas d'échec
        }
    }

    async function updateFumoCard(card) {
        const data = await fetchFumo();
        if (!data) return; // Ne rien faire si l'API échoue

        const fumoId = data.regular[0].id;
        const imageUrl = `http://localhost:8081/fumos/image/${fumoId}`;

        // Sélectionne les éléments à l'intérieur de la carte
        const fumoName = card.querySelector(".fumoName");
        const fumoImageDiv = card.querySelector(".fumoImage");
        const fumoPrice = card.querySelector(".fumoPrice");
        const fumoButton = card.querySelector(".fumoButton button");

        // Met à jour le contenu
        fumoName.textContent = data.ch_name;
        fumoImageDiv.innerHTML = `<img src="${imageUrl}" alt="${data.ch_name}" style="width:150px; height:auto;">`;

        // Génère un prix aléatoire
        const price = (Math.random() * (50 - 30) + 30).toFixed(2);
        fumoPrice.textContent = `${price}€`;

        // Appliquer un CSS aléatoire (exemple)
        card.style.border = `2px solid hsl(${Math.random() * 360}, 100%, 50%)`; // Bordure colorée aléatoire

        // Ajoute un événement au bouton "Acheter"
        fumoButton.addEventListener("click", () => {
            panier.style.display = "block"; // Affiche le panier quand on clique sur "Acheter"
        });
    }

    // Mettre à jour chaque carte Fumo
    fumoCards.forEach(updateFumoCard);
});
