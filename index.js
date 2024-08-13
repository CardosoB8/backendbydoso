const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Carregar variáveis do .env

const app = express();
app.use(express.json());
app.use(cors()); // Suporte a CORS
app.use(express.static(path.join(__dirname, 'public')));

const linksFilePath = path.join(__dirname, process.env.LINKS_FILE || 'links.json');

// Middleware para verificar a chave de encurtamento
const verifyKey = (req, res, next) => {
    const { key } = req.body;
    if (key !== process.env.ENCODING_KEY) {
        return res.status(403).send('Unauthorized');
    }
    next();
};

// Carregar links do arquivo JSON
const loadLinks = () => {
    if (fs.existsSync(linksFilePath)) {
        const data = fs.readFileSync(linksFilePath);
        return JSON.parse(data);
    }
    return {};
};

// Salvar links no arquivo JSON
const saveLinks = (links) => {
    fs.writeFileSync(linksFilePath, JSON.stringify(links, null, 2));
};

// Rota para encurtar o link
app.post('/shorten', verifyKey, (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).send('Original URL is required');
    }

    const links = loadLinks();
    const linkId = `mozencurtabydoso-${Date.now()}`;
    links[linkId] = originalUrl;
    saveLinks(links);

    res.json({ shortUrl: `https://backendbydoso.vercel.app/${linkId}` });
});

// Rota para verificar o link encurtado
app.get('/verify/:linkId', (req, res) => {
    const { linkId } = req.params;
    const links = loadLinks();

    if (links[linkId]) {
        res.sendFile(path.join(__dirname, 'public', 'verify.html'));
    } else {
        res.status(404).send('Link not found');
    }
});

// Rota para contagem regressiva
app.get('/countdown/:linkId', (req, res) => {
    const { linkId } = req.params;
    const links = loadLinks();

    if (links[linkId]) {
        res.sendFile(path.join(__dirname, 'public', 'countdown.html'));
    } else {
        res.status(404).send('Link not found');
    }
});

// Rota para captcha
app.get('/captcha/:linkId', (req, res) => {
    const { linkId } = req.params;
    const links = loadLinks();

    if (links[linkId]) {
        res.sendFile(path.join(__dirname, 'public', 'captcha.html'));
    } else {
        res.status(404).send('Link not found');
    }
});

// Rota para download
app.get('/download/:linkId', (req, res) => {
    const { linkId } = req.params;
    const links = loadLinks();

    if (links[linkId]) {
        res.sendFile(path.join(__dirname, 'public', 'download.html'));
    } else {
        res.status(404).send('Link not found');
    }
});

// Rota para redirecionar o link encurtado para o URL original
app.get('/:linkId', (req, res) => {
    const { linkId } = req.params;
    const links = loadLinks();

    if (links[linkId]) {
        const originalUrl = links[linkId];
        res.redirect(originalUrl);
    } else {
        res.status(404).send('Link not found');
    }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Servidor está rodando e pronto para receber solicitações');
});
