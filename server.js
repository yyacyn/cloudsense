const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route untuk halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cloud', (req, res) => {
    res.sendFile(path.join(__dirname, 'cloud.html'));
});

app.listen(port, () => {
    console.log(`🚀 CloudSense server running at http://localhost:${port}`);
    console.log(`📱 Hand tracking ready at http://localhost:${port}/cloud`);
});