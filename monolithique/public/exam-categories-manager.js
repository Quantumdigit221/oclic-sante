// Exam Categories Manager
// Gestion des catégories d'examens avec unités et références

class ExamCategoriesManager {
    constructor() {
        this.categories = [];
        this.currentCategory = null;
        this.form = null;
        this.modal = null;
        this.isEditing = false;
        this.init();
    }

    init() {
        this.createModal();
        this.createForm();
        this.loadCategories();
        this.setupEventListeners();
    }

    createModal() {
        // Créer le modal
        this.modal = document.createElement('div');
        this.modal.id = 'exam-category-modal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Contenu du modal
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

        // Bouton fermer
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 16px;
        `;
        closeBtn.onclick = () => this.closeModal();

        modalContent.appendChild(closeBtn);
        this.modal.appendChild(modalContent);
        document.body.appendChild(this.modal);
    }

    createForm() {
        const modalContent = this.modal.querySelector('div');
        
        // Titre
        const title = document.createElement('h2');
        title.textContent = 'Gestion des Catégories d\'Examens';
        title.style.cssText = `
            margin-bottom: 20px;
            color: #007bff;
            text-align: center;
        `;
        modalContent.appendChild(title);

        // Formulaire
        this.form = document.createElement('form');
        this.form.id = 'exam-category-form';
        this.form.style.cssText = `
            display: grid;
            gap: 15px;
        `;

        // Champs du formulaire
        const fields = [
            { name: 'name', label: 'Nom de la catégorie', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'unit', label: 'Unité', type: 'text', placeholder: 'ex: g/L, mmol/L, UI/L...' },
            { name: 'referenceMin', label: 'Référence minimale', type: 'text', placeholder: 'ex: 0.5' },
            { name: 'referenceMax', label: 'Référence maximale', type: 'text', placeholder: 'ex: 1.2' },
            { name: 'referenceText', label: 'Texte de référence', type: 'textarea', placeholder: 'ex: Valeurs normales: 0.5-1.2 g/L' },
            { name: 'categoryType', label: 'Type de catégorie', type: 'select', options: ['Laboratoire', 'Radiologie', 'Cardiologie', 'Neurologie', 'Autre'] }
        ];

        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 5px;
            `;

            const label = document.createElement('label');
            label.textContent = field.label;
            label.style.cssText = `
                font-weight: bold;
                color: #333;
            `;

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                field.options.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = option;
                    input.appendChild(optionElement);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type;
            }

            input.name = field.name;
            input.id = field.name;
            if (field.placeholder) {
                input.placeholder = field.placeholder;
            }
            if (field.required) {
                input.required = true;
            }

            input.style.cssText = `
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 14px;
            `;

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            this.form.appendChild(formGroup);
        });

        // Boutons
        const buttonGroup = document.createElement('div');
        buttonGroup.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        `;

        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.textContent = 'Enregistrer';
        saveBtn.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Annuler';
        cancelBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        cancelBtn.onclick = () => this.closeModal();

        buttonGroup.appendChild(saveBtn);
        buttonGroup.appendChild(cancelBtn);
        this.form.appendChild(buttonGroup);

        // Événement de soumission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        modalContent.appendChild(this.form);
    }

    setupEventListeners() {
        // Bouton pour ajouter une catégorie
        const addBtn = document.createElement('button');
        addBtn.textContent = '+ Ajouter une catégorie';
        addBtn.style.cssText = `
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: background-color 0.3s;
        `;
        addBtn.onmouseover = () => addBtn.style.background = '#218838';
        addBtn.onmouseout = () => addBtn.style.background = '#28a745';
        addBtn.onclick = () => this.openModal();

        // Rechercher un meilleur emplacement pour le bouton
        const targetContainer = this.findBestContainer();
        if (targetContainer) {
            // Ajouter un conteneur pour le bouton si nécessaire
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding: 15px;
                margin: 10px 0;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            `;
            
            // Ajouter un titre
            const title = document.createElement('h3');
            title.textContent = 'Gestion des Catégories d\'Examens';
            title.style.cssText = `
                margin: 0;
                flex-grow: 1;
                color: #495057;
                font-size: 18px;
            `;
            
            buttonContainer.appendChild(title);
            buttonContainer.appendChild(addBtn);
            
            // Insérer au début du conteneur trouvé
            targetContainer.insertBefore(buttonContainer, targetContainer.firstChild);
            
            console.log('📋 Bouton "Ajouter une catégorie" placé dans:', targetContainer.className || targetContainer.tagName);
        } else {
            console.warn('⚠️ Conteneur approprié non trouvé pour le bouton "Ajouter une catégorie"');
            // Fallback: insérer dans le body
            document.body.appendChild(addBtn);
        }
    }

    findBestContainer() {
        // Liste des conteneurs par ordre de préférence
        const containers = [
            '.categories-container',
            '.exam-categories',
            '.admin-panel',
            '.management-section',
            '.main-content',
            '.container',
            '.content-wrapper',
            '.page-content'
        ];

        for (const selector of containers) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`✅ Conteneur trouvé: ${selector}`);
                return container;
            }
        }

        // Si aucun conteneur spécifique n'est trouvé, chercher des éléments communs
        const fallbackContainers = [
            'main',
            '.app',
            '#root',
            'body'
        ];

        for (const selector of fallbackContainers) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`🔄 Conteneur de fallback utilisé: ${selector}`);
                return container;
            }
        }

        return null;
    }

    async loadCategories() {
        try {
            const token = localStorage.getItem('oclic_sante_jwt_token');
            const response = await fetch('/api/exam-categories', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.categories = await response.json();
                this.displayCategories();
            } else {
                console.error('Erreur chargement catégories:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur chargement catégories:', error);
        }
    }

    displayCategories() {
        // Afficher la liste des catégories existantes
        let listContainer = document.getElementById('exam-categories-list');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.id = 'exam-categories-list';
            listContainer.style.cssText = `
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 5px;
            `;
            
            const modalContent = this.modal.querySelector('div');
            modalContent.appendChild(listContainer);
        }

        listContainer.innerHTML = '<h3>Catégories existantes:</h3>';

        this.categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.cssText = `
                background: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border: 1px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;

            const info = document.createElement('div');
            info.innerHTML = `
                <strong>${category.name}</strong><br>
                <small>Unité: ${category.unit || 'N/A'} | Référence: ${category.reference_text || `${category.reference_min || ''}-${category.reference_max || ''}`}</small>
            `;

            const actions = document.createElement('div');
            actions.style.cssText = `
                display: flex;
                gap: 5px;
            `;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Modifier';
            editBtn.style.cssText = `
                background: #ffc107;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            `;
            editBtn.onclick = () => this.editCategory(category);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.style.cssText = `
                background: #dc3545;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            `;
            deleteBtn.onclick = () => this.deleteCategory(category.id);

            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            categoryDiv.appendChild(info);
            categoryDiv.appendChild(actions);
            listContainer.appendChild(categoryDiv);
        });
    }

    openModal(category = null) {
        this.currentCategory = category;
        this.isEditing = !!category;

        if (category) {
            // Remplir le formulaire avec les données de la catégorie
            Object.keys(category).forEach(key => {
                const input = this.form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = category[key] || '';
                }
            });
        } else {
            // Vider le formulaire
            this.form.reset();
        }

        this.modal.style.display = 'flex';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.form.reset();
        this.currentCategory = null;
        this.isEditing = false;
    }

    async saveCategory() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        try {
            const token = localStorage.getItem('oclic_sante_jwt_token');
            const url = this.isEditing ? `/api/exam-categories/${this.currentCategory.id}` : '/api/exam-categories';
            const method = this.isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Catégorie enregistrée:', result);
                
                // Recharger la liste
                await this.loadCategories();
                this.closeModal();
                
                // Afficher une notification
                this.showNotification('Catégorie enregistrée avec succès', 'success');
            } else {
                console.error('Erreur enregistrement catégorie:', response.statusText);
                this.showNotification('Erreur lors de l\'enregistrement', 'error');
            }
        } catch (error) {
            console.error('Erreur enregistrement catégorie:', error);
            this.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('oclic_sante_jwt_token');
            const response = await fetch(`/api/exam-categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Catégorie supprimée');
                await this.loadCategories();
                this.showNotification('Catégorie supprimée avec succès', 'success');
            } else {
                console.error('Erreur suppression catégorie:', response.statusText);
                this.showNotification('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error('Erreur suppression catégorie:', error);
            this.showNotification('Erreur lors de la suppression', 'error');
        }
    }

    editCategory(category) {
        this.openModal(category);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 10001;
            font-size: 14px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialiser le gestionnaire quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    window.examCategoriesManager = new ExamCategoriesManager();
});

// Rendre disponible globalement
window.ExamCategoriesManager = ExamCategoriesManager;
