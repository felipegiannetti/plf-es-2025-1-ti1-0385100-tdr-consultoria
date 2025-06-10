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

eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let imageUrl = imagemAtual; 
    const fileInput = document.getElementById('imagem');
    if (fileInput.files && fileInput.files[0]) {
        imageUrl = await uploadImagem(fileInput.files[0]);
    }

    const eventData = {
        id: document.getElementById('eventId').value || String(Date.now()),
        titulo: document.getElementById('titulo').value,
        data: new Date(document.getElementById('data').value).toISOString(),
        descricao: document.getElementById('descricao').value,
        categoria: document.getElementById('categoria').value,
        local: document.getElementById('local').value,
        localmapa: document.getElementById('localmapa').value,
        imagem: imageUrl,
        vagas: parseInt(document.getElementById('vagas').value),
        preco: parseFloat(document.getElementById('preco').value)
    };

    console.log('Evento a ser salvo:', eventData);

    const eventId = document.getElementById('eventId').value;
    const method = eventId ? 'PUT' : 'POST';
    const url = eventId ? `${API_URL}/eventos/${eventData.id}` : `${API_URL}/eventos`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert(eventId ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
        clearForm();
        loadEvents();
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        alert('Erro ao salvar evento: ' + error.message);
    }
});