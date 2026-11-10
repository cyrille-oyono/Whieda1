import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface MedicalRecord {
  id: number;
  patient_id: string;
  diagnosis: string;
  prescription: string;
  exam_type: string;
  parameters: string;
  normal_values: string;
  result_value: string;
  status: string;
  created_at: string;
}

export default function HealthCabinet() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Formulaire d'un nouveau bilan / consultation
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [examType, setExamType] = useState('');
  const [parameters, setParameters] = useState('');
  const [normalValues, setNormalValues] = useState('');
  const [resultValue, setResultValue] = useState('');
  const [status, setStatus] = useState('Normal');

  const supabase = getSupabaseClient();

  const fetchMedicalRecords = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur chargement dossiers médicaux :", error.message);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { error } = await supabase.from('medical_records').insert([
      {
        diagnosis,
        prescription,
        exam_type: examType,
        parameters,
        normal_values: normalValues,
        result_value: resultValue,
        status,
      },
    ]);

    if (error) {
      alert("Erreur lors de l'enregistrement du bilan : " + error.message);
    } else {
      alert("Bilan de santé enregistré avec succès !");
      setDiagnosis('');
      setPrescription('');
      setExamType('');
      setParameters('');
      setNormalValues('');
      setResultValue('');
      fetchMedicalRecords();
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow border border-gray-200 mt-6">
      <h2 className="text-2xl font-bold text-orange-600 mb-6">Cabinet de Santé & Bilans (Wheida Smart)</h2>

      {/* Formulaire de saisie d'un bilan */}
      <form onSubmit={handleAddRecord} className="bg-gray-50 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200">
        <h3 className="text-lg font-semibold col-span-full text-gray-700">Nouvelle Consultation & Bilan de Santé</h3>

        <input
          type="text"
          placeholder="Diagnostic médical"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          required
          className="p-2 border rounded bg-white"
        />

        <input
          type="text"
          placeholder="Type d'examen (ex: Glycémie, Tension)"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="p-2 border rounded bg-white"
        />

        <input
          type="text"
          placeholder="Paramètres mesurés"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          className="p-2 border rounded bg-white"
        />

        <input
          type="text"
          placeholder="Valeurs normales (ex: 120/80 mmHg)"
          value={normalValues}
          onChange={(e) => setNormalValues(e.target.value)}
          className="p-2 border rounded bg-white"
        />

        <input
          type="text"
          placeholder="Valeur obtenue / Résultat"
          value={resultValue}
          onChange={(e) => setResultValue(e.target.value)}
          className="p-2 border rounded bg-white"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded bg-white"
        >
          <option value="Normal">Normal</option>
          <option value="Anormal">Anormal / À surveiller</option>
          <option value="Critique">Critique</option>
        </select>

        <textarea
          placeholder="Ordonnance ou prescription médicale"
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          className="p-2 border rounded bg-white col-span-full"
          rows={2}
        />

        <button
          type="submit"
          className="bg-orange-600 text-white p-2 rounded col-span-full font-semibold hover:bg-orange-700 transition"
        >
          Enregistrer le dossier médical
        </button>
      </form>

      {/* Liste des bilans */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">Historique des Bilans de Santé</h3>
      {loading ? (
        <p>Chargement des dossiers...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">Aucun bilan enregistré pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r.id} className="p-4 border rounded-lg bg-gray-50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg text-gray-800">{r.exam_type || 'Consultation générale'}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${r.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600"><strong>Diagnostic :</strong> {r.diagnosis}</p>
                <p className="text-sm text-gray-600"><strong>Paramètres :</strong> {r.parameters} | <strong>Valeur :</strong> <span className="font-semibold text-orange-600">{r.result_value}</span> (Norme : {r.normal_values})</p>
                {r.prescription && <p className="text-sm text-blue-700 mt-1"><strong>Ordonnance :</strong> {r.prescription}</p>}
              </div>
              <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                  }
