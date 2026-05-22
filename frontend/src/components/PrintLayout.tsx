import { Consultation, Medicine, Service, Ticket } from '../types';
import { format } from 'date-fns';

interface PrintLayoutProps {
  consultation: Consultation;
  ticket?: Ticket;
  medicines: Medicine[];
  services: Service[];
  currentCenter: any;
  type: 'prescription' | 'labOrders';
}

export const generatePrintHTML = (consultation: Consultation, ticket?: Partial<Ticket>, medicines?: Medicine[], services?: Service[], currentCenter?: any, type?: 'prescription' | 'labOrders') => {
  const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
  
  if (type === 'prescription') {
    return generatePrescriptionHTML(consultation, ticket, medicines, currentCenter, currentDate);
  } else {
    return generateLabOrdersHTML(consultation, ticket, services, currentCenter, currentDate);
  }
};

const generatePrescriptionHTML = (consultation: Consultation, ticket?: Partial<Ticket>, medicines?: Medicine[], currentCenter?: any, currentDate?: string) => {
  // Validation des données
  if (!consultation) {
    return '<html><body><h1>Erreur: Aucune consultation fournie</h1></body></html>';
  }

  // Debug: afficher la structure des données
  console.log('Consultation data:', consultation);
  console.log('Prescription data:', consultation.prescription);
  console.log('Medicines available:', medicines?.length || 0);
  
  // Gérer différents formats de prescription
  let prescriptionData = [];
  if (consultation.prescription) {
    if (Array.isArray(consultation.prescription)) {
      prescriptionData = consultation.prescription;
    } else if (typeof consultation.prescription === 'string') {
      try {
        prescriptionData = JSON.parse(consultation.prescription);
      } catch (e) {
        prescriptionData = [];
      }
    }
  }
  
  const prescriptionItems = prescriptionData?.map((presc: any) => {
    const medicine = medicines?.find(m => m.id === presc.medicineId);
    return {
      ...presc,
      medicineName: medicine?.name || presc.medicineName || presc.name || 'Médicament inconnu',
      medicineDetails: medicine
    };
  }) || [];
  
  console.log('Prescription items processed:', prescriptionItems);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ordonnance - ${consultation.patientName || 'Patient inconnu'}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          color: #000;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 11pt;
        }
        
        .patient-info {
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .patient-info p {
          margin: 5px 0;
          font-size: 11pt;
        }
        
        .prescription-title {
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0 15px 0;
          text-decoration: underline;
        }
        
        .prescription-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 11pt;
        }
        
        .prescription-table th {
          background-color: #007bff;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #0056b3;
        }
        
        .prescription-table td {
          padding: 8px;
          border: 1px solid #ddd;
          vertical-align: top;
        }
        
        .prescription-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }
        
        .prescription-table tr:hover {
          background-color: #e9ecef;
        }
        
        .footer {
          margin-top: 40px;
          text-align: right;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin: 30px 0 0 auto;
          padding-top: 5px;
          font-size: 11pt;
        }
        
        .notes {
          margin-top: 20px;
          font-style: italic;
          font-size: 10pt;
          color: #666;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .prescription-table { page-break-inside: auto; }
          .prescription-table tr { page-break-inside: avoid; }
          .prescription-table td, .prescription-table th { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ordonnance Médicale</h1>
        <p><strong>${currentCenter?.name || 'Poste de Santé'}</strong></p>
        <p>${currentCenter?.address || ''}</p>
        <p>Tél: ${currentCenter?.phone || ''} | Email: ${currentCenter?.email || ''}</p>
        ${currentCenter?.rnis ? `<p>N° RNIS: ${currentCenter.rnis}</p>` : ''}
        ${currentCenter?.directorName ? `<p>Directeur: Dr. ${currentCenter.directorName}</p>` : ''}
        <p>N° Ordre: ${consultation.id || 'N/A'} | Date: ${currentDate || new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="patient-info">
        <div>
          <p><strong>Nom & Prénoms:</strong> ${consultation.patientName || 'N/A'}</p>
          <p><strong>Âge:</strong> ${ticket?.patientAge || 'N/A'} ans</p>
          <p><strong>Sexe:</strong> ${ticket?.patientGender === 'M' ? 'Masculin' : ticket?.patientGender === 'F' ? 'Féminin' : 'N/A'}</p>
        </div>
        <div>
          <p><strong>Téléphone:</strong> ${ticket?.patientPhone || 'N/A'}</p>
          <p><strong>Adresse:</strong> ${ticket?.patientAddress || 'N/A'}</p>
          <p><strong>Date:</strong> ${consultation.createdAt ? format(new Date(consultation.createdAt), 'dd/MM/yyyy') : new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
      
      <div class="prescription-title">PRESCRIPTION</div>
      
      ${prescriptionItems.length > 0 ? `
        <table class="prescription-table">
          <thead>
            <tr>
              <th width="5%">N°</th>
              <th width="25%">Médicament</th>
              <th width="20%">Posologie</th>
              <th width="10%">Quantité</th>
              <th width="15%">Forme</th>
              <th width="15%">DCI</th>
              <th width="10%">Catégorie</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${item.medicineName}</strong></td>
                <td>${item.dosage || 'N/A'}</td>
                <td>${item.quantity || 'N/A'}</td>
                <td>${item.form || 'N/A'}</td>
                <td>${item.medicineDetails?.dci || 'N/A'}</td>
                <td>${item.medicineDetails?.category || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p>Aucune prescription</p>'}
      
      ${consultation.notes ? `
        <div class="notes">
          <strong>Notes:</strong> ${consultation.notes}
        </div>
      ` : ''}
      
    </body>
    </html>
  `;
};

const generateLabOrdersHTML = (consultation: Consultation, ticket?: Partial<Ticket>, services: Service[] = [], currentCenter?: any, currentDate?: string) => {
  // Validation des données
  if (!consultation) {
    return '<html><body><h1>Erreur: Aucune consultation fournie</h1></body></html>';
  }

  // Debug: afficher la structure des données
  console.log('Lab orders data:', consultation.labOrders);
  console.log('Services available:', services?.length || 0);
  console.log('Services list:', services);
  
  // S'assurer que labOrders est un tableau et le convertir si nécessaire
  let labOrders = [];
  if (consultation.labOrders) {
    if (Array.isArray(consultation.labOrders)) {
      labOrders = consultation.labOrders;
    } else if (typeof consultation.labOrders === 'string') {
      try {
        labOrders = JSON.parse(consultation.labOrders);
      } catch (e) {
        labOrders = [consultation.labOrders];
      }
    }
  }

  const labServices = labOrders.map((serviceId: any) => {
    // Gérer différents formats d'ID
    const id = typeof serviceId === 'object' ? serviceId.id || serviceId.serviceId : serviceId;
    console.log('Looking for service with ID:', id);
    
    const service = services?.find(s => s.id === id);
    console.log('Found service:', service);
    
    return service || { 
      id: id, 
      name: typeof serviceId === 'object' ? serviceId.name || `Examen (ID: ${id})` : `Examen (ID: ${id})`, 
      category: typeof serviceId === 'object' ? serviceId.category || 'Non spécifié' : 'Non spécifié', 
      description: typeof serviceId === 'object' ? serviceId.description || '' : '',
      price: 0
    };
  });
  
  console.log('Final lab services:', labServices);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Prescription d'Examens - ${consultation.patientName || 'Patient inconnu'}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.4;
          margin: 0;
          padding: 0;
          color: #000;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
        }
        
        .header p {
          margin: 5px 0;
          font-size: 11pt;
        }
        
        .patient-info {
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .patient-info p {
          margin: 5px 0;
          font-size: 11pt;
        }
        
        .exam-title {
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0 15px 0;
          text-decoration: underline;
        }
        
        .exam-item {
          margin-bottom: 15px;
          padding: 12px;
          border-left: 3px solid #6f42c1;
          background-color: #f8f9fa;
          page-break-inside: avoid;
        }
        
        .exam-name {
          font-weight: bold;
          font-size: 12pt;
          margin-bottom: 5px;
        }
        
        .exam-details {
          font-size: 11pt;
          margin: 3px 0;
        }
        
        .exam-category {
          display: inline-block;
          background-color: #6f42c1;
          color: white;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 9pt;
          margin-top: 5px;
        }
        
        .clinical-info {
          margin: 20px 0;
          padding: 10px;
          background-color: #e9ecef;
          border-radius: 3px;
        }
        
        .clinical-info h4 {
          margin: 0 0 10px 0;
          font-size: 12pt;
        }
        
        .clinical-info p {
          margin: 5px 0;
          font-size: 11pt;
        }
        
        .footer {
          margin-top: 40px;
          text-align: right;
        }
        
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin: 30px 0 0 auto;
          padding-top: 5px;
          font-size: 11pt;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .exam-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Prescription d'Examens</h1>
        <p><strong>${currentCenter?.name || 'Poste de Santé'}</strong></p>
        <p>${currentCenter?.address || ''}</p>
        <p>Tél: ${currentCenter?.phone || ''} | Email: ${currentCenter?.email || ''}</p>
        ${currentCenter?.rnis ? `<p>N° RNIS: ${currentCenter.rnis}</p>` : ''}
        ${currentCenter?.directorName ? `<p>Directeur: Dr. ${currentCenter.directorName}</p>` : ''}
        <p>N° Prescription: ${consultation.id || 'N/A'} | Date: ${currentDate || new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="patient-info">
        <div>
          <p><strong>Nom & Prénoms:</strong> ${consultation.patientName || 'N/A'}</p>
          <p><strong>Âge:</strong> ${ticket?.patientAge || 'N/A'} ans</p>
          <p><strong>Sexe:</strong> ${ticket?.patientGender === 'M' ? 'Masculin' : ticket?.patientGender === 'F' ? 'Féminin' : 'N/A'}</p>
        </div>
        <div>
          <p><strong>Téléphone:</strong> ${ticket?.patientPhone || 'N/A'}</p>
          <p><strong>Adresse:</strong> ${ticket?.patientAddress || 'N/A'}</p>
          <p><strong>Date:</strong> ${consultation.createdAt ? format(new Date(consultation.createdAt), 'dd/MM/yyyy') : new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
      
      ${consultation.symptoms || consultation.diagnosis ? `
        <div class="clinical-info">
          <h4>Informations Cliniques</h4>
          ${consultation.symptoms ? `<p><strong>Symptômes:</strong> ${consultation.symptoms}</p>` : ''}
          ${consultation.diagnosis ? `<p><strong>Diagnostic:</strong> ${consultation.diagnosis}</p>` : ''}
        </div>
      ` : ''}
      
      <div class="exam-title">EXAMENS PRESCRITS</div>
      
      ${labServices.map((service, index) => `
        <div class="exam-item">
          <div class="exam-name">${index + 1}. ${service.name}</div>
          <div class="exam-details"><strong>Catégorie:</strong> ${service.category}</div>
          ${service.description ? `<div class="exam-details"><strong>Description:</strong> ${service.description}</div>` : ''}
          ${service.category ? `<div class="exam-category">${service.category}</div>` : ''}
        </div>
      `).join('') || '<p>Aucun examen prescrit</p>'}
      
      ${consultation.notes ? `
        <div style="margin-top: 20px; font-style: italic; font-size: 10pt; color: #666;">
          <strong>Notes:</strong> ${consultation.notes}
        </div>
      ` : ''}
      
    </body>
    </html>
  `;
};
