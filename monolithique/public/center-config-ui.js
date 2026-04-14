// Interface de configuration du centre médical
(function() {
    'use strict';
    
    console.log('CONFIG: Initializing center configuration interface...');
    
    // Fonction pour créer l'interface de configuration
    function createConfigInterface() {
        const config = window.medicalCenterConfig || {};
        
        return `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
                <h2 style="color: #1e293b; margin-bottom: 30px;">Configuration du Centre Médical</h2>
                
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Informations principales -->
                    <div style="margin-bottom: 40px;">
                        <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Informations Principales</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Nom du centre:</label>
                                <input type="text" id="center-name" value="${config.name || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Sous-titre:</label>
                                <input type="text" id="center-subtitle" value="${config.subtitle || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Adresse:</label>
                                <input type="text" id="center-address" value="${config.address || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Téléphone:</label>
                                <input type="text" id="center-phone" value="${config.phone || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Email:</label>
                                <input type="email" id="center-email" value="${config.email || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">Site web:</label>
                                <input type="text" id="center-website" value="${config.website || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Informations professionnelles -->
                    <div style="margin-bottom: 40px;">
                        <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Informations Professionnelles</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">N° d'enregistrement:</label>
                                <input type="text" id="center-registration" value="${config.registrationNumber || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">N° de licence:</label>
                                <input type="text" id="center-license" value="${config.licenseNumber || ''}" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Spécialités -->
                    <div style="margin-bottom: 40px;">
                        <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Spécialités Médicales</h3>
                        <textarea id="center-specialties" rows="4" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">${(config.specialties || []).join('\\n')}</textarea>
                        <small style="color: #6b7280;">Une spécialité par ligne</small>
                    </div>
                    
                    <!-- Médecins -->
                    <div style="margin-bottom: 40px;">
                        <h3 style="color: #14b8a6; margin-bottom: 20px; border-bottom: 2px solid #14b8a6; padding-bottom: 8px;">Équipe Médicale</h3>
                        <div id="doctors-container">
                            ${(config.doctors || []).map((doc, index) => `
                                <div class="doctor-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: center;">
                                    <input type="text" placeholder="Nom du médecin" value="${doc.name || ''}" data-field="name" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                    <input type="text" placeholder="Spécialité" value="${doc.specialty || ''}" data-field="specialty" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                    <input type="text" placeholder="N° ORD" value="${doc.registration || ''}" data-field="registration" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
                                    <button onclick="removeDoctor(${index})" style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addDoctor()" style="background: #14b8a6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 10px;">+ Ajouter un médecin</button>
                    </div>
                    
                    <!-- Boutons d'action -->
                    <div style="display: flex; gap: 20px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <button onclick="previewCenterHeader()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">📋 Aperçu</button>
                        <button onclick="saveCenterConfig()" style="background: #14b8a6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">💾 Enregistrer</button>
                        <button onclick="resetCenterConfig()" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer;">🔄 Réinitialiser</button>
                    </div>
                </div>
                
                <!-- Aperçu -->
                <div id="preview-container" style="margin-top: 30px; display: none;">
                    <h3 style="color: #1e293b; margin-bottom: 20px;">Aperçu de l'en-tête</h3>
                    <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 30px;">
                        <div id="preview-content"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Fonctions globales pour l'interface
    window.showCenterConfig = function() {
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = createConfigInterface();
        }
    };
    
    window.addDoctor = function() {
        const container = document.getElementById('doctors-container');
        const index = container.children.length;
        const doctorDiv = document.createElement('div');
        doctorDiv.className = 'doctor-item';
        doctorDiv.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: center;';
        doctorDiv.innerHTML = `
            <input type="text" placeholder="Nom du médecin" data-field="name" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            <input type="text" placeholder="Spécialité" data-field="specialty" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            <input type="text" placeholder="N° ORD" data-field="registration" data-index="${index}" style="padding: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
            <button onclick="removeDoctor(${index})" style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">×</button>
        `;
        container.appendChild(doctorDiv);
    };
    
    window.removeDoctor = function(index) {
        const container = document.getElementById('doctors-container');
        const items = container.querySelectorAll('.doctor-item');
        if (items[index]) {
            items[index].remove();
            // Réindexer les éléments restants
            reindexDoctors();
        }
    };
    
    function reindexDoctors() {
        const container = document.getElementById('doctors-container');
        const items = container.querySelectorAll('.doctor-item');
        items.forEach((item, index) => {
            const inputs = item.querySelectorAll('input');
            inputs.forEach(input => {
                input.setAttribute('data-index', index);
                const onclick = item.querySelector('button');
                if (onclick) {
                    onclick.setAttribute('onclick', `removeDoctor(${index})`);
                }
            });
        });
    }
    
    window.previewCenterHeader = function() {
        const config = collectFormData();
        window.updateCenterConfig(config);
        
        const previewContainer = document.getElementById('preview-container');
        const previewContent = document.getElementById('preview-content');
        
        if (previewContainer && previewContent) {
            previewContainer.style.display = 'block';
            previewContent.innerHTML = window.generateCenterHeader('full');
        }
    };
    
    window.saveCenterConfig = function() {
        const config = collectFormData();
        window.updateCenterConfig(config);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('medicalCenterConfig', JSON.stringify(config));
        
        alert('Configuration enregistrée avec succès !');
    };
    
    window.resetCenterConfig = function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
            localStorage.removeItem('medicalCenterConfig');
            location.reload();
        }
    };
    
    function collectFormData() {
        const doctors = [];
        const doctorItems = document.querySelectorAll('.doctor-item');
        doctorItems.forEach(item => {
            const nameInput = item.querySelector('input[data-field="name"]');
            const specialtyInput = item.querySelector('input[data-field="specialty"]');
            const registrationInput = item.querySelector('input[data-field="registration"]');
            
            if (nameInput && nameInput.value.trim()) {
                doctors.push({
                    name: nameInput.value.trim(),
                    specialty: specialtyInput ? specialtyInput.value.trim() : '',
                    registration: registrationInput ? registrationInput.value.trim() : ''
                });
            }
        });
        
        return {
            name: document.getElementById('center-name')?.value || '',
            subtitle: document.getElementById('center-subtitle')?.value || '',
            address: document.getElementById('center-address')?.value || '',
            phone: document.getElementById('center-phone')?.value || '',
            email: document.getElementById('center-email')?.value || '',
            website: document.getElementById('center-website')?.value || '',
            registrationNumber: document.getElementById('center-registration')?.value || '',
            licenseNumber: document.getElementById('center-license')?.value || '',
            specialties: document.getElementById('center-specialties')?.value.split('\\n').filter(s => s.trim()) || [],
            doctors: doctors
        };
    }
    
    // Charger la configuration sauvegardée au démarrage
    function loadSavedConfig() {
        const saved = localStorage.getItem('medicalCenterConfig');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                window.updateCenterConfig(config);
                console.log('CONFIG: Loaded saved configuration');
            } catch (e) {
                console.error('CONFIG: Error loading saved configuration', e);
            }
        }
    }
    
    // Initialiser
    setTimeout(loadSavedConfig, 1000);
    
    console.log('CONFIG: Center configuration interface ready');
})();
