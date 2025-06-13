const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const pastaDestino = path.resolve(__dirname, '../../img/noticias');

if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaDestino);
    },
    filename: function (req, file, cb) {
        const nomeArquivo = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
        cb(null, nomeArquivo);
    }
});
const upload = multer({ storage: storage });

app.post('/upload-noticia', upload.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const caminhoImagem = `assets/img/noticias/${req.file.filename}`;
    res.json({ imageUrl: caminhoImagem });
});

app.use('/assets/img/noticias', express.static(pastaDestino));

const PORT = 4001;
app.listen(PORT, () => {
    console.log(`Servidor de upload de notícias rodando em http://localhost:${PORT}`);
});
