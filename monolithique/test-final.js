// Test du login (mot de passe via TEST_ADMIN_PASSWORD dans .env — ne pas commiter de secret)
import 'dotenv/config';

const password = process.env.TEST_ADMIN_PASSWORD;
if (!password) {
  console.error('Définir TEST_ADMIN_PASSWORD dans l\'environnement ou dans .env pour ce script.');
  process.exit(1);
}

const email = process.env.TEST_ADMIN_EMAIL || 'admin@sante.quantum221.com';

fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
})
  .then(response => response.json())
  .then(data => {
    console.log('Login result:', data);
    if (data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token.substring(0, 50) + '...');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  })
  .catch(error => console.error('Error:', error));
