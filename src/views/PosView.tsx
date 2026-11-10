                </option>
              ))}
            </select>
          </div>

          {!selectedPatientId && (
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                Nom du client (si non listé) :
              </label>
              <input
                type="text"
                placeholder="ex: Jean Dupont"
                value={customPatientName}
                onChange={e => setCustomPatientName(e.target.value)}
                className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-white"
              />
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs italic">
              Le panier est vide. Sélectionnez des produits à gauche.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-neutral-900 text-xs truncate">{item.productName}</h5>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {formatMoney(item.patientPrice)} × {item.quantity} · <strong className="text-amber-700">+{item.pv * item.quantity} PV</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, -1)}
                    className="w-6 h-6 bg-white border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Minus className="w-3 h-3 text-neutral-600" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, 1)}
                    className="w-6 h-6 bg-white border border-neutral-300 rounded flex items-center justify-center hover:bg-neutral-100"
                  >
                    <Plus className="w-3 h-3 text-neutral-600" />
                  </button>

                  <span className="font-mono font-bold text-neutral-900 text-xs w-16 text-right">
                    {formatMoney(item.subtotal)}
                  </span>

                  <button
                    onClick={() => handleRemoveFromCart(item.productId)}
                    className="text-neutral-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Totals Section */}
        {cart.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-neutral-200 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Mode de Paiement</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-medium"
                >
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="especes">Espèces (Caisse)</option>
                  <option value="carte_bancaire">Carte Bancaire</option>
                  <option value="virement">Virement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Réf. Transaction</label>
                <input
                  type="text"
                  placeholder="ex: OM-9876543"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Remise exceptionnelle (FCFA) :</span>
              <input
                type="number"
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-28 p-1.5 text-right border border-neutral-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="p-3 bg-orange-50/80 rounded-xl border border-orange-200 space-y-1 font-mono">
              <div className="flex justify-between text-neutral-600 text-[11px]">
                <span>Total Brut :</span>
                <span>{formatMoney(totalGross)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1 border-t border-orange-200">
                <span>NET À PAYER :</span>
                <span className="text-orange-600 text-base">{formatMoney(netTotal)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-700 pt-1">
                <span>PV Réseau Générés :</span>
                <span className="font-bold">{formatPV(totalPv)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
            >
              <CreditCard className="w-4 h-4" />
              <span>Encaisser et Imprimer le Reçu ({formatMoney(netTotal)})</span>
            </button>
          </div>
        )}
      </div>
      </div>
      )}

      {/* VIEW 2: INVOICES & SALES HISTORY */}
      {activePosTab === 'invoices' && (
        <div className="space-y-4">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block">Chiffre d'Affaires Global</span>
              <span className="text-xl font-bold text-neutral-900 font-mono mt-1 block">{formatMoney(totalInvoiced)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block">Total PV Encaissés</span>
              <span className="text-xl font-bold text-amber-700 font-mono mt-1 block">{formatPV(totalPvInvoiced)}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 block">Commissions Partenaires</span>
              <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">{formatMoney(totalCommissions)}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par N° reçu, client, parrain ou caissier..."
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">N° Reçu</th>
                    <th className="py-3 px-4">Date & Heure</th>
                    <th className="py-3 px-4">Client / Patient</th>
                    <th className="py-3 px-4">Parrain MLM</th>
                    <th className="py-3 px-4 text-right">Montant Net</th>
                    <th className="py-3 px-4 text-right">PV</th>
                    <th className="py-3 px-4">Paiement</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-neutral-400">
                        Aucune facture enregistrée pour le moment.
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-orange-600">
                          {sale.receiptNumber}
                        </td>
                        <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                          {sale.date} à {sale.time}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-900">
                          {sale.patientName}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {sale.sponsorPartnerName ? (
                            <div>
                              <span className="font-semibold">{sale.sponsorPartnerName}</span>
                              <span className="block text-[10px] font-mono text-orange-600">{sale.sponsorPartnerCode}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Vente directe</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900">
                          {formatMoney(sale.netAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                          {formatPV(sale.totalPv)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-800 uppercase">
                            {sale.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sale.status === 'complete' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {sale.status === 'complete' ? 'Validé' : 'Annulé'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setLastSale(sale);
                                setIsReceiptOpen(true);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Afficher / Imprimer Reçu"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(sale)}
                              className="p-1.5 text-neutral-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Télécharger Facture PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {currentUser.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => handleStartEditSale(sale)}
                                  className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setSaleToDelete(sale)}
                                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT / INVOICE MODAL */}
      {isReceiptOpen && lastSale && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden border border-neutral-200">
            <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" />
                <span>Reçu & Facture Officielle ({lastSale.receiptNumber})</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(lastSale)}
                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Télécharger PDF
                </button>
                <button onClick={() => setIsReceiptOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs font-mono text-neutral-800 bg-neutral-50">
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-2xs space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="font-bold text-base text-neutral-900">{companySettings.name}</h2>
                  <p className="text-[11px] text-neutral-500 font-sans">{companySettings.address} · {companySettings.phone}</p>
                  <p className="text-[11px] text-orange-600 font-bold font-sans">Boutique, Pharmacie & Cabinet de Santé Whieda</p>
                </div>

                <div className="border-t border-b border-neutral-200 py-2 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span>N° Reçu :</span><strong>{lastSale.receiptNumber}</strong></div>
                  <div className="flex justify-between"><span>Date :</span><span>{lastSale.date} à {lastSale.time}</span></div>
                  <div className="flex justify-between"><span>Client / Patient :</span><strong>{lastSale.patientName}</strong></div>
                  {lastSale.sponsorPartnerName && (
                    <div className="flex justify-between text-orange-700"><span>Parrain MLM :</span><strong>{lastSale.sponsorPartnerName} ({lastSale.sponsorPartnerCode})</strong></div>
                  )}
                  <div className="flex justify-between"><span>Caissier :</span><span>{lastSale.cashierName}</span></div>
                </div>

                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-1">Article</th>
                      <th className="py-1 text-center">Qté</th>
                      <th className="py-1 text-right">P.U</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {lastSale.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 pr-2 font-sans">{it.productName}</td>
                        <td className="py-1.5 text-center">{it.quantity}</td>
                        <td className="py-1.5 text-right">{formatMoney(it.patientPrice)}</td>
                        <td className="py-1.5 text-right font-bold">{formatMoney(it.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-neutral-200 pt-3 space-y-1 text-right">
                  <div className="flex justify-between"><span>Total Brut :</span><span>{formatMoney(lastSale.totalAmount)}</span></div>
                  {lastSale.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600"><span>Remise :</span><span>-{formatMoney(lastSale.discountAmount)}</span></div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-dashed">
                    <span>TOTAL NET À PAYER :</span>
                    <span className="text-orange-600">{formatMoney(lastSale.netAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-700 pt-1 font-bold">
                    <span>Total PV Attribués :</span>
                    <span>{formatPV(lastSale.totalPv)}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-neutral-400 font-sans pt-4 border-t border-neutral-100">
                  Merci pour votre confiance ! · Whieda Smart © 2026
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-neutral-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleDownloadPdf(lastSale)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Télécharger Facture PDF
              </button>
         
