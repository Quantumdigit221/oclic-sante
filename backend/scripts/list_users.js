import mysql from 'mysql2/promise';

async function listUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'sante_saas'
  });

  try {
    console.log('=== LISTE DES UTILISATEURS ===\n');
    
    const [users] = await connection.execute('SELECT id, name, email, role, phone, centerId, created_at FROM users ORDER BY role, name');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔑 Rôle: ${user.role}`);
      console.log(`   📱 Téléphone: ${user.phone || 'Non renseigné'}`);
      console.log(`   🏥 Centre ID: ${user.centerId || 'Aucun'}`);
      console.log(`   📅 Créé le: ${new Date(user.created_at).toLocaleString('fr-FR')}`);
      console.log('');
    });

    // Résumé par rôle
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    console.log('=== RÉSUMÉ PAR RÔLE ===');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`🔹 ${role}: ${count} utilisateur(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

listUsers().catch(console.error);
