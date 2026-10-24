server.js
const express = require('express');
const os = require('os');
 
const app = express();
const PUERTO = process.env.PORT || 3000;
const iniciado = new Date().toISOString();
const mensajes = [];
 
app.use(express.json());
app.use(express.static('public'));
 
app.get('/health', (req, res) => res.json({ estado: 'ok' }));
 
app.get('/info', (req, res) => res.json({
  servidor: os.hostname(),
  node: process.version,
  iniciado,
  entorno: process.env.NODE_ENV || 'desarrollo'
}));
 
app.get('/api/mensajes', (req, res) => res.json(mensajes));
 
app.post('/api/mensajes', (req, res) => {
  const { nombre, texto } = req.body;
  if (!nombre || !texto) return res.status(400).json({ error: 'Faltan datos' });
  mensajes.push({ nombre: String(nombre).slice(0, 30), texto: String(texto).slice(0, 140) });
  if (mensajes.length > 50) mensajes.shift();
  res.status(201).json({ ok: true });
});
 
app.listen(PUERTO, '0.0.0.0', () => console.log('Escuchando en el puerto ' + PUERTO));
 
public/index.html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Muro de la clase</title>
</head>
<body style="font-family:sans-serif;max-width:560px;margin:2rem auto;padding:0 1rem">
  <h1>Muro de la clase</h1>
  <p id="nodo">Cargando información del servidor...</p>
  <form id="f">
    <input id="nombre" placeholder="Tu nombre" required>
    <input id="texto" placeholder="Tu mensaje" required>
    <button>Enviar</button>
  </form>
  <ul id="lista"></ul>
  <script>
    async function cargar() {
      const info = await (await fetch('/info')).json();
      document.getElementById('nodo').textContent =
        'Servidor: ' + info.servidor + ' · Node ' + info.node + ' · encendido desde ' + info.iniciado;
      const msgs = await (await fetch('/api/mensajes')).json();
      const ul = document.getElementById('lista');
      ul.innerHTML = '';
      msgs.forEach(function (m) {
        const li = document.createElement('li');
        li.textContent = m.nombre + ': ' + m.texto;
        ul.appendChild(li);
      });
    }
    document.getElementById('f').addEventListener('submit', async function (e) {
      e.preventDefault();
      await fetch('/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: document.getElementById('nombre').value,
          texto: document.getElementById('texto').value
        })
      });
      document.getElementById('texto').value = '';
      cargar();
    });
    cargar();
  </script>
</body>
</html>
 
