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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
=======
const fs = require('fs');

const SECRET_KEY = 'nadadehacker'; // Chave secreta

module.exports = (req, res) => {
    if (req.method === 'POST') {
        return handleShortenUrl(req, res);
    } else if (req.method === 'GET') {
        return handleGetOriginalUrl(req, res);
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

// Handler para encurtar URLs
function handleShortenUrl(req, res) {
    const { secret, url } = req.query;

    // Verificação da chave secreta
    if (secret !== SECRET_KEY) {
        return res.status(403).json({ error: 'Chave secreta incorreta!' });
    }

    if (!url) {
        return res.status(400).json({ error: 'URL não fornecida!' });
    }

    const urlId = generateId(); // Função para gerar ID único
    const shortUrl = `moz-encurta-by-doso.vercel.app/${urlId}`;

    // Ler o arquivo JSON existente
    let urls = {};
    try {
        urls = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
    }

    // Adicionar a nova URL encurtada
    urls[urlId] = url;
    
    // Salvar o arquivo JSON atualizado
    fs.writeFileSync('urls.json', JSON.stringify(urls, null, 2));

    return res.status(200).json({ shortUrl });
}

// Handler para obter URLs originais
function handleGetOriginalUrl(req, res) {
    const { id } = req.query;

    // Ler o arquivo JSON para encontrar a URL original
    let urls = {};
    try {
        urls = JSON.parse(fs.readFileSync('urls.json', 'utf8'));
    } catch (error) {
        console.error('Erro ao ler o arquivo JSON:', error);
    }

    const originalUrl = urls[id];

    if (originalUrl) {
        return res.status(200).json({ originalUrl });
    } else {
        return res.status(404).json({ error: 'URL não encontrada!' });
    }
}

function generateId() {
    return Math.random().toString(36).substr(2, 8);
}
