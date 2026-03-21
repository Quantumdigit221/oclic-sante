# Guide de Déploiement O'CLIC SANTE sur Render

Ce guide détaille les étapes pour déployer l'application sur le service Cloud Render avec une base de données MySQL distante.

## 1. Préparation de la Base de Données Distante
Utilisez un service comme **Aiven.io**, **PlanetScale**, **TiDB Cloud** ou une instance MySQL gérée sur **Render**.

- Récupérez votre chaîne de connexion (URI). 
- Format habituel : `mysql://utilisateur:mot_de_passe@host:port/nom_base`

## 2. Configuration sur Render
Créez un nouveau **Web Service** sur Render et liez-le à votre dépôt GitHub.

### Paramètres de Construction (Settings)
- **Environment** : `Node`
- **Build Command** : `npm install`
- **Start Command** : `npm start`

### Variables d'Environnement (Advanced)
Ajoutez les variables suivantes dans la section "Environment Variables" :

| Clé | Valeur | Note |
|---|---|---|
| `PORT` | `10000` | Render l'assigne automatiquement, laissez le système faire ou mettez 10000. |
| `DATABASE_URL` | `mysql://...` | Votre chaîne de connexion MySQL complète. |
| `JWT_SECRET` | `votre_secret_tres_long` | Une clé aléatoire pour sécuriser les tokens. |
| `NODE_ENV` | `production` | Pour activer les optimisations de performance. |
| `FRONTEND_URL` | `https://votre-app.render.com` | L'URL finale de votre application. |

## 3. Déploiement
Render va automatiquement détecter le changement sur la branche `main`, installer les dépendances et démarrer le serveur.

### Vérification
- Une fois le déploiement terminé (statut "Live"), ouvrez l'URL fournie par Render.
- L'application créera automatiquement les tables nécessaires lors du premier démarrage grâce à la fonction `initializeDatabase()`.

## 4. Maintenance
- Pour mettre à jour l'application, effectuez simplement un `git push` sur votre dépôt GitHub.
- Surveillez les logs dans l'onglet "Events" de Render en cas d'erreur de connexion à la base de données.
