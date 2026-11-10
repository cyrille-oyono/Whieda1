                            {srv}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {v.sponsorPartnerName ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-orange-950 flex items-center gap-1">
                                  <LinkIcon className="w-3 h-3 text-orange-600" />
                                  <span>{v.sponsorPartnerName}</span>
                                </span>
                                <span className="text-[10px] font-mono text-orange-700">{v.sponsorPartnerCode}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Visite simple / Direct</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">
                            {v.receptionistName || currentUser.fullName}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {v.status === 'en_attente' && (
                                <button
                                  onClick={() => updateVisitStatus(v.id, 'en_cours')}
                                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md font-semibold text-[11px] transition-colors"
                                >
                                  Prendre en charge
                                </button>
                              )}
                              {v.status === 'en_cours' && (
                                <button
                                  onClick={() => updateVisitStatus(v.id, 'termine')}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md font-semibold text-[11px] transition-colors"
                                >
                                  Terminer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VUE 2 : FICHIER RÉCAPITULATIF PATIENTS / CLIENTS REÇUS                */}
      {/* ===================================================================== */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Controls & PDF Export */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Month Select */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 mb-1">Mois</label>
                  <select
                    value={summaryMonth}
                    onChange={e => setSummaryMonth(e.target.value)}
                    className="px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white font-medium text-neutral-800"
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                {/* Year Select */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 mb-1">Année</label>
                  <select
                    value={summaryYear}
                    onChange={e => setSummaryYear(e.target.value)}
                    className="px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white font-medium text-neutral-800"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y === 'all' ? 'Toutes les années' : y}</option>
                    ))}
                  </select>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 mb-1">Motif / Service</label>
                  <select
                    value={summaryService}
                    onChange={e => setSummaryService(e.target.value)}
                    className="px-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white font-medium text-neutral-800"
                  >
                    <option value="all">Tous les services</option>
                    {REQUESTED_SERVICES.map(srv => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-semibold text-neutral-500 mb-1">Recherche rapide</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Nom, téléphone, adresse, parrain..."
                      value={summarySearch}
                      onChange={e => setSummarySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2 pt-4 lg:pt-0">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Télécharger le Fichier PDF</span>
                </button>
              </div>
            </div>

            {/* Summary Statistics Mini Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-3 border-t border-neutral-100 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-500 block">Total Reçus</span>
                <span className="text-base font-bold text-neutral-900 font-mono">{countTotalSummary}</span>
              </div>
              <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200">
                <span className="text-[10px] text-blue-800 block">Bilans de santé</span>
                <span className="text-base font-bold text-blue-900 font-mono">{countBilans}</span>
              </div>
              <div className="p-2.5 bg-purple-50/70 rounded-lg border border-purple-200">
                <span className="text-[10px] text-purple-800 block">Massages</span>
                <span className="text-base font-bold text-purple-900 font-mono">{countMassages}</span>
              </div>
              <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block">Achats Produits</span>
                <span className="text-base font-bold text-emerald-900 font-mono">{countAchats}</span>
              </div>
              <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200">
                <span className="text-[10px] text-amber-800 block">Formations</span>
                <span className="text-base font-bold text-amber-900 font-mono">{countFormations}</span>
              </div>
              <div className="p-2.5 bg-neutral-100 rounded-lg border border-neutral-300">
                <span className="text-[10px] text-neutral-700 block">Simples Visites</span>
                <span className="text-base font-bold text-neutral-900 font-mono">{countVisites}</span>
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">N°</th>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Nom & Prénom du Patient / Client</th>
                    <th className="py-3 px-4">Adresse / Quartier</th>
                    <th className="py-3 px-4">Téléphone</th>
                    <th className="py-3 px-4">Motif / Prestation</th>
                    <th className="py-3 px-4">Parrain Up (MLM)</th>
                    <th className="py-3 px-4">Réceptionniste</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800 font-medium">
                  {filteredSummaryVisits.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400 italic">
                        Aucun patient ou visiteur enregistré pour les critères sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredSummaryVisits.map((v, index) => {
                      const srv = v.requestedService || v.purpose;
                      return (
                        <tr key={v.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-neutral-400 font-bold">{index + 1}</td>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-neutral-600 text-[11px]">
                            {v.date} <span className="text-neutral-400">({v.time})</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-neutral-900">{v.visitorName}</td>
                          <td className="py-3 px-4 text-neutral-600">{v.visitorAddress || 'N/A'}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600 text-[11px]">{v.visitorPhone || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getServiceBadge(srv)}`}>
                              {srv}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {v.sponsorPartnerName ? (
                              <div className="font-semibold text-orange-950">
                                {v.sponsorPartnerName} <span className="text-[10px] font-mono text-orange-600">({v.sponsorPartnerCode})</span>
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">Direct</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-neutral-600">
                            {v.receptionistName || currentUser.fullName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL : ENREGISTRER UNE NOUVELLE VISITE / PATIENT                     */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-neutral-200 text-xs">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Enregistrer un Nouveau Patient ou Visiteur</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* Quick Select from existing patients */}
              {patients.length > 0 && (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                    Patient déjà enregistré (Auto-remplissage) :
                  </label>
                  <select
                    onChange={e => e.target.value && handleSelectExistingPatient(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-medium text-neutral-800"
                    defaultValue=""
                  >
                    <option value="" disabled>-- Sélectionner un patient existant --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Type de Visiteur</label>
                  <select
                    value={visitorType}
                    onChange={e => setVisitorType(e.target.value as VisitorType)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-bold"
                  >
                    <option value="patient">Patient (Cabinet)</option>
                    <option value="client">Client (Boutique / Pharma)</option>
                    <option value="staff">Personnel / Visite Interne</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Motif / Prestation Sollicitée</label>
                  <select
                    value={requestedService}
                    onChange={e => setRequestedService(e.target.value as RequestedService)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-bold text-orange-600"
                  >
                    {REQUESTED_SERVICES.map(srv => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nom Complet du Visiteur / Patient *</label>
                <input
                  type="text"
                  placeholder="ex: Jean Baptiste Etoa"
                  value={visitorName}
                  onChange={e => setVisitorName(e.target.value)}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Adresse / Quartier</label>
                  <input
                    type="text"
                    placeholder="ex: Quartier Mimboman"
                    value={visitorAddress}
                    onChange={e => setVisitorAddress(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Sponsor Partner Mandatory / Recommended for Network PV */}
              <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-200 space-y-1.5">
                <label className="block font-bold text-orange-950 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-orange-600" />
                  <span>Parrain Up / Partenaire Réseau (Traçabilité PV) *</span>
                </label>
                <p className="text-[10px] text-orange-800">
                  Sélectionnez le partenaire parrain qui a introduit ce patient ou client dans le réseau Whieda.
                </p>
                <select
                  value={sponsorPartnerId}
                  onChange={e => setSponsorPartnerId(e.target.value)}
                  className="w-full p-2 border border-orange-300 rounded-lg bg-white font-medium text-neutral-900 mt-1"
                  required={visitorType === 'patient' || visitorType === 'client'}
                >
                  <option value="">-- Sélectionner le Parrain Partenaire --</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Notes Complémentaires (Optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="Remarques sur l'état de santé, orientation vers le médecin..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 rounded-lg shadow-xs"
                >
                  Enregistrer la Visite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
