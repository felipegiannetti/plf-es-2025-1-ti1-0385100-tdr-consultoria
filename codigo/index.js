// Trabalho Interdisciplinar 1 - Aplicações Web
//
// Esse módulo implementa uma API RESTful baseada no JSONServer
// O servidor JSONServer fica hospedado na seguinte URL
// https://jsonserver.rommelpuc.repl.co/contatos
//
// Para montar um servidor para o seu projeto, acesse o projeto 
// do JSONServer no Replit, faça o FORK do projeto e altere o 
// arquivo db.json para incluir os dados do seu projeto.
//
// URL Projeto JSONServer: https://replit.com/@rommelpuc/JSONServer
//
// Autor: Rommel Vieira Carneiro
// Data: 03/10/2023

const jsonServer = require('json-server')
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// Criar servidor Express
const server = express()
server.use(cors())

// Configurar JSON Server
const jsonServerRouter = jsonServer.router('./db/db.json', { readOnly: false })
const jsonServerMiddlewares = jsonServer.defaults({ noCors: true })

// Configurar pastas para upload
const eventosPath = path.join(__dirname, 'public/assets/img/eventos')
const noticiasPath = path.join(__dirname, 'public/assets/img/noticias')

// Criar diretórios se não existirem
;[eventosPath, noticiasPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
})

// Configurar storage para eventos
const eventoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, eventosPath),
    filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname.replace(/\s/g, '_')
        cb(null, filename)
    }
})

// Configurar storage para notícias
const noticiaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, noticiasPath),
    filename: (req, file, cb) => {
        const filename = Date.now() + '-' + file.originalname.replace(/\s/g, '_')
        cb(null, filename)
    }
})

const uploadEventos = multer({ storage: eventoStorage })
const uploadNoticias = multer({ storage: noticiaStorage })

// Rotas para upload
server.post('/upload-evento', uploadEventos.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' })
    }
    const caminhoImagem = `assets/img/eventos/${req.file.filename}`
    res.json({ imageUrl: caminhoImagem })
})

server.post('/upload-noticia', uploadNoticias.single('imagem'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' })
    }
    const caminhoImagem = `assets/img/noticias/${req.file.filename}`
    res.json({ imageUrl: caminhoImagem })
})

// Servir arquivos estáticos
server.use('/assets/img/eventos', express.static(eventosPath))
server.use('/assets/img/noticias', express.static(noticiasPath))

// Usar middlewares do JSON Server
server.use(jsonServerMiddlewares)
server.use(jsonServerRouter)

// Iniciar servidor
const PORT = 3000
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
    console.log(`- API REST (db.json) disponível`)
    console.log(`- Upload de eventos em /upload-evento`)
    console.log(`- Upload de notícias em /upload-noticia`)
})