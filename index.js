const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config();

// Inicialize o Firebase Admin SDK com variáveis de ambiente
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
const app = express();

// Configuração das variáveis de ambiente
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para gerar um ID único
function generateId(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Página Inicial (Index como "home")
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Página de Verificação
app.get('/net', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'net.html'));
});

// Página de Contagem Regressiva
app.get('/c', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'c.html'));
});

// Página de Captcha
app.get('/ca', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ca.html'));
});

// Página de Download
app.get('/d', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'd.html'));
});

// Página de FAQ
app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

// Página de Política de Privacidade
app.get('/politicas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'politicas.html'));
});

// Página de Termos de Uso
app.get('/termos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termos.html'));
});

// Página de Short
app.get('/short', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'short.html'));
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
  const { url } = req.body;

  if (!url) {
    return res.status(400).send('URL é obrigatória.');
  }

  const id = generateId();
  const shortUrl = `https://mznet.vercel.app/net?id=${id}`;

  try {
    await db.ref('urls/' + id).set(url);
    res.send(shortUrl); // Envia apenas a URL encurtada
  } catch (error) {
    console.error('Erro ao salvar no Firebase:', error);
    res.status(500).send('Erro ao salvar a URL.');
  }
});

// Middleware para rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'error.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
