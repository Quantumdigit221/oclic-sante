
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, CheckCircle, Clock, ShoppingBag, Eye, Printer, User, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../components/ui/Card';
import { generatePrintHTML } from '../components/PrintLayout.tsx';
import { Consultation } from '../types';

export const Prescriptions = () => {
    const navigate = useNavigate();
    const { consultations, sales, medicines, services, currentCenter, tickets } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

    // Vérifications de sécurité pour éviter les erreurs filter
    const consultationsList = Array.isArray(consultations) ? consultations : [];
    const salesList = Array.isArray(sales) ? sales : [];

    // Fonction pour imprimer une ordonnance
    const handlePrintPrescription = (consultation: any) => {
        try {
            // S'assurer d'avoir le ticket pour les infos d'âge/genre
            const ticket = tickets.find(t => t.id === consultation.ticketId);
            
            const printContent = generatePrintHTML(
                consultation as any,
                ticket as any,
                medicines,
                services,
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

    // Fonction pour passer à la caisse
    const handleCheckout = (consultation: any) => {
        const prescription = Array.isArray(consultation.prescription) 
            ? consultation.prescription 
            : (typeof consultation.prescription === 'string' ? JSON.parse(consultation.prescription) : []);
        
        const items = prescription.map((item: any) => {
            const medicine = medicines.find(m => m.id === item.medicineId);
            return {
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                quantity: item.quantity,
                unitPrice: medicine?.price || 0,
                total: (medicine?.price || 0) * item.quantity
            };
        });

        // Naviguer vers la page pharmacie avec les articles pré-remplis
        navigate('/pharmacy', { state: { cartItems: items, patientName: consultation.patientName } });
    };

    // Fonction pour voir les détails de la consultation
    const handleViewConsultationDetails = (consultation: any) => {
        // Naviguer vers la page consultations avec l'ID de la consultation
        navigate(`/consultations`, { state: { selectedConsultationId: consultation.id } });
    };

    // Filtrer les consultations qui ont des prescriptions
    const consultationsWithPrescription = useMemo(() => {
        return consultationsList.filter(c => {
            const p = Array.isArray(c.prescription)
                ? c.prescription
                : (typeof c.prescription === 'string' ? JSON.parse(c.prescription) : []);
            return p && p.length > 0;
        });
    }, [consultationsList]);

    // Déterminer le statut de chaque prescription en fonction des ventes
    const prescriptionList = useMemo(() => {
        return consultationsWithPrescription.map(c => {
            const prescItems = Array.isArray(c.prescription)
                ? c.prescription
                : (typeof c.prescription === 'string' ? JSON.parse(c.prescription) : []);

            // Trouver si une vente existe pour ce ticketId
            const relatedSale = salesList.find(s => s.ticketId === c.ticketId);
            const isServed = !!relatedSale;

            return {
                ...c,
                prescriptionItems: prescItems,
                isServed,
                saleDate: relatedSale?.createdAt
            };
        });
    }, [consultationsWithPrescription, salesList]);

    const filteredPrescriptions = useMemo(() => {
        return prescriptionList.filter(p => {
            const matchesSearch = p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && p.isServed) ||
                (statusFilter === 'pending' && !p.isServed);
            return matchesSearch && matchesStatus;
        });
    }, [prescriptionList, searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Gestion des Ordonnances</h2>
                    <p className="text-sm text-slate-500">Suivi des prescriptions médicales et délivrances</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par patient ou N° ticket..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                        >
                            Tous
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === 'pending' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                        >
                            En attente
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${statusFilter === 'completed' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                        >
                            Délivrées
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPrescriptions.map(p => (
                    <Card key={p.id} className="overflow-hidden hover:border-teal-300 transition-colors">
                        <div className={`h-1 w-full ${p.isServed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{p.patientName}</h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {p.ticketId}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {format(new Date(p.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${p.isServed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {p.isServed ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        {p.isServed ? 'Délivrée' : 'En attente'}
                                    </div>
                                    {p.isServed && p.saleDate && (
                                        <p className="text-[10px] text-slate-400 mt-1 italic">Le {format(new Date(p.saleDate), 'dd/MM/yyyy HH:mm')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4 mt-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">Contenu de l'ordonnance</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {p.prescriptionItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="w-8 h-8 bg-white rounded border border-slate-200 flex items-center justify-center text-xs font-bold text-teal-600">
                                                {item.quantity}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-800 truncate">{item.medicineName}</div>
                                                <div className="text-[10px] text-slate-500 truncate">{item.dosage}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button 
                                    onClick={() => handlePrintPrescription(p)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    <Printer className="w-4 h-4" /> Imprimer
                                </button>
                                {!p.isServed && (
                                    <button 
                                        onClick={() => handleCheckout(p)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
                                    >
                                        <ShoppingBag className="w-4 h-4" /> Passer à la caisse
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleViewConsultationDetails(p)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Eye className="w-4 h-4" /> Détails Consultation
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredPrescriptions.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Aucune ordonnance trouvée</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-1">
                            Les ordonnances apparaissent ici lorsqu'un médecin valide une consultation avec une prescription.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Prescriptions;
