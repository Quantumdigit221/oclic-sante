import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  if (req.body) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Login ultra simple
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:');
  console.log('- Email:', email);
  console.log('- Password:', password);
  console.log('- Email check:', email === 'admin@sante.quantum221.com');
  console.log('- Password check:', password === 'admin123');
  
  if (email === 'admin@sante.quantum221.com' && password === 'admin123') {
    console.log('✅ Login SUCCESS');
    return res.json({
      success: true,
      message: 'Connexion réussie',
      token: 'fake-jwt-token-' + Date.now(),
      user: {
        id: 'admin-001',
        name: 'Administrateur',
        email: email,
        role: 'SUPER_ADMIN'
      }
    });
  }
  
  console.log('❌ Login FAILED');
  return res.status(401).json({
    success: false,
    message: 'Email ou mot de passe incorrect'
  });
});

// API endpoints
app.get('/api/services', (req, res) => {
  res.json({ services: [{ id: '1', name: 'Consultation', price: 5000 }] });
});

app.get('/api/tickets', (req, res) => {
  res.json({ tickets: [{ id: '1', patient: 'Test', status: 'WAITING' }] });
});

app.get('/api/patients', (req, res) => {
  res.json({ patients: [{ id: '1', name: 'Jean Test' }] });
});

app.get('/api/medicines', (req, res) => {
  res.json({ medicines: [{ id: '1', name: 'Paracétamol' }] });
});

app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: '1', name: 'Admin', role: 'SUPER_ADMIN' }] });
});

app.get('/api/consultations', (req, res) => {
  res.json({ consultations: [{ id: '1', patient: 'Test' }] });
});

app.get('/api/lab-results', (req, res) => {
  res.json({ labResults: [{ id: '1', result: 'Normal' }] });
});

app.get('/api/sales', (req, res) => {
  res.json({ sales: [{ id: '1', amount: 5000 }] });
});

// Servir les fichiers statiques
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`🚀 Minimal Server démarré sur http://localhost:${PORT}`);
  console.log(`Login: admin@sante.quantum221.com / admin123`);
});
