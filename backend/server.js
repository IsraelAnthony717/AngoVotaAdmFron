const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3003;
const upload = multer();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database file
const DB_FILE = path.join(__dirname, 'candidatos.json');

// Initialize database
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Helper functions
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes for candidatos
// GET /candidato - get all candidatos
app.get('/candidato', (req, res) => {
  try {
    const candidatos = readDatabase();
    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /candidatos - alias for /candidato
app.get('/candidatos', (req, res) => {
  try {
    const candidatos = readDatabase();
    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /candidato - create new candidato
app.post('/candidato', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { nome, partido, numero, cor } = req.body;
    const newCandidato = {
      id: Date.now(), // Simple ID generation
      nome,
      partido,
      numero,
      cor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    candidatos.push(newCandidato);
    writeDatabase(candidatos);
    res.json(newCandidato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /candidatos - alias for /candidato
app.post('/candidatos', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { nome, partido, numero, cor } = req.body;
    const newCandidato = {
      id: Date.now(), // Simple ID generation
      nome,
      partido,
      numero,
      cor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    candidatos.push(newCandidato);
    writeDatabase(candidatos);
    res.json(newCandidato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /candidato/criar - alias for /candidato
app.post('/candidato/criar', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { nome, partido, numero, cor } = req.body;
    const newCandidato = {
      id: Date.now(),
      nome,
      partido,
      numero,
      cor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    candidatos.push(newCandidato);
    writeDatabase(candidatos);
    res.json(newCandidato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /candidatos/criar - alias for /candidatos
app.post('/candidatos/criar', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { nome, partido, numero, cor } = req.body;
    const newCandidato = {
      id: Date.now(),
      nome,
      partido,
      numero,
      cor,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    candidatos.push(newCandidato);
    writeDatabase(candidatos);
    res.json(newCandidato);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /candidato/:id - update candidato
app.put('/candidato/:id', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const { nome, partido, numero, cor } = req.body;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos[index] = { ...candidatos[index], nome, partido, numero, cor, updated_at: new Date().toISOString() };
      writeDatabase(candidatos);
      res.json(candidatos[index]);
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /candidatos/:id - alias for /candidato/:id
app.put('/candidatos/:id', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const { nome, partido, numero, cor } = req.body;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos[index] = { ...candidatos[index], nome, partido, numero, cor, updated_at: new Date().toISOString() };
      writeDatabase(candidatos);
      res.json(candidatos[index]);
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /candidato/atualizar/:id - alternative update route
app.put('/candidato/atualizar/:id', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const { nome, partido, numero, cor } = req.body;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos[index] = { ...candidatos[index], nome, partido, numero, cor, updated_at: new Date().toISOString() };
      writeDatabase(candidatos);
      res.json(candidatos[index]);
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /candidatos/atualizar/:id - alternative update route
app.put('/candidatos/atualizar/:id', upload.any(), (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const { nome, partido, numero, cor } = req.body;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos[index] = { ...candidatos[index], nome, partido, numero, cor, updated_at: new Date().toISOString() };
      writeDatabase(candidatos);
      res.json(candidatos[index]);
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /candidato/:id - delete candidato
app.delete('/candidato/:id', (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos.splice(index, 1);
      writeDatabase(candidatos);
      res.json({ message: 'Candidato deleted successfully' });
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /candidatos/:id - alias for /candidato/:id
app.delete('/candidatos/:id', (req, res) => {
  try {
    const candidatos = readDatabase();
    const { id } = req.params;
    const index = candidatos.findIndex(c => c.id == id);
    if (index !== -1) {
      candidatos.splice(index, 1);
      writeDatabase(candidatos);
      res.json({ message: 'Candidato deleted successfully' });
    } else {
      res.status(404).json({ error: 'Candidato not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
