
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, ShoppingCart, Plus, AlertTriangle, Package, Calendar, FileText, Printer, CreditCard, Banknote, Smartphone, X, User, QrCode, Edit, Trash2, Download, Filter, TrendingUp } from 'lucide-react';
import { isBefore, addMonths, parseISO, format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Sale, Consultation, Medicine } from '../types';
import { Card, MetricCard } from '../components/ui/Card';

class PharmacyErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('[Pharmacy] Runtime error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:'40px', textAlign:'center', color:'#ef4444'}}>
          <h2 style={{fontSize:'20px', fontWeight:'bold', marginBottom:'12px'}}>⚠️ Erreur dans le module Pharmacie</h2>
          <p style={{color:'#64748b', marginBottom:'16px'}}>{this.state.error}</p>
          <button onClick={() => this.setState({hasError:false, error:''})} style={{padding:'8px 16px', background:'#0d9488', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PharmacyInner = () => {

  const { medicines, addSale, consultations, currentCenter, patients, addMedicine, updateMedicine, deleteMedicine, sales } = useStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'movements'>('inventory');
  const [cart, setCart] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Vérifications de sécurité pour éviter les erreurs filter
  const medicinesArray = Array.isArray(medicines) ? medicines : [];
  const patientsArray = Array.isArray(patients) ? patients : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  const salesList = Array.isArray(sales) ? sales : [];
  
  // Patient Selection State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const [showPatientList, setShowPatientList] = useState(false);

  // Medicine Management State
  const [showMedModal, setShowMedModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [medForm, setMedForm] = useState<Partial<Medicine>>({
    name: '', dci: '', stock: 0, minStock: 10, price: 0, 
    category: 'Général', expiryDate: '', batchNumber: '', form: 'Comprimé'
  });

  // Checkout State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'CARD'>('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  
  // Receipt State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Prescription Import State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);
  const [servedPrescriptions, setServedPrescriptions] = useState<Set<string>>(new Set());

  // Movement Report State
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMedicine, setSelectedMedicine] = useState<string>('all');
  const [movementType, setMovementType] = useState<string>('all');

  const filteredMedicines = medicinesArray.filter(m => 
    (m.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (m.dci?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patientsArray.filter(p => 
    `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (p.phone || '').includes(customerSearch)
  );

  const handleOpenMedModal = (med?: Medicine) => {
    if (med) {
      setEditingMed(med);
      setMedForm(med);
    } else {
      setEditingMed(null);
      setMedForm({
        name: '', dci: '', stock: 0, minStock: 10, price: 0, 
        category: 'Général', expiryDate: '', batchNumber: '', form: 'Comprimé'
      });
    }
    setShowMedModal(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medForm.name || !medForm.price) return;

    if (editingMed && editingMed.id) {
      updateMedicine(editingMed.id, medForm);
    } else {
      addMedicine(medForm as Omit<Medicine, 'id' | 'centerId'>);
    }
    setShowMedModal(false);
  };

  const handleDeleteMedicine = (id: string, name: string) => {
    if(window.confirm(`Voulez-vous vraiment supprimer "${name}" de l'inventaire ?`)) {
       deleteMedicine(id);
    }
  };

  const addToCart = (med: any, qtyToAdd: number = 1) => {
    if (med.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === med.id);
      if (existing) {
        if (existing.qty + qtyToAdd > med.stock) return prev; // Cannot add more than stock
        return prev.map(item => item.id === med.id ? {...item, qty: item.qty + qtyToAdd} : item);
      }
      return [...prev, { id: med.id, name: med.name, price: med.price, qty: qtyToAdd }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const changeDue = paymentMethod === 'CASH' && amountReceived ? Number(amountReceived) - totalAmount : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const saleItems = cart.map(item => ({
      medicineId: item.id,
      medicineName: item.name,
      quantity: item.qty,
      unitPrice: item.price,
      total: item.price * item.qty
    }));

    // Customer Name logic
    const finalCustomerName = selectedPatientName || "Client de passage";

    addSale(saleItems, paymentMethod, selectedTicketId, finalCustomerName);
    
    // Create temp sale object for receipt
    const newSale: Sale = {
       id: `sale-${Date.now()}`,
       centerId: currentCenter?.id || '',
       ticketId: selectedTicketId,
       patientName: finalCustomerName,
       items: saleItems,
       totalAmount: totalAmount,
       paymentMethod: paymentMethod,
       createdAt: new Date().toISOString(),
    };

    setLastSale(newSale);
    setShowCheckoutModal(false);
    setShowReceiptModal(true);
    setCart([]);
    setAmountReceived('');
    setSelectedTicketId(undefined);
    setSelectedPatientName('');
    setCustomerSearch('');
  };

  const importPrescription = (consultation: Consultation) => {
    const newCartItems: any[] = [];
    
    // Gérer à la fois les tableaux et les chaînes JSON
    let prescriptionItems: any[] = [];
    try {
      prescriptionItems = Array.isArray(consultation.prescription) 
        ? consultation.prescription 
        : (typeof consultation.prescription === 'string' && consultation.prescription ? JSON.parse(consultation.prescription) : []);
    } catch(e) {
      console.warn('[Pharmacy] Failed to parse prescription:', e);
      prescriptionItems = [];
    }
    
    if (Array.isArray(prescriptionItems)) {
      prescriptionItems.forEach((item: any) => {
        const med = medicines.find(m => m.id === item.medicineId);
        if (med && med.stock > 0) {
        // Only add if we have stock
        const qty = Math.min(item.quantity, med.stock);
        newCartItems.push({
          id: med.id,
          name: med.name,
          price: med.price,
          qty: qty
        });
      }
    });
    } // close if(Array.isArray)

    setCart(newCartItems);
    setSelectedTicketId(consultation.ticketId);
    setSelectedPatientName(consultation.patientName);
    
    // Marquer cette ordonnance comme servie
    setServedPrescriptions(prev => new Set([...prev, consultation.id]));
    
    setShowPrescriptionModal(false);
  };

  const selectPatient = (patient: any) => {
    const patientFullName = `${patient.firstName} ${patient.lastName}`;
    setSelectedPatientName(patientFullName);
    setCustomerSearch(patientFullName);
    setShowPatientList(false);

    // Automatically import the latest prescription
    const patientConsultations = consultationsList
      .filter(c => c.patientName === patientFullName)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (patientConsultations.length > 0 && patientConsultations[0].prescription && patientConsultations[0].prescription.length > 0) {
      console.log(`Importing prescription for ${patientFullName}...`);
      importPrescription(patientConsultations[0]);
    }
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiry = parseISO(dateStr);
    const threeMonthsFromNow = addMonths(new Date(), 3);
    return isBefore(expiry, threeMonthsFromNow);
  };

  // --- Movement Report Logic ---
  interface MedicamentMovement {
    id: string;
    date: string;
    medicineName: string;
    medicineId: string;
    movementType: 'VENTE' | 'PERTE' | 'RETOUR' | 'AJOUT';
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    patientName?: string;
    referenceNumber?: string;
    paymentMethod?: string;
    batchNumber?: string;
    category?: string;
  }

  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    let end: Date = endOfDay(now);

    switch (period) {
      case 'daily':
        start = startOfDay(subDays(now, 1));
        break;
      case 'weekly':
        start = startOfDay(subDays(now, 7));
        break;
      case 'monthly':
        start = startOfDay(subDays(now, 30));
        break;
      case 'custom':
        start = startOfDay(new Date(startDate));
        end = endOfDay(new Date(endDate));
        break;
      default:
        start = startOfDay(subDays(now, 7));
    }

    return { start, end };
  };

  const medicationMovements: MedicamentMovement[] = useMemo(() => {
    const { start, end } = getDateRange();
    const movements: MedicamentMovement[] = [];

    // Process sales
    salesList.forEach(sale => {
      const saleDate = new Date(sale.createdAt);
      if (saleDate >= start && saleDate <= end && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          movements.push({
            id: `${sale.id}-${item.medicineId}`,
            date: sale.createdAt,
            medicineName: item.medicineName,
            medicineId: item.medicineId,
            movementType: 'VENTE',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalAmount: item.total,
            patientName: sale.patientName,
            referenceNumber: sale.id,
            paymentMethod: sale.paymentMethod,
            batchNumber: medicines.find(m => m.id === item.medicineId)?.batchNumber,
            category: medicines.find(m => m.id === item.medicineId)?.category
          });
        });
      }
    });

    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [salesList, medicines, startDate, endDate, period]);

  const filteredMovements = useMemo(() => {
    return medicationMovements.filter(movement => {
      const medicineMatch = selectedMedicine === 'all' || movement.medicineId === selectedMedicine;
      const typeMatch = movementType === 'all' || movement.movementType === movementType;
      return medicineMatch && typeMatch;
    });
  }, [medicationMovements, selectedMedicine, movementType]);

  const statistics = useMemo(() => {
    const totalQuantity = filteredMovements.reduce((sum, m) => sum + m.quantity, 0);
    const totalAmount = filteredMovements.reduce((sum, m) => sum + m.totalAmount, 0);
    const uniqueMedicines = new Set(filteredMovements.map(m => m.medicineId)).size;
    
    const movementsByType = filteredMovements.reduce((acc, m) => {
      acc[m.movementType] = (acc[m.movementType] || 0) + m.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topMedicines = Object.entries(
      filteredMovements.reduce((acc, m) => {
        acc[m.medicineName] = (acc[m.medicineName] || 0) + m.quantity;
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([nameA, quantityA]: [string, number], [nameB, quantityB]: [string, number]) => quantityB - quantityA)
      .slice(0, 5)
      .map(([name, quantity]: [string, number]) => ({ name, quantity }));

    return {
      totalQuantity,
      totalAmount,
      uniqueMedicines,
      movementsByType,
      topMedicines
    };
  }, [filteredMovements]);

  const exportToCSV = () => {
    const headers = [
      'Date', 'Médicament', 'Catégorie', 'Type Mouvement', 'Quantité', 
      'Prix Unitaire', 'Montant Total', 'Patient', 'Référence', 'Mode Paiement'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredMovements.map(m => [
        format(new Date(m.date), 'dd/MM/yyyy HH:mm'),
        m.medicineName,
        m.category || '',
        m.movementType,
        m.quantity,
        m.unitPrice,
        m.totalAmount,
        m.patientName || '',
        m.referenceNumber || '',
        m.paymentMethod || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport_mouvements_medicaments_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const printContent = document.getElementById('medication-movement-print');
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacie</h2>
          <p className="text-sm text-slate-500">Gestion des stocks et ventes</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'inventory' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inventaire
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'sales' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vente / Caisse
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'movements' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mouvements Stock
          </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex gap-4">
             <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher médicament..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => handleOpenMedModal()}
              className="bg-teal-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-teal-500"
            >
              <Plus className="w-4 h-4" /> Ajouter Produit
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                  <th className="px-6 py-4">Nom Produit</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Prix Unitaire</th>
                  <th className="px-6 py-4">Péremption</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMedicines.map(med => (
                  <tr key={`med-${med.id || med.name}-${Math.random().toString(36).substr(2, 9)}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{med.name}</div>
                      <div className="text-xs text-slate-500">{med.dci}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{med.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${med.stock <= med.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                          {med.stock}
                        </span>
                        {med.stock <= med.minStock && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{med.price} FCFA</td>
                    <td className="px-6 py-4 text-sm">
                      {med.expiryDate && (
                        <div className={`flex items-center gap-1 ${isExpiringSoon(med.expiryDate) ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                          <Calendar className="w-3 h-3" />
                          {format(parseISO(med.expiryDate), 'dd/MM/yyyy')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenMedModal(med)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMedicine(med.id, med.name)}
                          className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'sales' && (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Product List */}
          <Card className="flex-1 overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Chercher un produit..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button 
                onClick={() => setShowPrescriptionModal(true)}
                className="ml-4 text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 font-medium flex items-center gap-2"
               >
                 <FileText className="w-4 h-4" /> Ordonnances
               </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-4">
                  {filteredMedicines.map(med => (
                    <div key={`med-grid-${med.id || med.name}-${Math.random().toString(36).substr(2, 9)}`} className="border border-slate-200 p-4 rounded-lg hover:border-teal-400 transition-colors bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-800 text-sm truncate flex-1" title={med.name}>{med.name}</h4>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 ml-2">{med.stock}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 truncate">{med.dci}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-teal-700 text-sm">{med.price} FCFA</span>
                        <button 
                          onClick={() => addToCart(med)}
                          disabled={med.stock <= 0}
                          className="bg-teal-400 text-slate-900 p-2 rounded-lg hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </Card>

          {/* Cart */}
          <Card className="w-80 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <ShoppingCart className="w-5 h-5 text-teal-600" />
                 Panier Actuel
               </h3>
               {selectedPatientName && (
                 <div className="mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex justify-between items-center">
                   <span>Patient: {selectedPatientName}</span>
                   <button onClick={() => { setSelectedPatientName(''); setSelectedTicketId(undefined); }}><X className="w-3 h-3"/></button>
                 </div>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {cart.length === 0 ? (
                 <div className="text-center py-10 text-slate-400 text-sm">
                   Votre panier est vide.
                 </div>
               ) : (
                 cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-2">
                     <div className="flex-1">
                       <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                       <div className="text-xs text-slate-500">{item.price} x {item.qty}</div>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-bold text-slate-700 text-sm">{item.price * item.qty}</span>
                       <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))
               )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-600 font-medium">Total à payer</span>
                 <span className="text-2xl font-bold text-teal-700">{totalAmount} FCFA</span>
               </div>
               
               <div className="relative mb-3">
                  {!selectedPatientName ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Rechercher / Nom du client..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-teal-500 outline-none"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowPatientList(true);
                        }}
                        onBlur={() => setTimeout(() => setShowPatientList(false), 200)}
                      />
                      {showPatientList && customerSearch && (
                        <div className="absolute bottom-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mb-1 z-10">
                           {filteredPatients.map(p => (
                             <div 
                              key={p.id} 
                              className="p-2 hover:bg-slate-50 cursor-pointer text-sm"
                              onMouseDown={() => selectPatient(p)}
                             >
                               <div className="font-bold">{p.firstName} {p.lastName}</div>
                               <div className="text-xs text-slate-500">{p.phone}</div>
                             </div>
                           ))}
                           <div className="p-2 hover:bg-slate-50 cursor-pointer text-sm text-teal-600 italic border-t" onMouseDown={() => {
                             setSelectedPatientName(customerSearch);
                             setShowPatientList(false);
                           }}>
                             Utiliser "{customerSearch}" comme nom
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 bg-white border border-slate-200 rounded-lg text-sm flex justify-between items-center">
                       <span className="font-medium">{selectedPatientName}</span>
                       <button onClick={() => {setSelectedPatientName(''); setCustomerSearch(''); }} className="text-slate-400 hover:text-slate-600">
                         <Edit className="w-3 h-3" />
                       </button>
                    </div>
                  )}
               </div>

               <button 
                onClick={() => setShowCheckoutModal(true)}
                disabled={cart.length === 0}
                className="w-full bg-teal-400 text-slate-900 py-3 rounded-xl font-bold hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
               >
                 Encaisser
               </button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'movements' && (
        <>
          {/* Header with Export Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Rapport de Mouvement de Stock</h3>
              <p className="text-sm text-slate-500">Suivi des mouvements de médicaments</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="bg-teal-400 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-teal-500"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button 
                onClick={exportToPDF}
                className="bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-300"
              >
                <FileText className="w-4 h-4" /> Export PDF
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Période</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setPeriod('daily')}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${period === 'daily' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    24h
                  </button>
                  <button 
                    onClick={() => setPeriod('weekly')}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${period === 'weekly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    7J
                  </button>
                  <button 
                    onClick={() => setPeriod('monthly')}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${period === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    30J
                  </button>
                  <button 
                    onClick={() => setPeriod('custom')}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all ${period === 'custom' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                  >
                    Perso
                  </button>
                </div>
              </div>

              {/* Custom Date Range */}
              {period === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date début</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date fin</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Medicine Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Médicament</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  value={selectedMedicine}
                  onChange={(e) => setSelectedMedicine(e.target.value)}
                >
                  <option value="all">Tous les médicaments</option>
                  {medicines.map(med => (
                    <option key={med.id} value={med.id}>{med.name}</option>
                  ))}
                </select>
              </div>

              {/* Movement Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type Mouvement</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="VENTE">Vente</option>
                  <option value="PERTE">Perte</option>
                  <option value="RETOUR">Retour</option>
                  <option value="AJOUT">Ajout Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Total Quantité</p>
                <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><Package className="w-4 h-4"/></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{statistics.totalQuantity} <span className="text-sm font-normal text-slate-500">unités</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Montant Total</p>
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><TrendingUp className="w-4 h-4"/></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{statistics.totalAmount.toLocaleString()} <span className="text-sm font-normal text-slate-500">FCFA</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Médicaments Uniques</p>
                <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><Package className="w-4 h-4"/></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{statistics.uniqueMedicines} <span className="text-sm font-normal text-slate-500">types</span></h3>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500">Mouvements</p>
                <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><AlertTriangle className="w-4 h-4"/></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">{filteredMovements.length} <span className="text-sm font-normal text-slate-500">transactions</span></h3>
            </div>
          </div>

          {/* Top Medicines */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Top 5 Médicaments Vendus</h3>
            <div className="space-y-2">
              {statistics.topMedicines.map((med, index) => (
                <div key={med.name} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-900">{med.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{med.quantity} unités</span>
                </div>
              ))}
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Détail des Mouvements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Médicament</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Quantité</th>
                    <th className="px-6 py-4">Prix Unit.</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Référence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMovements.map(movement => (
                    <tr key={movement.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm">
                        {format(new Date(movement.date), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{movement.medicineName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{movement.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          movement.movementType === 'VENTE' ? 'bg-green-100 text-green-700' :
                          movement.movementType === 'PERTE' ? 'bg-red-100 text-red-700' :
                          movement.movementType === 'RETOUR' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {movement.movementType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{movement.quantity}</td>
                      <td className="px-6 py-4 text-sm">{movement.unitPrice} FCFA</td>
                      <td className="px-6 py-4 text-sm font-bold">{movement.totalAmount} FCFA</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{movement.patientName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 font-mono">{movement.referenceNumber || '-'}</td>
                    </tr>
                  ))}
                  {filteredMovements.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-slate-500">
                        Aucun mouvement trouvé pour la période sélectionnée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print Content (Hidden) */}
          <div id="medication-movement-print" className="hidden print:block">
            <div className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{currentCenter?.name}</h1>
                <p className="text-slate-600">{currentCenter?.address}</p>
                <p className="text-slate-600">{currentCenter?.phone}</p>
                <h2 className="text-xl font-bold mt-4">Rapport de Mouvement de Médicaments</h2>
                <p className="text-slate-600">
                  {format(getDateRange().start, 'dd/MM/yyyy')} - {format(getDateRange().end, 'dd/MM/yyyy')}
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Résumé</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>Total Quantité: {statistics.totalQuantity} unités</div>
                  <div>Montant Total: {statistics.totalAmount.toLocaleString()} FCFA</div>
                  <div>Médicaments Uniques: {statistics.uniqueMedicines}</div>
                  <div>Total Mouvements: {filteredMovements.length}</div>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Médicament</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Quantité</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-left p-2">Patient</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map(movement => (
                    <tr key={movement.id} className="border-b">
                      <td className="p-2">{format(new Date(movement.date), 'dd/MM/yyyy')}</td>
                      <td className="p-2">{movement.medicineName}</td>
                      <td className="p-2">{movement.movementType}</td>
                      <td className="p-2 text-right">{movement.quantity}</td>
                      <td className="p-2 text-right">{movement.totalAmount}</td>
                      <td className="p-2">{movement.patientName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-8 text-center text-sm text-slate-500">
                Généré le {format(new Date(), 'dd/MM/yyyy HH:mm')}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Importer une ordonnance</h3>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {consultationsList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Aucune consultation trouvée avec des prescriptions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultationsList
                    .filter(c => c.prescription && c.prescription.length > 0 && !servedPrescriptions.has(c.id))
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(consultation => (
                      <div 
                        key={consultation.id}
                        className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          importPrescription(consultation);
                          setShowPrescriptionModal(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-900">
                              {consultation.patientName || 'Patient inconnu'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {format(new Date(consultation.createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                            {Array.isArray(consultation.prescription) 
                              ? `${consultation.prescription.length} médicament(s)`
                              : '1 médicament'}
                          </span>
                        </div>
                        {consultation.diagnosis && (
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                            <span className="font-medium">Diagnostic:</span> {consultation.diagnosis}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                 <h3 className="text-xl font-bold text-slate-900 text-center">Paiement</h3>
                 <p className="text-center text-slate-500 text-sm mt-1">Total à régler</p>
                 <div className="text-center text-4xl font-bold text-teal-600 mt-2">{totalAmount} <span className="text-lg text-slate-400">FCFA</span></div>
              </div>
              
              <div className="p-6 space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Mode de Paiement</label>
                    <div className="grid grid-cols-3 gap-3">
                       <button 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                       >
                          <Banknote className="w-6 h-6" />
                          <span className="text-xs font-medium">Espèces</span>
                       </button>
                       <button 
                        onClick={() => setPaymentMethod('MOBILE_MONEY')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'MOBILE_MONEY' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                       >
                          <Smartphone className="w-6 h-6" />
                          <span className="text-xs font-medium">Mobile Money</span>
                       </button>
                       <button 
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CARD' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                       >
                          <CreditCard className="w-6 h-6" />
                          <span className="text-xs font-medium">Carte</span>
                       </button>
                    </div>
                 </div>

                 {paymentMethod === 'CASH' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                       <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Montant Reçu</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder="0"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            autoFocus
                          />
                       </div>
                       <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                          <span className="font-medium text-slate-600">Monnaie à rendre</span>
                          <span className={`text-xl font-bold ${changeDue < 0 ? 'text-red-500' : 'text-slate-900'}`}>
                             {Math.max(0, changeDue)} FCFA
                          </span>
                       </div>
                    </div>
                 )}

                 {paymentMethod === 'MOBILE_MONEY' && (
                    <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                       {currentCenter?.pispiAlias ? (
                         <>
                           <div className="bg-white p-2 rounded-lg">
                              <img 
                               src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${currentCenter.pispiAlias}`} 
                               alt="QR Paiement" 
                               className="w-20 h-20"
                              />
                           </div>
                           <div>
                              <h4 className="font-bold text-blue-900 text-sm">Scanner pour payer</h4>
                              <p className="text-xs text-blue-700 mt-1">Utilisez votre application mobile money habituelle.</p>
                           </div>
                         </>
                       ) : (
                         <div className="text-sm text-blue-800 flex items-center gap-2">
                           <AlertTriangle className="w-5 h-5" />
                           Configurez l'alias PI-SPI dans les paramètres pour afficher le QR Code.
                         </div>
                       )}
                    </div>
                 )}

                 <button 
                  onClick={handleCheckout}
                  disabled={paymentMethod === 'CASH' && (Number(amountReceived) < totalAmount)}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                 >
                    Confirmer le Paiement
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Receipt Print Modal */}
      {showReceiptModal && lastSale && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 bg-slate-100 flex justify-center overflow-y-auto">
                 <div id="receipt-print-area" className="bg-white w-[302px] p-4 text-slate-900 font-mono text-xs shadow-md">
                    <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                       <div className="font-black text-xl uppercase mb-1">{currentCenter?.name}</div>
                       <div className="text-xs font-medium mt-1">
                          DATE: {format(new Date(), 'dd/MM/yyyy HH:mm')}
                       </div>
                    </div>

                    {lastSale.patientName && (
                      <div className="mb-3 border-b border-dashed border-slate-200 pb-2">
                         <div className="text-[10px] font-bold uppercase">Patient :</div>
                         <div className="font-bold text-sm">{lastSale.patientName}</div>
                      </div>
                    )}

                    <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 space-y-1">
                       {lastSale.items.map((item, idx) => (
                          <div key={`${item.medicineId}-${idx}`} className="flex justify-between gap-2">
                             <span className="flex-1 truncate font-bold">{item.medicineName}</span>
                             <span className="font-bold whitespace-nowrap">{item.total} F</span>
                          </div>
                       ))}
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span>TOTAL À PAYER :</span>
                          <span>{lastSale.totalAmount} F</span>
                       </div>
                       <div className="flex justify-between text-sm font-black border-t-2 border-slate-900 pt-2">
                          <span>MONTANT PAYÉ :</span>
                          <span>{lastSale.totalAmount} F</span>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="p-4 border-t border-slate-200 bg-white flex gap-3 no-print">
                 <button onClick={() => setShowReceiptModal(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Fermer</button>
                 <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800">
                    <Printer className="w-4 h-4" /> Imprimer
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {showMedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingMed ? 'Modifier Médicament' : 'Nouveau Médicament'}
              </h3>
              <button onClick={() => setShowMedModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveMedicine} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom Commercial</label>
                  <input 
                    type="text" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.name}
                    onChange={e => setMedForm({...medForm, name: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">DCI (Générique)</label>
                   <input 
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.dci}
                    onChange={e => setMedForm({...medForm, dci: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actuel</label>
                   <input 
                    type="number" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.stock}
                    onChange={e => setMedForm({...medForm, stock: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Seuil Alerte</label>
                   <input 
                    type="number" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.minStock}
                    onChange={e => setMedForm({...medForm, minStock: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Prix Vente (FCFA)</label>
                   <input 
                    type="number" required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.price || ''}
                    onChange={e => setMedForm({...medForm, price: Number(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Date Péremption</label>
                   <input 
                    type="date"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.expiryDate}
                    onChange={e => setMedForm({...medForm, expiryDate: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                     value={medForm.category}
                     onChange={e => setMedForm({...medForm, category: e.target.value})}
                   >
                     <option value="Général">Général</option>
                     <option value="Antibiotique">Antibiotique</option>
                     <option value="Antalgique">Antalgique</option>
                     <option value="Antipaludéen">Antipaludéen</option>
                     <option value="Anti-inflammatoire">Anti-inflammatoire</option>
                     <option value="Vitamine">Vitamine</option>
                     <option value="Injectable">Injectable</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Forme</label>
                   <select 
                     className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                     value={medForm.form}
                     onChange={e => setMedForm({...medForm, form: e.target.value})}
                   >
                     <option value="Comprimé">Comprimé</option>
                     <option value="Gélule">Gélule</option>
                     <option value="Sirop">Sirop</option>
                     <option value="Injectable">Injectable</option>
                     <option value="Pommade">Pommade</option>
                     <option value="Solution">Solution</option>
                   </select>
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Lot</label>
                   <input 
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medForm.batchNumber}
                    onChange={e => setMedForm({...medForm, batchNumber: e.target.value})}
                    placeholder="Ex: LOT2024001"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowMedModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-400 text-slate-900 rounded-lg hover:bg-teal-500 font-medium shadow-sm"
                >
                  {editingMed ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export const Pharmacy = () => (
  <PharmacyErrorBoundary>
    <PharmacyInner />
  </PharmacyErrorBoundary>
);
