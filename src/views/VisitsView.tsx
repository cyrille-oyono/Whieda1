import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VisitorType, VisitStatus } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  UserCheck, 
  Calendar, 
  Clock, 
  Users, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock3, 
  X,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { getVisitStatusLabel } from '../utils/formatters';

export const VisitsView: React.FC = () => {
  const { visits, addVisit, updateVisitStatus, partners, patients, addPatient } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'patient_client' | 'staff'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [visitorType, setVisitorType] = useState<VisitorType>('patient');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [sponsorPartnerId, setSponsorPartnerId] = useState('');
  const [purpose, setPurpose] = useState('Consultation Médicale');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Filtered visits
  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.sponsorPartnerName && v.sponsorPartnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateFilter || v.date === dateFilter;

    let matchesType = true;
    if (filterType === 'patient_client') {
      matchesType = v.visitorType === 'patient' || v.visitorType === 'client';
    } else if (filterType === 'staff') {
      matchesType = v.visitorType === 'staff';
    }

    return matchesSearch && matchesDate && matchesType;
  });

  const handleOpenModal = () => {
    setVisitorName('');
    setVisitorPhone('');
    setSponsorPartnerId('');
    setPurpose('Consultation Médicale');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSelectExistingPatient = (patientId: string) => {
    const p = patients.find(pat => pat.id === patientId);
    if (p) {
      setVisitorName(p.fullName);
      setVisitorPhone(p.phone);
      setVisitorType(p.type);
      if (p.sponsorPartnerId) {
        setSponsorPartnerId(p.sponsorPartnerId);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!visitorName.trim()) {
      setFormError('Veuillez renseigner le nom du visiteur.');
      return;
    }

    // Crucial rule: Patients and Clients must be linked to a sponsor partner
    if ((visitorType === 'patient' || visitorType === 'client') && !sponsorPartnerId) {
      setFormError('Traçabilité Partenaire Obligatoire : Chaque patient ou client doit être rattaché à son partenaire parrain.');
      return;
    }

    const selectedPartner = partners.find(p => p.id === sponsorPartnerId);

    // Save visit
    addVisit({
      visitorName,
      visitorPhone: visitorPhone || undefined,
      visitorType,
      sponsorPartnerId: selectedPartner?.id,
      sponsorPartnerName: selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : undefined,
      sponsorPartnerCode: selectedPartner?.code,
      purpose,
      notes: notes || undefined,
      status: 'en_attente',
    });

    // Also register to patients list if new
    const alreadyExists = patients.some(pat => pat.fullName.toLowerCase() === visitorName.toLowerCase());
    if (!alreadyExists && (visitorType === 'patient' || visitorType === 'client')) {
      addPatient({
        fullName: visitorName,
        phone: visitorPhone || '+237 ...',
        type: visitorType,
        sponsorPartnerId: selectedPartner?.id,
        sponsorPartnerName: selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : undefined,
        sponsorPartnerCode: selectedPartner?.code,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Registre des Visites Journalières
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Accueil physique des personnes, distinction Patients / Staff et traçabilité parrainage MLM
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Entrée</span>
        </button>
      </div>

      {/* Traçabilité Alert banner */}
      <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-orange-950">
          <LinkIcon className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            <strong className="font-semibold text-orange-900">Règle de Traçabilité Partenaire :</strong> Le rattachement au partenaire parrain garantit que tous les achats à la caisse et bilans médicaux généreront automatiquement ses commissions et PV.
          </span>
        </div>
        <span className="hidden md:inline-block text-[11px] font-mono font-medium text-orange-700 shrink-0">
          MLM Sync Actif
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom de visiteur, parrain ou motif..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Filter (Functional Buttons) */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tous ({visits.length})
            </button>
            <button
              onClick={() => setFilterType('patient_client')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'patient_client' ? 'bg-white text-orange-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Patients & Clients
            </button>
            <button
              onClick={() => setFilterType('staff')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                filterType === 'staff' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Personnel (Staff)
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent border-none p-0 text-xs focus:outline-none text-neutral-700"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Visiteur</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Partenaire Parrain (MLM)</th>
                <th className="py-3 px-4">Motif de la Visite</th>
                <th className="py-3 px-4">Enregistré par</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400">
                    Aucune entrée trouvée pour cette sélection.
                  </td>
                </tr>
              ) : (
                filteredVisits.map(v => {
                  const statusConfig = getVisitStatusLabel(v.status);
                  return (
                    <tr key={v.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-medium text-neutral-900">{v.time}</div>
                        <div className="text-[11px] text-neutral-400">{v.date}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">{v.visitorName}</div>
                        {v.visitorPhone && (
                          <div className="text-[11px] text-neutral-500">{v.visitorPhone}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          v.visitorType === 'staff'
                            ? 'bg-neutral-100 text-neutral-700'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {v.visitorType === 'staff' ? 'Personnel' : 'Patient / Client'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {v.sponsorPartnerName ? (
                          <div>
                            <div className="font-medium text-neutral-900 flex items-center gap-1">
                              <LinkIcon className="w-3 h-3 text-orange-600" />
                              <span>{v.sponsorPartnerName}</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              Code : {v.sponsorPartnerCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">Non applicable (Staff)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-medium text-neutral-800">{v.purpose}</div>
                        {v.notes && (
                          <div className="text-[11px] text-neutral-400 truncate">{v.notes}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-neutral-500">
                        {v.registeredBy}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <select
                          value={v.status}
                          onChange={e => updateVisitStatus(v.id, e.target.value as VisitStatus)}
                          className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="en_attente">En attente</option>
                          <option value="en_consultation">En consultation</option>
                          <option value="termine">Terminé</option>
                          <option value="annule">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enregistrer une Nouvelle Visite
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type distinction */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Type de Visiteur
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisitorType('patient')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'patient'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitorType('client')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'client'
                        ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Client Boutique
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVisitorType('staff');
                      setSponsorPartnerId('');
                    }}
                    className={`py-2 px-3 rounded-lg border font-medium text-center transition-all ${
                      visitorType === 'staff'
                        ? 'border-neutral-800 bg-neutral-900 text-white font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Employé (Staff)
                  </button>
                </div>
              </div>

              {/* Quick autofill from registered patients */}
              {visitorType !== 'staff' && patients.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Sélectionner un patient déjà enregistré (Optionnel) :
                  </label>
                  <select
                    onChange={e => handleSelectExistingPatient(e.target.value)}
                    className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-neutral-50"
                  >
                    <option value="">-- Nouveau patient / saisie manuelle --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone}) · Parrain: {p.sponsorPartnerName || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Visitor Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Christine Bella"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* CRUCIAL: Parrain Partenaire */}
              {visitorType !== 'staff' && (
                <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-orange-900">
                      Partenaire Parrain Obligatoire (MLM) *
                    </label>
                    <span className="text-[10px] text-orange-700 font-mono">Bénéficiaire des PV</span>
                  </div>
                  <select
                    value={sponsorPartnerId}
                    onChange={e => setSponsorPartnerId(e.target.value)}
                    required
                    className="w-full text-xs p-2 border border-orange-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-neutral-900 font-medium"
                  >
                    <option value="">-- Choisir le Partenaire Parrain --</option>
                    {partners.map(ptn => (
                      <option key={ptn.id} value={ptn.id}>
                        {ptn.firstName} {ptn.lastName} ({ptn.code}) - {ptn.level}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-orange-800">
                    Tous les futurs achats boutique, pharmacie ou examens profiteront à ce parrain.
                  </p>
                </div>
              )}

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Motif de la Visite *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Consultation Dr. Kamga, Achat Thé Détox, Retrait..."
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Observations / Antécédents
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes cliniques préliminaires ou remarques..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  Valider l'Entrée
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
