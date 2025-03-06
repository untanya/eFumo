document.addEventListener("DOMContentLoaded", async () => {
    const fumoContainer = document.querySelector(".fumoContainer");
    const panier = document.querySelector(".panier");
    const panierBox = document.querySelector(".panierBox");
    const searchInput = document.getElementById("search");

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

    let panierVisible = false;

    const currentPage = 1;
    const itemsPerPage = 10; // Nombre de Fumos affichées par page

    // 📌 Fonction pour récupérer un Fumo aléatoire
    async function fetchFumo() {
        try {
            const response = await fetch("http://localhost:8081/fumos/random");
            if (!response.ok) throw new Error("Erreur lors du chargement des données.");
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la récupération du Fumo :", error);
            return null;
        }
    }

    // 📌 Fonction pour rechercher une Fumo par nom
    async function fetchFumoByName(name) {
        try {
            const response = await fetch(`http://localhost:8081/fumos/${encodeURIComponent(name)}`);
            if (!response.ok) throw new Error("Fumo non trouvée.");
            return await response.json();
        } catch (error) {
            console.error("Erreur lors de la recherche de la Fumo :", error);
            return null;
        }
    }

    // 📌 Met à jour une carte avec les infos d'une Fumo
    function updateFumoCard(card, fumoData) {
        if (!fumoData || !fumoData.regular || !Array.isArray(fumoData.regular) || fumoData.regular.length === 0) {
            console.warn("⚠ Aucune Fumo valide trouvée.");
            return;
        }

        const fumoId = fumoData.regular[0].id;
        const imageUrl = `http://localhost:8081/fumos/image/${fumoId}`;

        const fumoName = card.querySelector(".fumoName");
        const fumoImageDiv = card.querySelector(".fumoImage");
        const fumoPrice = card.querySelector(".fumoPrice");
        const fumoButton = card.querySelector(".fumoButton button");

        fumoName.textContent = fumoData.ch_name;
        fumoImageDiv.innerHTML = `<img src="${imageUrl}" alt="${fumoData.ch_name}" style="width:150px; height:auto;">`;

        const price = (Math.random() * (50 - 30) + 30).toFixed(2);
        fumoPrice.textContent = `${price}€`;

        const contrastColors = ["#FFD700", "#FFFFFF", "#90EE90", "#00BFFF", "#FF69B4"];
        const borderColor = contrastColors[Math.floor(Math.random() * contrastColors.length)];
        card.style.border = `4px solid ${borderColor}`;

        fumoButton.addEventListener("click", () => {
            if (!panierVisible) {
                panier.style.display = "block";
                panierVisible = true;
            }

            const existingFumo = document.querySelector(`.panierItem[data-id="${fumoId}"]`);

            if (existingFumo) {
                const qty = existingFumo.querySelector(".panierQuantity");
                qty.textContent = `x${Number.parseInt(qty.textContent.replace('x', '')) + 1}`;
            } else {
                const panierItem = document.createElement("div");
                panierItem.classList.add("panierItem");
                panierItem.setAttribute("data-id", fumoId);
                panierItem.innerHTML = `
                    <div class="panierFumo">
                        <img src="${imageUrl}" alt="${fumoData.ch_name}" style="width:50px; height:auto;">
                        <p>${fumoData.ch_name} - <strong>${price}€</strong> (<span class="panierQuantity">x1</span>)</p>
                    </div>
                `;
                panierBox.appendChild(panierItem);
            }
        });
    }

    // 📌 Affiche les Fumos avec pagination
    async function displayFumos(fumoList) {
        fumoContainer.innerHTML = ""; // Réinitialise la liste

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedFumos = fumoList.slice(startIndex, startIndex + itemsPerPage);

        for (const fumoData of paginatedFumos) {
            const fumoCard = document.createElement("section");
            fumoCard.classList.add("fumo");
            fumoCard.innerHTML = `
                <div class="fumoName">Nom de la Fumo</div>
                <div class="fumoImage"></div>
                <div class="fumoPrice">Prix :</div>
                <div class="fumoButton">
                    <button type="submit">Acheter</button>
                </div>
            `;
            updateFumoCard(fumoCard, fumoData);
            fumoContainer.appendChild(fumoCard);
        }
    }

    // 📌 Chargement initial avec 10 Fumos aléatoires
    async function loadRandomFumos() {
        const randomFumos = [];
        for (let i = 0; i < itemsPerPage; i++) {
            const fumo = await fetchFumo();
            if (fumo) randomFumos.push(fumo);
        }
        displayFumos(randomFumos);
    }

    // 📌 Événement sur la barre de recherche
    searchInput.addEventListener("input", async (event) => {
        const query = event.target.value.trim();

        if (query.length === 0) {
            // Recharge des Fumos aléatoires si la recherche est vide
            await loadRandomFumos();
        } else {
            const fumoData = await fetchFumoByName(query);
            if (Array.isArray(fumoData) && fumoData.length > 0) {
                displayFumos(fumoData);
            } else {
                console.log("Aucune Fumo trouvée.");
                fumoContainer.innerHTML = "<p style='color:white;'>Aucune Fumo trouvée.</p>";
            }
        }
    });

    // 📌 Événement pour afficher/cacher le panier
    panier.addEventListener("click", () => {
        panierVisible = !panierVisible;

        if (panierVisible) {
            panier.style.display = "none"; // Cache le bouton Panier
            panierBox.style.display = "block"; // Affiche le panier
        }
    });

    // 📌 Chargement initial
    await loadRandomFumos();
});
