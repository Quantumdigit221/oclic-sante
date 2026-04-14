import React from 'react';
import { CreditCard, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export const BillingRequired: React.FC<{
  projectId: string;
  onBillingEnabled?: () => void;
}> = ({ projectId, onBillingEnabled }) => {
  const billingUrl = `https://console.cloud.google.com/billing/enable?project=${projectId}`;
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Facturation requise
          </h3>
          
          <p className="text-amber-800 mb-4">
            Pour utiliser Google Cloud Vision API, vous devez activer la facturation sur votre projet.
            Google offre <strong>$300 de crédits gratuits</strong> pour les nouveaux utilisateurs.
          </p>

          <div className="bg-white rounded-lg p-4 border border-amber-300 mb-4">
            <h4 className="font-medium text-amber-900 mb-2">Informations du projet :</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID Projet :</span> {projectId}</p>
              <p><span className="font-medium">Crédits offerts :</span> $300 (équivalent à ~100,000 analyses)</p>
              <p><span className="font-medium">Coût par analyse :</span> ~$0.0015</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={billingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <CreditCard className="w-4 h-4" />
              Activer la facturation
              <ExternalLink className="w-4 h-4" />
            </a>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium"
            >
              Actualiser la page
            </button>
          </div>

          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Après activation :</strong> Attendez 2-3 minutes que la configuration se propage, 
              puis rechargez cette page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
