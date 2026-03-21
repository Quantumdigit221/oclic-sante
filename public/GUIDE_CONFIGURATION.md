# Guide de Configuration du Centre Médical

## 🎯 Objectif
Ce guide explique comment configurer les informations de votre centre médical qui apparaîtront dans tous les documents imprimés (ordonnances, examens, tickets).

## 📋 Informations configurables

### 1. Informations principales
- **Nom du centre**: Nom officiel de votre établissement
- **Sous-titre**: Description ou slogan
- **Adresse**: Adresse physique complète
- **Téléphone**: Numéro de contact principal
- **Email**: Adresse email professionnelle
- **Site web**: URL de votre site

### 2. Informations professionnelles
- **N° d'enregistrement**: Numéro d'enregistrement officiel
- **N° de licence**: Numéro de licence médicale

### 3. Spécialités médicales
Liste des spécialités proposées (une par ligne) :
- Médecine Générale
- Pédiatrie
- Gynécologie
- Urgences
- Laboratoire d'Analyse
- Radiologie
- Cardiologie

### 4. Équipe médicale
Informations sur chaque médecin :
- **Nom**: Nom complet du médecin
- **Spécialité**: Domaine de spécialisation
- **N° ORD**: Numéro d'ordre professionnel

## ⚙️ Comment accéder à la configuration

### Depuis l'interface simple:
1. Allez dans le menu latéral
2. Cliquez sur "⚙️ Configuration"
3. Cliquez sur "⚙️ Ouvrir la configuration"

### Directement via l'URL:
Naviguez vers `#/config` dans votre navigateur

## 📝 Étapes de configuration

### 1. Remplir les informations principales
```
Nom du centre: CENTRE MEDICAL O'CLIC
Sous-titre: Plateforme de Gestion Médicale Intégrée
Adresse: Rue de la Santé, Conakry, Guinée
Téléphone: +224 622 123 456
Email: contact@oclicsante.com
Site web: www.oclicsante.com
```

### 2. Ajouter les informations professionnelles
```
N° d'enregistrement: N° REG: CM-2024-001
N° de licence: N° LIC: MED-GN-2024-001
```

### 3. Configurer les spécialités
```
Médecine Générale
Pédiatrie
Gynécologie
Urgences
Laboratoire d'Analyse
Radiologie
Cardiologie
```

### 4. Ajouter l'équipe médicale
Cliquez sur "+ Ajouter un médecin" pour chaque membre :
- Dr. Marie Dupont | Médecine Générale | ORD-001
- Dr. Ahmad Ba | Pédiatrie | ORD-002
- Dr. Fatoumata Diallo | Gynécologie | ORD-003

## 🔧 Fonctionnalités disponibles

### Aperçu en temps réel
- Cliquez sur "📋 Aperçu" pour voir comment l'en-tête apparaîtra dans les documents
- L'aperçu montre le format exact d'impression

### Sauvegarde automatique
- Cliquez sur "💾 Enregistrer" pour sauvegarder vos modifications
- Les configurations sont sauvegardées localement dans le navigateur
- Les modifications persistent après rechargement

### Réinitialisation
- Cliquez sur "🔄 Réinitialiser" pour restaurer les valeurs par défaut
- **Attention**: Cette action efface toutes vos personnalisations

## 📄 Résultat dans les documents

### En-tête d'ordonnance:
```
CENTRE MEDICAL O'CLIC
Plateforme de Gestion Médicale Intégrée
Rue de la Santé, Conakry, Guinée
📞 +224 622 123 456 | ✉️ contact@oclicsante.com
N° REG: CM-2024-001 | N° LIC: MED-GN-2024-001

Médecine Générale • Pédiatrie • Gynécologie • Urgences
```

### Pied de page:
```
CENTRE MEDICAL O'CLIC | Rue de la Santé, Conakry, Guinée
📞 +224 622 123 456 | ✉️ contact@oclicsante.com | 🌐 www.oclicsante.com
N° REG: CM-2024-001 | N° LIC: MED-GN-2024-001
Document généré le 19/03/2026 | Ce document est confidentiel
```

## 💡 Conseils d'utilisation

### Pour une meilleure apparence:
- Utilisez un nom concis et professionnel
- Assurez-vous que l'adresse est complète et précise
- Vérifiez les numéros de téléphone avant de sauvegarder
- Limitez les spécialités à 4-6 items pour un meilleur affichage

### Pour la conformité:
- Incluez toujours vos numéros d'enregistrement officiels
- Utilisez les informations exactes de votre licence médicale
- Assurez-vous que les informations des médecins sont correctes

### Pour la maintenance:
- Mettez à jour les informations lorsque nécessaire
- Vérifiez régulièrement les coordonnées
- Ajoutez de nouveaux médecins quand ils rejoignent l'équipe

## 🔄 Synchronisation

### Local vs Centralisé:
- **Actuellement**: Configuration sauvegardée localement dans le navigateur
- **Futur**: Synchronisation possible avec base de données centrale

### Import/Export:
Pour sauvegarder votre configuration :
1. Configurez toutes vos informations
2. Utilisez les outils de développement du navigateur
3. Exportez `localStorage.getItem('medicalCenterConfig')`

## 📞 Support

En cas de problème:
1. Vérifiez que toutes les informations requises sont remplies
2. Essayez de recharger la page et recommencer
3. Contactez le support technique pour assistance

---

**Dernière mise à jour**: 19 mars 2026
**Version**: 1.0.0
