document.addEventListener("DOMContentLoaded", async () => {
    const fumoCards = document.querySelectorAll(".fumo"); // Sélectionne toutes les cartes
    const panier = document.querySelector(".panier"); // Bouton pour afficher le panier
    const panierBox = document.querySelector(".panierBox"); // Boîte du panier
    let panierVisible = false; // État du panier

    // 📌 Création du conteneur des boutons d'action (Fermer & Vider)
    const panierActions = document.createElement("div");
    panierActions.classList.add("panierActions");

    // 📌 Bouton "Fermer le panier"
    const closePanierBtn = document.createElement("button");
    closePanierBtn.textContent = "Fermer le panier";
    closePanierBtn.classList.add("closePanier");
    closePanierBtn.addEventListener("click", () => {
        panierBox.style.display = "none"; // Cache le panier
        panier.style.display = panierBox.children.length > 1 ? "block" : "none"; // Cache "Panier" si vide
        panierVisible = false;
    });

    // 📌 Bouton "Vider le panier"
    const clearPanierBtn = document.createElement("button");
    clearPanierBtn.textContent = "Vider le panier";
    clearPanierBtn.classList.add("clearPanier");
    clearPanierBtn.addEventListener("click", () => {
        for (const item of panierBox.querySelectorAll(".panierItem")) {
            item.remove(); // Supprime chaque élément du panier
        }
        panierBox.style.display = "none"; // Cache la boîte du panier
        panier.style.display = "none"; // Cache aussi le bouton Panier
        panierVisible = false;
    });

    // 📌 Ajoute les boutons dans le conteneur d'actions
    panierActions.appendChild(closePanierBtn);
    panierActions.appendChild(clearPanierBtn);

    // 📌 Ajoute le conteneur d'actions au panierBox
    panierBox.prepend(panierActions);

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

        // Sélectionne les éléments de la carte
        const fumoName = card.querySelector(".fumoName");
        const fumoImageDiv = card.querySelector(".fumoImage");
        const fumoPrice = card.querySelector(".fumoPrice");
        const fumoButton = card.querySelector(".fumoButton button");

        // Mise à jour du contenu
        fumoName.textContent = data.ch_name;
        fumoImageDiv.innerHTML = `<img src="${imageUrl}" alt="${data.ch_name}" style="width:150px; height:auto;">`;

        // Génère un prix aléatoire
        const price = (Math.random() * (50 - 30) + 30).toFixed(2);
        fumoPrice.textContent = `${price}€`;

        // 🎨 Appliquer une couleur de bordure **accessible** par rapport à `#A11B29`
        const contrastColors = ["#FFD700", "#FFFFFF", "#90EE90", "#00BFFF", "#FF69B4"];
        const borderColor = contrastColors[Math.floor(Math.random() * contrastColors.length)];
        card.style.border = `4px solid ${borderColor}`;

        // 📌 Ajoute un événement au bouton "Acheter"
        fumoButton.addEventListener("click", () => {
            if (!panierVisible) {
                panier.style.display = "block";
            }

            // Vérifie si la Fumo est déjà dans le panier
            const existingFumo = document.querySelector(`.panierItem[data-id="${fumoId}"]`);

            if (existingFumo) {
                // Augmente la quantité si la Fumo est déjà présente
                const qty = existingFumo.querySelector(".panierQuantity");
                qty.textContent = `x${Number.parseInt(qty.textContent.replace('x', '')) + 1}`;
            } else {
                // Ajoute une nouvelle Fumo dans le panier
                const panierItem = document.createElement("div");
                panierItem.classList.add("panierItem");
                panierItem.setAttribute("data-id", fumoId);
                panierItem.innerHTML = `
                    <div class="panierFumo">
                        <img src="${imageUrl}" alt="${data.ch_name}" style="width:50px; height:auto;">
                        <p>${data.ch_name} - <strong>${price}€</strong> (<span class="panierQuantity">x1</span>)</p>
                    </div>
                `;
                panierBox.appendChild(panierItem);
            }
        });
    }

    // 📌 Mettre à jour chaque carte Fumo avec `for...of`
    for (const card of fumoCards) {
        await updateFumoCard(card);
    }

    // 📌 Événement pour afficher/cacher le panier
    panier.addEventListener("click", () => {
        panierVisible = !panierVisible;

        if (panierVisible) {
            panier.style.display = "none"; // Cache le bouton Panier
            panierBox.style.display = "block"; // Affiche le panier
        }
    });
});
