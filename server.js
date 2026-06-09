// ─────────────────────────────────────────────────────────
//  MongoDB Chat CRUD — server.js
//  Grupo 9 | Tema 2 — Document Store
//  Rotas: POST /messages  (INSERT)
//         GET  /messages  (FIND)
//         PUT  /messages/:id  (UPDATE)
//         DELETE /messages/:id  (DELETE soft)
//         DELETE /messages  (DELETE all — limpar coleção)
// ─────────────────────────────────────────────────────────

require('dotenv').config();
const express    = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const URI  = process.env.MONGODB_URI;

if (!URI || URI.includes('SEU_USUARIO')) {
  console.error('\n❌  Configure o arquivo .env com sua MONGODB_URI antes de iniciar.\n');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Conexão MongoDB ───────────────────────────────────────
let db;
const client = new MongoClient(URI, { tls: true, tlsAllowInvalidCertificates: true });

async function connect() {
  await client.connect();
  db = client.db(); // usa o db definido na URI (chatdb)
  console.log('✅  Conectado ao MongoDB:', db.databaseName);

  // Índice para queries por room + timestamp
  await db.collection('messages').createIndex({ room: 1, timestamp: -1 });
}

function col() {
  return db.collection('messages');
}

// ── INSERT ────────────────────────────────────────────────
// POST /messages
// Body: { room, author: { id, name, avatar, initials }, text }
app.post('/messages', async (req, res) => {
  try {
    const { room, author, text } = req.body;
    if (!room || !author || !text) {
      return res.status(400).json({ error: 'room, author e text são obrigatórios' });
    }

    const doc = {
      room,
      author,
      text,
      timestamp: new Date(),
      edited:    false,
      deleted:   false
    };

    const result = await col().insertOne(doc);
    doc._id = result.insertedId;

    console.log(`[INSERT] _id=${result.insertedId} room=${room} author=${author.name}`);
    res.status(201).json(doc);
  } catch (err) {
    console.error('[INSERT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── FIND ──────────────────────────────────────────────────
// GET /messages?room=geral
app.get('/messages', async (req, res) => {
  try {
    const room = req.query.room || 'geral';
    const messages = await col()
      .find({ room })
      .sort({ timestamp: 1 })
      .toArray();

    console.log(`[FIND] room=${room} total=${messages.length}`);
    res.json(messages);
  } catch (err) {
    console.error('[FIND ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE ────────────────────────────────────────────────
// PUT /messages/:id
// Body: { text }
app.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text é obrigatório' });

    const result = await col().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { text, edited: true, editedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ error: 'Mensagem não encontrada' });

    console.log(`[UPDATE] _id=${id} newText="${text.substring(0, 40)}"`);
    res.json(result);
  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE (soft) ─────────────────────────────────────────
// DELETE /messages/:id
// Documento permanece na coleção com deleted: true
app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await col().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { deleted: true, deletedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ error: 'Mensagem não encontrada' });

    console.log(`[DELETE soft] _id=${id}`);
    res.json(result);
  } catch (err) {
    console.error('[DELETE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE ALL ────────────────────────────────────────────
// DELETE /messages  (limpar coleção inteira)
app.delete('/messages', async (req, res) => {
  try {
    const result = await col().deleteMany({});
    console.log(`[DELETE ALL] removidos=${result.deletedCount}`);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error('[DELETE ALL ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────
connect().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀  Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌  Falha ao conectar ao MongoDB:', err.message);
  process.exit(1);
});
