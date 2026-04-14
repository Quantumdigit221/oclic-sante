import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { generatePrintHTML } from '../components/PrintLayout.tsx';
import { VoiceField } from '../components/VoiceField.tsx';
import { DesktopVoiceField } from '../components/DesktopVoiceField.tsx';
import { TestVoiceField } from '../components/TestVoiceField.tsx';
import { PrescriptionsVoiceCommand } from '../components/PrescriptionsVoiceCommand.tsx';
import {
  User,
  Clock,
  Activity,
  FileText,
  Thermometer,
  Heart,
  Weight,
  Stethoscope,
  Plus,
  Mic,
  Trash2,
  Save,
  History,
  Search,
  Printer,
  FlaskConical,
  Pill,
  X,
  AlertCircle
} from 'lucide-react';
import { TicketStatus, Ticket, PrescriptionItem, Medicine, Service } from '../types';

type Tab = 'clinical' | 'prescription' | 'exams';

export const Consultations = () => {
  const navigate = useNavigate();
  const { tickets, updateTicketStatus, currentUser, medicines, services, saveConsultation, consultations, currentCenter, refreshTickets, patients, services: allServices } = useStore();
  
  // Guard for array states
  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const servicesList = Array.isArray(services) ? services : [];
  const medicinesList = Array.isArray(medicines) ? medicines : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('clinical');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Consultation Form State
  const [vitals, setVitals] = useState({ temp: '', weight: '', bp: '', pulse: '' });
  const [clinical, setClinical] = useState({ symptoms: '', diagnosis: '', notes: '' });
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  const [labOrders, setLabOrders] = useState<string[]>([]);

  // Prescription Input State
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [medDosage, setMedDosage] = useState('');
  const [medQty, setMedQty] = useState(1);

  // Exam Input State
  const [examSearch, setExamSearch] = useState('');

  // Functions for printing and downloading
  const handlePrintPrescription = (consultation: any) => {
    try {
      if (!consultation) {
        alert('Aucune consultation sélectionnée');
        return;
      }

      const ticket = tickets.find(t => t.id === consultation.ticketId);
      const printContent = generatePrintHTML(consultation, ticket, medicines, services, currentCenter, 'prescription');

      if (!printContent) {
        alert('Erreur lors de la génération de l\'ordonnance');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      } else {
        alert('Veuillez autoriser les pop-ups pour imprimer');
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression de l\'ordonnance');
    }
  };

  const handleDownloadPrescription = (consultation: any) => {
    try {
      if (!consultation) {
        alert('Aucune consultation sélectionnée');
        return;
      }

      const ticket = tickets.find(t => t.id === consultation.ticketId);
      const printContent = generatePrintHTML(consultation, ticket, medicines, services, currentCenter, 'prescription');

      if (!printContent) {
        alert('Erreur lors de la génération de l\'ordonnance');
        return;
      }

      const blob = new Blob([printContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ordonnance_${consultation.patientName.replace(/\s+/g, '_')}_${format(new Date(consultation.createdAt), 'dd-MM-yyyy')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de l\'ordonnance');
    }
  };

  const handlePrintLabOrders = (consultation: any) => {
    try {
      if (!consultation) {
        alert('Aucune consultation sélectionnée');
        return;
      }

      const ticket = tickets.find(t => t.id === consultation.ticketId);
      const printContent = generatePrintHTML(consultation, ticket, medicines, allServices, currentCenter, 'labOrders');

      if (!printContent) {
        alert('Erreur lors de la génération des ordres d\'examens');
        return;
      }

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      } else {
        alert('Veuillez autoriser les pop-ups pour imprimer');
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de l\'impression des ordres d\'examens');
    }
  };

  const handleDownloadLabOrders = (consultation: any) => {
    try {
      if (!consultation) {
        alert('Aucune consultation sélectionnée');
        return;
      }

      const ticket = tickets.find(t => t.id === consultation.ticketId);
      const printContent = generatePrintHTML(consultation, ticket, medicines, allServices, currentCenter, 'labOrders');

      if (!printContent) {
        alert('Erreur lors de la génération des ordres d\'examens');
        return;
      }

      const blob = new Blob([printContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `examens_${consultation.patientName.replace(/\s+/g, '_')}_${format(new Date(consultation.createdAt), 'dd-MM-yyyy')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement des ordres d\'examens');
    }
  };

  const waitingTickets = useMemo(() =>
    ticketsList.filter(t =>
      t && (t.status === 'WAITING' || t.status === 'IN_PROGRESS') &&
      // Filtrer pour ne garder que les consultations ou urgences
      (t.serviceCategory === 'Consultation' || t.serviceCategory === 'Urgences' || t.serviceName?.toLowerCase().includes('consultation') || t.serviceName?.toLowerCase().includes('urgence')) &&
      // Inclure les tickets sans doctorId OU ceux assignés au médecin courant OU si l'utilisateur est admin
      (!t.doctorId || t.doctorId === currentUser?.id || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN') &&
      // Inclure les tickets sans centerId (compatibilité) OU ceux du centre courant
      (!t.centerId || t.centerId === currentCenter?.id || currentCenter === null)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [ticketsList, currentUser, currentCenter]);

  const patientHistory = useMemo(() =>
    selectedTicket ? consultations.filter(c => c.patientName === selectedTicket.patientName) : [],
    [selectedTicket, consultations]);

  const filteredMedicines = useMemo(() =>
    medSearch ? medicines.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase()) || m.dci.toLowerCase().includes(medSearch.toLowerCase())) : [],
    [medSearch, medicines]);

  const availableServices = useMemo(() =>
    servicesList.filter(s => s && s.category !== 'Consultation' && s.isActive && (
      (s.name || '').toLowerCase().includes((examSearch || '').toLowerCase()) ||
      (s.category || '').toLowerCase().includes((examSearch || '').toLowerCase())
    )),
    [servicesList, examSearch]);

  // Group services by category for better display in Exam tab
  const servicesByCategory = useMemo((): Record<string, Service[]> => {
    const grouped: Record<string, Service[]> = {};
    (availableServices || []).forEach(s => {
      if (!s || !s.category) return;
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    return grouped;
  }, [availableServices]);

  const handleSelectTicket = (ticket: Ticket) => {
    console.log('🎫 Ticket sélectionné:', JSON.stringify(ticket, null, 2));
    setSelectedTicket(ticket);

    // Forcer le selectedTicket à rester défini même après les re-rendus
    setTimeout(() => {
      setSelectedTicket(current => current?.id === ticket.id ? current : ticket);
    }, 100);

    if (ticket.status === 'WAITING') {
      console.log('🔄 Mise à jour du statut du ticket vers IN_PROGRESS');
      updateTicketStatus(ticket.id, 'IN_PROGRESS');
    }
    // Reset Form
    setVitals({ temp: '', weight: '', bp: '', pulse: '' });
    setClinical({ symptoms: '', diagnosis: '', notes: '' });
    setPrescription([]);
    setLabOrders([]);
    setMedSearch('');
    setSelectedMed(null);
    setActiveTab('clinical');
  };

  const handleAddMedicine = () => {
    const medicineName = selectedMed ? selectedMed.name : medSearch;
    if (medicineName && medDosage) {
      setPrescription(prev => [
        ...prev,
        {
          medicineId: selectedMed?.id || '',
          medicineName: medicineName,
          dosage: medDosage,
          quantity: medQty,
          form: selectedMed?.form || 'Comprimé'
        }
      ]);
      setSelectedMed(null);
      setMedSearch('');
      setMedDosage('');
      setMedQty(1);
    }
  };

  const toggleLabOrder = (serviceId: string) => {
    setLabOrders(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleSaveConsultation = async () => {
    if (!selectedTicket || !currentUser) return;

    // Validation: Vérifier qu'au moins un diagnostic est saisi
    if (!clinical.diagnosis.trim()) {
      alert('Veuillez saisir un diagnostic avant de sauvegarder la consultation.');
      return;
    }

    // Find patient in the global list to ensure patientId is available
    const patient = patients.find(p => `${p.firstName} ${p.lastName}` === selectedTicket.patientName);
    const patientId = selectedTicket.patientId || patient?.id;

    if (!patientId) {
      alert("Impossible de trouver le patient associé à ce ticket. Veuillez vérifier les données.");
      return;
    }

    try {
      const savedConsultation = await saveConsultation({
        centerId: selectedTicket.centerId,
        ticketId: selectedTicket.id,
        patientId: patientId,
        status: 'completed',
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        patientName: selectedTicket.patientName,
        temperature: vitals.temp ? parseFloat(vitals.temp) : undefined,
        weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
        bloodPressure: vitals.bp,
        pulse: vitals.pulse ? parseFloat(vitals.pulse) : undefined,
        symptoms: clinical.symptoms,
        diagnosis: clinical.diagnosis,
        notes: clinical.notes,
        prescription: JSON.stringify(prescription || []),
        labOrders: labOrders || []
      });

      if (savedConsultation) {
        await updateTicketStatus(selectedTicket.id, 'COMPLETED');

        // Find the patient from the patients list
        const patient = patients.find(p =>
          `${p.firstName} ${p.lastName}` === selectedTicket.patientName
        );

        // Show success message and reset form
        alert("Consultation enregistrée avec succès !");

        // Reset form
        setSelectedTicket(null);
        setVitals({ temp: '', weight: '', bp: '', pulse: '' });
        setClinical({ symptoms: '', diagnosis: '', notes: '' });
        setPrescription([]);
        setLabOrders([]);
      }

    } catch (error) {
      console.error('Error saving consultation:', error);
      alert("Erreur lors de la sauvegarde de la consultation. Veuillez réessayer.");
    }
  };

  const handleClosePrintModal = () => {
    setShowPrintModal(false);
    setSelectedTicket(null); // Clear form and go back to queue
  };

  const handlePrintPreview = () => {
    setShowPrintModal(true);
  };

  // Helper to get service name/cat from ID
  const getServiceInfo = (id: string) => services.find(s => s.id === id);

  // Reload tickets on page load
  useEffect(() => {
    console.log('Loading consultations page, refreshing tickets...');
    // refreshTickets(); // Désactivé temporairement pour éviter la réinitialisation du selectedTicket
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">

        {/* Left Column: Waiting Queue */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              File d'attente ({waitingTickets.length})
            </h3>
            <button
              onClick={refreshTickets}
              className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"
              title="Rafraîchir la liste"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {waitingTickets.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Aucun patient en attente</p>
              </div>
            ) : (
              waitingTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === ticket.id
                    ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:border-teal-300 bg-white'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900">{ticket.patientName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.patientAge} ans ({ticket.patientGender})</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(ticket.createdAt), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                      {ticket.serviceName}
                    </div>
                    {ticket.serviceCategory && (
                    <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100 italic">
                      {ticket.serviceCategory}
                    </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Consultation Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Stethoscope className="w-20 h-20 mb-4 opacity-20" />
              <h3 className="text-xl font-medium text-slate-600">Espace de Consultation</h3>
              <p>Sélectionnez un patient dans la file d'attente pour commencer.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-2 bg-teal-50 border-b border-teal-200">
                <p className="text-sm text-teal-700">🎫 Ticket en cours: {selectedTicket.patientName}</p>
              </div>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-slate-500" />
                    {selectedTicket.patientName}
                  </h2>
                  <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    <span>{selectedTicket.patientAge} ans</span>
                    <span>{selectedTicket.patientGender === 'M' ? 'Masculin' : 'Féminin'}</span>
                    <span>Ticket: {selectedTicket.ticketNumber}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('clinical')}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg flex items-center gap-2 px-3 border border-blue-200"
                    title="Voir les antécédents"
                  >
                    <History className="w-5 h-5" />
                    <span className="text-sm font-medium">Antécédents</span>
                  </button>
                  <button
                    onClick={handlePrintPreview}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"
                    title="Aperçu Ordonnance"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg"
                    title="Imprimer Ticket"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  {selectedTicket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'COMPLETED')}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      title="Terminer Consultation"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('clinical')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'clinical' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Activity className="w-4 h-4" /> Examen Clinique
                </button>
                <button
                  onClick={() => setActiveTab('prescription')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'prescription' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <Pill className="w-4 h-4" /> Prescription ({prescription.length})
                </button>
                <button
                  onClick={() => setActiveTab('exams')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'exams' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <FlaskConical className="w-4 h-4" /> Examens & Actes ({labOrders.length})
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* History Section */}
                {patientHistory.length > 0 && (
                  <div className="bg-white border-2 border-slate-100 rounded-xl p-4 mb-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                      <History className="w-5 h-5 text-blue-600" /> 
                      HISTORIQUE MÉDICAL ({patientHistory.length})
                    </h4>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {patientHistory.map(hist => (
                        <div key={hist.id} className="text-sm bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-bold text-slate-900 block">{format(new Date(hist.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                              <span className="text-xs text-slate-500">Dr. {hist.doctorName || 'Inconnu'}</span>
                            </div>
                            <div className="flex gap-1">
                              {(hist.prescription && hist.prescription.length > 0) && (
                                <>
                                  <button
                                    onClick={() => handlePrintPrescription(hist)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Imprimer l'ordonnance"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadPrescription(hist)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                    title="Télécharger l'ordonnance"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                              {(hist.labOrders && hist.labOrders.length > 0) && (
                                <>
                                  <button
                                    onClick={() => handlePrintLabOrders(hist)}
                                    className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                    title="Imprimer les examens"
                                  >
                                    <FlaskConical className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDownloadLabOrders(hist)}
                                    className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                    title="Télécharger les examens"
                                  >
                                    <FileText className="w-3 h-3" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          {hist.symptoms && (
                            <div className="text-[10px] text-slate-500 italic mb-1">
                              Motif: {hist.symptoms}
                            </div>
                          )}
                          <span className="text-slate-600 font-medium">{hist.diagnosis}</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {(() => {
                              const prescriptionArr = Array.isArray(hist.prescription)
                                ? hist.prescription
                                : (typeof hist.prescription === 'string' && (hist.prescription.startsWith('[') || hist.prescription.startsWith('{')))
                                  ? JSON.parse(hist.prescription)
                                  : [];

                              const labOrdersArr = Array.isArray(hist.labOrders)
                                ? hist.labOrders
                                : (typeof hist.labOrders === 'string' && hist.labOrders.startsWith('['))
                                  ? JSON.parse(hist.labOrders)
                                  : [];

                              const prescCount = Array.isArray(prescriptionArr) ? prescriptionArr.length : 0;
                              const labsCount = Array.isArray(labOrdersArr) ? labOrdersArr.length : 0;

                              return (
                                <>
                                  {prescCount > 0 && (
                                    <div className="mt-1 text-blue-600 flex items-center gap-1">
                                      <Pill className="w-3 h-3" />
                                      <span>{prescCount} médicament(s)</span>
                                    </div>
                                  )}
                                  {labsCount > 0 && (
                                    <div className="mt-1 text-purple-600 flex items-center gap-1">
                                      <FlaskConical className="w-3 h-3" />
                                      <span>{labsCount} examen(s)</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Tab Content */}
                {activeTab === 'clinical' && (
                  <>
                    {/* Vitals */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        Constantes Vitales
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Température</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="37°C"
                            value={vitals.temp}
                            onChange={e => setVitals(prev => ({ ...prev, temp: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Poids</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="70 kg"
                            value={vitals.weight}
                            onChange={e => setVitals(prev => ({ ...prev, weight: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Tension</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="120/80"
                            value={vitals.bp}
                            onChange={e => setVitals(prev => ({ ...prev, bp: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Pouls</label>
                          <input
                            type="text"
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="72 bpm"
                            value={vitals.pulse}
                            onChange={e => setVitals(prev => ({ ...prev, pulse: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clinical Examination */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                        Examen Clinique
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Symptômes / Motif de consultation</label>
                          <textarea
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={3}
                            placeholder="Décrire les symptômes du patient..."
                            value={clinical.symptoms}
                            onChange={e => setClinical(prev => ({ ...prev, symptoms: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Diagnostic</label>
                          <textarea
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={2}
                            placeholder="Diagnostic provisoire..."
                            value={clinical.diagnosis}
                            onChange={e => setClinical(prev => ({ ...prev, diagnosis: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 font-medium">Notes cliniques</label>
                          <textarea
                            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={3}
                            placeholder="Observations supplémentaires..."
                            value={clinical.notes}
                            onChange={e => setClinical(prev => ({ ...prev, notes: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Prescription Tab Content */}
                {activeTab === 'prescription' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-500" />
                        Prescription Médicale
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                          <div className="md:col-span-5 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Rechercher médicament..."
                              value={selectedMed ? selectedMed.name : medSearch}
                              onChange={e => {
                                setMedSearch(e.target.value);
                                setSelectedMed(null);
                              }}
                            />
                            {/* Dropdown for filtered medicines */}
                            {medSearch && filteredMedicines.length > 0 && (
                              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10 mt-1">
                                {filteredMedicines.map(med => (
                                  <div
                                    key={med.id}
                                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                    onClick={() => {
                                      setSelectedMed(med);
                                      setMedSearch(med.name);
                                    }}
                                  >
                                    <div className="font-medium text-sm">{med.name}</div>
                                    <div className="text-xs text-slate-500">{med.dci} - {med.form}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="md:col-span-4">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Posologie"
                              value={medDosage}
                              onChange={e => setMedDosage(e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Qté"
                              min="1"
                              value={medQty}
                              onChange={e => setMedQty(parseInt(e.target.value))}
                            />
                          </div>
                          <div className="md:col-span-1">
                            <button
                              onClick={handleAddMedicine}
                              disabled={!selectedMed || !medDosage}
                              className="w-full h-full bg-teal-400 text-slate-900 rounded-lg flex items-center justify-center hover:bg-teal-500 disabled:bg-slate-300"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {prescription.length > 0 ? (
                          <div className="space-y-2">
                            {prescription.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-white">
                                <div>
                                  <div className="font-medium text-slate-900">{item.medicineName}</div>
                                  <div className="text-sm text-teal-600">{item.dosage}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-slate-700">x{item.quantity}</span>
                                  <button
                                    onClick={() => setPrescription(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400">
                            Aucun médicament prescrit
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Exams Tab Content */}
                {activeTab === 'exams' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-purple-500" />
                        Examens & Actes
                      </h3>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Rechercher un examen..."
                            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                            value={examSearch}
                            onChange={e => setExamSearch(e.target.value)}
                          />
                        </div>

                        {Object.entries(servicesByCategory).map(([category, catServices]) => (
                          <div key={category} className="mb-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              {category} ({catServices.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {catServices.map(service => (
                                <div
                                  key={service.id}
                                  onClick={() => toggleLabOrder(service.id)}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                    labOrders.includes(service.id)
                                      ? 'border-teal-500 bg-teal-50'
                                      : 'border-slate-200 hover:border-teal-300 bg-white'
                                  }`}
                                >
                                  <div className="font-medium text-slate-900 text-sm">{service.name}</div>
                                  {service.category && (
                                    <div className="text-xs text-slate-400 mt-1">{service.category}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  {selectedTicket && (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      N'oubliez pas de sauvegarder la consultation
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveConsultation}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder la consultation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && selectedTicket && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center no-print">
              <h3 className="font-bold text-slate-800">Aperçu de l'ordonnance</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-300 font-medium">
                  <Printer className="w-4 h-4" /> Imprimer
                </button>
                <button onClick={handleClosePrintModal} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50">
                  Fermer et Terminer
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white" id="prescription-area">
              <div className="max-w-2xl mx-auto space-y-8 font-serif">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-black uppercase tracking-wide">{currentCenter?.name}</h1>
                    <p className="text-sm text-black mt-1 font-medium">{currentCenter?.address}</p>
                    <p className="text-sm text-black font-medium">Tel: {currentCenter?.phone}</p>
                    <p className="text-sm text-black">{currentCenter?.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-black mb-2">
                      <p className="font-bold">Ordonnance N°: {selectedTicket?.id}</p>
                      <p>Date: {format(new Date(), 'dd MMMM yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="border-b border-black pb-6">
                  <h2 className="font-bold text-lg text-black mb-3">Patient</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm text-black">
                    <div>
                      <p><span className="font-medium">Nom:</span> {selectedTicket?.patientName}</p>
                      <p><span className="font-medium">Téléphone:</span> {selectedTicket?.patientPhone}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Adresse:</span> {selectedTicket?.patientAddress}</p>
                      <p><span className="font-medium">Âge:</span> {selectedTicket?.patientAge} ans</p>
                    </div>
                  </div>
                </div>

                {/* Prescription */}
                {prescription.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-lg text-black mb-4 border-b border-black pb-1 uppercase tracking-wider">Prescription</h3>
                    <ol className="list-decimal list-inside space-y-4">
                      {prescription.map((item, idx) => (
                        <li key={idx} className="pl-2">
                          <span className="font-bold text-lg text-black">{item.medicineName}</span> <span className="text-black text-sm">({item.form})</span>
                          <div className="pl-6 text-black italic mt-1 font-medium">{item.dosage}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Lab Orders */}
                {labOrders.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-bold text-lg text-black mb-4 border-b border-black pb-1 uppercase tracking-wider">Demande d'examens</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {labOrders.map(id => {
                        const service = services.find(s => s.id === id);
                        return (
                          <li key={id} className="text-lg text-black pl-2 font-medium">
                            {service?.name} <span className="text-sm font-normal">({service?.category})</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-end pt-12 border-t-2 border-black">
                  <div className="text-center w-48">
                    <p className="text-sm text-black mb-12 font-bold">Signature & Cachet</p>
                    <div className="h-0.5 w-full bg-black"></div>
                    <p className="text-xs text-black mt-1 font-bold">Dr. {currentUser?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Consultations;
