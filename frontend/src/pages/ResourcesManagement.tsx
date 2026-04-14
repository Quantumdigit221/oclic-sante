
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Plus, 
  Search, 
  Wallet, 
  Package, 
  Box, 
  TrendingDown, 
  Calendar, 
  Edit, 
  Trash2, 
  Filter, 
  Download, 
  FileText, 
  AlertTriangle,
  ChevronRight,
  DollarSign,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, StatCard } from '../components/ui/Card';
import axios from 'axios';

interface Expense {
  id: number;
  category: string;
  title: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  reference: string;
  notes: string;
}

interface Asset {
  id: number;
  name: string;
  category: string;
  serial_number: string;
  purchase_date: string;
  purchase_price: number;
  current_value: number;
  location: string;
  status: string;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_alert: number;
  unit_price: number;
  location: string;
}

export const ResourcesManagement = () => {
  const { currentCenter } = useStore();
  const [activeTab, setActiveTab] = useState<'expenses' | 'assets' | 'inventory'>('expenses');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'expenses' ? '/api/expenses' : activeTab === 'assets' ? '/api/assets' : '/api/inventory';
      const res = await axios.get(endpoint);
      if (activeTab === 'expenses') setExpenses(res.data);
      else if (activeTab === 'assets') setAssets(res.data);
      else setInventory(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    try {
      const endpoint = activeTab === 'expenses' ? `/api/expenses/${id}` : activeTab === 'assets' ? `/api/assets/${id}` : `/api/inventory/${id}`;
      await axios.delete(endpoint);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredData = () => {
    if (activeTab === 'expenses') return expenses.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === 'assets') return assets.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ressources & Maintenance</h2>
          <p className="text-sm text-slate-500">Gestion des dépenses, immobilisations et stocks généraux</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner">
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'expenses' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Wallet className="w-4 h-4" /> Dépenses
          </button>
          <button 
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'assets' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Package className="w-4 h-4" /> Immobilisations
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-white shadow text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Box className="w-4 h-4" /> Stock Général
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={activeTab === 'expenses' ? "Total Dépenses (Mois)" : activeTab === 'assets' ? "Valeur Totale Parc" : "Alertes Stock"}
          value={activeTab === 'expenses' ? "1,240,500 FCFA" : activeTab === 'assets' ? "45,800,000 FCFA" : "4 Articles"}
          icon={activeTab === 'expenses' ? Wallet : Package}
          iconColor={activeTab === 'expenses' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}
          trend={activeTab === 'expenses' ? "+5.2%" : undefined}
          trendType={activeTab === 'expenses' ? 'down' : undefined}
        />
        <StatCard 
          title={activeTab === 'expenses' ? "Dépense Moyenne" : activeTab === 'assets' ? "Maintenance" : "Valeur Stock"}
          value={activeTab === 'expenses' ? "45,000 FCFA" : activeTab === 'assets' ? "92%" : "345,000 FCFA"}
          icon={TrendingDown}
          iconColor="bg-teal-100 text-teal-600"
        />
        <StatCard 
          title="Dernière Opération"
          value="Aujourd'hui"
          icon={Calendar}
          iconColor="bg-slate-100 text-slate-600"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`Rechercher ${activeTab === 'expenses' ? 'une dépense' : activeTab === 'assets' ? 'un équipement' : 'un article'}...`}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50">
              <Filter className="w-4 h-4" /> Filtrer
            </button>
            <button 
              onClick={() => { setEditingItem(null); setShowModal(true); }}
              className="flex-1 md:flex-none bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-teal-700 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase font-semibold">
                {activeTab === 'expenses' ? (
                  <>
                    <th className="px-6 py-4">Titre / Catégorie</th>
                    <th className="px-6 py-4">Montant</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Référence</th>
                  </>
                ) : activeTab === 'assets' ? (
                  <>
                    <th className="px-6 py-4">Désignation</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Achat</th>
                    <th className="px-6 py-4">Valeur Actuelle</th>
                    <th className="px-6 py-4">Statut</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4">Article</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Unité</th>
                    <th className="px-6 py-4">Prix Unitaire</th>
                  </>
                )}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredData().map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {activeTab === 'expenses' ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{(item.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-400">FCFA</span></td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.expense_date ? format(parseISO(item.expense_date), 'dd MMM yyyy', { locale: fr }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.payment_method === 'CASH' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{item.reference || '-'}</td>
                    </>
                  ) : activeTab === 'assets' ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">SN: {item.serial_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium">{item.purchase_date ? format(parseISO(item.purchase_date), 'dd/MM/yyyy') : '-'}</div>
                        <div className="text-[10px] text-slate-400">{(item.purchase_price || 0).toLocaleString()} FCFA</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">{(item.current_value || 0).toLocaleString()} FCFA</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${item.quantity <= item.min_stock_alert ? 'text-red-600' : 'text-slate-900'}`}>{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{item.unit}</td>
                      <td className="px-6 py-4 font-medium text-teal-700">{item.unit_price} FCFA</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                         <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData().length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Search className="w-8 h-8 opacity-20" />
                      <p>Aucun résultat trouvé pour "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resource Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-teal-600" />
                {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'expenses' ? 'une dépense' : activeTab === 'assets' ? 'une immobilisation' : 'un article'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
               <p className="text-sm text-slate-500 mb-6 italic">Le formulaire complet est en cours d'initialisation pour assurer l'intégrité des données multitenant.</p>
               
               <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                 <button onClick={() => setShowModal(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium">Fermer</button>
                 <button className="px-6 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md font-bold">Valider</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
