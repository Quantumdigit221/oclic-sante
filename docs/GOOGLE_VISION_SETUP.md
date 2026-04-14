# Guide d'Intégration Google Cloud Vision API

## 🎯 Objectif
Intégrer Google Cloud Vision API pour analyser automatiquement les documents médicaux (ordonnances, résultats d'examens, analyses).

## 📋 Prérequis
- Compte Google Cloud Platform
- Projet Google Cloud actif
- Carte de crédit (pour l'activation, mais des crédits gratuits sont disponibles)

## 🔧 Étapes de Configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur la liste déroulante des projets en haut
3. Cliquez sur "Nouveau projet"
4. Donnez un nom : `sante-saas-vision`
5. Cliquez sur "Créer"

### 2. Activer les APIs nécessaires

1. Dans votre projet, allez à "API et services" > "Bibliothèque"
2. Recherchez et activez ces APIs :
   - **Cloud Vision API**
   - **Cloud Storage API** (optionnel, pour stocker les images)

### 3. Créer une clé API

1. Allez à "API et services" > "Identifiants"
2. Cliquez sur "Créer des identifiants" > "Clé API"
3. Choisissez "Clé API" (pas OAuth)
4. Copiez la clé générée (format : `AIzaSy...`)
5. **Important** : Limitez la clé API pour des raisons de sécurité :
   - Cliquez sur la clé créée
   - Sous "Restrictions d'application", choisissez "Adresses IP HTTP"
   - Ajoutez l'IP de votre serveur
   - Sous "Restrictions d'API", sélectionnez "Cloud Vision API"

### 4. Configurer la facturation

1. Allez à "Facturation" > "Liens de facturation"
2. Ajoutez un moyen de paiement
3. Google offre **$300 de crédits gratuits** pour les nouveaux utilisateurs
4. La Vision API coûte environ **$1.50 pour 1000 traitements**

## 💰 Coûts Estimés

| Service | Coût par 1000 requêtes | Usage mensuel estimé | Coût mensuel |
|---------|----------------------|---------------------|--------------|
| OCR (TEXT_DETECTION) | $1.50 | 1000 documents | $1.50 |
| DOCUMENT_TEXT_DETECTION | $1.50 | 1000 documents | $1.50 |
| **Total** | | | **$3.00** |

## 🔐 Sécurité

### Variables d'environnement
Ajoutez votre clé API dans vos variables d'environnement :

```bash
# .env.local
GOOGLE_VISION_API_KEY=AIzaSyVotreCleIci
```

### Configuration Vite
Dans `vite.config.ts` :

```typescript
export default defineConfig({
  define: {
    'process.env.GOOGLE_VISION_API_KEY': JSON.stringify(process.env.GOOGLE_VISION_API_KEY)
  }
});
```

## 🚀 Utilisation

### 1. Page de test
Accédez à : `http://localhost:3003/vision-test`

### 2. Configuration dans l'application
1. Cliquez sur "Configurer API"
2. Entrez votre clé API Google Vision
3. La clé sera sauvegardée localement

### 3. Analyser un document
1. Uploadez une image ou un PDF
2. Choisissez "Analyser le document" ou "Extraire le texte seulement"
3. L'IA analyse et extrait les informations automatiquement

## 📊 Fonctionnalités

### OCR (Reconnaissance Optique de Caractères)
- Extraction de texte depuis les images
- Support du français et de l'anglais
- Niveau de confiance par caractère

### Détection de documents médicaux
- **Ordonnances** : Détection des médicaments, posologie
- **Résultats** : Extraction des valeurs numériques
- **Analyses** : Identification des types d'examens

### Extraction structurée
- Nom du patient
- Nom du médecin
- Date du document
- Liste des médicaments
- Résultats chiffrés

## 🛠️ Intégration avancée

### Utilisation du service directement

```typescript
import GoogleVisionService from '../services/googleVisionService';

const visionService = new GoogleVisionService(process.env.GOOGLE_VISION_API_KEY);

// Extraire le texte
const ocrResult = await visionService.extractTextFromImage(imageBase64);

// Analyser un document médical
const analysisResult = await visionService.analyzeMedicalDocument(imageBase64);
```

### Dans un composant React

```tsx
import { VisionAnalyzer } from '../components/VisionAnalyzer';

const MyComponent = () => {
  const handleAnalysisComplete = (result) => {
    console.log('Résultat:', result);
    // Traiter les données extraites
  };

  return (
    <VisionAnalyzer 
      onAnalysisComplete={handleAnalysisComplete}
      title="Analyse d'ordonnance"
    />
  );
};
```

## 🔍 Exemples d'utilisation

### 1. Cabinet médical
- Numériser les ordonnances papier
- Extraire automatiquement les médicaments
- Intégrer avec le dossier patient

### 2. Laboratoire
- Analyser les résultats d'analyses
- Extraire les valeurs numériques
- Comparer avec les valeurs de référence

### 3. Pharmacie
- Traiter les ordonnances numériques
- Vérifier les interactions médicamenteuses
- Accélérer le service

## ⚠️ Limitations

### Taille des images
- Maximum : 4 MB par image
- Formats supportés : JPEG, PNG, GIF, BMP, WEBP

### Langues
- Principalement optimisé pour le français et l'anglais
- Peut nécessiter des ajustements pour d'autres langues

### Qualité des images
- Meilleurs résultats avec des images claires
- Évitez les flous, ombres, reflets
- Résolution minimum recommandée : 300 DPI

## 🚨 Bonnes pratiques

### 1. Validation humaine
- Vérifiez toujours les extractions
- L'OCR peut faire des erreurs
- Important pour les données médicales

### 2. Stockage sécurisé
- Ne stockez pas les images sur le client
- Utilisez un serveur sécurisé
- Supprimez les images temporaires

### 3. Monitoring
- Surveillez l'utilisation de l'API
- Configurez des alertes de budget
- Optimisez les requêtes

## 🆘 Support

### Documentation officielle
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Guide de démarrage rapide](https://cloud.google.com/vision/docs/quickstart)

### Dépannage courant
1. **Erreur 403** : Vérifiez que l'API est activée
2. **Erreur 429** : Trop de requêtes, attendez un peu
3. **Erreur 400** : Format d'image invalide
4. **Facturation** : Vérifiez que le paiement est configuré

---

## 🎉 Prochaines étapes

1. ✅ Configurer Google Cloud Platform
2. ✅ Obtenir une clé API
3. ✅ Tester avec la page de démo
4. 🔄 Intégrer dans les formulaires patients
5. 🔄 Ajouter à la pharmacie
6. 🔄 Connecter avec les consultations

Pour toute question, contactez le support technique !
