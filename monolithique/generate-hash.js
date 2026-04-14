import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash for admin123:', hash);

// Vérifier
const isValid = bcrypt.compareSync(password, hash);
console.log('Verification:', isValid);
