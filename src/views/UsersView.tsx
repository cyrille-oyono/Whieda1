              <div className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-neutral-900">
                    <span>👑 Administrateur</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">Admin</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-1 space-y-0.5">
                    <div>Tél : <strong>+237 600000001</strong></div>
                    <div>Pass : <strong className="text-red-600">Whieda@2026!</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('+237 600000001', 'admin-phone')}
                  className="w-full py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'admin-phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'admin-phone' ? 'Copié !' : 'Copier l’identifiant'}</span>
                </button>
              </div>

              {/* Accountant */}
              <div className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-neutral-900">
                    <span>💼 Comptable</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Finance</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-1 space-y-0.5">
                    <div>Tél : <strong>+237 600000003</strong></div>
                    <div>Pass : <strong className="text-blue-600">Whieda@2026!</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('+237 600000003', 'acc-phone')}
                  className="w-full py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'acc-phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'acc-phone' ? 'Copié !' : 'Copier l’identifiant'}</span>
                </button>
              </div>

              {/* Doctor */}
              <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-neutral-900">
                    <span>🩺 Médecin</span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">Santé</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-1 space-y-0.5">
                    <div>Tél : <strong>+237 600000002</strong></div>
                    <div>Pass : <strong className="text-rose-600">Whieda@2026!</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('+237 600000002', 'doc-phone')}
                  className="w-full py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'doc-phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'doc-phone' ? 'Copié !' : 'Copier l’identifiant'}</span>
                </button>
              </div>

              {/* Receptionist */}
              <div className="p-3 bg-white rounded-xl border border-orange-200 shadow-2xs flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between font-bold text-neutral-900">
                    <span>🛎️ Réceptionniste</span>
                    <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">Accueil</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-1 space-y-0.5">
                    <div>Tél : <strong>+237 600000005</strong></div>
                    <div>Pass : <strong className="text-orange-600">Whieda@2026!</strong></div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('+237 600000005', 'rec-phone')}
                  className="w-full py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'rec-phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'rec-phone' ? 'Copié !' : 'Copier l’identifiant'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, email ou département..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-200 rounded-xl bg-white font-medium text-neutral-700 w-full sm:w-auto"
            >
              <option value="all">Tous les rôles ({users.length})</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Employé</th>
                    <th className="py-3 px-4">Rôle / Profil RBAC</th>
                    <th className="py-3 px-4">Téléphone / Identifiant</th>
                    <th className="py-3 px-4">Département</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                        Aucun employé trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-neutral-900 flex items-center gap-2">
                            <span>{u.fullName}</span>
                            {u.id === currentUser.id && (
                              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-[9px] rounded font-bold">Vous</span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                            {getRoleDisplayName(u.role)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                          {u.phone || 'Non renseigné'}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-600">
                          {u.department || 'Général'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              toggleUserStatus(u.id);
                              showToast(`Statut de ${u.fullName} mis à jour.`, 'info');
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              u.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                            title="Cliquer pour basculer le statut Actif / Inactif"
                          >
                            {u.active ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
                              title="Modifier les accès"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                            </button>
                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors"
                                title="Supprimer le collaborateur"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* ========================================================= */}
      {/* TAB 2: ROLES & RBAC PERMISSIONS                           */}
      {/* ========================================================= */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher un rôle par nom ou description..."
                value={roleSearchTerm}
                onChange={e => setRoleSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => (
              <div key={role.id} className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">{role.name}</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{role.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-100 text-orange-800 uppercase">
                      {role.id}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-700 block">
                      Modules Autorisés ({role.allowedTabs.length}) :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {role.allowedTabs.map(tabId => {
                        const mod = AVAILABLE_MODULES.find(m => m.id === tabId);
                        return (
                          <span key={tabId} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[10px] font-medium">
                            {mod ? mod.label : tabId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditRole(role)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-orange-600" />
                    <span>Modifier les Droits</span>
                  </button>
                  {['admin', 'doctor', 'accountant', 'cashier', 'receptionist', 'partner'].includes(role.id) ? (
                    <span className="text-[10px] text-neutral-400 italic px-2">Système</span>
                  ) : (
                    <button
                      onClick={() => setRoleToDelete(role)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer ce rôle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS : CREATE & EDIT EMPLOYEES / ROLES                  */}
      {/* ========================================================= */}

      {/* 1. Create Employee Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200 text-xs">
            <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Créer un Nouveau Collaborateur</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Nom Complet</label>
                <input
                  type="text"
                  placeholder="ex: Dr. Marie Ngono"
                  value={createForm.fullName}
                  onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Téléphone (Identifiant)</label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={createForm.phone}
                    onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="employe@whieda.com"
                    value={createForm.email}
                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Mot de Passe</label>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono font-bold text-orange-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Rôle / Profil RBAC</label>
                  <select
                    value={createForm.role}
                    onChange={e => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white font-bold text-neutral-900"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Département</label>
                <input
                  type="text"
                  value={createForm.department}
                  onChange={e => setCreateForm({ ...createForm, department: e.target.value })}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
 
