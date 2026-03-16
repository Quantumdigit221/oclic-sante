// Serveur Ultra Simple pour Debug
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'test_secret';

app.use(cors());
app.use(express.json());

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ultra Simple Server' });
});

// Login ultra simple
app.post('/api/login', (req, res) => {
  console.log('=== LOGIN DEBUG ===');
  const { email, password } = req.body;
  
  console.log('Email reçu:', email);
  console.log('Password reçu:', password);
  console.log('Email === "admin@sante.quantum221.com":', email === 'admin@sante.quantum221.com');
  console.log('Password === "admin123":', password === 'admin123');
  
  if (email === 'admin@sante.quantum221.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'ADMIN' }, JWT_SECRET);
    console.log('✅ Login réussi!');
    return res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: { email, role: 'ADMIN' }
    });
  }
  
  console.log('❌ Login échoué');
  return res.status(401).json({
    success: false,
    message: 'Email ou mot de passe incorrect'
  });
});

// Routes de test
app.get('/api/tickets', (req, res) => {
  res.json({ tickets: [{ id: '1', patient: 'Test' }] });
});

// Servir les fichiers statiques
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`🚀 Ultra Simple Server démarré sur http://localhost:${PORT}`);
  console.log(`Login: admin@sante.quantum221.com / admin123`);
});
