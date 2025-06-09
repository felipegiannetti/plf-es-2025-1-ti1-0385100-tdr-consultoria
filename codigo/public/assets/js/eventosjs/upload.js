const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use('/public/assets/img/eventos', express.static(path.join(__dirname, 'public/assets/img/eventos')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/img/eventos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('imagem'), (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');
    res.json({ imageUrl: `/public/assets/img/eventos/${req.file.filename}` });
});

app.listen(4000, () => console.log('Servidor de upload rodando na porta 4000'));