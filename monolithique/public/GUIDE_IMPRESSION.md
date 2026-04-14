# Guide d'Impression PDF - O'CLIC SANTE

## 🎯 Objectif
Ce guide explique comment utiliser les fonctionnalités d'impression PDF pour les ordonnances, examens et tickets dans O'CLIC SANTE.

## 📋 Fonctionnalités disponibles

### 1. Impression d'Ordonnances
- **Où**: Onglet "Prescription" dans les consultations
- **Quoi**: Ordonnance médicale complète avec médicaments et instructions
- **Format**: PDF optimisé pour impression A4

### 2. Impression d'Examens
- **Où**: Onglet "Examens" dans les consultations  
- **Quoi**: Résultats d'examens cliniques et de laboratoire
- **Format**: PDF avec tableaux détaillés

### 3. Impression de Tickets
- **Où**: Liste des tickets (icône imprimante 🖨️)
- **Quoi**: Ticket de paiement avec services et montant
- **Format**: Ticket compact ou PDF détaillé

## 🖨️ Comment imprimer

### Depuis l'interface simple:
1. Allez dans la section "Consultations"
2. Cliquez sur l'onglet désiré (Prescription, Examens, Diagnostic)
3. Cliquez sur le bouton "🖨️ Imprimer..."
4. La fenêtre d'impression s'ouvrira automatiquement

### Depuis l'interface React:
1. Dans la liste des tickets, cliquez sur l'icône 🖨️
2. Une modal s'ouvrira avec l'aperçu
3. Cliquez sur "Imprimer" pour générer le PDF

## 📄 Contenu des PDF

### Ordonnance médicale:
- En-tête O'CLIC SANTE
- Informations patient (nom, âge, sexe)
- Liste des médicaments avec posologie
- Instructions détaillées
- Diagnostic associé
- Signature médecin

### Résultats d'examens:
- Informations patient
- Examen clinique (pression, cœur, température)
- Résultats de laboratoire
- Dates et statuts
- Diagnostic

### Ticket:
- Numéro unique
- Date et heure
- Patient et services
- Montant et paiement
- Statut du ticket

## ⚙️ Configuration technique

### Bibliothèques utilisées:
- **jsPDF**: Génération de fichiers PDF
- **html2canvas**: Conversion HTML en image
- **Print CSS**: Styles optimisés pour impression

### Compatibilité:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (limité)

## 🔧 Dépannage

### Problème: Le PDF ne s'imprime pas
**Solution**: 
- Vérifiez que les popups sont autorisés
- Rechargez la page
- Essayez avec un autre navigateur

### Problème: Mise en page incorrecte
**Solution**:
- Vérifiez les paramètres d'impression (A4, portrait)
- Assurez-vous que "Mettre à l'échelle" est désactivé
- Utilisez "Imprimer les couleurs de fond"

### Problème: Contenu coupé
**Solution**:
- Réduisez les marges dans les paramètres d'impression
- Vérifiez l'option "Ajuster à la page"
- Contactez l'administrateur si le problème persiste

## 📱 Mobile/Tablette

L'impression fonctionne également sur mobile:
- Utilisez le menu "Partager" → "Imprimer"
- Ou connectez-vous depuis un ordinateur pour une meilleure expérience

## 🔄 Mises à jour

Les modèles d'impression sont régulièrement mis à jour pour:
- Améliorer la lisibilité
- Ajouter de nouvelles informations
- Optimiser pour différentes imprimantes

## 📞 Support

En cas de problème technique:
1. Vérifiez votre connexion internet
2. Essayez de recharger la page
3. Contactez le support technique

---

**Dernière mise à jour**: 19 mars 2026
**Version**: 1.0.0
