const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');

app.use(express.json());
// Serve the static HTML/CSS/JS frontend
app.use(express.static(__dirname));

// Initialize scores file if it doesn't exist
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([
        { name: "Spieler 1", company: "Profi", score: 42 },
        { name: "Spieler 2", company: "Elite", score: 35 },
        { name: "Spieler 3", company: "Anfänger", score: 10 }
    ]));
}

app.get('/api/scores', (req, res) => {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) {
        res.status(500).json({ error: 'Failed to read scores' });
    }
});

app.post('/api/scores', (req, res) => {
    try {
        const { name, company, score } = req.body;
        if (!name || !company || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid data' });
        }
        
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        let highScores = JSON.parse(data);
        
        highScores.push({ name: name.substring(0,25), company: company.substring(0,25), score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10); // keep top 10
        
        fs.writeFileSync(SCORES_FILE, JSON.stringify(highScores, null, 2));
        res.json(highScores);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
