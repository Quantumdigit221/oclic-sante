// Simple Button Handler - Gestion des boutons enregistrement et compte rendu
(function() {
    'use strict';
    
    console.log('🔘 BUTTON-HANDLER: Initializing simple button handler...');
    
    // Configuration des boutons à détecter
    const BUTTON_CONFIG = {
        recordButton: {
            // Priorité haute : boutons spécifiques d'enregistrement
            keywords: ['enregistrer', 'enregistrement', 'save', 'sauvegarder'],
            excludeKeywords: ['compte rendu', 'compte-rendu', 'rapport'] // Exclure les boutons de rapport
        },
        reportButton: {
            // Priorité haute : boutons spécifiques de compte rendu
            keywords: ['compte rendu', 'compte-rendu', 'rapport', 'publier le compte rendu']
        }
    };
    
    // État du système
    let buttonState = {
        recordButtons: [],
        reportButtons: [],
        allProcessedButtons: new Set() // Suivi global de tous les boutons traités
    };
    
    // Variables pour éviter les boucles infinies
    let isScanning = false;
    let lastScanTime = 0;
    let scanTimeout = null;
    
    // Fonction pour trouver les boutons par texte avec gestion des exclusions
    function findButtonsByText(keywords, excludeKeywords = []) {
        const buttons = [];
        const allButtons = document.querySelectorAll('button, [role="button"], .btn');
        const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
        const excludeArray = Array.isArray(excludeKeywords) ? excludeKeywords : [excludeKeywords];
        
        allButtons.forEach(button => {
            const buttonText = (button.textContent || '').toLowerCase().trim();
            const buttonTitle = (button.getAttribute('title') || '').toLowerCase();
            const buttonOnClick = (button.getAttribute('onclick') || '').toLowerCase();
            
            // Vérifier si un des keywords correspond
            const matches = keywordArray.some(keyword => 
                buttonText.includes(keyword.toLowerCase()) || 
                buttonTitle.includes(keyword.toLowerCase()) ||
                buttonOnClick.includes(keyword.toLowerCase())
            );
            
            // Vérifier si un des mots d'exclusion correspond
            const shouldExclude = excludeArray.some(exclude => 
                buttonText.includes(exclude.toLowerCase()) || 
                buttonTitle.includes(exclude.toLowerCase()) ||
                buttonOnClick.includes(exclude.toLowerCase())
            );
            
            // Ajouter seulement si ça match et que ça n'est pas exclu
            if (matches && !shouldExclude) {
                buttons.push(button);
            }
        });
        
        return buttons;
    }
    
    // Fonction debounce pour éviter les scans excessifs (DÉSACTIVÉ)
    function debounceScan() {
        console.log('🔘 BUTTON-HANDLER: Debounce scan désactivé pour éviter la boucle infinie');
        return;
        
        // Code désactivé :
        /*
        if (scanTimeout) {
            clearTimeout(scanTimeout);
        }
        
        scanTimeout = setTimeout(() => {
            if (!isScanning) {
                scanForButtons();
            }
        }, 500); // Attendre 500ms avant de scanner
        */
    }
    
    // Gérer le bouton d'enregistrement
    function handleRecordButton(button) {
        console.log('🔘 BUTTON-HANDLER: Found record button:', button.textContent);
        
        // Vérifier si le bouton est déjà traité globalement
        if (buttonState.allProcessedButtons.has(button)) {
            return;
        }
        
        // Marquer le bouton comme traité globalement
        buttonState.allProcessedButtons.add(button);
        
        // Vérifier si le bouton est déjà géré
        if (button.hasAttribute('data-handler-attached')) {
            return;
        }
        
        // Marquer le bouton comme géré
        button.setAttribute('data-handler-attached', 'true');
        
        // Retirer l'ancien listener
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Ajouter le nouveau listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔘 BUTTON-HANDLER: Record button clicked');
            
            // Action d'enregistrement
            performRecordAction();
        });
        
        // Ajouter un indicateur visuel
        newButton.style.border = '2px solid #28a745';
        newButton.title = 'Cliquez pour enregistrer';
    }
    
    // Gérer le bouton de compte rendu
    function handleReportButton(button) {
        console.log('🔘 BUTTON-HANDLER: Found report button:', button.textContent);
        
        // Vérifier si le bouton est déjà traité globalement
        if (buttonState.allProcessedButtons.has(button)) {
            return;
        }
        
        // Marquer le bouton comme traité globalement
        buttonState.allProcessedButtons.add(button);
        
        // Vérifier si le bouton est déjà géré
        if (button.hasAttribute('data-handler-attached')) {
            return;
        }
        
        // Marquer le bouton comme géré
        button.setAttribute('data-handler-attached', 'true');
        
        // Retirer l'ancien listener
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Ajouter le nouveau listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔘 BUTTON-HANDLER: Report button clicked');
            
            // Action de compte rendu
            performReportAction();
        });
        
        // Ajouter un indicateur visuel
        newButton.style.border = '2px solid #007bff';
        newButton.title = 'Cliquez pour générer le compte rendu';
    }
    
    // Action d'enregistrement (sauvegarder et archiver)
    function performRecordAction() {
        try {
            console.log('🔘 BUTTON-HANDLER: Performing record action...');
            
            // Chercher les données à enregistrer
            const formData = extractFormData();
            
            if (formData) {
                // Afficher un message de confirmation et lancer immédiatement
                showNotification('Sauvegarde en cours...', 'info');
                
                // Lancer la sauvegarde immédiatement sans délai
                saveAndArchive(formData, 'record');
            } else {
                showNotification('Aucune donnée à enregistrer', 'warning');
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error in record action:', error);
            showNotification('Erreur lors de l\'enregistrement: ' + error.message, 'error');
        }
    }
    
    // Action de compte rendu (sauvegarder et archiver)
    function performReportAction() {
        try {
            console.log('🔘 BUTTON-HANDLER: Performing report action...');
            
            // Chercher les données pour le rapport
            const reportData = extractReportData();
            
            if (reportData) {
                // Afficher un message de confirmation et lancer immédiatement
                showNotification('Sauvegarde et archivage du compte rendu...', 'info');
                
                // Lancer la sauvegarde immédiatement sans délai
                saveAndArchive(reportData, 'report');
            } else {
                showNotification('Aucune donnée pour le compte rendu', 'warning');
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error in report action:', error);
            showNotification('Erreur lors de la génération du compte rendu: ' + error.message, 'error');
        }
    }
    
    // Fonction pour sauvegarder et archiver les données
    async function saveAndArchive(data, type) {
        try {
            console.log('🔘 BUTTON-HANDLER: Saving and archiving data...', data);
            
            // Déterminer le type de données et l'endpoint approprié
            let endpoint, updateData;
            
            if (type === 'record') {
                // Pour les enregistrements généraux
                endpoint = '/api/lab-results';
                updateData = {
                    ...data,
                    status: 'ARCHIVED',
                    archivedAt: new Date().toISOString(),
                    archivedBy: getCurrentUserId()
                };
            } else if (type === 'report') {
                // Pour les comptes rendus
                endpoint = '/api/lab-results';
                updateData = {
                    ...data,
                    status: 'ARCHIVED',
                    reportType: 'COMPTE_RENDU',
                    archivedAt: new Date().toISOString(),
                    archivedBy: getCurrentUserId()
                };
            }
            
            // Récupérer le token JWT
            const token = localStorage.getItem('oclic_sante_jwt_token');
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }
            
            // Ajouter un timeout pour éviter les attentes infinies
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s max
            
            // Envoyer les données à l'API avec timeout
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const result = await response.json();
                console.log('🔘 BUTTON-HANDLER: Data saved and archived successfully:', result);
                
                // Afficher un message de succès
                showNotification('Données sauvegardées et archivées avec succès', 'success');
                
                // Afficher les options pour les données archivées
                showArchivedOptions(result, type);
                
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de la sauvegarde');
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error saving and archiving:', error);
            
            if (error.name === 'AbortError') {
                showNotification('Délai d\'attente dépassé - Veuillez réessayer', 'error');
            } else {
                showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
            }
        }
    }
    
    // Fonction pour afficher les options pour les données archivées
    function showArchivedOptions(data, type) {
        try {
            console.log('🔘 BUTTON-HANDLER: Showing archived options for:', data);
            
            // Créer un modal pour les options archivées
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                text-align: center;
            `;
            
            modalContent.innerHTML = `
                <h3 style="color: #28a745; margin-bottom: 20px;">✅ Données archivées avec succès</h3>
                <p style="margin-bottom: 20px;">ID: <strong>${data.id}</strong></p>
                <p style="margin-bottom: 30px;">Statut: <strong>ARCHIVÉ</strong></p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button id="view-details-btn" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">📋 Voir les détails</button>
                    <button id="print-pdf-btn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🖨️ Imprimer PDF</button>
                    <button id="send-email-btn" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">📧 Envoyer par e-mail</button>
                    <button id="send-whatsapp-btn" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">💬 Envoyer par WhatsApp</button>
                    <button id="close-modal-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Fermer</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Ajouter les événements
            document.getElementById('view-details-btn').onclick = () => {
                showDetails(data);
                closeModal();
            };
            
            document.getElementById('print-pdf-btn').onclick = () => {
                generatePDF(data);
                closeModal();
            };
            
            document.getElementById('send-email-btn').onclick = () => {
                sendByEmail(data);
                closeModal();
            };
            
            document.getElementById('send-whatsapp-btn').onclick = () => {
                sendByWhatsApp(data);
                closeModal();
            };
            
            document.getElementById('close-modal-btn').onclick = closeModal;
            
            function closeModal() {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error showing archived options:', error);
        }
    }
    
    // Fonction pour obtenir l'ID de l'utilisateur actuel
    function getCurrentUserId() {
        // Essayer de récupérer depuis le token ou le stockage local
        try {
            const token = localStorage.getItem('oclic_sante_jwt_token');
            if (token) {
                // Décoder le token pour obtenir l'ID utilisateur (si disponible)
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.id || payload.userId || 'unknown';
            }
        } catch (e) {
            console.warn('Could not decode user token:', e);
        }
        return 'unknown';
    }
    
    // Fonction pour afficher les détails
    function showDetails(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Showing details for:', data);
            
            // Créer un modal de détails
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            // Construire le contenu des détails
            let detailsHTML = `
                <h3 style="color: #007bff; margin-bottom: 20px;">📋 Détails du document archivé</h3>
                <div style="text-align: left; background: #f8f9fa; padding: 20px; border-radius: 5px;">
            `;
            
            Object.keys(data).forEach(key => {
                if (data[key] && key !== 'id') {
                    detailsHTML += `
                        <p style="margin: 10px 0;">
                            <strong>${key}:</strong> ${data[key]}
                        </p>
                    `;
                }
            });
            
            detailsHTML += `
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button id="close-details-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Fermer</button>
                </div>
            `;
            
            modalContent.innerHTML = detailsHTML;
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            document.getElementById('close-details-btn').onclick = () => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error showing details:', error);
            showNotification('Erreur lors de l\'affichage des détails', 'error');
        }
    }
    
    // Fonction pour générer le PDF avec informations du centre
    function generatePDF(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Generating PDF for:', data);
            
            // Créer une nouvelle fenêtre pour le PDF
            const pdfWindow = window.open('', '_blank');
            
            // Récupérer les informations du centre (à adapter selon votre système)
            const centerInfo = getCenterInfo();
            
            // Construire le contenu HTML du PDF
            const pdfContent = createPDFContent(data, centerInfo);
            
            pdfWindow.document.write(pdfContent);
            pdfWindow.document.close();
            
            // Attendre que le contenu soit chargé puis imprimer
            pdfWindow.onload = () => {
                setTimeout(() => {
                    pdfWindow.print();
                }, 500);
            };
            
            showNotification('PDF généré avec succès', 'success');
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error generating PDF:', error);
            showNotification('Erreur lors de la génération du PDF', 'error');
        }
    }
    
    // Fonction pour obtenir les informations du centre
    function getCenterInfo() {
        // Ces informations peuvent provenir de l'API ou d'une configuration
        return {
            name: 'Centre de Santé O\'Clic',
            address: '123 Rue de la Santé, Dakar, Sénégal',
            phone: '+221 33 123 45 67',
            email: 'contact@oclic-sante.sn',
            rnis: 'RNIS123456',
            logo: '/logo.png'
        };
    }
    
    // Fonction pour créer le contenu PDF
    function createPDFContent(data, centerInfo) {
        const currentDate = new Date().toLocaleDateString('fr-FR');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Compte Rendu Médical</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .center-info {
                        margin-bottom: 20px;
                    }
                    .content {
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .signature {
                        margin-top: 50px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${centerInfo.name}</h1>
                    <div class="center-info">
                        <p>${centerInfo.address}</p>
                        <p>Tél: ${centerInfo.phone} | Email: ${centerInfo.email}</p>
                        <p>RNIS: ${centerInfo.rnis}</p>
                    </div>
                    <h2>COMPTE RENDU MÉDICAL</h2>
                    <p>Date: ${currentDate}</p>
                    <p>ID Document: ${data.id}</p>
                </div>
                
                <div class="content">
                    ${createReportContent(data)}
                </div>
                
                <div class="signature">
                    <p>Dr. _________________________</p>
                    <p>Médecin Traitant</p>
                </div>
                
                <div class="footer">
                    <p>Document généré par O'Clic Santé - ${currentDate}</p>
                    <p>Ce document est un compte rendu médical et ne peut être utilisé que par le patient et son médecin traitant</p>
                </div>
                
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Imprimer</button>
                    <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">Fermer</button>
                </div>
            </body>
            </html>
        `;
    }
    
    // Fonction pour envoyer par e-mail
    function sendByEmail(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Sending by email:', data);
            
            // Créer un modal pour l'envoi d'e-mail
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 400px;
            `;
            
            modalContent.innerHTML = `
                <h3 style="color: #17a2b8; margin-bottom: 20px;">📧 Envoyer par e-mail</h3>
                <form id="email-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Adresse e-mail du patient:</label>
                        <input type="email" id="patient-email" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Message (optionnel):</label>
                        <textarea id="email-message" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">Veuillez trouver ci-joint votre compte rendu médical.</textarea>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="submit" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Envoyer</button>
                        <button type="button" id="cancel-email" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Annuler</button>
                    </div>
                </form>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            document.getElementById('email-form').onsubmit = (e) => {
                e.preventDefault();
                const email = document.getElementById('patient-email').value;
                const message = document.getElementById('email-message').value;
                
                // Simuler l'envoi d'e-mail (à implémenter avec l'API)
                simulateEmailSending(email, message, data);
                
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
            document.getElementById('cancel-email').onclick = () => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error sending email:', error);
            showNotification('Erreur lors de l\'envoi de l\'e-mail', 'error');
        }
    }
    
    // Fonction pour envoyer par WhatsApp
    function sendByWhatsApp(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Sending by WhatsApp:', data);
            
            // Créer un modal pour l'envoi WhatsApp
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 400px;
            `;
            
            modalContent.innerHTML = `
                <h3 style="color: #25D366; margin-bottom: 20px;">💬 Envoyer par WhatsApp</h3>
                <form id="whatsapp-form">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Numéro WhatsApp du patient:</label>
                        <input type="tel" id="patient-phone" required placeholder="+221 XX XXX XX XX" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Message:</label>
                        <textarea id="whatsapp-message" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">Bonjour, votre compte rendu médical est prêt. Vous pouvez le consulter via ce lien: [LIEN_VERS_DOCUMENT]</textarea>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button type="submit" style="background: #25D366; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Envoyer</button>
                        <button type="button" id="cancel-whatsapp" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Annuler</button>
                    </div>
                </form>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            document.getElementById('whatsapp-form').onsubmit = (e) => {
                e.preventDefault();
                const phone = document.getElementById('patient-phone').value;
                const message = document.getElementById('whatsapp-message').value;
                
                // Simuler l'envoi WhatsApp (à implémenter avec l'API)
                simulateWhatsAppSending(phone, message, data);
                
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
            document.getElementById('cancel-whatsapp').onclick = () => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            };
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error sending WhatsApp:', error);
            showNotification('Erreur lors de l\'envoi WhatsApp', 'error');
        }
    }
    
    // Fonction pour simuler l'envoi d'e-mail
    function simulateEmailSending(email, message, data) {
        console.log('🔘 BUTTON-HANDLER: Simulating email send to:', email);
        showNotification(`E-mail envoyé à ${email}`, 'success');
        
        // TODO: Implémenter l'envoi réel via l'API
        // fetch('/api/send-email', { ... })
    }
    
    // Fonction pour simuler l'envoi WhatsApp
    function simulateWhatsAppSending(phone, message, data) {
        console.log('🔘 BUTTON-HANDLER: Simulating WhatsApp send to:', phone);
        showNotification(`Message WhatsApp envoyé à ${phone}`, 'success');
        
        // TODO: Implémenter l'envoi réel via l'API WhatsApp
        // fetch('/api/send-whatsapp', { ... })
    }
    
    // Extraire les données du formulaire
    function extractFormData() {
        const data = {};
        
        // Chercher les inputs, selects, textareas de manière plus approfondie
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                const value = input.value || input.textContent;
                
                // Nettoyer et formater la valeur
                if (value && value.trim()) {
                    data[key] = value.trim();
                }
            }
        });
        
        // Chercher spécifiquement les éléments visibles avec du texte
        const textElements = document.querySelectorAll('p, span, div, td, th, h1, h2, h3, h4, h5, h6');
        
        textElements.forEach(element => {
            const text = element.textContent?.trim();
            const className = element.className?.toLowerCase();
            
            // Chercher des patterns spécifiques dans le texte
            if (text && text.length > 3 && text.length < 200) {
                // Informations patient
                if (text.toLowerCase().includes('patient') || 
                    text.toLowerCase().includes('nom') || 
                    text.toLowerCase().includes('prénom') ||
                    text.toLowerCase().includes('age') ||
                    text.toLowerCase().includes('sexe')) {
                    
                    if (!data.patientNom && text.toLowerCase().includes('nom')) {
                        data.patientNom = text.replace(/nom[:\s]+/i, '').trim();
                    }
                    if (!data.patientAge && text.toLowerCase().includes('age')) {
                        data.patientAge = text.replace(/age[:\s]+/i, '').trim();
                    }
                    if (!data.patientSexe && text.toLowerCase().includes('sexe')) {
                        data.patientSexe = text.replace(/sexe[:\s]+/i, '').trim();
                    }
                }
                
                // Informations examen
                if (text.toLowerCase().includes('examen') || 
                    text.toLowerCase().includes('type') ||
                    text.toLowerCase().includes('date') ||
                    text.toLowerCase().includes('médecin')) {
                    
                    if (!data.examenType && text.toLowerCase().includes('type')) {
                        data.examenType = text.replace(/type[:\s]+/i, '').trim();
                    }
                    if (!data.examenDate && text.toLowerCase().includes('date')) {
                        data.examenDate = text.replace(/date[:\s]+/i, '').trim();
                    }
                    if (!data.examenMedecin && text.toLowerCase().includes('médecin')) {
                        data.examenMedecin = text.replace(/médecin[:\s]+/i, '').trim();
                    }
                }
                
                // Résultats et conclusion
                if (text.toLowerCase().includes('résultat') || 
                    text.toLowerCase().includes('resultat') ||
                    text.toLowerCase().includes('conclusion') ||
                    text.toLowerCase().includes('diagnostic')) {
                    
                    if (!data.resultats && (text.toLowerCase().includes('résultat') || text.toLowerCase().includes('resultat'))) {
                        data.resultats = text.replace(/(résultat|resultat)[:\s]+/i, '').trim();
                    }
                    if (!data.conclusion && text.toLowerCase().includes('conclusion')) {
                        data.conclusion = text.replace(/conclusion[:\s]+/i, '').trim();
                    }
                    if (!data.diagnostic && text.toLowerCase().includes('diagnostic')) {
                        data.diagnostic = text.replace(/diagnostic[:\s]+/i, '').trim();
                    }
                }
                
                // Notes et observations
                if (text.toLowerCase().includes('note') || 
                    text.toLowerCase().includes('observation') ||
                    text.toLowerCase().includes('remarque')) {
                    
                    if (!data.notes && text.toLowerCase().includes('note')) {
                        data.notes = text.replace(/note[:\s]+/i, '').trim();
                    }
                    if (!data.observations && text.toLowerCase().includes('observation')) {
                        data.observations = text.replace(/observation[:\s]+/i, '').trim();
                    }
                }
            }
        });
        
        // Chercher dans les tableaux
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const firstCell = cells[0].textContent?.trim();
                    const secondCell = cells[1].textContent?.trim();
                    
                    if (firstCell && secondCell) {
                        // Essayer d'identifier la nature des données
                        if (firstCell.toLowerCase().includes('patient') || firstCell.toLowerCase().includes('nom')) {
                            data.patientNom = secondCell;
                        } else if (firstCell.toLowerCase().includes('examen') || firstCell.toLowerCase().includes('type')) {
                            data.examenType = secondCell;
                        } else if (firstCell.toLowerCase().includes('date')) {
                            data.examenDate = secondCell;
                        } else if (firstCell.toLowerCase().includes('médecin') || firstCell.toLowerCase().includes('doctor')) {
                            data.examenMedecin = secondCell;
                        } else if (firstCell.toLowerCase().includes('résultat') || firstCell.toLowerCase().includes('resultat')) {
                            data.resultats = secondCell;
                        } else if (firstCell.toLowerCase().includes('conclusion')) {
                            data.conclusion = secondCell;
                        } else {
                            // Stocker comme donnée générique
                            const genericKey = `tableau_ligne_${index}`;
                            data[genericKey] = `${firstCell}: ${secondCell}`;
                        }
                    }
                }
            });
        });
        
        // Ajouter des métadonnées
        data.timestamp = new Date().toISOString();
        data.centerId = 'center-001';
        data.tenantId = 'center-001';
        
        // Logger les données extraites pour debugging
        console.log('🔘 BUTTON-HANDLER: Extracted form data:', data);
        
        return Object.keys(data).length > 3 ? data : null;
    }
    
    // Extraire les données pour le rapport
    function extractReportData() {
        const data = {};
        
        // Chercher les éléments avec des données spécifiques au compte rendu
        const reportElements = document.querySelectorAll('[data-report], [data-compte-rendu], .report-data, .compte-rendu-data');
        
        reportElements.forEach(element => {
            const key = element.getAttribute('data-report') || 
                       element.getAttribute('data-compte-rendu') || 
                       element.className || 'data';
            data[key] = element.textContent || element.value || element.innerHTML;
        });
        
        // Extraire les données du formulaire de manière plus complète
        const formData = extractFormData();
        if (formData) {
            Object.assign(data, formData);
        }
        
        // Chercher spécifiquement dans les formulaires et conteneurs de données
        const forms = document.querySelectorAll('form, .form, .data-form, .consultation-form, .examen-form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.name || input.id) {
                    const key = input.name || input.id;
                    const value = input.value || input.textContent;
                    
                    // Nettoyer et formater la valeur
                    if (value && value.trim()) {
                        data[key] = value.trim();
                    }
                }
            });
        });
        
        // Chercher dans les tableaux et listes
        const tables = document.querySelectorAll('table, .data-table, .results-table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            const tableData = [];
            
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length > 0) {
                    const rowData = [];
                    cells.forEach(cell => {
                        rowData.push(cell.textContent?.trim() || cell.value?.trim() || '');
                    });
                    if (rowData.some(cell => cell)) { // Ne garder que les lignes avec des données
                        tableData.push(rowData);
                    }
                }
            });
            
            if (tableData.length > 0) {
                data['tableau_donnees'] = tableData;
            }
        });
        
        // Chercher les éléments spécifiques au compte rendu médical
        const medicalElements = document.querySelectorAll([
            '.patient-info', '.patient-name', '.patient-id',
            '.examen-info', '.examen-type', '.examen-date',
            '.resultat', '.resultats', '.conclusion',
            '.medecin', '.doctor-info',
            '.notes', '.observations',
            '.diagnostic', '.traitement'
        ].join(', '));
        
        medicalElements.forEach(element => {
            const key = element.className.replace(/\s+/g, '_') || 'data';
            const value = element.textContent?.trim() || element.value?.trim();
            
            if (value) {
                data[key] = value;
            }
        });
        
        // Ajouter des métadonnées enrichies
        data.reportType = 'compte-rendu';
        data.generatedAt = new Date().toISOString();
        data.centerId = 'center-001';
        data.tenantId = 'center-001';
        data.generationMode = 'auto-extraction';
        
        // S'assurer qu'il y a des données significatives
        const hasSignificantData = Object.keys(data).some(key => {
            const value = data[key];
            return value && 
                   typeof value === 'string' && 
                   value.length > 3 && 
                   !['reportType', 'generatedAt', 'centerId', 'tenantId', 'generationMode'].includes(key);
        });
        
        return hasSignificantData ? data : null;
    }
    
    // Générer un aperçu pour l'enregistrement
    function generateRecordPreview(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Generating record preview:', data);
            
            // Créer le contenu de l'aperçu
            const previewContent = createRecordPreviewContent(data);
            
            // Ouvrir dans une nouvelle fenêtre
            const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
            
            if (previewWindow) {
                previewWindow.document.write(previewContent);
                previewWindow.document.close();
                
                // Ajouter les boutons d'action
                setTimeout(() => {
                    const buttonsContainer = previewWindow.document.createElement('div');
                    buttonsContainer.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                    `;
                    
                    // Bouton Imprimer
                    const printButton = previewWindow.document.createElement('button');
                    printButton.textContent = '🖨️ Imprimer';
                    printButton.style.cssText = `
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
                    `;
                    printButton.onclick = () => {
                        previewWindow.print();
                    };
                    
                    // Bouton Fermer
                    const closeButton = previewWindow.document.createElement('button');
                    closeButton.textContent = '✕ Fermer';
                    closeButton.style.cssText = `
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    `;
                    closeButton.onclick = () => {
                        previewWindow.close();
                    };
                    
                    buttonsContainer.appendChild(printButton);
                    buttonsContainer.appendChild(closeButton);
                    previewWindow.document.body.appendChild(buttonsContainer);
                    
                    showNotification('Aperçu généré avec succès!', 'success');
                }, 500);
                
            } else {
                showNotification('Impossible d\'ouvrir l\'aperçu', 'error');
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error generating record preview:', error);
            showNotification('Erreur lors de la génération de l\'aperçu: ' + error.message, 'error');
        }
    }
    
    // Générer un aperçu pour le compte rendu
    function generateReportPreview(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Generating report preview:', data);
            
            // Créer le contenu de l'aperçu
            const previewContent = createReportContent(data);
            
            // Ouvrir dans une nouvelle fenêtre
            const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
            
            if (previewWindow) {
                previewWindow.document.write(previewContent);
                previewWindow.document.close();
                
                // Ajouter les boutons d'action
                setTimeout(() => {
                    const buttonsContainer = previewWindow.document.createElement('div');
                    buttonsContainer.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                    `;
                    
                    // Bouton Imprimer
                    const printButton = previewWindow.document.createElement('button');
                    printButton.textContent = '🖨️ Imprimer';
                    printButton.style.cssText = `
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(0,123,255,0.3);
                    `;
                    printButton.onclick = () => {
                        previewWindow.print();
                    };
                    
                    // Bouton Fermer
                    const closeButton = previewWindow.document.createElement('button');
                    closeButton.textContent = '✕ Fermer';
                    closeButton.style.cssText = `
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                    `;
                    closeButton.onclick = () => {
                        previewWindow.close();
                    };
                    
                    buttonsContainer.appendChild(printButton);
                    buttonsContainer.appendChild(closeButton);
                    previewWindow.document.body.appendChild(buttonsContainer);
                    
                    showNotification('Aperçu du compte rendu généré avec succès!', 'success');
                }, 500);
                
            } else {
                showNotification('Impossible d\'ouvrir l\'aperçu', 'error');
            }
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error generating report preview:', error);
            showNotification('Erreur lors de la génération de l\'aperçu: ' + error.message, 'error');
        }
    }
    
    // Créer le contenu de l'aperçu d'enregistrement
    function createRecordPreviewContent(data) {
        const date = new Date().toLocaleDateString('fr-FR');
        const time = new Date().toLocaleTimeString('fr-FR');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Aperçu Enregistrement - O'CLIC SANTE</title>
                <style>
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        background: #fff;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #007bff;
                        padding-bottom: 15px;
                    }
                    
                    .header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: #007bff;
                    }
                    
                    .header p {
                        margin: 5px 0;
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .data-section {
                        margin-bottom: 25px;
                    }
                    
                    .data-section h2 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0 0 15px 0;
                        color: #333;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                    }
                    
                    .data-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .data-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px dotted #ccc;
                        background: #f9f9f9;
                    }
                    
                    .data-label {
                        font-weight: bold;
                        color: #333;
                    }
                    
                    .data-value {
                        color: #555;
                        text-align: right;
                        font-family: 'Courier New', monospace;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #333;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                    
                    .preview-notice {
                        background: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 15px;
                        border-radius: 6px;
                        margin-bottom: 20px;
                        text-align: center;
                        font-weight: bold;
                    }
                    
                    @media print {
                        body { background: white; }
                        .preview-notice { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="preview-notice">
                    📄 APERÇU POUR IMPRESSION - Vérifiez les données avant d'imprimer
                </div>
                
                <div class="header">
                    <h1>Enregistrement</h1>
                    <p>O'CLIC SANTE - Centre Médical</p>
                    <p>${date} - ${time}</p>
                </div>
                
                <div class="data-section">
                    <h2>Données Enregistrées</h2>
                    <div class="data-grid">
                        ${Object.entries(data).filter(([key]) => 
                            !['reportType', 'generatedAt', 'centerId', 'tenantId', 'generationMode'].includes(key)
                        ).map(([key, value]) => `
                            <div class="data-item">
                                <span class="data-label">${formatKey(key)}:</span>
                                <span class="data-value">${value || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Généré par O'CLIC SANTE</strong></p>
                    <p>ID: ${data.centerId || 'center-001'}</p>
                </div>
                
                <script>
                    function formatKey(key) {
                        return key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    }
                </script>
            </body>
            </html>
        `;
    }
    
    // Sauvegarder localement
    function saveRecordLocally(data) {
        const records = JSON.parse(localStorage.getItem('button-handler-records') || '[]');
        records.push(data);
        localStorage.setItem('button-handler-records', JSON.stringify(records));
        console.log('🔘 BUTTON-HANDLER: Record saved locally:', data);
    }
    
    // Générer le rapport
    function generateReport(data) {
        try {
            console.log('🔘 BUTTON-HANDLER: Generating report:', data);
            
            // Créer le contenu du rapport
            const reportContent = createReportContent(data);
            
            // Afficher le rapport dans une nouvelle fenêtre
            const reportWindow = window.open('', '_blank', 'width=800,height=600');
            reportWindow.document.write(reportContent);
            reportWindow.document.close();
            
            showNotification('Compte rendu généré!', 'success');
            
        } catch (error) {
            console.error('🔘 BUTTON-HANDLER: Error generating report:', error);
            showNotification('Erreur lors de la génération du rapport: ' + error.message, 'error');
        }
    }
    
    // Créer le contenu du rapport
    function createReportContent(data) {
        const date = new Date().toLocaleDateString('fr-FR');
        const time = new Date().toLocaleTimeString('fr-FR');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Compte Rendu - O'CLIC SANTE</title>
                <style>
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        background: #fff;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                    }
                    
                    .header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    .header p {
                        margin: 5px 0;
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .patient-info {
                        margin-bottom: 25px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        background: #f9f9f9;
                    }
                    
                    .patient-info h2 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0 0 10px 0;
                        color: #333;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .info-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                        border-bottom: 1px dotted #ccc;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #333;
                    }
                    
                    .info-value {
                        color: #555;
                        text-align: right;
                    }
                    
                    .examen-section {
                        margin-bottom: 25px;
                    }
                    
                    .examen-section h2 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0 0 15px 0;
                        color: #333;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                    }
                    
                    .examen-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .resultat-section {
                        margin-bottom: 25px;
                    }
                    
                    .resultat-section h2 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0 0 15px 0;
                        color: #333;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                    }
                    
                    .resultat-content {
                        background: #f0f0f0;
                        padding: 15px;
                        border: 1px solid #ddd;
                        min-height: 100px;
                        white-space: pre-wrap;
                        font-family: 'Courier New', monospace;
                        font-size: 11px;
                        line-height: 1.6;
                    }
                    
                    .conclusion-section {
                        margin-bottom: 25px;
                    }
                    
                    .conclusion-section h2 {
                        font-size: 14px;
                        font-weight: bold;
                        margin: 0 0 15px 0;
                        color: #333;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                    }
                    
                    .conclusion-content {
                        background: #e8f4f8;
                        padding: 15px;
                        border: 1px solid #ddd;
                        font-weight: bold;
                        color: #333;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #333;
                        text-align: center;
                        font-size: 10px;
                        color: #666;
                    }
                    
                    .signature {
                        margin-top: 30px;
                        text-align: right;
                        font-style: italic;
                    }
                    
                    .no-data {
                        text-align: center;
                        color: #999;
                        font-style: italic;
                        padding: 40px;
                        background: #f9f9f9;
                        border: 1px solid #ddd;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Compte Rendu</h1>
                    <p>O'CLIC SANTE - Centre Médical</p>
                    <p>${date} - ${time}</p>
                </div>
                
                ${Object.keys(data).filter(key => 
                    !['reportType', 'generatedAt', 'centerId', 'tenantId', 'generationMode'].includes(key)
                ).length > 0 ? `
                
                <!-- Informations Patient -->
                <div class="patient-info">
                    <h2>Informations Patient</h2>
                    <div class="info-grid">
                        ${Object.entries(data).filter(([key]) => 
                            key.includes('patient') || key.includes('nom') || key.includes('id')
                        ).map(([key, value]) => `
                            <div class="info-item">
                                <span class="info-label">${formatKey(key)}:</span>
                                <span class="info-value">${value || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Examen -->
                <div class="examen-section">
                    <h2>Examen</h2>
                    <div class="examen-grid">
                        ${Object.entries(data).filter(([key]) => 
                            key.includes('examen') || key.includes('type') || key.includes('date')
                        ).map(([key, value]) => `
                            <div class="info-item">
                                <span class="info-label">${formatKey(key)}:</span>
                                <span class="info-value">${value || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Résultats -->
                <div class="resultat-section">
                    <h2>Résultats</h2>
                    <div class="resultat-content">
                        ${Object.entries(data).filter(([key]) => 
                            key.includes('resultat') || key.includes('résultat') || key.includes('result')
                        ).map(([key, value]) => `
                            <div><strong>${formatKey(key)}:</strong> ${value || 'N/A'}</div>
                        `).join('<br><br>') || 'Aucun résultat disponible'}
                    </div>
                </div>
                
                <!-- Conclusion -->
                <div class="conclusion-section">
                    <h2>Conclusion</h2>
                    <div class="conclusion-content">
                        ${Object.entries(data).filter(([key]) => 
                            key.includes('conclusion') || key.includes('diagnostic')
                        ).map(([key, value]) => `
                            <div>${value || 'Aucune conclusion disponible'}</div>
                        `).join('<br><br>') || 'Aucune conclusion disponible'}
                    </div>
                </div>
                
                <!-- Autres informations -->
                ${Object.entries(data).filter(([key]) => 
                    !['reportType', 'generatedAt', 'centerId', 'tenantId', 'generationMode'].includes(key) &&
                    !key.includes('patient') && !key.includes('nom') && !key.includes('id') &&
                    !key.includes('examen') && !key.includes('type') && !key.includes('date') &&
                    !key.includes('resultat') && !key.includes('résultat') && !key.includes('result') &&
                    !key.includes('conclusion') && !key.includes('diagnostic')
                ).length > 0 ? `
                <div class="examen-section">
                    <h2>Autres Informations</h2>
                    <div class="examen-grid">
                        ${Object.entries(data).filter(([key]) => 
                            !['reportType', 'generatedAt', 'centerId', 'tenantId', 'generationMode'].includes(key) &&
                            !key.includes('patient') && !key.includes('nom') && !key.includes('id') &&
                            !key.includes('examen') && !key.includes('type') && !key.includes('date') &&
                            !key.includes('resultat') && !key.includes('résultat') && !key.includes('result') &&
                            !key.includes('conclusion') && !key.includes('diagnostic')
                        ).map(([key, value]) => `
                            <div class="info-item">
                                <span class="info-label">${formatKey(key)}:</span>
                                <span class="info-value">${value || 'N/A'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="footer">
                    <p>Généré par O'CLIC SANTE</p>
                    <p>ID: ${data.centerId || 'center-001'}</p>
                </div>
                
                <div class="signature">
                    <p>Le Médecin Traitant</p>
                </div>
                
                ` : `
                
                <div class="no-data">
                    <h2>Aucune Donnée Disponible</h2>
                    <p>Aucune donnée significative n'a été trouvée pour générer ce compte rendu.</p>
                    <p>Veuillez vous assurer que le formulaire contient des informations avant de générer le rapport.</p>
                </div>
                
                `}
                
                <script>
                    function formatKey(key) {
                        return key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
                    }
                </script>
            </body>
            </html>
        `;
    }
    
    // Afficher une notification
    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.button-handler-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'button-handler-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
    
    // Scanner les boutons (BLOQUÉ TOTAL - PLUS JAMAIS D'EXÉCUTION)
    function scanForButtons() {
        // BLOCAGE TOTAL - Cette fonction ne sera jamais exécutée
        console.log('� BLOCAGE TOTAL: scanForButtons() ne sera jamais exécuté');
        return;
        
        // CODE ANCIEN COMPLÈTEMENT NEUTRALISÉ :
        // Toute tentative d'exécution sera bloquée ci-dessus
    }
    
    // Observer les changements dans le DOM (DÉSACTIVÉ)
    function setupMutationObserver() {
        console.log('🔘 BUTTON-HANDLER: Mutation observer désactivé pour éviter les boucles infinies');
        
        // Ne pas observer les changements pour éviter la boucle infinie
        // L'observer se déclenchait en boucle à cause des modifications DOM
        
        console.log('🔘 BUTTON-HANDLER: Observer désactivé - les boutons existants resteront actifs');
    }
    
    // Initialisation (BLOQUÉE COMPLÈTEMENT)
    function initialize() {
        console.log('🛑 BLOCAGE TOTAL: Button handler complètement désactivé');
        
        // BLOCAGE TOTAL DE TOUTES LES FONCTIONNALITÉS
        // Aucun scan, aucun observer, aucune exécution automatique
        
        console.log('🛑 SYSTÈME BLOQUÉ: Plus aucune fonction de scanning ne sera exécutée');
        console.log('� CONSOLE: Devrait rester totalement propre maintenant');
        
        // RETOUR IMMÉDIAT - AUCUNE EXÉCUTION POSSIBLE
        return;
        
        // CODE ANCIEN COMPLÈTEMENT DÉSACTIVÉ :
        /*
        console.log('�🔘 BUTTON-HANDLER: Initializing button handler...');
        
        // NE PAS scanner les boutons existants pour éviter la boucle infinie
        // setTimeout(scanForButtons, 500);
        
        // NE PAS configurer l'observer pour éviter la boucle infinie
        // setupMutationObserver();
        
        console.log('🔘 BUTTON-HANDLER: Initialization complete - SCANNING DÉSACTIVÉ');
        console.log('🔘 BUTTON-HANDLER: Available commands:');
        console.log('  - scanForButtons() : Scanner les boutons (DÉSACTIVÉ)');
        console.log('  - performRecordAction() : Tester l\'enregistrement');
        console.log('  - performReportAction() : Tester le compte rendu');
        */
    }
    
    // Fonctions globales pour les tests
    window.scanForButtons = scanForButtons;
    window.performRecordAction = performRecordAction;
    window.performReportAction = performReportAction;
    
    // Démarrer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();
