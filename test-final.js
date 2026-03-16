// Test final du login
fetch('http://localhost:3000/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@sante.quantum221.com',
    password: 'admin123'
  })
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
