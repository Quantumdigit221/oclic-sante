import mysql from 'mysql2/promise';

async function testLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'sante_saas'
  });

  try {
    const email = 'superadmin@sante.sn';
    const password = 'demo123';
    
    console.log('=== TEST DE CONNEXION ===\n');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log('');

    // Vérifier si l'utilisateur existe
    const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé dans la base de données');
      return;
    }

    const user = users[0];
    console.log('✅ Utilisateur trouvé:');
    console.log(`   👤 Nom: ${user.name}`);
    console.log(`   🔑 Rôle: ${user.role}`);
    console.log(`   🔒 Mot de passe dans DB: "${user.password}"`);
    console.log(`   🏥 Centre ID: ${user.centerId || 'Aucun'}`);
    console.log('');

    // Test de la logique de connexion du backend
    const loginSuccess = user && password === user.password;
    
    console.log('=== VÉRIFICATION DE LA CONNEXION ===');
    console.log(`🔍 Utilisateur trouvé: ${!!user}`);
    console.log(`🔍 Mot de passe correct: ${password === user.password}`);
    console.log(`🎯 Connexion réussie: ${loginSuccess}`);
    
    if (!loginSuccess) {
      console.log('\n❌ PROBLÈME DÉTECTÉ:');
      if (password !== user.password) {
        console.log('   💡 Le mot de passe ne correspond pas');
        console.log(`   📝 Attendu: "${user.password}"`);
        console.log(`   📝 Reçu: "${password}"`);
      }
    } else {
      console.log('\n✅ La connexion devrait fonctionner !');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

testLogin().catch(console.error);
