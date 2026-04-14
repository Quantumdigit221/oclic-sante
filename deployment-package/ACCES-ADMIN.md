# 🔐 ACCÈS ADMINISTRATEURS O'CLIC SANTE
## sante.quantum221.com

### 👑 SUPER ADMIN

**Identifiants par défaut :**
- **Email** : `admin@sante.quantum221.com`
- **Mot de passe** : `admin123`
- **Rôle** : `SUPER_ADMIN`
- **Privilèges** : Accès total à toute la plateforme

### 🏥 ADMIN CENTRE

**Identifients par défaut :**
- **Email** : `admin@sante.quantum221.com` 
- **Mot de passe** : `admin123`
- **Rôle** : `ADMIN`
- **Privilèges** : Gestion du centre de santé

### 🔄 CHANGEMENT DES MOTS DE PASSE

#### Étape 1 : Première Connexion
1. Accéder : https://sante.quantum221.com
2. Cliquer : "Connexion"
3. Saisir : `admin@sante.quantum221.com` / `admin123`
4. Valider

#### Étape 2 : Mise à Jour Sécurisée
1. Aller : Profil → Paramètres
2. Saisir : Nouveau mot de passe (min 8 caractères)
3. Confirmer : Répéter le mot de passe
4. Sauvegarder

### 👥 AUTRES ROLES

#### 🩺 MÉDECIN (DOCTOR)
- Email : À créer via admin
- Accès : Consultations, ordonnances, examens
- Pas d'accès administration

#### 📋 RÉCEPTIONNISTE (RECEPTIONIST)  
- Email : À créer via admin
- Accès : File d'attente, tickets, patients
- Pas d'accès consultations médicales

#### 💊 PHARMACIEN (PHARMACIST)
- Email : À créer via admin
- Accès : Gestion pharmacie, stocks
- Pas d'accès consultations

### 🔧 CRÉATION UTILISATEURS

#### Via Super Admin
1. Menu : Administration → Utilisateurs
2. Cliquer : "Ajouter un utilisateur"
3. Remplir : Nom, email, rôle, centre
4. Générer : Mot de passe temporaire
5. Notifier : Envoyer par email

#### Rôles Disponibles
- `SUPER_ADMIN` : Contrôle total
- `ADMIN` : Gestion centre
- `DOCTOR` : Consultations médicales
- `RECEPTIONIST` : Accueil et tickets
- `PHARMACIST` : Gestion pharmacie

### 🚨 SÉCURITÉ RECOMMANDÉE

#### Mots de Passe Forts
- Minimum 8 caractères
- Majuscules + minuscules
- Chiffres + caractères spéciaux
- Exemple : `O'CLIC@2024!Santé`

#### Double Authentification
- Activer 2FA si disponible
- Codes de secours sauvegardés
- Session limitée à 2 heures

#### Permissions par Rôle
| Rôle | Patients | Tickets | Consultations | Admin | API |
|-------|----------|----------|----------------|--------|-----|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | 📊 | ✅ | 📊 |
| DOCTOR | ✅ | ✅ | ✅ | ❌ | 🩺 |
| RECEPTIONIST | ✅ | ✅ | ❌ | ❌ | 📋 |
| PHARMACIST | 📊 | 📊 | ❌ | ❌ | 💊 |

### 📞 SUPPORT ACCÈS

#### Problèmes Connexion
- **Email incorrect** : Vérifier base de données
- **Mot de passe oublié** : Réinitialiser via admin
- **Compte bloqué** : Vérifier logs sécurité
- **Permission refusée** : Vérifier rôle utilisateur

#### Logs de Sécurité
- Connexions réussies/échouées
- Tentatives d'accès non autorisées
- Changements de permissions
- Actions administratives critiques

### 🔐 BONNES PRATIQUES

#### Administrateurs
- Changer mot de passe tous les 3 mois
- Ne jamais partager identifiants
- Utiliser VPN pour accès distant
- Activer alerts de sécurité

#### Utilisateurs Standards
- Mot de passe unique par utilisateur
- Droits minimum nécessaires (principe PoLP)
- Révocation accès immédiate si départ
- Formation sécurité obligatoire

---

**O'CLIC SANTE** - Gestion Sécurisée des Accès 🔐
🌐 https://sante.quantum221.com
📞 Support : consulter documentation technique
