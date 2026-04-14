
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { Search, Microscope, CheckCircle, Clock, Plus, X, Eye, User, Calendar, AlertCircle, FileText, Upload, Trash2, Printer, ChevronRight, Calculator, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../components/ui/Card';

export const Exams = () => {
    const { consultations, labResults, addLabResult, updateLabResult, patients, services, tickets, currentUser, currentCenter } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

    // Stats
    const consultationsList = Array.isArray(consultations) ? consultations : [];
    const labResultsList = Array.isArray(labResults) ? labResults : [];
    const servicesList = Array.isArray(services) ? services : [];
    const ticketsList = Array.isArray(tickets) ? tickets : [];

    // Modal state
    const [showResultModal, setShowResultModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [resultRows, setResultRows] = useState<any[]>([
        { category: 'BIOCHIMIE', name: '', result: '', unit: '', norms: '' }
    ]);
    const [resultForm, setResultForm] = useState({
        generalObservations: '',
        status: 'completed' as 'completed' | 'validated',
        externalLab: false
    });

    // Extraire les demandes d'examens
    const examOrders = useMemo(() => {
        const orders: any[] = [];
        
        // 1. Demandes issues des consultations
        consultationsList.forEach(c => {
            let labs = [];
            try {
                labs = Array.isArray(c.labOrders) ? c.labOrders : JSON.parse(c.labOrders || '[]');
            } catch(e) { labs = []; }

            if (labs && labs.length > 0) {
                labs.forEach((examId: string) => {
                    const service = servicesList.find(s => s.id === examId);
                    const existingResult = labResultsList.find(r => r.consultationId === c.id && (r.testName === service?.name));

                    orders.push({
                        id: `order-${c.id}-${examId}`,
                        consultationId: c.id,
                        patientId: c.patientId,
                        patientName: c.patientName,
                        examId,
                        examName: service?.name || 'Examen inconnu',
                        category: service?.category || 'Laboratoire',
                        date: c.createdAt || c.date,
                        status: existingResult ? existingResult.status : 'pending',
                        result: existingResult,
                        type: 'CONSULTATION'
                    });
                });
            }
        });

        // 2. Tickets directs créés à la réception (Tout ce qui n'est pas Consultation/Urgence)
        ticketsList.filter(t => 
            (t.status === 'WAITING' || t.status === 'IN_PROGRESS')
        ).forEach(t => {
            // Un ticket peut avoir plusieurs services (Tableau services attaché par l'API)
            const servicesArray = Array.isArray(t.services) && t.services.length > 0 
                ? t.services 
                : [{ id: t.serviceId, name: t.serviceName, category: t.serviceCategory }];

            servicesArray.forEach((s: any) => {
                // On ne garde que les services de type Laboratoire ou Examen
                const isLab = s.category === 'Laboratoire' || s.category === 'Examen' || 
                             s.name?.toLowerCase().includes('analyse') || 
                             s.name?.toLowerCase().includes('radio') ||
                             s.name?.toLowerCase().includes('laboratoire');
                
                if (!isLab) return;

                const existingResult = labResultsList.find(r => r.ticketId === t.id && (r.testName === s.name));
                
                orders.push({
                    id: `ticket-${t.id}-${s.id || s.name}`,
                    ticketId: t.id,
                    patientId: t.patientId || t.id,
                    patientName: t.patientName,
                    examId: s.id || t.serviceId,
                    examName: s.name || t.serviceName,
                    category: s.category || t.serviceCategory || 'Laboratoire',
                    date: t.createdAt,
                    status: existingResult ? existingResult.status : 'pending',
                    result: existingResult,
                    type: 'DIRECT'
                });
            });
        });

        return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [consultationsList, servicesList, labResultsList, ticketsList]);

    const filteredOrders = useMemo(() => {
        return examOrders.filter(o => {
            const matchesSearch = o.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.examName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'completed' && (o.status === 'completed' || o.status === 'validated')) ||
                (statusFilter === 'pending' && o.status === 'pending');
            return matchesSearch && matchesStatus;
        });
    }, [examOrders, searchTerm, statusFilter]);

    const handleOpenResultModal = (order: any) => {
        setSelectedOrder(order);
        
        if (order.result) {
            const resObj = order.result || {};
            let resultData: any = {};
            try {
                resultData = typeof resObj.result === 'string' ? JSON.parse(resObj.result) : (resObj.result || {});
            } catch (e) {
                console.error('Failed to parse result data in modal:', e);
            }
            
            setResultRows(resultData.rows || [{ category: order.category?.toUpperCase() || 'ANALYSE', name: order.examName, result: '', unit: '', norms: '' }]);
            setResultForm({
                generalObservations: resultData.observations || resObj.notes || '',
                status: resObj.status || 'completed',
                externalLab: !!resultData.external
            });
        } else {
            setResultRows([{ category: order.category?.toUpperCase() || 'ANALYSE', name: order.examName, result: '', unit: '', norms: '' }]);
            setResultForm({
                generalObservations: '',
                status: 'completed',
                externalLab: false
            });
        }
        setShowResultModal(true);
    };

    const addRow = () => {
        const lastCategory = resultRows.length > 0 ? resultRows[resultRows.length - 1].category : 'ANALYSE';
        setResultRows([...resultRows, { category: lastCategory, name: '', result: '', unit: '', norms: '' }]);
    };

    const removeRow = (index: number) => {
        setResultRows(resultRows.filter((_, i) => i !== index));
    };

    const updateRow = (index: number, field: string, value: string) => {
        const newRows = [...resultRows];
        newRows[index][field] = value;
        setResultRows(newRows);
    };

    const handleSaveResult = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        if (isSaving) return;
        setIsSaving(true);
        const payload = {
            patientId: selectedOrder.patientId,
            patientName: selectedOrder.patientName,
            consultationId: selectedOrder.consultationId,
            ticketId: selectedOrder.ticketId,
            testName: selectedOrder.examName,
            category: selectedOrder.category,
            status: resultForm.status,
            result: {
                rows: resultRows,
                observations: resultForm.generalObservations,
                external: resultForm.externalLab,
                timestamp: new Date().toISOString()
            },
            notes: resultForm.generalObservations,
            doctorId: currentUser?.id || '',
            doctorName: currentUser?.name || 'Laboratoire'
        };

        try {
            let res;
            if (selectedOrder.result?.id) {
                // Update existing record
                res = await updateLabResult(selectedOrder.result.id, payload);
            } else {
                // Create new record
                res = await addLabResult(payload);
            }
            
            if (res) {
                setShowResultModal(false);
            } else {
                alert('Erreur lors de l\'enregistrement. Veuillez réessayer.');
            }
        } catch (err: any) {
            console.error('[Exams] Erreur save:', err);
            alert('Erreur: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrintCompteRendu = async (order: any) => {
        const resObj = order.result || {};
        let resultData: any = {};
        try {
            resultData = typeof resObj.result === 'string' ? JSON.parse(resObj.result) : (resObj.result || {});
        } catch (e) {
            console.error('Failed to parse result data:', e);
            resultData = { rows: [] };
        }
        const rows = resultData.rows || [];
        
        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Veuillez autoriser les pop-ups pour imprimer le compte-rendu.");
            return;
        }

        const center = currentCenter || { name: 'Clinique O-CLIC', address: 'Kaolack, Sénégal', phone: '---', email: '---' };
        const patient = patients.find(p => p.id === order.patientId);

        // Group rows by category
        const groups: {[key: string]: any[]} = {};
        rows.forEach((r: any) => {
            const cat = r.category || 'EXAMEN';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(r);
        });

        const html = `
            <html>
            <head>
                <title>Compte Rendu d'Analyse - ${order.patientName}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
                    .center-info h1 { margin: 0; color: #0d9488; font-size: 24px; text-transform: uppercase; }
                    .center-info p { margin: 2px 0; font-size: 12px; color: #64748b; }
                    .title-box { text-align: center; margin: 20px 0; }
                    .title-box h2 { border: 2px solid #1e293b; display: inline-block; padding: 5px 40px; text-transform: uppercase; font-size: 18px; margin-bottom: 30px;}
                    .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 30px; background: #f8fafc; }
                    .patient-grid div p { margin: 4px 0; font-size: 14px; }
                    .patient-grid div strong { color: #0f172a; }
                    .group-header { background: #f1f5f9; padding: 8px 15px; font-weight: 800; font-size: 14px; border-bottom: 2px solid #0d9488; margin-top: 25px; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                    th { text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
                    td { padding: 12px 10px; font-size: 13px; border-bottom: 1px dashed #e2e8f0; }
                    .footer { margin-top: 60px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
                    .signature { text-align: center; width: 250px; }
                    .sig-line { border-top: 1px solid #1e293b; margin-top: 60px; padding-top: 5px; font-weight: bold; color: #0f172a; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body onload="window.print();">
                <div class="header">
                    <div class="center-info">
                        <h1>${center.name || "LABORATOIRE D'ANALYSES"}</h1>
                        <p>📍 ${center.address || ''}</p>
                        <p>📞 Téléphone: ${center.phone || ''}</p>
                        <p>✉️ Email: ${center.email || ''}</p>
                    </div>
                    <div style="text-align: right">
                        <div style="margin-bottom: 10px;">
                            <svg id="barcode" style="height: 40px; width: 150px; background: #eee; border-radius: 4px;"></svg>
                            <p style="font-size: 8px; margin: 0; font-family: monospace;">NIP: ${order.patientId}</p>
                        </div>
                        <p style="font-weight: bold; font-size: 16px; color: #0d9488;">N°: LAB-${order.result?.id?.substring(0,8) || order.consultationId?.substring(0,6)}</p>
                        <p>Édité le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                </div>

                <div class="title-box">
                    <h2>Compte Rendu d'Analyse</h2>
                    <div style="float: right; margin-top: -60px;">
                        <div style="width: 60px; height: 60px; background: #eee; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #999;">QR CODE</div>
                    </div>
                </div>

                <div class="patient-grid">
                    <div>
                        <p><strong>Nom:</strong> ${patient?.lastName || order.patientName?.split(' ')[1] || ''}</p>
                        <p><strong>Prénom:</strong> ${patient?.firstName || order.patientName?.split(' ')[0] || ''}</p>
                        <p><strong>Âge:</strong> ${patient?.age || '---'} ans</p>
                    </div>
                    <div style="text-align: right">
                        <p><strong>NIP:</strong> ${order.patientId || '---'}</p>
                        <p><strong>Prélèvement du:</strong> ${format(new Date(order.date), 'dd/MM/yyyy HH:mm')}</p>
                        <p><strong>Médecin:</strong> ${order.result?.doctorName || 'Dr. Requérent'}</p>
                    </div>
                </div>

                ${Object.keys(groups).map(groupName => `
                    <div class="group-header">${groupName}</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40%">Examen demandé</th>
                                <th style="width: 15%">Résultat</th>
                                <th style="width: 15%">Unité</th>
                                <th>Valeurs de Référence</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${groups[groupName].map(r => `
                                <tr>
                                    <td><strong>${r.name || order.examName}</strong></td>
                                    <td><span style="font-weight: 800; font-size: 15px;">${r.result || '---'}</span></td>
                                    <td>${r.unit || '---'}</td>
                                    <td><small>${r.norms ? r.norms.replace(/\n/g, '<br>') : '---'}</small></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `).join('')}

                <div style="margin-top: 40px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <strong style="font-size: 12px; color: #64748b; text-transform: uppercase;">Observations:</strong>
                    <p style="font-size: 14px; margin-top: 5px;">${resultData.observations || 'Néant'}</p>
                </div>

                <div class="footer">
                    <div>
                        ${resultData.external ? '⚠️ Prélèvement externe' : '✅ Prélèvement interne'}
                    </div>
                    <div class="signature">
                        <p>Biologiste / Responsable de Laboratoire</p>
                        <div class="sig-line">Dr. ${order.result?.doctorName || ''}</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWin.document.write(html);
        printWin.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-teal-600 p-6 rounded-2xl shadow-lg shadow-teal-100 text-white">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                        <Microscope className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Plateau Technique</h2>
                        <p className="opacity-90">Saisie et Validation des résultats d'analyses</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 text-center">
                        <div className="text-2xl font-bold">{filteredOrders.filter(o => o.status === 'pending').length}</div>
                        <div className="text-[10px] uppercase font-bold text-teal-100">En attente</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[250px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher patient, examen..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {(['all', 'pending', 'completed'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-6 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${statusFilter === f ? 'bg-white shadow-sm text-teal-600' : 'text-slate-500 border-transparent'}`}
                            >
                                {f === 'all' ? 'Tous' : f === 'pending' ? 'Attente' : 'Archives'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredOrders.map((order, idx) => (
                    <Card key={`${order.consultationId}-${idx}`} className={`overflow-hidden border-l-4 transition-all hover:shadow-md ${order.status === 'pending' ? 'border-amber-400' : 'border-blue-500 border-l-emerald-500'}`}>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                                        {order.patientName?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{order.patientName}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="w-3 h-3" /> {format(new Date(order.date), 'dd MMM yyyy HH:mm', { locale: fr })}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {order.status === 'pending' ? 'Attente' : 'Terminé'}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Examen prescrit</div>
                                <div className="flex items-center gap-2 font-bold text-slate-800">
                                    <Microscope className="w-4 h-4 text-teal-500" />
                                    {order.examName}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{order.category}</div>
                            </div>

                            <div className="flex gap-2">
                                {order.status === 'pending' ? (
                                    <button
                                        onClick={() => handleOpenResultModal(order)}
                                        className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-teal-700 shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Saisir Résultats
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handlePrintCompteRendu(order)}
                                            className="flex-1 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-3.5 h-3.5" /> Compte-Rendu
                                        </button>
                                        <button
                                            onClick={() => handleOpenResultModal(order)}
                                            className="w-10 bg-slate-100 text-slate-600 py-2 rounded-lg hover:bg-slate-200 flex items-center justify-center"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Microscope className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Aucun examen trouvé</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Vérifiez vos filtres ou effectuez une nouvelle recherche par nom de patient.</p>
                </div>
            )}

            {/* Structured Result Modal */}
            {showResultModal && (
                <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-5xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                                    <FileCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-xl uppercase tracking-tight">Saisie du Compte Rendu</h3>
                                    <p className="text-sm text-slate-500 font-medium">Patient: <span className="text-teal-600">{selectedOrder?.patientName}</span> • {selectedOrder?.examName}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowResultModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                                <X className="w-6 h-6 text-slate-400 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                            <form onSubmit={handleSaveResult} className="space-y-6">
                                {/* Table of Results */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Valeurs d'Analyses</div>
                                        <button 
                                            type="button" 
                                            onClick={addRow}
                                            className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-1.5"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                                        </button>
                                    </div>
                                    <div className="p-0 overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-100">
                                                    <th className="px-4 py-3 text-left">Catégorie / Groupe</th>
                                                    <th className="px-4 py-3 text-left">Examen / Paramètre</th>
                                                    <th className="px-4 py-3 text-left">Résultat</th>
                                                    <th className="px-4 py-3 text-left">Unité</th>
                                                    <th className="px-4 py-3 text-left w-1/4">Valeurs de Référence (Normes)</th>
                                                    <th className="px-4 py-3 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {resultRows.map((row, idx) => (
                                                    <tr key={idx} className="group hover:bg-teal-50/10 active:bg-teal-50/20 transition-colors">
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" value={row.category} 
                                                                placeholder="ex: BIOCHIMIE"
                                                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500 font-bold text-teal-700"
                                                                onChange={e => updateRow(idx, 'category', e.target.value.toUpperCase())}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" value={row.name} 
                                                                placeholder="ex: Glycémie à Jeun"
                                                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                                                                onChange={e => updateRow(idx, 'name', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" value={row.result} 
                                                                placeholder="0.00"
                                                                className="w-full bg-white border-2 border-slate-300 rounded-lg py-2 px-3 text-sm focus:border-teal-500 outline-none font-black text-slate-900"
                                                                onChange={e => updateRow(idx, 'result', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input 
                                                                type="text" value={row.unit} 
                                                                placeholder="g/l"
                                                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500 text-slate-600"
                                                                onChange={e => updateRow(idx, 'unit', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <textarea 
                                                                value={row.norms} 
                                                                placeholder="0.70 - 1.10"
                                                                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[11px] focus:ring-2 focus:ring-teal-500 h-10 min-h-[40px] resize-none"
                                                                onChange={e => updateRow(idx, 'norms', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeRow(idx)}
                                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                                        <button 
                                            type="button" onClick={addRow}
                                            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> Ajouter une autre analyse
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Observations Générales</label>
                                        <textarea
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 h-28 text-sm font-medium"
                                            placeholder="Conclusion, recommandations ou notes..."
                                            value={resultForm.generalObservations}
                                            onChange={e => setResultForm({ ...resultForm, generalObservations: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Statut & Validation</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50">
                                                <input 
                                                    type="checkbox" id="external" checked={resultForm.externalLab}
                                                    className="w-5 h-5 accent-teal-600 cursor-pointer"
                                                    onChange={e => setResultForm({...resultForm, externalLab: e.target.checked})}
                                                />
                                                <label htmlFor="external" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Prélèvement réalisé en externe</label>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Confirmer la publication</div>
                                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setResultForm({...resultForm, status: 'completed'})}
                                                        className={`flex-1 py-3 text-xs font-black uppercase rounded-lg transition-all ${resultForm.status === 'completed' ? 'bg-amber-400 text-slate-900 shadow-md' : 'text-slate-500'}`}
                                                    >
                                                        Brouillon
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setResultForm({...resultForm, status: 'validated'})}
                                                        className={`flex-1 py-3 text-xs font-black uppercase rounded-lg transition-all ${resultForm.status === 'validated' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500'}`}
                                                    >
                                                        Valider (Final)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-white flex gap-3 sticky bottom-0 z-10">
                            <button
                                type="button"
                                onClick={() => setShowResultModal(false)}
                                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors"
                            >
                                Abandonner
                            </button>
                            <button
                                onClick={handleSaveResult}
                                disabled={isSaving}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-3 ${isSaving ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                            >
                                <CheckCircle className="w-5 h-5" /> {isSaving ? 'Enregistrement...' : 'Enregistrer & Publier le Compte Rendu'}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Exams;
