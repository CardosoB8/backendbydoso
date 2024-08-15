const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config();

// Inicialize o Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
const app = express();

// Configuração das variáveis de ambiente
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

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
app.get('/get-long-url', async (req, res) => {
    const id = req.query.id;

    try {
        const snapshot = await db.ref('urls/' + id).once('value');
        const longUrl = snapshot.val();

        if (longUrl) {
            res.send(longUrl);
        } else {
            res.status(404).send('URL não encontrada.');
        }
    } catch (error) {
        console.error('Erro ao acessar o Firebase:', error);
        res.status(500).send('Erro ao acessar o banco de dados.');
    }
});

// Rota para encurtar URLs
app.post('/encurtar', async (req, res) => {
    const { url, secretKey } = req.body;

    if (secretKey !== SECRET_KEY) {
        return res.status(401).send('Senha secreta incorreta.');
    }

    if (!url) {
        return res.status(400).send('URL é obrigatória.');
    }

    const id = generateId();
    const shortUrl = `https://encurtadordelinksmoz.vercel.app/verificar?id=${id}`;

    try {
        await db.ref('urls/' + id).set(url);
        res.send(`URL encurtado: <a href="${shortUrl}">${shortUrl}</a>`);
    } catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
        res.status(500).send('Erro ao salvar a URL.');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
