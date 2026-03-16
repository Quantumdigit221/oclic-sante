// Composant Tickets pour l'architecture monolithique
// Inspiré du code React original mais adapté pour Node.js/Express

import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Printer, User, Clock, CheckCircle, XCircle, FileText, QrCode, AlertTriangle } from 'lucide-react';

export const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentCenter, setCurrentCenter] = useState({
    id: 'center-1',
    name: 'Centre Médical O\'CLIC SANTE',
    address: '123 Rue de la Santé, Dakar, Sénégal',
    phone: '+221 33 123 45 67',
    email: 'contact@sante.quantum221.com',
    rnis: 'RNIS-001',
    pispiAlias: 'OCLIC-SANTE'
  });

  // États du composant
  const [showModal, setShowModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);
  const [filter, setFilter] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const serviceDropdownRef = useRef(null);

  // Données du formulaire
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'F',
    patientPhone: '',
    patientAddress: '',
    serviceId: '',
    doctorId: '',
    paymentMethod: 'CASH',
    notes: ''
  });

  // Charger les données depuis l'API locale
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger toutes les données depuis l'API monolithique
      const [ticketsRes, servicesRes, usersRes, patientsRes] = await Promise.all([
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/patients').then(r => r.json())
      ]);

      setTickets(ticketsRes.tickets || []);
      setServices(servicesRes.services || []);
      setUsers(usersRes.users || []);
      setPatients(patientsRes.patients || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      // Utiliser les données par défaut si l'API n'est pas disponible
      setDefaultData();
    }
  };

  const setDefaultData = () => {
    // Données par défaut pour le mode démo
    setTickets([
      {
        id: 'ticket-001',
        ticketNumber: 'TKT-20240315-001',
        patientName: 'Patient Test',
        patientAge: 35,
        patientGender: 'M',
        serviceName: 'Consultation générale',
        status: 'WAITING',
        amount: 5000,
        createdAt: new Date().toISOString()
      }
    ]);

    setServices([
      {
        id: 'service-001',
        name: 'Consultation générale',
        category: 'Consultation',
        price: 5000,
        emergencyPrice: 7500,
        isActive: true
      },
      {
        id: 'service-002',
        name: 'Consultation pédiatrique',
        category: 'Consultation',
        price: 6000,
        emergencyPrice: 9000,
        isActive: true
      }
    ]);

    setUsers([
      {
        id: 'user-001',
        name: 'Dr. Administrateur',
        role: 'DOCTOR',
        specialty: 'Médecine générale'
      }
    ]);
  };

  const getServiceId = (s) => {
    if (!s) return '';
    if (typeof s === 'string') return s.trim();
    if (s && typeof s === 'object' && 'id' in s) {
      return s.id != null ? String(s.id).trim() : '';
    }
    return '';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount || 0);
  };

  const format = (date, formatStr) => {
    const d = new Date(date);
    if (formatStr === 'HH:mm') {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (formatStr === 'dd/MM/yyyy HH:mm') {
      return d.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return d.toLocaleDateString('fr-FR');
  };

  const createTicket = async (ticketData) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });
      
      if (response.ok) {
        const newTicket = await response.json();
        setTickets(prev => [...prev, newTicket]);
        return newTicket;
      }
      throw new Error('Erreur création ticket');
    } catch (error) {
      console.error('Erreur:', error);
      // Simulation pour le mode démo
      const mockTicket = {
        ...ticketData,
        id: 'ticket-' + Date.now(),
        ticketNumber: 'TKT-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      setTickets(prev => [...prev, mockTicket]);
      return mockTicket;
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setTickets(prev => prev.map(t => 
          t.id === ticketId ? { ...t, status: newStatus } : t
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Simulation pour le mode démo
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientName.trim()) {
      alert('Veuillez entrer le nom du patient');
      return;
    }

    if (!formData.patientAge || parseInt(formData.patientAge) <= 0) {
      alert('Veuillez entrer un âge valide');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Veuillez sélectionner au moins un service');
      return;
    }

    try {
      const uniqueSelectedServices = [...new Set(selectedServices)];
      const uniqueSelectedServicesList = services.filter(s => 
        uniqueSelectedServices.includes(getServiceId(s))
      );

      const amount = uniqueSelectedServicesList.reduce((total, service) => {
        const servicePrice = parseFloat(String(service.price)) || 0;
        return total + servicePrice;
      }, 0);

      // Créer un ticket pour chaque service sélectionné
      const createdTickets = [];

      for (const service of uniqueSelectedServicesList) {
        const ticketData = {
          centerId: currentCenter.id,
          patientName: formData.patientName,
          patientAge: parseInt(formData.patientAge),
          patientGender: formData.patientGender,
          patientPhone: formData.patientPhone,
          patientAddress: formData.patientAddress,
          serviceId: getServiceId(service),
          serviceName: service.name,
          amount: parseFloat(String(service.price)) || 0,
          paymentMethod: formData.paymentMethod,
          doctorId: formData.doctorId,
          notes: formData.notes,
          status: 'WAITING'
        };

        const ticket = await createTicket(ticketData);
        if (ticket) {
          createdTickets.push(ticket);
        }
      }

      if (createdTickets.length > 0) {
        setPrintTicket(createdTickets[0]);
        if (createdTickets.length > 1) {
          alert(`${createdTickets.length} tickets créés avec succès.`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des tickets');
      return;
    }

    // Réinitialiser le formulaire
    setShowModal(false);
    setFormData({
      patientName: '', patientAge: '', patientGender: 'F', patientPhone: '', 
      patientAddress: '', serviceId: '', doctorId: '', paymentMethod: 'CASH', notes: ''
    });
    setSelectedServices([]);
    setServiceSearch('');
  };

  const filteredTickets = tickets.filter(t =>
    (t?.patientName || '').toLowerCase().includes((filter || '').toLowerCase()) ||
    (t?.ticketNumber || '').toLowerCase().includes((filter || '').toLowerCase())
  );

  const filteredPatients = patientSearch
    ? patients.filter(p =>
      (`${p?.firstName || ''} ${p?.lastName || ''}`).toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p?.phone || '').includes(patientSearch)
    )
    : [];

  const filteredServices = serviceSearch
    ? services.filter(service => {
        const id = getServiceId(service);
        const isActive = service?.isActive !== false;
        const isValid = id !== '';
        const matchesSearch = (service?.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
          service?.category?.toLowerCase().includes(serviceSearch.toLowerCase()));
        return isActive && isValid && (serviceSearch ? matchesSearch : true);
      })
    : services.filter(service => {
        const id = getServiceId(service);
        const isActive = service?.isActive !== false;
        const isValid = id !== '';
        return isActive && isValid;
      });

  const handleSelectPatient = (patient) => {
    setFormData({
      ...formData,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientAge: String(new Date().getFullYear() - new Date(patient.birthDate).getFullYear()),
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAddress: patient.address,
    });
    setPatientSearch('');
  };

  const handleSelectService = (service) => {
    const serviceId = getServiceId(service);

    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
      setServiceSearch('');
    } else {
      setSelectedServices(prev => {
        const newSelection = [...prev];
        if (!newSelection.includes(serviceId)) {
          newSelection.push(serviceId);
        }
        return newSelection;
      });
      setServiceSearch(service.name);
      setShowServiceDropdown(false);
    }
  };

  const selectedServicesList = services.filter(s => selectedServices.includes(getServiceId(s)));
  const uniqueSelectedServices = [...new Set(selectedServices)];
  const uniqueSelectedServicesList = services.filter(s => uniqueSelectedServices.includes(getServiceId(s)));
  const amount = uniqueSelectedServicesList.reduce((total, service) => {
    const servicePrice = parseFloat(String(service.price)) || 0;
    return total + servicePrice;
  }, 0);
  const safeAmount = isNaN(amount) ? 0 : amount;

  // Composants UI simplifiés
  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className={`${color} p-4 rounded-xl border border-slate-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Tickets</h2>
          <p className="text-sm text-slate-500">File d'attente et facturation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Rafraîchir"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          title="En attente"
          value={tickets.filter(t => t.status === 'WAITING').length}
          icon={Clock}
          color="bg-amber-100"
        />
        <MetricCard
          title="En cours"
          value={tickets.filter(t => t.status === 'IN_PROGRESS').length}
          icon={User}
          color="bg-blue-100"
        />
        <MetricCard
          title="Terminés"
          value={tickets.filter(t => t.status === 'COMPLETED').length}
          icon={CheckCircle}
          color="bg-emerald-100"
        />
        <MetricCard
          title="Total Tickets"
          value={tickets.length}
          icon={FileText}
          color="bg-slate-100"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un patient ou n° ticket..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">N° Ticket</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Heure</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{ticket.ticketNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                        {ticket.patientGender}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.patientName}</p>
                        <p className="text-xs text-slate-500">{ticket.patientAge} ans</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ticket.serviceName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${ticket.status === 'WAITING' ? 'bg-amber-100 text-amber-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                      }
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {format(new Date(ticket.createdAt), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPrintTicket(ticket)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                        title="Imprimer ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {ticket.status === 'WAITING' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Démarrer consultation"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'COMPLETED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Terminer consultation"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Aucun ticket trouvé.
            </div>
          )}
        </div>
      </div>

      {/* Modal et autres composants peuvent être ajoutés ici */}
      {/* ... */}
    </div>
  );
};
