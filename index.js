require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 3000;

// Configuração do Firebase
const firebaseConfig = {
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
};

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Configuração das Sessões
app.use(session({
    secret: process.env.SESSION_SECRET || 'dosoaprendizmoztudonet',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }  // 10 minutos
}));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));  // Serve arquivos estáticos

// Rota para a raiz da aplicação
app.get('/', (req, res) => {
    res.redirect('/shorten');
});

// Página para encurtar links
app.get('/shorten', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'shorten.html'));
});

// Endpoint para encurtar e armazenar link
app.post('/shorten', async (req, res) => {
    const originalUrl = req.body.url;
    const customAlias = req.body.alias || Math.random().toString(36).substring(2, 8);
    const db = admin.database();
    const ref = db.ref(`links/${customAlias}`);

    try {
        const snapshot = await ref.once('value');
        if (snapshot.exists()) {
            res.redirect(`/response.html?status=error&message=${encodeURIComponent('Alias já está em uso. Tente outro.')}`);
        } else {
            await ref.set({ originalUrl, createdAt: Date.now() });
            res.redirect(`/response.html?status=success&message=${encodeURIComponent(`/ver/${customAlias}`)}`);
        }
    } catch (error) {
        console.error('Erro ao encurtar o link:', error);
        res.redirect(`/response.html?status=error&message=${encodeURIComponent('Erro ao encurtar o link.')}`);
    }
});


// Rota para fornecer dados dos anúncios a partir de um arquivo JSON
app.get('/api/ads', (req, res) => {
    const adsFilePath = path.join(__dirname, 'public', 'ads', 'ads.json');
    fs.readFile(adsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de anúncios:', err);
            return res.status(500).json({ error: 'Erro ao carregar anúncios' });
        }

        try {
            const ads = JSON.parse(data);
            if (ads.length === 0) {
                return res.status(404).json({ error: 'Nenhum anúncio encontrado' });
            }

            // Escolher um anúncio aleatório do arquivo JSON
            const randomAd = ads[Math.floor(Math.random() * ads.length)];
            const imageUrl = `/ads/${randomAd.image}`;  // Caminho para acessar a imagem
            const adLink = randomAd.url;  // URL associado à imagem

            res.json({ image: imageUrl, url: adLink });
        } catch (parseError) {
            console.error('Erro ao analisar o arquivo JSON:', parseError);
            res.status(500).json({ error: 'Erro ao processar anúncios' });
        }
    });
});


// Função para verificar o passo da verificação
const checkVerificationStep = (requiredStep) => (req, res, next) => {
    if (req.session.verifyStep === requiredStep) {
        next();
    } else {
        res.redirect(`/response.html?status=error&message=${encodeURIComponent('Acesso negado. Complete a verificação na página anterior.')}`);
    }
};


// Página de verificação 1
app.get('/ver/:alias', (req, res) => {
    req.session.verifyStep = 1;
    res.sendFile(path.join(__dirname, 'public', 'ver.html'));
});

// Página de verificação 2
app.get('/veri/:alias', checkVerificationStep(1), (req, res) => {
    req.session.verifyStep = 2;
    res.sendFile(path.join(__dirname, 'public', 'veri.html'));
});

// Página de verificação 3
app.get('/verif/:alias', checkVerificationStep(2), (req, res) => {
    req.session.verifyStep = 3;
    res.sendFile(path.join(__dirname, 'public', 'verif.html'));
});

// Endpoint para redirecionar após a verificação
app.get('/redirect/:alias', checkVerificationStep(3), async (req, res) => {
    const alias = req.params.alias;
    const db = admin.database();
    const ref = db.ref(`links/${alias}`);

    try {
        const snapshot = await ref.once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            req.session.destroy();  // Limpa a sessão após a verificação
            res.redirect(data.originalUrl);
        } else {
            res.status(404).send('Link não encontrado!');
        }
    } catch (error) {
        console.error('Erro ao redirecionar:', error);
        res.status(500).send('Erro ao redirecionar.');
    }
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
