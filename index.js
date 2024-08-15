const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config(); // Carregar variáveis do .env

const app = express();

// Configuração das variáveis de ambiente
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const LINKS_FILE = process.env.LINKS_FILE || 'urls.json';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para gerar um ID único
function generateId(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Página de Verificação
app.get('/verificar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verificar.html'));
});

// Página de Contagem Regressiva
app.get('/contar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contar.html'));
});

// Página de Captcha
app.get('/captcha', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'captcha.html'));
});

// Página de Download
app.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// Rota para obter o longo URL
app.get('/get-long-url', (req, res) => {
    const id = req.query.id;
    const urlsFile = path.join(__dirname, LINKS_FILE);

    if (fs.existsSync(urlsFile)) {
        const fileContent = fs.readFileSync(urlsFile, 'utf8');
        const urls = fileContent ? JSON.parse(fileContent) : {};
        const longUrl = urls[id];

        if (longUrl) {
            res.send(longUrl);
        } else {
            res.status(404).send('URL não encontrada.');
        }
    } else {
        res.status(404).send('Arquivo de URLs não encontrado.');
    }
});

// Rota para encurtar URLs
app.post('/encurtar', (req, res) => {
    const { url, secretKey } = req.body;

    if (secretKey !== SECRET_KEY) {
        return res.status(401).send('Senha secreta incorreta.');
    }

    if (!url) {
        return res.status(400).send('URL é obrigatória.');
    }

    const id = generateId();
    const shortUrl = `https://encurtadordelinksmoz.vercel.app/verificar?id=${id}`;

    const urlsFile = path.join(__dirname, LINKS_FILE);
    let urls = {};
    try {
        if (fs.existsSync(urlsFile)) {
            const fileContent = fs.readFileSync(urlsFile, 'utf8');
            urls = fileContent ? JSON.parse(fileContent) : {};
        }
    } catch (error) {
        console.error('Erro ao ler o arquivo de URLs:', error);
        return res.status(500).send('Erro ao ler o arquivo de URLs.');
    }

    urls[id] = url;

    try {
        fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));
    } catch (error) {
        console.error('Erro ao escrever o arquivo de URLs:', error);
        return res.status(500).send('Erro ao salvar a URL.');
    }

    res.send(`URL encurtado: <a href="${shortUrl}">${shortUrl}</a>`);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
