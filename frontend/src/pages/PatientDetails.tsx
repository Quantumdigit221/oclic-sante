import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from '../store';
import { ArrowLeft, User, Calendar, Phone, MapPin, FileText, Activity, Pill, Stethoscope, Clock, Filter, Search, Printer, Download, Microscope } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePrintHTML } from "../components/PrintLayout";

function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, consultations, medicines, services, currentCenter } = useStore();
  
  // Vérifications de sécurité pour éviter les erreurs filter
  const patientsList = Array.isArray(patients) ? patients : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  const medicinesList = Array.isArray(medicines) ? medicines : [];
  const servicesList = Array.isArray(services) ? services : [];
  
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [patientConsultations, setPatientConsultations] = useState<any[]>([]);

  useEffect(() => {
    setIsLoading(false);
  }, [id, patients, consultations]);

  useEffect(() => {
    if (id) {
      const foundPatient = patientsList.find(p => p.id === id);
      if (foundPatient) {
        setPatient(foundPatient);
        
        const patientConsults = consultationsList.filter(c => c.patientName === `${foundPatient.firstName} ${foundPatient.lastName}`);
        const sortedConsultations = patientConsults.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPatientConsultations(sortedConsultations);
      }
    }
  }, [id, patients, consultations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement du dossier médical...</p>
        </div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500">Patient non trouvé</p>
          <button 
            onClick={() => navigate("/patients")}
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
            onClick={() => navigate("/patients")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dossier Médical</h1>
            <p className="text-slate-500">Historique médical complet du patient</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{patient.firstName} {patient.lastName}</h2>
            <p className="text-slate-500">Code: {patient.code}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm">
                  {format(new Date(patient.birthDate), "dd MMMM yyyy", { locale: fr })} 
                  ({patient.age} ans)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sexe:</span>
                <span className="text-sm">{patient.gender === "M" ? "Masculin" : "Féminin"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Groupe Sanguin:</span>
                <span className="text-sm">{patient.bloodGroup || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{patient.phone || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{patient.address || "Non spécifié"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Allergies:</span>
                <span className="text-sm text-red-600">{patient.allergies || "Aucune"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Historique des Consultations</h3>
          
          {patientConsultations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucune consultation dans l\"historique</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientConsultations.map((consultation) => (
                <div key={consultation.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {format(new Date(consultation.createdAt), "dd MMMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">
                            {format(new Date(consultation.createdAt), "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">Dr. {consultation.doctorName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {consultation.symptoms && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Symptômes</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{consultation.symptoms}</p>
                      </div>
                    )}

                    {consultation.diagnosis && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Diagnostic</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{consultation.diagnosis}</p>
                      </div>
                    )}

                    {consultation.notes && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Notes</h4>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{consultation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-purple-600" />
            Laboratoire
          </h3>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-slate-900">Résultats d\"Analyse et Radio</h4>
                <p className="text-sm text-slate-500">Consultez et gérez les résultats de laboratoire</p>
              </div>
              <button
                onClick={() => navigate(`/patients/${id}/lab-results`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Microscope className="w-4 h-4" />
                Voir les Résultats
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">12</div>
                <div className="text-sm text-purple-700">Analyses</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">8</div>
                <div className="text-sm text-blue-700">Radios</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-900">15</div>
                <div className="text-sm text-green-700">Validés</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;
