const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = 8081;

app.use(cors()); // Active CORS pour toutes les routes

// Charger les données Fumo depuis fumo_data.json
const fumoData = JSON.parse(fs.readFileSync(path.join(__dirname, "fumo_data.json"), "utf-8"));
const fumos = fumoData.characters;

// Route 1️⃣ : Obtenir un Fumo aléatoire
app.get("/fumos/random", (req, res) => {
    const randomFumo = fumos[Math.floor(Math.random() * fumos.length)];
    res.json(randomFumo);
});

// Route 2️⃣ : Obtenir une Fumo spécifique avec son nom
app.get("/fumos/:name", (req, res) => {
    const fumoName = req.params.name.toLowerCase();
    const foundFumo = fumos.find(fumo => fumo.name.toLowerCase() === fumoName);

    if (foundFumo) {
        res.json(foundFumo);
    } else {
        res.status(404).json({ error: "Fumo non trouvé" });
    }
});

// Route 3️⃣ : Proxy pour récupérer l'image avec simulation de navigateur
app.get("/fumos/image/:id", async (req, res) => {
    try {
        const fumoId = req.params.id;
        const foundFumo = fumos.find(fumo => fumo.regular.some(version => version.id === fumoId));

        if (!foundFumo) {
            return res.status(404).json({ error: "Fumo non trouvé" });
        }

        const fumoVersion = foundFumo.regular.find(version => version.id === fumoId);
        const imageUrl = fumoVersion.img;

        // Simuler un navigateur avec des headers spécifiques
        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Referer": "https://www.gift-gift.jp/"
        };

        // Faire une requête à l'URL de l'image et la transmettre directement au client
        const response = await axios.get(imageUrl, { responseType: "stream", headers });

        res.setHeader("Content-Type", response.headers["content-type"]);
        response.data.pipe(res);
    } catch (error) {
        console.error("Erreur lors du chargement de l'image :", error);
        res.status(500).json({ error: "Impossible de récupérer l'image" });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
