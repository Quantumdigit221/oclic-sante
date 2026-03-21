// Configuration du centre médical pour les en-têtes d'impression
(function() {
    'use strict';
    
    console.log('CENTER: Initializing medical center configuration...');
    
    // Configuration du centre médical
    const medicalCenterConfig = {
        // Informations principales
        name: "CENTRE MEDICAL O'CLIC",
        subtitle: "Plateforme de Gestion Médicale Intégrée",
        
        // Coordonnées
        address: "Rue de la Santé, Conakry, Guinée",
        phone: "+224 622 123 456",
        email: "contact@oclicsante.com",
        website: "www.oclicsante.com",
        
        // Informations professionnelles
        registrationNumber: "N° REG: CM-2024-001",
        licenseNumber: "N° LIC: MED-GN-2024-001",
        
        // Horaires
        workingHours: {
            monday: "08:00 - 18:00",
            tuesday: "08:00 - 18:00", 
            wednesday: "08:00 - 18:00",
            thursday: "08:00 - 18:00",
            friday: "08:00 - 18:00",
            saturday: "08:00 - 14:00",
            sunday: "Fermé"
        },
        
        // Services spécialisés
        specialties: [
            "Médecine Générale",
            "Pédiatrie", 
            "Gynécologie",
            "Urgences",
            "Laboratoire d'Analyse",
            "Radiologie",
            "Cardiologie"
        ],
        
        // Équipe médicale
        doctors: [
            { name: "Dr. Marie Dupont", specialty: "Médecine Générale", registration: "ORD-001" },
            { name: "Dr. Ahmad Ba", specialty: "Pédiatrie", registration: "ORD-002" },
            { name: "Dr. Fatoumata Diallo", specialty: "Gynécologie", registration: "ORD-003" }
        ],
        
        // Informations de paiement
        paymentMethods: ["Espèces", "Mobile Money", "Carte Bancaire", "Assurance"],
        
        // Réseaux sociaux
        social: {
            facebook: "facebook.com/oclicsante",
            whatsapp: "+224 622 123 456",
            instagram: "@oclicsante"
        }
    };
    
    // Rendre la configuration accessible globalement
    window.medicalCenterConfig = medicalCenterConfig;
    
    // Fonction pour générer l'en-tête du centre
    window.generateCenterHeader = function(type = 'full') {
        const config = window.medicalCenterConfig;
        
        switch(type) {
            case 'full':
                return `
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
                            ${config.name}
                        </div>
                        <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">
                            ${config.subtitle}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                            ${config.address}
                        </div>
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">
                            📞 ${config.phone} | ✉️ ${config.email}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
                            ${config.registrationNumber} | ${config.licenseNumber}
                        </div>
                        <div style="border-top: 2px solid #14b8a6; padding-top: 8px; margin-top: 8px;">
                            <div style="font-size: 11px; color: #64748b;">
                                ${config.specialties.slice(0, 4).join(' • ')}
                            </div>
                        </div>
                    </div>
                `;
                
            case 'simple':
                return `
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 6px;">
                            ${config.name}
                        </div>
                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">
                            ${config.address}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8;">
                            📞 ${config.phone} | ✉️ ${config.email}
                        </div>
                        <div style="border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 4px;">
                            <div style="font-size: 10px; color: #94a3b8;">
                                ${config.registrationNumber}
                            </div>
                        </div>
                    </div>
                `;
                
            case 'compact':
                return `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 18px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">
                            ${config.name}
                        </div>
                        <div style="font-size: 10px; color: #64748b;">
                            ${config.address} | 📞 ${config.phone}
                        </div>
                    </div>
                `;
                
            default:
                return generateCenterHeader('full');
        }
    };
    
    // Fonction pour générer le pied de page du centre
    window.generateCenterFooter = function(type = 'full') {
        const config = window.medicalCenterConfig;
        const currentDate = new Date().toLocaleDateString('fr-FR');
        
        switch(type) {
            case 'full':
                return `
                    <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
                            ${config.name} | ${config.address}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-bottom: 6px;">
                            📞 ${config.phone} | ✉️ ${config.email} | 🌐 ${config.website}
                        </div>
                        <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
                            ${config.registrationNumber} | ${config.licenseNumber}
                        </div>
                        <div style="font-size: 9px; color: #94a3b8;">
                            Document généré le ${currentDate} | Ce document est confidentiel
                        </div>
                    </div>
                `;
                
            case 'simple':
                return `
                    <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                        <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">
                            ${config.name} | ${config.address}
                        </div>
                        <div style="font-size: 9px; color: #94a3b8;">
                            📞 ${config.phone} | Document généré le ${currentDate}
                        </div>
                    </div>
                `;
                
            case 'compact':
                return `
                    <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        <div style="font-size: 9px; color: #94a3b8;">
                            ${config.name} | ${currentDate}
                        </div>
                    </div>
                `;
                
            default:
                return generateCenterFooter('full');
        }
    };
    
    // Fonction pour mettre à jour la configuration
    window.updateCenterConfig = function(newConfig) {
        Object.assign(window.medicalCenterConfig, newConfig);
        console.log('CENTER: Configuration updated', window.medicalCenterConfig);
    };
    
    // Fonction pour obtenir les informations d'un médecin
    window.getDoctorInfo = function(doctorId) {
        const config = window.medicalCenterConfig;
        return config.doctors.find(doc => doc.registration === doctorId) || config.doctors[0];
    };
    
    // Fonction pour obtenir les horaires formatés
    window.getFormattedHours = function() {
        const config = window.medicalCenterConfig;
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        return days.map((day, index) => {
            const hours = config.workingHours[dayKeys[index]];
            return `${day}: ${hours}`;
        }).join(' | ');
    };
    
    console.log('CENTER: Medical center configuration ready');
    console.log('CENTER: Current config:', medicalCenterConfig);
})();
