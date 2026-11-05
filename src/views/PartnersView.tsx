import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Partner } from '../types';
import { formatMoney, formatPV } from '../utils/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  Award, 
  CheckCircle, 
  Clock, 
  Share2, 
  ArrowRight,
  TrendingUp,
  X,
  CreditCard,
  Layers
} from 'lucide-react';

export const PartnersView: React.FC = () => {
  const { partners, addPartner, settlePartnerPayout, placePartnerPv } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPartnerForPayout, setSelectedPartnerForPayout] = useState<Partner | null>(null);
  const [selectedPartnerForPlacement, setSelectedPartnerForPlacement] = useState<Partner | null>(null);

  // Add Partner Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [code, setCode] = useState(`WH-PTN-${Math.floor(100 + Math.random() * 900)}`);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [level, setLevel] = useState('Bronze');

  // Payout Modal State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutMethod, setPayoutMethod] = useState('Orange Money');
  const [payoutNotes, setPayoutNotes] = useState('');

  // PV Placement Modal State
  const [pvToPlace, setPvToPlace] = useState<number>(0);

  // Financial Totals
  const totalGainsGenerated = partners.reduce((acc, p) => acc + p.totalDirectEarnings, 0);
  const totalPaid = partners.reduce((acc, p) => acc + p.paidEarnings, 0);
  const totalRemaining = partners.reduce((acc, p) => acc + p.remainingEarnings, 0);
  const totalPvNetwork = partners.reduce((acc, p) => acc + p.totalPv, 0);

  const handleOpenAdd = () => {
    setFirstName('');
    setLastName('');
    setCode(`WH-PTN-${Math.floor(100 + Math.random() * 900)}`);
    setPhone('');
    setEmail('');
    setSponsorId('');
    setLevel('Bronze');
    setIsAddModalOpen(true);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const sponsor = partners.find(p => p.id === sponsorId);
    addPartner({
      code,
      firstName,
      lastName,
      phone,
      email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@reseau-whieda.com`,
      sponsorId: sponsor?.id,
      sponsorName: sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : undefined,
      sponsorCode: sponsor?.code,
      level,
    });
    setIsAddModalOpen(false);
  };

  const handleOpenPayout = (p: Partner) => {
    setSelectedPartnerForPayout(p);
    setPayoutAmount(p.remainingEarnings);
    setPayoutMethod('Orange Money');
    setPayoutNotes('');
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartnerForPayout && payoutAmount > 0) {
      settlePartnerPayout(selectedPartnerForPayout.id, Number(payoutAmount), payoutMethod, payoutNotes);
      setSelectedPartnerForPayout(null);
    }
  };

  const handleOpenPlacement = (p: Partner) => {
    setSelectedPartnerForPlacement(p);
    setPvToPlace(p.remainingPv);
  };

  const handleConfirmPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartnerForPlacement && pvToPlace > 0) {
      placePartnerPv(selectedPartnerForPlacement.id, Number(pvToPlace));
      setSelectedPartnerForPlacement(null);
    }
  };

  const filteredPartners = partners.filter(p => {
    const full = `${p.firstName} ${p.lastName} ${p.code}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Gestion des Partenaires & Système MLM / PV
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Suivi des gains directs accumulés par les recommandations de patients et gestion des Points de Valeur
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Partenaire MLM</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Total Gains Directs Réseau</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatMoney(totalGainsGenerated)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">{formatMoney(totalPaid)}</span>
            <span>déjà réglé</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Commissions Reste à Payer</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600 tabular-nums">
            {formatMoney(totalRemaining)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            <span>En attente de versement aux parrains</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Total PV Accumulés</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatPV(totalPvNetwork)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            <span>Points de qualification et bonus de volume</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold">Membres Actifs du Réseau</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {partners.length}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            <span>Arbre binaire et affiliation active</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher un partenaire par nom ou code (ex: WH-PTN-101)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Main Partners Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Code / ID</th>
                <th className="py-3 px-4">Partenaire</th>
                <th className="py-3 px-4">Parrain Up</th>
                <th className="py-3 px-4 text-right">Gains Directs Totaux</th>
                <th className="py-3 px-4 text-right">Déjà Soldé</th>
                <th className="py-3 px-4 text-right">Reste à Payer</th>
                <th className="py-3 px-4 text-right">PV Totaux</th>
                <th className="py-3 px-4 text-right">PV Placés / Restants</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    Aucun partenaire trouvé.
                  </td>
                </tr>
              ) : (
                filteredPartners.map(p => {
                  const isSettled = p.remainingEarnings === 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900 whitespace-nowrap">
                        {p.code}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                          <span>{p.phone}</span>
                          <span className="text-neutral-300">·</span>
                          <span className="text-neutral-400 font-medium">{p.level}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {p.sponsorName ? (
                          <div>
                            <div className="font-medium text-neutral-800">{p.sponsorName}</div>
                            <span className="text-[10px] text-neutral-400 font-mono">{p.sponsorCode}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">Tête de réseau</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                        {formatMoney(p.totalDirectEarnings)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-emerald-700 tabular-nums">
                        {formatMoney(p.paidEarnings)}
                      </td>

                      {/* Reste à payer / État */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-bold tabular-nums ${
                            isSettled ? 'text-neutral-400' : 'text-orange-600'
                          }`}>
                            {formatMoney(p.remainingEarnings)}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                            isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {isSettled ? 'Soldé' : 'Reste à payer'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                        {formatPV(p.totalPv)}
                      </td>

                      {/* PV Placés / Restants */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px]">
                        <span className="text-emerald-700 font-semibold">{p.placedPv} placés</span>
                        <span className="text-neutral-300 mx-1">/</span>
                        <span className={`font-semibold ${p.remainingPv > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                          {p.remainingPv} restants
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleOpenPayout(p)}
                          disabled={p.remainingEarnings <= 0}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            p.remainingEarnings > 0
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                          title="Régler commission"
                        >
                          Régler
                        </button>

                        <button
                          onClick={() => handleOpenPlacement(p)}
                          disabled={p.remainingPv <= 0}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            p.remainingPv > 0
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          }`}
                          title="Placer des PV dans l'arbre"
                        >
                          Placer PV
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nouveau Partenaire */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Enregistrer un Nouveau Partenaire MLM
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ibrahim"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nom de Famille *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Traoré"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Code / ID Unique Partenaire *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Grade Initial
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Bronze">Bronze</option>
                    <option value="Argent">Argent</option>
                    <option value="Or">Or</option>
                    <option value="Diamant">Diamant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Parrain Up */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Parrain (Partenaire Up-Line)
                </label>
                <select
                  value={sponsorId}
                  onChange={e => setSponsorId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Aucun (Tête de Réseau) --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.code}) - {p.level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-sm"
                >
                  Créer Partenaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Régler la Commission */}
      {selectedPartnerForPayout && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Règlement de Commission Partenaire
                </h3>
              </div>
              <button onClick={() => setSelectedPartnerForPayout(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-6 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">
                  {selectedPartnerForPayout.firstName} {selectedPartnerForPayout.lastName}
                </div>
                <div className="text-neutral-500 font-mono mt-0.5">
                  ID: {selectedPartnerForPayout.code} · Tel: {selectedPartnerForPayout.phone}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center font-bold">
                  <span>Solde en attente :</span>
                  <span className="text-orange-600 font-mono">
                    {formatMoney(selectedPartnerForPayout.remainingEarnings)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Montant à Verser (FCFA) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={selectedPartnerForPayout.remainingEarnings}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Moyen de Paiement *
                </label>
                <select
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN Mobile Money</option>
                  <option value="Espèces à la Caisse">Espèces (Guichet Caisse)</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Référence de transaction / Reçu
                </label>
                <input
                  type="text"
                  placeholder="ex: OM-TX-849202"
                  value={payoutNotes}
                  onChange={e => setPayoutNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPayout(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Confirmer le Règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Placer des PV */}
      {selectedPartnerForPlacement && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Placement des Points de Valeur (PV)
                </h3>
              </div>
              <button onClick={() => setSelectedPartnerForPlacement(null)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPlacement} className="p-6 space-y-4">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div className="font-bold text-neutral-900">
                  {selectedPartnerForPlacement.firstName} {selectedPartnerForPlacement.lastName}
                </div>
                <div className="text-neutral-500 font-mono mt-0.5">
                  ID: {selectedPartnerForPlacement.code}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-200 flex justify-between items-center font-bold">
                  <span>PV Restants à placer :</span>
                  <span className="text-amber-600 font-mono">
                    {formatPV(selectedPartnerForPlacement.remainingPv)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nombre de PV à placer dans l'arbre binaire *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedPartnerForPlacement.remainingPv}
                  value={pvToPlace}
                  onChange={e => setPvToPlace(Number(e.target.value))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              <p className="text-[11px] text-neutral-500">
                Ces PV seront injectés dans les branches de l'arbre pour débloquer les cycles et paliers MLM de l'équipe.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPlacement(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm"
                >
                  Valider le Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
