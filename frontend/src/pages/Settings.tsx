
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Building2, Save, MapPin, Phone, Mail, User, Bed, FileBadge, CheckCircle, Smartphone, Brain, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings = () => {
  const { currentCenter, updateCenter } = useStore();
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    directorName: '',
    rnis: '',
    capacity: 0,
    pispiAlias: ''
  });

  useEffect(() => {
    if (currentCenter) {
      setFormData({
        name: currentCenter.name,
        address: currentCenter.address,
        phone: currentCenter.phone,
        email: currentCenter.email,
        directorName: currentCenter.directorName,
        rnis: currentCenter.rnis || '',
        capacity: currentCenter.capacity || 0,
        pispiAlias: currentCenter.pispiAlias || ''
      });
    }
  }, [currentCenter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCenter) return;

    updateCenter({
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      directorName: formData.directorName,
      rnis: formData.rnis,
      capacity: Number(formData.capacity),
      pispiAlias: formData.pispiAlias
    });

    setSuccessMsg('Informations mises à jour avec succès');
    setTimeout(() => setSuccessMsg(''), 3000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentCenter) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Configuration</h2>
          <p className="text-sm text-slate-500">Gérer les informations de votre établissement</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
           <CheckCircle className="w-5 h-5" />
           {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900">Identité du Centre</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Centre</label>
               <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Directeur</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="text" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.directorName}
                    onChange={e => setFormData({...formData, directorName: e.target.value})}
                 />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">RNIS (Identification Nat.)</label>
               <div className="relative">
                 <FileBadge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.rnis}
                    onChange={e => setFormData({...formData, rnis: e.target.value})}
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900">Coordonnées</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
               <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Complète</label>
               <input 
                  type="text" required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="tel" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                 />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="email" required
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Capacity & Payment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Bed className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900">Autres Configuration</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Capacité d'accueil (Lits)</label>
               <input 
                  type="number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
               />
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Alias PI-SPI (Mobile Money)</label>
               <div className="relative">
                 <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.pispiAlias}
                    onChange={e => setFormData({...formData, pispiAlias: e.target.value})}
                    placeholder="Ex: POSTE_MEDINA_01"
                 />
               </div>
               <p className="text-xs text-slate-500 mt-1">
                 Identifiant marchand pour générer le QR Code de paiement.
               </p>
            </div>
          </div>
        </div>

        {/* Section IA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900">Intelligence Artificielle</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Diagnostic par IA</h4>
                <p className="text-sm text-slate-500">Configurer le service d'analyse d'imagerie médicale</p>
              </div>
              <Link
                to="/ai-settings"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4" />
                Configurer
              </Link>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
           <button 
            type="submit"
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-6 py-3 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2"
           >
             <Save className="w-5 h-5" />
             Enregistrer les modifications
           </button>
        </div>
      </form>
    </div>
  );
};
