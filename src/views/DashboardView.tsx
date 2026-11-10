        {/* Right Col: Alerts & Top Partners */}
        <div className="space-y-6">
          {/* Low Stock Quick Watch */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Surveillance des Stocks ({lowStockProducts.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('stock')}
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Gérer →
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400 italic">
                  Tous les stocks de la pharmacie et boutique sont au-dessus des seuils d'alerte.
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h4>
                      <span className="text-[10px] text-red-600 font-mono font-medium">
                        Reste : {p.stockQuantity} unités (Seuil : {p.minStockThreshold})
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate('suppliers')}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                    >
                      Commander
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Partners Summary Widget */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Partenaires Réseau Récents
                </h3>
              </div>
              <button
                onClick={() => onNavigate('partners')}
                className="text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Voir tout ({partners.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {partners.slice(0, 4).map(ptn => (
                <div key={ptn.id} className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{ptn.firstName} {ptn.lastName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Code : <span className="text-orange-600 font-bold">{ptn.code}</span> · {ptn.rank}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-700 font-mono block">
                      {ptn.pv} PV
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium font-mono">
                      {formatMoney(ptn.remainingEarnings)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
