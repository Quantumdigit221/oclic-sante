# 🚀 Guide d'Installation - Intégration IA Réelle

## 📋 Prérequis

### 1. Compte Google Cloud Platform
- Créer un compte sur [Google Cloud Console](https://console.cloud.google.com/)
- Activer l'API Vertex AI
- Créer un projet (ou utiliser un projet existant)

### 2. Clé API DeepMind
- Générer une clé d'authentification
- Configurer les permissions pour Vertex AI

## ⚙️ Configuration Étape par Étape

### Étape 1: Variables d'Environnement

1. **Copiez le fichier d'exemple** :
```bash
cp .env.example .env.local
```

2. **Configurez vos clés** dans `.env.local` :
```bash
# Mode de fonctionnement
REACT_APP_USE_REAL_AI=true

# Configuration Google DeepMind
REACT_APP_DEEPMIND_API_KEY=votre_clé_api_ici
REACT_APP_DEEPMIND_PROJECT_ID=votre_projet_id_ici
REACT_APP_DEEPMIND_LOCATION=us-central1
```

### Étape 2: Installation des Dépendances

```bash
# Installer les packages Google Cloud
npm install @google-cloud/vertexai

# Ou avec yarn
yarn add @google-cloud/vertexai
```

### Étape 3: Test de Connexion

1. **Démarrez l'application** :
```bash
npm start
```

2. **Testez la connexion** dans la console du navigateur :
```javascript
// Dans la console du navigateur
import('./services/realAIDiagnosisService').then(module => {
  const service = new module.RealAIDiagnosisService();
  service.testConnection().then(result => {
    console.log('Connection test:', result);
  });
});
```

### Étape 4: Validation

1. **Allez dans Diagnostic IA** dans l'application
2. **Téléchargez une image médicale**
3. **Cliquez sur "Analyse détaillée"**
4. **Vérifiez la console** pour voir :
   ```
   🚀 Using real AI API for analysis...
   ```

## 🔧 Dépannage

### Problèmes Courants

#### ❌ "Configuration DeepMind manquante"
**Solution** : Vérifiez que les variables d'environnement sont correctement configurées

#### ❌ "Erreur 403 Forbidden"
**Solution** : 
- Vérifiez que votre clé API est valide
- Assurez-vous que l'API Vertex AI est activée
- Vérifiez les permissions du compte de service

#### ❌ "Erreur 429 Too Many Requests"
**Solution** : 
- Attendez quelques minutes
- Augmentez les quotas dans Google Cloud Console
- Implémentez un retry avec délai

#### ❌ "Fallback to simulation"
**Solution** : L'API a échoué, vérifiez les logs pour l'erreur exacte

### Logs Utiles

Dans la console du navigateur, recherchez :
- `🚀 Using real AI API` : Confirme l'utilisation de l'API réelle
- `🎭 Using simulation mode` : Mode simulation activé
- `Real AI failed, falling back to simulation` : Erreur API avec fallback

## 🧪 Test avec une vraie image

### Image de test
Utilisez une radiographie thoracique standard pour tester :

1. **Téléchargez l'image**
2. **Sélectionnez "Radiographie"**
3. **Lancez "Analyse détaillée"**
4. **Vérifiez les résultats** :
   - Temps de traitement : 5-15 secondes
   - Résultats structurés en JSON
   - Terminologie médicale précise

### Résultats attendus

```json
{
  "findings": [
    {
      "type": "Opacité pulmonaire",
      "description": "Zone d'opacité détectée...",
      "confidence": 0.87,
      "location": "Lobe supérieur droit",
      "severity": "moderate"
    }
  ],
  "overallAssessment": {
    "impression": "Analyse radiologique complète...",
    "confidence": 0.85,
    "urgency": "medium"
  }
}
```

## 📊 Monitoring

### Métriques à surveiller
- **Temps de réponse** : 5-15 secondes normal
- **Taux de réussite** : >95%
- **Coûts** : ~$0.0025 par 1K tokens

### Alertes
Configurez des alertes pour :
- Erreurs >5%
- Temps de réponse >30s
- Coûts mensuels > budget

## 🔒 Sécurité

### Bonnes pratiques
- **Ne jamais** commiter les clés API dans Git
- **Utiliser** des variables d'environnement
- **Limiter** les permissions du compte de service
- **Surveiller** l'utilisation des API

### Rotation des clés
- Changez les clés API tous les 90 jours
- Utilisez des clés différentes pour dev/prod
- Documentez les rotations

## 💰 Coûts Estimés

### Google DeepMind Gemini
- **Prix** : ~$0.0025 par 1K tokens
- **Usage typique** : 500-2000 tokens par analyse
- **Coût par analyse** : $0.001 - $0.005
- **100 analyses/mois** : ~$0.10 - $0.50

### Budget recommandé
- **Développement** : $10/mois
- **Production** : $50-100/mois
- **Monitoring** : Actif pour éviter les surcoûts

## 🎯 Prochaines Étapes

1. **Test complet** avec plusieurs types d'images
2. **Validation médicale** avec des radiologues
3. **Optimisation** des prompts pour meilleurs résultats
4. **Monitoring** des coûts et performance
5. **Déploiement** en production

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez les logs** du navigateur
2. **Vérifiez la configuration** Google Cloud
3. **Testez avec une image simple**
4. **Contactez le support** technique

---

*L'intégration réelle transforme votre application de démo en outil médical professionnel. Prenez le temps de bien configurer et tester chaque étape.*
