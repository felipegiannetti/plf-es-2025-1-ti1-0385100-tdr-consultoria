const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Caminho absoluto para salvar as imagens em: public/assets/img/eventos
const pastaDestino = path.resolve(__dirname, '../../img/eventos');


// Servir as imagens publicamente via /assets/img/eventos
app.use('/assets/img/eventos', express.static(pastaDestino));

// Configuração do multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaDestino);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});

const upload = multer({ storage: storage });

// Rota de upload
app.post('/upload', upload.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    // Caminho que será usado no src do HTML
    const imagePath = `assets/img/eventos/${req.file.filename}`;
    console.log('Imagem salva em:', imagePath);
    res.json({ imageUrl: imagePath });
});

// Iniciar o servidor
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor de upload rodando em http://localhost:${PORT}`);
});
