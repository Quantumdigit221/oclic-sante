import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Upload, FileText, Download, Plus, Search, Filter, Calendar, User, Eye, Edit, Trash2, Camera, Microscope } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  consultationId: string;
  type: 'analysis' | 'radio';
  examName: string;
  examCategory: string;
  resultDate: string;
  status: 'pending' | 'completed' | 'validated';
  results: {
    text?: string;
    textResult?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
  doctorId: string;
  doctorName: string;
  createdAt: string;
  updatedAt: string;
}

export const LabResults = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, consultations, services, currentCenter, currentUser } = useStore();
  
  // Vérifications de sécurité pour éviter les erreurs filter
  const patientsList = Array.isArray(patients) ? patients : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  const servicesList = Array.isArray(services) ? services : [];
  
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'analysis' | 'radio'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'validated'>('all');
  
  // Formulaire pour ajouter/modifier un résultat
  const [formData, setFormData] = useState({
    consultationId: '',
    type: 'analysis' as 'analysis' | 'radio',
    examName: '',
    examCategory: '',
    resultDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'completed' | 'validated',
    textResult: '',
    file: null as File | null
  });

  // Mock data - à remplacer par les vraies données de la base
  useEffect(() => {
    // Simuler le chargement des résultats
    const mockResults: LabResult[] = [
      {
        id: 'lab-1',
        patientId: id || '',
        patientName: 'Aly Thiam',
        consultationId: 'c-1',
        type: 'analysis',
        examName: 'NFS (Numération Formule Sanguine)',
        examCategory: 'Hématologie',
        resultDate: '2026-01-09',
        status: 'completed',
        results: {
          text: 'Hémoglobine: 12.5 g/dL (N: 12-16)\nGlobules rouges: 4.2 T/L (N: 4.0-5.5)\nGlobules blancs: 7.8 G/L (N: 4.0-10.0)\nPlaquettes: 280 G/L (N: 150-400)\n\nConclusion: Résultats dans les limites normales.',
          fileUrl: '/uploads/nfs_result.pdf',
          fileName: 'NFS_Aly_Thiam_2026-01-09.pdf',
          fileSize: 1024000
        },
        doctorId: currentUser?.id || '',
        doctorName: currentUser?.name || 'Dr. Inconnu',
        createdAt: '2026-01-09T10:30:00Z',
        updatedAt: '2026-01-09T14:20:00Z'
      },
      {
        id: 'lab-2',
        patientId: id || '',
        patientName: 'Aly Thiam',
        consultationId: 'c-1',
        type: 'radio',
        examName: 'Radiographie Thoracique',
        examCategory: 'Radiologie',
        resultDate: '2026-01-09',
        status: 'validated',
        results: {
          fileUrl: '/uploads/radio_thorax.jpg',
          fileName: 'Radio_Thorax_Aly_Thiam_2026-01-09.jpg',
          fileSize: 2048000
        },
        doctorId: currentUser?.id || '',
        doctorName: currentUser?.name || 'Dr. Inconnu',
        createdAt: '2026-01-09T11:00:00Z',
        updatedAt: '2026-01-09T15:30:00Z'
      }
    ];
    setLabResults(mockResults);
  }, [id, currentUser]);

  const patient = patientsList.find(p => p.id === id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 10MB');
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const consultation = consultationsList.find(c => c.id === formData.consultationId);
    if (!consultation || !patient) return;

    const newResult: LabResult = {
      id: `lab-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      consultationId: formData.consultationId,
      type: formData.type,
      examName: formData.examName,
      examCategory: formData.examCategory,
      resultDate: formData.resultDate,
      status: formData.status,
      results: {
        text: formData.textResult || undefined,
        fileUrl: formData.file ? `/uploads/${formData.file.name}` : undefined,
        fileName: formData.file?.name,
        fileSize: formData.file?.size
      },
      doctorId: currentUser?.id || '',
      doctorName: currentUser?.name || 'Dr. Inconnu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLabResults([...labResults, newResult]);
    setShowAddModal(false);
    setFormData({
      consultationId: '',
      type: 'analysis',
      examName: '',
      examCategory: '',
      resultDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      textResult: '',
      file: null
    });
  };

  const handleDelete = (resultId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce résultat?')) {
      setLabResults(labResults.filter(r => r.id !== resultId));
    }
  };

  const filteredResults = labResults.filter(result => {
    const matchesSearch = result.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.examCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || result.type === filterType;
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'validated': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      case 'validated': return 'Validé';
      default: return status;
    }
  };

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500">Patient non trouvé</p>
          <button 
            onClick={() => navigate('/patients')}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Laboratoire - Résultats</h1>
            <p className="text-slate-500">{patient.firstName} {patient.lastName}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-4 h-4" />
          Nouveau Résultat
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un examen..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Tous les types</option>
            <option value="analysis">Analyses</option>
            <option value="radio">Radiologie</option>
          </select>
          <select
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminé</option>
            <option value="validated">Validé</option>
          </select>
        </div>
      </div>

      {/* Liste des résultats */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucun résultat trouvé</p>
          </div>
        ) : (
          filteredResults.map((result) => (
            <div key={result.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {result.type === 'analysis' ? (
                        <Microscope className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Camera className="w-5 h-5 text-purple-600" />
                      )}
                      <span className="font-medium text-slate-900">{result.examName}</span>
                    </div>
                    <span className="text-sm text-slate-500">{result.examCategory}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {format(new Date(result.resultDate), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-500">
                    Dr. {result.doctorName} • {format(new Date(result.createdAt), 'dd/MM/yyyy HH:mm')}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.results.textResult && (
                      <button
                        onClick={() => setSelectedResult(result)}
                        className="p-1 hover:bg-slate-100 rounded"
                        title="Voir le résultat"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                    {result.results.fileUrl && (
                      <button
                        className="p-1 hover:bg-slate-100 rounded"
                        title="Télécharger le fichier"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                
                {result.results.textResult && (
                  <div className="text-sm text-slate-600 line-clamp-3">
                    {result.results.textResult}
                  </div>
                )}
                
                {result.results.fileName && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    {result.results.fileName}
                    {result.results.fileSize && (
                      <span>({(result.results.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Nouveau Résultat</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Consultation</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.consultationId}
                    onChange={(e) => setFormData({...formData, consultationId: e.target.value})}
                  >
                    <option value="">Sélectionner une consultation</option>
                    {consultations
                      .filter(c => c.patientName === `${patient.firstName} ${patient.lastName}`)
                      .map(consultation => (
                        <option key={consultation.id} value={consultation.id}>
                          {format(new Date(consultation.createdAt), 'dd/MM/yyyy')} - {consultation.symptoms?.substring(0, 50)}...
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="analysis">Analyse</option>
                    <option value="radio">Radiologie</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'examen</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.examName}
                    onChange={(e) => setFormData({...formData, examName: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.examCategory}
                    onChange={(e) => setFormData({...formData, examCategory: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date du résultat</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.resultDate}
                    onChange={(e) => setFormData({...formData, resultDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="pending">En attente</option>
                    <option value="completed">Terminé</option>
                    <option value="validated">Validé</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Résultat (texte)</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.textResult}
                  onChange={(e) => setFormData({...formData, textResult: e.target.value})}
                  placeholder="Entrez les résultats détaillés..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fichier (PDF, JPG, PNG - max 10MB)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                  {formData.file && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <FileText className="w-4 h-4" />
                      {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedResult.examName}</h2>
                <p className="text-slate-500">{selectedResult.examCategory}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {selectedResult.results.text && (
                <div className="mb-6">
                  <h3 className="font-medium text-slate-900 mb-3">Résultats détaillés</h3>
                  <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-slate-700">
                    {selectedResult.results.text}
                  </div>
                </div>
              )}
              
              {selectedResult.results.fileUrl && (
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Fichier joint</h3>
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-700">{selectedResult.results.fileName}</span>
                        {selectedResult.results.fileSize && (
                          <span className="text-slate-500">
                            ({(selectedResult.results.fileSize / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
                      </div>
                      <button className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabResults;
