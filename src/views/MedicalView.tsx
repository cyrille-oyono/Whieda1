import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MedicalRecord, PrescriptionItem, MedicalExamDefinition, ExamParameter, MedicalExamRecordItem } from '../types';
import { 
  Stethoscope, 
  Plus, 
  FileText, 
  Printer, 
  Activity, 
  Search, 
  X, 
  CheckCircle,
  Settings,
  Sliders,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export const MedicalView: React.FC = () => {
  const { 
    medicalRecords, 
    addMedicalRecord, 
    patients, 
    products, 
    currentUser,
    examDefinitions,
    addExamDefinition,
    updateExamDefinition,
    deleteExamDefinition
  } = useApp();

  const [activeTab, setActiveTab] = useState<'consultations' | 'exam_config'>('consultations');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [selectedRecordForPdf, setSelectedRecordForPdf] = useState<MedicalRecord | null>(null);

  // --- Admin Exam Config State ---
  const [isExamConfigModalOpen, setIsExamConfigModalOpen] = useState(false);
  const [editingExamDef, setEditingExamDef] = useState<MedicalExamDefinition | null>(null);
  const [examCode, setExamCode] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examCategory, setExamCategory] = useState('Bio-Électronique');
  const [examDescription, setExamDescription] = useState('');
  const [examPrice, setExamPrice] = useState<number>(20000);
  const [examParameters, setExamParameters] = useState<ExamParameter[]>([
    { id: 'param-1', name: 'Potentiel d’Oxydoréduction (rH2)', unit: 'rH2', normalRange: '21.0 - 24.0' },
  ]);

  // --- Consultation Form State ---
  const [patientId, setPatientId] = useState('');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState<'M' | 'F'>('F');
  const [bloodPressure, setBloodPressure] = useState('130/80 mmHg');
  const [heartRate, setHeartRate] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(36.9);
  const [weight, setWeight] = useState<number>(68);
  const [bloodSugar, setBloodSugar] = useState<number>(0.98);
  const [symptoms, setSymptoms] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  
  // Selected Exam Definitions in this consultation
  const [selectedExamDefIds, setSelectedExamDefIds] = useState<string[]>(['exam-def-1']);
  const [examMeasuredValues, setExamMeasuredValues] = useState<Record<string, string>>({
    'p-1': '22.4',
    'p-2': '195',
    'p-3': '7.38',
    'p-4': '22'
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-tmp-1',
      medication: 'Thé Détox Whieda Herbal Pure',
      dosage: '1 sachet infusé à chaud',
      frequency: 'Matin à jeun',
      duration: '21 jours',
      instructions: 'Boire chaud, sans sucre.',
    },
  ]);
  const [recommendedExams, setRecommendedExams] = useState<string>('Bilan Bio-Électronique dans 3 semaines');

  // --- Handlers for Admin Exam Definitions ---
  const handleOpenAddExamDef = () => {
    setEditingExamDef(null);
    setExamCode(`EXAM-${Math.floor(10 + Math.random() * 90)}`);
    setExamTitle('');
    setExamCategory('Bio-Électronique');
    setExamDescription('');
    setExamPrice(20000);
    setExamParameters([
      { id: `p-${Date.now()}-1`, name: 'Paramètre 1', unit: 'g/L', normalRange: '1.0 - 2.0' },
      { id: `p-${Date.now()}-2`, name: 'Paramètre 2', unit: 'mg/dL', normalRange: '< 50' },
    ]);
    setIsExamConfigModalOpen(true);
  };

  const handleOpenEditExamDef = (def: MedicalExamDefinition) => {
    setEditingExamDef(def);
    setExamCode(def.code);
    setExamTitle(def.title);
    setExamCategory(def.category);
    setExamDescription(def.description || '');
    setExamPrice(def.price || 0);
    setExamParameters(def.parameters || []);
    setIsExamConfigModalOpen(true);
  };

  const handleAddParamLine = () => {
    setExamParameters([
      ...examParameters,
      { id: `p-${Date.now()}`, name: '', unit: '', normalRange: '', description: '' }
    ]);
  };

  const handleUpdateParamLine = (idx: number, field: keyof ExamParameter, val: string) => {
    setExamParameters(examParameters.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const handleRemoveParamLine = (idx: number) => {
    setExamParameters(examParameters.filter((_, i) => i !== idx));
  };

  const handleSaveExamDef = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    if (editingExamDef) {
      updateExamDefinition(editingExamDef.id, {
        code: examCode.trim().toUpperCase(),
        title: examTitle.trim(),
        category: examCategory.trim(),
        description: examDescription.trim(),
        price: Number(examPrice),
        parameters: examParameters.filter(p => p.name.trim().length > 0),
      });
    } else {
      addExamDefinition({
        code: examCode.trim().toUpperCase() || `EXAM-${Math.floor(100 + Math.random() * 900)}`,
        title: examTitle.trim(),
        category: examCategory.trim() || 'Général',
        description: examDescription.trim(),
        price: Number(examPrice),
        parameters: examParameters.filter(p => p.name.trim().length > 0),
      });
    }
    setIsExamConfigModalOpen(false);
  };

  // --- Handlers for Consultations ---
  const handleOpenNewConsultation = () => {
    if (patients.length > 0) {
      setPatientId(patients[0].id);
    }
    setBloodPressure('130/85 mmHg');
    setHeartRate(74);
    setTemperature(36.8);
    setWeight(70);
    setBloodSugar(1.00);
    setSymptoms('');
    setAnamnesis('');
    setDiagnosis('');
    setTreatmentNotes('');
    
    // Default select first exam definition if available
    if (examDefinitions.length > 0) {
      setSelectedExamDefIds([examDefinitions[0].id]);
      const initialValues: Record<string, string> = {};
      examDefinitions[0].parameters.forEach(p => {
        initialValues[p.id] = '';
      });
      setExamMeasuredValues(initialValues);
    } else {
      setSelectedExamDefIds([]);
      setExamMeasuredValues({});
    }

    setPrescriptions([
      {
        id: `rx-${Date.now()}`,
        medication: 'Régulateur Tensionnel & Cardio Herbal',
        dosage: '2 comprimés',
        frequency: 'Matin et Soir avant les repas',
        duration: '30 jours',
        instructions: 'À prendre avec un grand verre d’eau.',
      },
    ]);
    setRecommendedExams('Contrôle tensionnel et biologique dans 15 jours');
    setIsConsultationModalOpen(true);
  };

  const handleToggleExamSelection = (examDefId: string) => {
    if (selectedExamDefIds.includes(examDefId)) {
      setSelectedExamDefIds(selectedExamDefIds.filter(id => id !== examDefId));
    } else {
      setSelectedExamDefIds([...selectedExamDefIds, examDefId]);
    }
  };

  const handleUpdateMeasuredValue = (paramId: string, val: string) => {
    setExamMeasuredValues(prev => ({ ...prev, [paramId]: val }));
  };

  const handleAddPrescriptionLine = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: `rx-${Date.now()}`,
        medication: 'Gélules Moringa Organique 500mg',
        dosage: '2 gélules',
        frequency: 'Matin et Soir avant le repas',
        duration: '30 jours',
        instructions: 'Avec un grand verre d’eau.',
      },
    ]);
  };

  const handleRemovePrescriptionLine = (id: string) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const handleUpdatePrescription = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;

    const examsList = recommendedExams
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    // Build recorded exam items
    const examRecords: MedicalExamRecordItem[] = selectedExamDefIds.map(defId => {
      const def = examDefinitions.find(d => d.id === defId);
      return {
        examDefinitionId: defId,
        examTitle: def ? def.title : 'Bilan',
        results: def ? def.parameters.map(p => ({
          parameterId: p.id,
          parameterName: p.name,
          measuredValue: examMeasuredValues[p.id] || 'Non mesuré',
          unit: p.unit,
          normalRange: p.normalRange,
          status: 'normal',
        })) : []
      };
    });

    const newRecord = addMedicalRecord({
      patientId: pat.id,
      patientName: pat.fullName,
      patientAge,
      patientGender,
      patientPhone: pat.phone,
      vitals: {
        bloodPressure,
        heartRate: Number(heartRate),
        temperature: Number(temperature),
        weight: Number(weight),
        bloodSugar: Number(bloodSugar),
      },
      symptoms,
      anamnesis,
      diagnosis,
      treatmentNotes,
      prescriptions,
      recommendedExams: examsList,
      examRecords,
      status: 'cloture',
    });

    setIsConsultationModalOpen(false);
    setSelectedRecordForPdf(newRecord);
  };

  const filteredRecords = medicalRecords.filter(r => {
    const full = `${r.patientName} ${r.diagnosis} ${r.doctorName}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-rose-600" />
            <span>Espace Médecin & Bilans de Santé</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Consultations médicales, paramètres d'examens biologiques et bilans de santé paramétrables
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab(activeTab === 'exam_config' ? 'consultations' : 'exam_config')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                activeTab === 'exam_config'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Settings className="w-4 h-4 text-orange-600" />
              <span>Paramétrer Types d'Examens (Admin)</span>
            </button>
          )}

          <button
            onClick={handleOpenNewConsultation}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Consultation Médicale</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200 shadow-xs w-full sm:w-auto">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'consultations'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Dossiers Médicaux & Bilans ({medicalRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exam_config')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'exam_config'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-orange-500" />
          <span>Types d'Examens & Paramètres ({examDefinitions.length})</span>
        </button>
      </div>

      {/* VIEW 1: ADMIN EXAM DEFINITION & NORMAL VALUES CONFIGURATION */}
      {activeTab === 'exam_config' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-orange-950">
                  Configuration Clinique des Bilans de Santé (Admin) :
                </span>
                <p className="text-orange-900 text-[11px] mt-0.5 leading-relaxed">
                  Vous pouvez ajouter des types d'examens (ex: Bilan Bio-Électronique, Bilan Lipidique, Rénal, Thyroïdien), définir leurs paramètres à mesurer (ex: pH, rH2, Cholestérol HDL, Créatinine), leurs unités et leurs valeurs normales de référence. Ces paramètres apparaîtront directement lors des consultations médicales et sur les rapports officiels.
                </p>
              </div>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={handleOpenAddExamDef}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Type d'Examen</span>
              </button>
            )}
          </div>

          {/* Exam Definitions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examDefinitions.map(def => (
              <div
                key={def.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold">
                      {def.code}
                    </span>
                    <span className="text-[11px] font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                      {def.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900">
                    {def.title}
                  </h3>

                  {def.description && (
                    <p className="text-[11px] text-neutral-500 line-clamp-2">
                      {def.description}
                    </p>
                  )}

                  {/* Measurable Parameters List */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                      Paramètres à mesurer & Valeurs normales ({def.parameters.length}) :
                    </span>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {def.parameters.map((p, idx) => (
                        <div key={idx} className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] flex items-center justify-between">
                          <div className="font-medium text-neutral-900 truncate max-w-[170px]">
                            {p.name}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono text-neutral-600 bg-white px-1.5 py-0.5 rounded border border-neutral-200 font-semibold">
                              {p.normalRange} {p.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-neutral-800 text-[11px]">
                    Tarif Bilan : {def.price ? `${def.price.toLocaleString('fr-FR')} FCFA` : 'Inclus'}
                  </span>
                  {currentUser.role === 'admin' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditExamDef(def)}
                        className="p-1.5 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                        title="Modifier le type d'examen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer l'examen "${def.title}" ?`)) {
                            deleteExamDefinition(def.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CONSULTATIONS & RECORDS LIST */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom de patient ou diagnostic..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Consultations Records List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4 hover:border-orange-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        {record.patientName}
                      </h3>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{record.date} à {record.time}</span>
                        <span>·</span>
                        <span>{record.doctorName}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
                      {record.vitals.bloodPressure}
                    </span>
                  </div>

                  {/* Vitals summary */}
                  <div className="grid grid-cols-4 gap-1.5 p-2 bg-neutral-50 rounded-lg text-[11px] text-center font-mono">
                    <div>
                      <span className="text-[9px] text-neutral-400 block">Pouls</span>
                      <span className="font-semibold text-neutral-800">{record.vitals.heartRate} bpm</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block">Temp.</span>
                      <span className="font-semibold text-neutral-800">{record.vitals.temperature}°C</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block">Poids</span>
                      <span className="font-semibold text-neutral-800">{record.vitals.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-400 block">Glyc.</span>
                      <span className="font-semibold text-neutral-800">{record.vitals.bloodSugar} g/L</span>
                    </div>
                  </div>

                  {/* Diagnostic snippet */}
                  <div className="text-xs">
                    <span className="font-semibold text-neutral-700 block">Diagnostic :</span>
                    <p className="text-neutral-600 line-clamp-2 mt-0.5 text-[11px]">
                      {record.diagnosis}
                    </p>
                  </div>

                  {/* Prescriptions & Exam badges */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-orange-800 bg-orange-50/80 px-2 py-0.5 rounded font-medium">
                      {record.prescriptions.length} prescription{record.prescriptions.length > 1 ? 's' : ''}
                    </span>
                    {record.examRecords && record.examRecords.length > 0 && (
                      <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                        {record.examRecords.length} bilan{record.examRecords.length > 1 ? 's' : ''} mesuré(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Print/View Report Button */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Ref: {record.id.slice(0, 8)}
                  </span>
                  <button
                    onClick={() => setSelectedRecordForPdf(record)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Rapport PDF & Ordonnance</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADMIN EXAM TYPE & PARAMETERS CONFIGURATION */}
      {isExamConfigModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  {editingExamDef ? 'Modifier le Type d\'Examen' : 'Ajouter un Type d\'Examen & Paramètres'}
                </h3>
              </div>
              <button onClick={() => setIsExamConfigModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExamDef} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom du Bilan / Examen *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Bilan Lipidique & Cardiovasculaire"
                    value={examTitle}
                    onChange={e => setExamTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code Examen
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: CARDIO-01"
                    value={examCode}
                    onChange={e => setExamCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Catégorie du Bilan
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Bio-Électronique, Biochimie, Métabolique"
                    value={examCategory}
                    onChange={e => setExamCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tarif Standard (FCFA)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={examPrice}
                    onChange={e => setExamPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description Clinique
                </label>
                <input
                  type="text"
                  placeholder="ex: Évaluation de l'intégrité vasculaire et des fractions lipidiques"
                  value={examDescription}
                  onChange={e => setExamDescription(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              {/* Paramètres à mesurer et Valeurs Normales */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-neutral-900 block">
                      Paramètres à Mesurer & Valeurs Normales de Référence
                    </label>
                    <span className="text-[10px] text-neutral-500">
                      Définissez les constantes biologiques attendues
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddParamLine}
                    className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter Paramètre</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {examParameters.map((param, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <label className="block text-[9px] text-neutral-400">Paramètre mesuré *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: Cholestérol HDL"
                          value={param.name}
                          onChange={e => handleUpdateParamLine(idx, 'name', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[9px] text-neutral-400">Unité</label>
                        <input
                          type="text"
                          placeholder="g/L, %"
                          value={param.unit}
                          onChange={e => handleUpdateParamLine(idx, 'unit', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs font-mono"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[9px] text-neutral-400">Valeur Normale / Plage *</label>
                        <input
                          type="text"
                          required
                          placeholder="ex: 1.50 - 2.00 ou < 1.20"
                          value={param.normalRange}
                          onChange={e => handleUpdateParamLine(idx, 'normalRange', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs font-mono font-bold text-emerald-800 bg-emerald-50/40"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveParamLine(idx)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsExamConfigModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  {editingExamDef ? 'Enregistrer Modifications' : 'Créer le Type d\'Examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NOUVELLE CONSULTATION MÉDICALE AVEC SAISIE DES VALEURS MESURÉES */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Nouvelle Consultation Médicale & Bilan de Santé
                </h3>
              </div>
              <button onClick={() => setIsConsultationModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitConsultation} className="p-6 space-y-4">
              {/* Patient Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Patient *
                  </label>
                  <select
                    value={patientId}
                    onChange={e => setPatientId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone}) · Parrain: {p.sponsorPartnerName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Âge & Sexe
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={e => setPatientAge(Number(e.target.value))}
                      className="w-16 text-xs p-2.5 border border-neutral-300 rounded-lg font-mono text-center"
                    />
                    <select
                      value={patientGender}
                      onChange={e => setPatientGender(e.target.value as 'M' | 'F')}
                      className="text-xs p-2.5 border border-neutral-300 rounded-lg"
                    >
                      <option value="F">Femme</option>
                      <option value="M">Homme</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Constantes & Paramètres Vitaux */}
              <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2.5">
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>Constantes & Paramètres Vitaux</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Tension (mmHg)</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={e => setBloodPressure(e.target.value)}
                      placeholder="120/80"
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-mono text-center font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Pouls (bpm)</label>
                    <input
                      type="number"
                      value={heartRate}
                      onChange={e => setHeartRate(Number(e.target.value))}
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Temp. (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={e => setTemperature(Number(e.target.value))}
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Poids (kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={e => setWeight(Number(e.target.value))}
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-0.5">Glycémie (g/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={bloodSugar}
                      onChange={e => setBloodSugar(Number(e.target.value))}
                      className="w-full p-2 border border-neutral-300 rounded bg-white font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Bilans d'Examens & Valeurs Mesurées vs Valeurs Normales */}
              {examDefinitions.length > 0 && (
                <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bilans d'Examens & Paramètres Biologiques Mesurés</span>
                      </span>
                      <p className="text-[10px] text-blue-800">
                        Cochez les bilans effectués et saisissez les valeurs constatées
                      </p>
                    </div>
                  </div>

                  {/* Checklist of exam definitions */}
                  <div className="flex flex-wrap gap-2">
                    {examDefinitions.map(def => {
                      const isSelected = selectedExamDefIds.includes(def.id);
                      return (
                        <button
                          key={def.id}
                          type="button"
                          onClick={() => handleToggleExamSelection(def.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {def.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input fields for selected exam parameters */}
                  {selectedExamDefIds.length > 0 && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-blue-200">
                      {selectedExamDefIds.map(defId => {
                        const def = examDefinitions.find(d => d.id === defId);
                        if (!def) return null;
                        return (
                          <div key={def.id} className="bg-white p-3 rounded-lg border border-blue-100 space-y-2">
                            <span className="text-xs font-bold text-blue-900 block">
                              {def.title} ({def.parameters.length} paramètres)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {def.parameters.map(p => (
                                <div key={p.id} className="p-2 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-neutral-900 truncate">{p.name}</div>
                                    <div className="text-[10px] text-neutral-500 font-mono">
                                      Norme: <strong className="text-emerald-700">{p.normalRange}</strong> {p.unit}
                                    </div>
                                  </div>
                                  <div className="w-24 shrink-0">
                                    <input
                                      type="text"
                                      placeholder="Valeur"
                                      value={examMeasuredValues[p.id] || ''}
                                      onChange={e => handleUpdateMeasuredValue(p.id, e.target.value)}
                                      className="w-full p-1 border border-neutral-300 rounded text-center font-mono font-bold text-xs bg-white"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Symptômes & Diagnostic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Symptômes & Motifs de consultation *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="ex: Céphalées matinales, fatigue hépatique..."
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Diagnostic Médical & Bilan Clinique *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="ex: Hypertension modérée stade 1 + engorgement vésiculaire"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>
              </div>

              {/* Ordonnance (Prescriptions) */}
              <div className="p-3.5 bg-orange-50/50 border border-orange-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-orange-950">
                    Ordonnance Médicale & Produits Naturels Whieda
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPrescriptionLine}
                    className="text-xs text-orange-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Ajouter un produit
                  </button>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="p-2.5 bg-white rounded-lg border border-orange-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <select
                          value={rx.medication}
                          onChange={e => handleUpdatePrescription(rx.id, 'medication', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs font-semibold"
                        >
                          {products.map(prod => (
                            <option key={prod.id} value={prod.name}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Posologie (ex: 2 cp)"
                          value={rx.dosage}
                          onChange={e => handleUpdatePrescription(rx.id, 'dosage', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Fréquence / Durée"
                          value={rx.frequency}
                          onChange={e => handleUpdatePrescription(rx.id, 'frequency', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePrescriptionLine(rx.id)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examens complémentaires */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Examens Complémentaires & Consignes Hygiéno-Diététiques
                </label>
                <textarea
                  rows={2}
                  value={recommendedExams}
                  onChange={e => setRecommendedExams(e.target.value)}
                  placeholder="ex: Bilan Bio-Électronique de suivi, réduction du sel..."
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsConsultationModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  Enregistrer & Générer Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RAPPORT MÉDICAL OFFICIEL A4 AVEC TABLEAU DES PARAMÈTRES MESURÉS ET VALEURS NORMALES */}
      {selectedRecordForPdf && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            {/* Top Toolbar (Hidden on Print) */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 no-print">
              <div>
                <span className="text-xs font-bold text-neutral-900">
                  Rapport Médical & Bilan de Santé A4
                </span>
                <p className="text-[11px] text-neutral-400">
                  Format officiel Whieda Meyomessala prêt pour impression directe ou sauvegarde PDF
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / Télécharger PDF</span>
                </button>
                <button
                  onClick={() => setSelectedRecordForPdf(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable A4 Document Content */}
            <div className="print-page bg-white p-6 rounded-xl border border-neutral-200 text-neutral-900 space-y-6">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-red-600 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-extrabold text-2xl">
                    W
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                      WHIEDA SMART HEALTH
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Cabinet de Santé, Pharmacie & Médecine Intégrative
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Agrément Sanitaire N° 2026/MS/CAM · Tél: (+237) 699 00 11 22
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="font-bold text-neutral-900">Dr. Eric Kamga</div>
                  <div className="text-[11px] text-neutral-500">Médecin Chef de Consultation</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">
                    Date : {selectedRecordForPdf.date} · Réf: {selectedRecordForPdf.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Patient Profile */}
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-neutral-50 rounded-lg text-xs border border-neutral-100">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Patient(e)</span>
                  <span className="font-bold text-neutral-900 text-sm">{selectedRecordForPdf.patientName}</span>
                  <div className="text-neutral-500 mt-0.5">
                    {selectedRecordForPdf.patientAge ? `${selectedRecordForPdf.patientAge} ans` : ''} · {selectedRecordForPdf.patientGender === 'F' ? 'Femme' : 'Homme'} · Tél: {selectedRecordForPdf.patientPhone || 'N/A'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px]">Type d'acte</span>
                  <span className="font-bold text-orange-900">Bilan de Santé & Ordonnance</span>
                  <div className="text-emerald-700 font-medium text-[11px] mt-0.5">
                    Dossier Clôturé
                  </div>
                </div>
              </div>

              {/* Paramètres Vitaux */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  1. Constantes Biométriques & Vitales
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 border border-neutral-200 rounded-lg bg-white">
                    <span className="text-[10px] text-neutral-400 block">Tension</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedRecordForPdf.vitals.bloodPressure}</span>
                  </div>
                  <div className="p-2 border border-neutral-200 rounded-lg bg-white">
                    <span className="text-[10px] text-neutral-400 block">Pouls</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedRecordForPdf.vitals.heartRate} bpm</span>
                  </div>
                  <div className="p-2 border border-neutral-200 rounded-lg bg-white">
                    <span className="text-[10px] text-neutral-400 block">Température</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedRecordForPdf.vitals.temperature} °C</span>
                  </div>
                  <div className="p-2 border border-neutral-200 rounded-lg bg-white">
                    <span className="text-[10px] text-neutral-400 block">Poids</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedRecordForPdf.vitals.weight} kg</span>
                  </div>
                  <div className="p-2 border border-neutral-200 rounded-lg bg-white">
                    <span className="text-[10px] text-neutral-400 block">Glycémie</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedRecordForPdf.vitals.bloodSugar} g/L</span>
                  </div>
                </div>
              </div>

              {/* Paramètres d'Examens Biologiques Mesurés vs Valeurs Normales */}
              {selectedRecordForPdf.examRecords && selectedRecordForPdf.examRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2">
                    2. Résultats des Bilans & Paramètres Mesurés
                  </h4>
                  <div className="space-y-3">
                    {selectedRecordForPdf.examRecords.map((item, i) => (
                      <div key={i} className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                        <div className="bg-neutral-50 px-3 py-1.5 font-bold text-neutral-900 border-b border-neutral-200 flex justify-between">
                          <span>{item.examTitle}</span>
                          <span className="text-[10px] text-neutral-500 font-normal">Paramètres & Valeurs de référence</span>
                        </div>
                        <table className="w-full text-left">
                          <thead className="bg-neutral-50/50 text-[10px] text-neutral-500 border-b border-neutral-200">
                            <tr>
                              <th className="p-2">Paramètre Analysé</th>
                              <th className="p-2 text-center">Valeur Mesurée</th>
                              <th className="p-2 text-right">Valeur Normale de Référence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-800">
                            {item.results.map((res, rIdx) => (
                              <tr key={rIdx}>
                                <td className="p-2 font-medium">{res.parameterName}</td>
                                <td className="p-2 text-center font-mono font-bold text-neutral-900">
                                  {res.measuredValue} {res.unit}
                                </td>
                                <td className="p-2 text-right font-mono text-emerald-800 font-semibold">
                                  {res.normalRange} {res.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anamnèse & Diagnostic */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-neutral-900">Symptomatologie :</span>
                  <p className="text-neutral-700 mt-0.5">{selectedRecordForPdf.symptoms}</p>
                </div>
                <div>
                  <span className="font-bold text-neutral-900">Conclusion Diagnostique :</span>
                  <p className="text-neutral-900 font-semibold mt-0.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                    {selectedRecordForPdf.diagnosis}
                  </p>
                </div>
              </div>

              {/* Prescription Rx */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                  3. Prescription Thérapeutique & Ordonnance (Rx)
                </h4>
                <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5">Médicament / Produit Whieda</th>
                        <th className="p-2.5">Posologie</th>
                        <th className="p-2.5">Fréquence</th>
                        <th className="p-2.5">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {selectedRecordForPdf.prescriptions.map((p, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-neutral-900">{p.medication}</td>
                          <td className="p-2.5">{p.dosage}</td>
                          <td className="p-2.5">{p.frequency}</td>
                          <td className="p-2.5 font-semibold text-neutral-700">{p.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommandations */}
              {selectedRecordForPdf.recommendedExams.length > 0 && (
                <div className="text-xs">
                  <span className="font-bold text-neutral-900">Examens de Contrôle & Recommandations :</span>
                  <ul className="list-disc list-inside text-neutral-700 mt-1 space-y-0.5">
                    {selectedRecordForPdf.recommendedExams.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Signature & Stamp Zone */}
              <div className="pt-6 border-t border-neutral-200 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400">Authentification Whieda Meyomessala</div>
                  <div className="w-24 h-12 border border-dashed border-neutral-300 rounded flex items-center justify-center text-[10px] text-neutral-400">
                    Cachet Clinique
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-neutral-900">Dr. Eric Kamga</div>
                  <div className="text-[10px] text-neutral-500">Médecin Chef de Consultation</div>
                  <div className="font-mono text-[10px] text-neutral-400 italic">
                    [Approuvé et certifié valide]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
