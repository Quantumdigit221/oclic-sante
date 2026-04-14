
import React, { useState } from 'react';
import { useStore } from '../store';
import {
  User,
  Search,
  Plus,
  History,
  MapPin,
  Phone,
  Calendar,
  Clock,
  FileText,
  X,
  CreditCard,
  AlertTriangle,
  Edit,
  Save,
  Pill,
  Stethoscope,
  Activity,
  Microscope
} from 'lucide-react';
import { Patient, TicketStatus, Consultation } from '../types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generatePrintHTML } from '../components/PrintLayout.tsx';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const Patients = () => {
  const { patients, tickets, consultations, sales, services, currentCenter, addPatient, updatePatient, medicines } = useStore();

  // Vérifications de sécurité pour éviter les erreurs filter
  const patientsList = Array.isArray(patients) ? patients : [];
  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  const salesList = Array.isArray(sales) ? sales : [];
  const servicesList = Array.isArray(services) ? services : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'billing'>('info');

  const safeAge = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : differenceInYears(new Date(), date);
  };

  const safeFormat = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : format(date, 'dd/MM/yyyy');
  };

  const safeFormatDate = (dateStr?: string | null, fmt: string = 'dd MMMM yyyy', fallback = '--') => {
    if (!dateStr) return fallback;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? fallback : format(date, fmt, { locale: fr });
  };

  // Fonctions d'impression
  const handlePrintPrescription = (consultation: any) => {
    if (!selectedPatient || !currentCenter) return;

    try {
      // Find the ticket associated with this consultation
      const ticket = ticketsList.find(t => t.id === consultation.ticketId);
      
      // Fallback ticket data from selectedPatient if not found
      const fallbackTicket = {
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientAge: safeAge(selectedPatient.birthDate) ?? selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientPhone: selectedPatient.phone,
        patientAddress: selectedPatient.address
      };

      const printContent = generatePrintHTML(
        consultation as any, 
        (ticket || fallbackTicket) as any, 
        medicines, 
        servicesList, 
        currentCenter, 
        'prescription'
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Erreur lors de la génération de l\'ordonnance');
    }
  };

  const handlePrintLabOrders = (consultation: any) => {
    if (!selectedPatient || !currentCenter) return;

    try {
      const ticket = ticketsList.find(t => t.id === consultation.ticketId);
      
      // Fallback ticket data from selectedPatient if not found
      const fallbackTicket = {
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientAge: safeAge(selectedPatient.birthDate) ?? selectedPatient.age,
        patientGender: selectedPatient.gender,
        patientPhone: selectedPatient.phone,
        patientAddress: selectedPatient.address
      };

      const printContent = generatePrintHTML(
        consultation as any, 
        (ticket || fallbackTicket) as any, 
        medicines, 
        servicesList, 
        currentCenter, 
        'labOrders'
      );

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('Erreur impression lab:', error);
      alert('Erreur lors de la génération des examens');
    }
  };


  // New Patient Form
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'M',
    phone: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});

  const filteredPatients = patientsList.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPatient.firstName && newPatient.lastName && newPatient.birthDate) {
      addPatient({
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        birthDate: newPatient.birthDate,
        gender: newPatient.gender as 'M' | 'F',
        phone: newPatient.phone,
        address: newPatient.address,
      });
      setShowAddModal(false);
      setNewPatient({ firstName: '', lastName: '', birthDate: '', gender: 'F', phone: '', address: '', bloodGroup: '', allergies: '', emergencyContact: '', emergencyPhone: '', notes: '' });
    }
  };

  const handleUpdatePatient = () => {
    if (selectedPatient && editForm) {
      updatePatient(selectedPatient.id, editForm);
      setSelectedPatient({ ...selectedPatient, ...editForm } as Patient);
      setIsEditing(false);
    }
  };

  const openPatientDetails = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditForm(patient);
    setIsEditing(false);
    setActiveTab('info');
  };

  // Helper for safe name comparison
  const normalize = (str: any) => (str || '').toString().toLowerCase().trim();

  // Get History Stats
  const patientName = selectedPatient ? `${selectedPatient.firstName || ''} ${selectedPatient.lastName || ''}` : '';

  const patientTickets = selectedPatient
    ? ticketsList.filter(t => normalize(t.patientName) === normalize(patientName) || (t.patientPhone && t.patientPhone === selectedPatient.phone))
    : [];

  const patientConsultations = selectedPatient
    ? consultationsList.filter(c => normalize(c.patientName) === normalize(patientName))
    : [];

  const patientSales = selectedPatient
    ? salesList.filter(s => normalize(s.patientName || '') === normalize(patientName))
    : [];

  // Combine Tickets and Sales for Billing History
  const billingHistory = [
    ...patientTickets.map(t => ({
      id: t.id,
      date: t.createdAt,
      type: 'Consultation',
      description: t.serviceName,
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      status: t.status === TicketStatus.COMPLETED ? 'Payé' : t.status,
      icon: <Stethoscope className="w-4 h-4 text-blue-500" />
    })),
    ...patientSales.map(s => ({
      id: s.id,
      date: s.createdAt,
      type: 'Pharmacie',
      description: `Achat Médicaments (${s.items.length})`,
      amount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      status: 'Payé',
      icon: <Pill className="w-4 h-4 text-emerald-500" />
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Patients</h2>
          <p className="text-sm text-slate-500">Base de données et dossiers médicaux</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors font-medium w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou code..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contacts</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Dernière Visite</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openPatientDetails(patient)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${patient.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                        {(patient.firstName || '').charAt(0)}{(patient.lastName || '').charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{patient.firstName || ''} {patient.lastName || ''}</div>
                        <div className="text-xs text-slate-500">
                          {safeAge(patient.birthDate) !== null ? `${safeAge(patient.birthDate)} ans • ${safeFormat(patient.birthDate)}` : 'Âge inconnu'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">{patient.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone || 'Non renseigné'}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {patient.address || 'Non renseigné'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    --
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPatientDetails(patient);
                      }}
                      className="text-teal-600 hover:text-teal-800 font-medium text-sm"
                    >
                      Voir Dossier
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Aucun patient trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Nouveau Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPatient.firstName}
                    onChange={e => setNewPatient({ ...newPatient, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPatient.lastName}
                    onChange={e => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de Naissance</label>
                  <input
                    type="date" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPatient.birthDate}
                    onChange={e => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                  />
                  {safeAge(newPatient.birthDate) !== null && (
                    <p className="text-xs text-slate-500 mt-1">
                      Âge: {safeAge(newPatient.birthDate)} ans
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                  >
                    <option value="F">Féminin</option>
                    <option value="M">Masculin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input
                  type="tel" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={newPatient.address}
                  onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-400 text-slate-900 rounded-lg hover:bg-teal-500 font-medium shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

            {/* Sidebar */}
            <div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-3xl font-bold shadow-sm ${selectedPatient.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                ${(selectedPatient.firstName || '').charAt(0)}${(selectedPatient.lastName || '').charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedPatient.firstName || ''} {selectedPatient.lastName || ''}</h2>
              <p className="text-slate-500 text-sm mb-4">{selectedPatient.code}</p>

              <div className="w-full space-y-3 mb-6">
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-left">
                  <span className="text-xs text-slate-400 block uppercase">Âge</span>
                  <span className="font-medium text-slate-800">{safeAge(selectedPatient.birthDate) ?? 0} ans</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-left">
                  <span className="text-xs text-slate-400 block uppercase">Groupe Sanguin</span>
                  <span className="font-medium text-slate-800">{selectedPatient.bloodGroup || '--'}</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-left">
                  <span className="text-xs text-slate-400 block uppercase">Allergies</span>
                  <span className="font-medium text-red-600">{selectedPatient.allergies || 'Aucune connue'}</span>
                </div>
              </div>

              <div className="mt-auto w-full">
                <button onClick={() => setSelectedPatient(null)} className="w-full py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-white transition-colors">
                  Fermer
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'info' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <User className="w-4 h-4" /> Informations
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <History className="w-4 h-4" /> Dossier Médical
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'billing' ? 'border-teal-600 text-teal-700 bg-teal-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  <CreditCard className="w-4 h-4" /> Facturation
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-900">Informations Générales</h3>
                      <button
                        onClick={() => isEditing ? handleUpdatePatient() : setIsEditing(true)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isEditing ? 'bg-teal-400 text-slate-900 hover:bg-teal-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        {isEditing ? 'Enregistrer' : 'Modifier'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Téléphone</label>
                          {isEditing ? (
                            <input
                              type="text" className="w-full p-2 border rounded" value={editForm.phone}
                              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2 text-slate-900"><Phone className="w-4 h-4 text-slate-400" /> {selectedPatient.phone || 'Non renseigné'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Adresse</label>
                          {isEditing ? (
                            <input
                              type="text" className="w-full p-2 border rounded" value={editForm.address}
                              onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center gap-2 text-slate-900"><MapPin className="w-4 h-4 text-slate-400" /> {selectedPatient.address || 'Non renseigné'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
                          {isEditing ? (
                            <input
                              type="text" className="w-full p-2 border rounded" value={editForm.email || ''}
                              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          ) : (
                            <div className="text-slate-900">{selectedPatient.email || 'Non renseigné'}</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Groupe Sanguin</label>
                          {isEditing ? (
                            <select
                              className="w-full p-2 border rounded" value={editForm.bloodGroup || ''}
                              onChange={e => setEditForm({ ...editForm, bloodGroup: e.target.value as any })}
                            >
                              <option value="">Inconnu</option>
                              {BLOOD_GROUPS.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="text-slate-900">{selectedPatient.bloodGroup || 'Non renseigné'}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Allergies</label>
                          {isEditing ? (
                            <input
                              type="text" className="w-full p-2 border rounded" value={editForm.allergies || ''}
                              onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                              placeholder="Séparez par des virgules"
                            />
                          ) : (
                            <div className="text-red-600 font-medium flex items-center gap-2">
                              {selectedPatient.allergies ? <AlertTriangle className="w-4 h-4" /> : null}
                              {selectedPatient.allergies || 'Aucune'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Contact d'urgence</label>
                          {isEditing ? (
                            <input
                              type="text" className="w-full p-2 border rounded" value={editForm.emergencyContact || ''}
                              onChange={e => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                              placeholder="Nom & Relation"
                            />
                          ) : (
                            <div className="text-slate-900">{selectedPatient.emergencyContact || 'Non renseigné'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Historique des Consultations</h3>
                      {patientConsultations.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border border-dashed rounded-lg">
                          Aucune consultation enregistrée.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientConsultations.map(cons => (
                            <div key={cons.id} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-teal-500 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-bold text-teal-700 text-lg">{cons.diagnosis}</h4>
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" /> {safeFormatDate(cons.createdAt, 'dd MMMM yyyy à HH:mm')}
                                  </p>
                                </div>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                  Dr. {cons.doctorName}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                <div>
                                  <span className="font-semibold text-slate-700 block mb-1">Symptômes:</span>
                                  <p className="text-slate-600">{cons.symptoms}</p>
                                </div>
                              </div>

                              {/* Vitals Summary */}
                              <div className="flex gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                                {cons.temperature && <span>Temp: {cons.temperature}°C</span>}
                                {cons.bloodPressure && <span>TA: {cons.bloodPressure}</span>}
                                {cons.weight && <span>Poids: {cons.weight}kg</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-600" />
                        Ordonnances
                      </h3>
                      {patientConsultations.filter(c => c.prescription && c.prescription.length > 0).length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border border-dashed rounded-lg">
                          <Pill className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                          Aucune ordonnance dans le dossier
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientConsultations.filter(c => c.prescription && c.prescription.length > 0).map(cons => (
                            <div key={`presc-${cons.id}`} className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-xs text-blue-600 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {safeFormatDate(cons.createdAt, 'dd MMMM yyyy')}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">Dr. {cons.doctorName}</p>
                                </div>
                                <button
                                  onClick={() => handlePrintPrescription(cons)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                  Imprimer
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(Array.isArray(cons.prescription) ? cons.prescription : []).map((p, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border border-blue-200">
                                    <div className="font-semibold text-blue-900">{p.medicineName}</div>
                                    <div className="text-blue-700 text-sm">
                                      <div>Dosage: {p.dosage}</div>
                                      <div>Quantité: {p.quantity} {p.form}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" />
                        Examens Prescrits
                      </h3>
                      {patientConsultations.filter(c => c.labOrders && c.labOrders.length > 0).length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border border-dashed rounded-lg">
                          <Activity className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                          Aucun examen prescrit dans le dossier
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientConsultations.filter(c => c.labOrders && c.labOrders.length > 0).map(cons => (
                            <div key={`lab-${cons.id}`} className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-xs text-purple-600 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {safeFormatDate(cons.createdAt, 'dd MMMM yyyy')}
                                  </p>
                                  <p className="text-xs text-purple-600 mt-1">Dr. {cons.doctorName}</p>
                                </div>
                                <button
                                  onClick={() => handlePrintLabOrders(cons)}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 text-sm"
                                >
                                  Imprimer
                                </button>
                              </div>
                              <div className="space-y-2">
                                {Array.isArray(cons.labOrders) && cons.labOrders.map((serviceId, idx) => {
                                  const service = services.find(s => s.id === serviceId);
                                  return (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200">
                                      <div className="font-semibold text-purple-900">{service?.name || 'Examen inconnu'}</div>
                                      <div className="text-purple-700 text-sm">
                                        Catégorie: {service?.category || 'Non spécifié'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900">Historique Facturation</h3>
                    <div className="overflow-x-auto w-full border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Description</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Montant</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Mode</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {billingHistory.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-slate-500">Aucune transaction trouvée.</td></tr>
                          ) : (
                            billingHistory.map(item => (
                              <tr key={item.id}>
                                <td className="px-4 py-3 text-slate-600">{safeFormatDate(item.date, 'dd/MM/yyyy')}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {item.icon}
                                    <div>
                                      <div className="font-medium text-slate-900">{item.description}</div>
                                      <div className="text-xs text-slate-400">{item.type}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700">{item.amount} FCFA</td>
                                <td className="px-4 py-3 font-medium text-slate-900">
                                  {item.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : item.paymentMethod === 'CARD' ? 'Carte Bancaire' : 'Espèces'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'Payé' || item.status === TicketStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800' :
                                    item.status === 'Annulé' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};
