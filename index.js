const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configuração da senha secreta
const SECRET_KEY = 'CardosoFernandoCarlos';

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
    const id = req.query.id;
    res.sendFile(path.join(__dirname, 'public', 'verificar.html'));
});

// Página de Contagem Regressiva
app.get('/contar', (req, res) => {
    const id = req.query.id;
    res.sendFile(path.join(__dirname, 'public', 'contar.html'));
});

// Página de Captcha
app.get('/captcha', (req, res) => {
    const id = req.query.id;
    res.sendFile(path.join(__dirname, 'public', 'captcha.html'));
});

// Página de Download
app.get('/download', (req, res) => {
    const id = req.query.id;
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// Rota para obter o longo URL
app.get('/get-long-url', (req, res) => {
    const id = req.query.id;
    const urlsFile = path.join(__dirname, 'urls.json');

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

    // Verifica se a senha secreta está correta
    if (secretKey !== SECRET_KEY) {
        return res.status(401).send('Senha secreta incorreta.');
    }

    if (!url) {
        return res.status(400).send('URL é obrigatória.');
    }

    const id = generateId();
    const shortUrl = `https://encurtadordelinksmoz.vercel.app/verificar?id=${id}`;

    // Salva o URL encurtado em um arquivo JSON
    const urlsFile = path.join(__dirname, 'urls.json');
    let urls = {};
    if (fs.existsSync(urlsFile)) {
        const fileContent = fs.readFileSync(urlsFile, 'utf8');
        urls = fileContent ? JSON.parse(fileContent) : {};
    }

    urls[id] = url;
    fs.writeFileSync(urlsFile, JSON.stringify(urls, null, 2));

    res.send(`URL encurtado: <a href="${shortUrl}">${shortUrl}</a>`);
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta:${port}`);
});
