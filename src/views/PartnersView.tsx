                  <th className="py-3 px-3 text-center">4. Carte</th>
                  <th className="py-3 px-3 text-center">5. Qualif</th>
                  <th className="py-3 px-3 text-right">6. Total PV</th>
                  <th className="py-3 px-3 text-right">7. PV Placer</th>
                  <th className="py-3 px-3 text-right">8. Gain Total</th>
                  <th className="py-3 px-3 text-right">9. Payé / Reste</th>
                  <th className="py-3 px-3 text-center">10. Actions & PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800 font-medium">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-neutral-400 italic">
                      Aucun partenaire trouvé dans le réseau.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((p) => {
                    const cardBadge = 
                      p.cardStatus === 'VIP' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                      p.cardStatus === 'Premium' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      p.cardStatus === 'Standard' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-neutral-100 text-neutral-700 border-neutral-300';

                    const qualifBadge = 
                      p.qualificationStatus === 'Qualifié' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700';

                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* 1. Date Entrée */}
                        <td className="py-3.5 px-3 text-neutral-500 font-mono text-[11px]">
                          {p.joinDate || '01/01/2026'}
                        </td>

                        {/* 2. Nom et ID */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-neutral-900">{p.firstName} {p.lastName}</div>
                          <div className="text-[10px] text-orange-600 font-mono font-bold">{p.code}</div>
                        </td>

                        {/* 3. Parrain Up */}
                        <td className="py-3.5 px-3">
                          {p.sponsorName ? (
                            <div>
                              <span className="text-neutral-900 block">{p.sponsorName}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{p.sponsorCode}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Racine (Admin)</span>
                          )}
                        </td>

                        {/* 4. Carte */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cardBadge}`}>
                            {p.cardStatus || 'Start'}
                          </span>
                        </td>

                        {/* 5. Qualif */}
                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${qualifBadge}`}>
                            {p.qualificationStatus || 'Qualifié'}
                          </span>
                        </td>

                        {/* 6. Total PV */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-amber-700">
                          {formatPV(p.totalPv)}
                        </td>

                        {/* 7. PV Placer */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="font-mono text-emerald-700 font-bold">{formatPV(p.placedPv)}</div>
                          <div className="text-[10px] text-orange-600 font-mono">Restant: {p.remainingPv}</div>
                        </td>

                        {/* 8. Gain Total */}
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900">
                          {formatMoney(p.totalDirectEarnings)}
                        </td>

                        {/* 9. Payé / Reste */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="font-mono text-emerald-600 font-bold">{formatMoney(p.paidEarnings)}</div>
                          <div className="font-mono text-orange-600 font-semibold text-[11px]">Reste: {formatMoney(p.remainingEarnings)}</div>
                        </td>

                        {/* 10. Actions & PDF */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Bouton Payer */}
                            {p.remainingEarnings > 0 && (
                              <button
                                onClick={() => handleOpenPayout(p)}
                                className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                                title="Régler les commissions"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Bouton Placer PV */}
                            {p.remainingPv > 0 && (
                              <button
                                onClick={() => handleOpenPlacement(p)}
                                className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                                title="Placer des PV"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Fiche PDF Individuelle */}
                            <button
                              onClick={() => handleDownloadPartnerSheetPDF(p)}
                              className="p-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
                              title="Télécharger la Fiche Individuelle PDF"
                            >
                              <FileDown className="w-3.5 h-3.5 text-orange-600" />
                            </button>

                            {/* Éditer */}
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => setPartnerToDelete(p)}
                              className="p-1.5 bg-neutral-100 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* ===================================================================== */}
      {/* VUE 2: ARBORESCENCE DU RÉSEAU (ARBRE MLM BINAIRE & LISTE)             */}
      {/* ===================================================================== */}
      {activeTab === 'tree' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-6">
          {/* Sub-mode selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Arbre Généalogique & Placement Binaire Whieda</h3>
              <p className="text-xs text-neutral-500">Visualisez la hiérarchie des parrainages et inspectez les filleuls directs de chaque membre</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setTreeSubMode('photo-model')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    treeSubMode === 'photo-model' ? 'bg-white text-orange-600 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Schéma Graphique Réseau
                </button>
                <button
                  onClick={() => setTreeSubMode('hierarchy-list')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    treeSubMode === 'hierarchy-list' ? 'bg-white text-orange-600 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Liste Hiérarchique Déployable
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                <button
                  onClick={() => setTreeZoom(prev => Math.max(0.6, prev - 0.1))}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg"
                  title="Zoom Arrière"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold px-2">{Math.round(treeZoom * 100)}%</span>
                <button
                  onClick={() => setTreeZoom(prev => Math.min(1.4, prev + 0.1))}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg"
                  title="Zoom Avant"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTreeZoom(1)}
                  className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg"
                  title="Réinitialiser Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mode 1: Schéma Graphique Réseau style Arbre Binaire */}
          {treeSubMode === 'photo-model' && (
            <div className="overflow-x-auto py-4">
              <div style={{ transform: `scale(${treeZoom})`, transformOrigin: 'top left', transition: 'transform 0.2s ease' }} className="min-w-[800px] space-y-8">
                {rootPartners.map(root => {
                  const directChildren = getDirectDownlines(root.id);
                  return (
                    <div key={root.id} className="bg-neutral-50/80 p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
                      {/* Root Card */}
                      <div className="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-orange-500 shadow-sm max-w-md mx-auto">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-red-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {root.firstName[0]}{root.lastName[0]}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900">{root.firstName} {root.lastName}</div>
                            <div className="text-[11px] text-orange-600 font-mono font-bold">{root.code}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full">
                            {root.cardStatus || 'Start'}
                          </span>
                          <div className="text-xs font-mono font-bold text-amber-700 mt-1">{formatPV(root.totalPv)}</div>
                        </div>
                      </div>

                      {/* Connecting line to children */}
                      {directChildren.length > 0 && (
                        <div className="relative flex justify-center">
                          <div className="w-0.5 h-6 bg-orange-300"></div>
                        </div>
                      )}

                      {/* Children Grid */}
                      {directChildren.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                          {directChildren.map(child => {
                            const grandChildren = getDirectDownlines(child.id);
                            return (
                              <div key={child.id} className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                                      {child.firstName[0]}{child.lastName[0]}
                                    </div>
                                    <div>
                                      <div className="font-bold text-neutral-900 text-xs">{child.firstName} {child.lastName}</div>
                                      <div className="text-[10px] text-orange-600 font-mono">{child.code}</div>
                                    </div>
                                  </div>
                                  <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 text-[9px] font-bold rounded">
                                    {child.cardStatus || 'Start'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] pt-2 border-t border-neutral-100 text-neutral-500 font-mono">
                                  <span>PV: <strong className="text-amber-700">{child.totalPv}</strong></span>
                                  <span>Filleuls: <strong className="text-neutral-800">{grandChildren.length}</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Liste Hiérarchique Déployable */}
          {treeSubMode === 'hierarchy-list' && (
            <div className="space-y-3">
              {rootPartners.map(root => {
                const children = getDirectDownlines(root.id);
                return (
                  <div key={root.id} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-4 bg-neutral-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Crown className="w-4 h-4 text-orange-600" />
                        <div>
                          <span className="font-bold text-neutral-900">{root.firstName} {root.lastName}</span>
                          <span className="ml-2 text-xs text-orange-600 font-mono font-bold">{root.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-mono font-bold">{formatPV(root.totalPv)}</span>
                        <span className="text-neutral-500">Filleuls directs : {children.length}</span>
                      </div>
                    </div>

                    {children.length > 0 && (
                      <div className="divide-y divide-neutral-100 pl-6 bg-neutral-50/50">
                        {children.map(child => {
                          const subChildren = getDirectDownlines(child.id);
                          return (
                            <div key={child.id} className="p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                <div>
                                  <span className="font-semibold text-neutral-800 text-xs">{child.firstName} {child.lastName}</span>
                                  <span className="ml-2 text-[10px] text-neutral-500 font-mono">{child.code}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-mono text-amber-700 font-bold">{formatPV(child.totalPv)}</span>
                                <span className="text-neutral-400">({subChildren.length} sous-filleuls)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS DIVERS (AJOUT, ÉDITION, PAIEMENT, PLACEMENT, IMPRESSION)         */}
      {/* ===================================================================== */}

      {/* 1. Modal: Nouveau Partenaire */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Enregistrer un Nouveau Partenaire</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="ex: Jean"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="ex: Dupont"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Code Partenaire</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold text-orange-600 bg-neutral-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+237 6..."
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Parrain (Sponsor Direct)</label>
                <select
                  value={sponsorId}
                  onChange={e => setSponsorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                >
                  <option value="">Aucun (Racine / Admin)</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Type de Carte</label>
                  <select
                    value={cardStatus}
                    onChange={e => setCardStatus(e.target.value as PartnerCardStatus)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Start">Start</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Qualification</label>
                  <select
                    value={qualificationStatus}
                    onChange={e => setQualificationStatus(e.target.value as PartnerQualification)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Qualifié">Qualifié</option>
                    <option value="Non qualifié">Non qualifié</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">PV Initial</label>
                  <input
                    type="number"
                    value={initialPv}
                    onChange={e => setInitialPv(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold text-amber-700"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-lg shadow-xs"
                >
                  Enregistrer le partenaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Règlement de Commissions (Paiement) */}
      {selectedPartnerForPayout && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>Règlement de Commissions</span>
              </h3>
              <button onClick={() => setSelectedPartnerForPayout(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p>Bénéficiaire : <strong className="font-bold">{selectedPartnerForPayout.firstName} {selectedPartnerForPayout.lastName}</strong> ({selectedPartnerForPayout.code})</p>
                <p>Reste à payer : <strong className="font-mono font-bold text-emerald-700">{formatMoney(selectedPartnerForPayout.remainingEarnings)}</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Montant à Verser (XAF)</label>
                <input
                  type="number"
                  max={selectedPartnerForPayout.remainingEarnings}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Mode de Paiement</label>
                <select
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white font-medium"
                >
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Espèces / Caisse">Espèces / Caisse</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Notes / Référence de Transaction</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={e => setPayoutNotes(e.target.value)}
                  placeholder="ex: Ref OM 98765432"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPayout(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Valider le Versement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Placement de PV */}
      {selectedPartnerForPlacement && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Placement de Points de Valeur (PV)</span>
              </h3>
              <button onClick={() => setSelectedPartnerForPlacement(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPlacement} className="p-6 space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p>Partenaire : <strong className="font-bold">{selectedPartnerForPlacement.firstName} {selectedPartnerForPlacement.lastName}</strong></p>
                <p>PV non placés disponibles : <strong className="font-mono font-bold text-amber-700">{selectedPartnerForPlacement.remainingPv} PV</strong></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Nombre de PV à Placer</label>
                <input
                  type="number"
                  max={selectedPartnerForPlacement.remainingPv}
                  value={pvToPlace}
                  onChange={e => setPvToPlace(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold text-amber-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPartnerForPlacement(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Confirmer le Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Impression Rapport Global Admin & Financier */}
      {isGlobalReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>État Global Administrateur & Financier</span>
              </h3>
              <button onClick={() => setIsGlobalReportModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-600">
              <p>
                Ce document officiel consigne l'intégralité des données du réseau <strong className="text-neutral-900">Whieda Smart</strong> : effectifs totaux, états de qualification, cumuls des PV, masse globale des gains générés et commissions en attente de versement.
              </p>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 font-mono text-neutral-800">
                <div className="flex justify-between"><span>Total Partenaires :</span><strong className="text-neutral-900">{totalPartners}</strong></div>
                <div className="flex justify-between"><span>Gains Totaux Réseau :</span><strong className="text-emerald-700">{formatMoney(totalGainsGenerated)}</strong></div>
                <div className="flex justify-between"><span>Restant à Payer :</span><strong className="text-orange-600">{formatMoney(totalRemaining)}</strong></div>
                <div className="flex justify-between"><span>Total PV Réseau :</span><strong className="text-amber-700">{formatPV(totalPvNetwork)}</strong></div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsGlobalReportModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleDownloadGlobalReportPDF();
                    setIsGlobalReportModalOpen(false);
                  }}
                  className="px-4 py-2 font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 rounded-lg shadow-xs flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Télécharger le Rapport PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Impression Arbre du Réseau */}
      {isTreePrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <GitFork className="w-4 h-4 text-orange-400" />
                <span>Arborescence Complète du Réseau</span>
              </h3>
              <button onClick={() => setIsTreePrintModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-600">
              <p>
                Générez le document PDF officiel de l'arborescence complète du réseau pour visualiser les parrainages et la hiérarchie de vos membres.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsTreePrintModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleDownloadNetworkTreePDF();
                    setIsTreePrintModalOpen(false);
                  }}
                  className="px-4 py-2 font-bold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-xs flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4 text-orange-400" />
                  <span>Télécharger l'Arbre en PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Confirmation Suppression Partenaire */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirmer la suppression</span>
              </h3>
              <button onClick={() => setPartnerToDelete(null)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-700">
              <p>
                Voulez-vous vraiment supprimer le partenaire <strong className="text-neutral-900">{partnerToDelete.firstName} {partnerToDelete.lastName}</strong> ({partnerToDelete.code}) ? Cette action est irréversible.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPartnerToDelete(null)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Édition Partenaire */}
      {partnerToEdit && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Pencil className="w-4 h-4 text-orange-400" />
                <span>Modifier le Partenaire</span>
              </h3>
              <button onClick={() => setPartnerToEdit(null)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Carte</label>
                  <select
                    value={editCardStatus}
                    onChange={e => setEditCardStatus(e.target.value as PartnerCardStatus)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Start">Start</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Qualification</label>
                  <select
                    value={editQualificationStatus}
                    onChange={e => setEditQualificationStatus(e.target.value as PartnerQualification)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Qualifié">Qualifié</option>
                    <option value="Non qualifié">Non qualifié</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Total PV</label>
                  <input
                    type="number"
                    value={editTotalPv}
                    onChange={e => setEditTotalPv(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPartnerToEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-xs"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
