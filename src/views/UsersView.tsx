import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User, RoleDefinition } from '../types';
import { getRoleLabel } from '../utils/formatters';
import { 
  UserCog, 
  Plus, 
  X, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  Search, 
  Users, 
  Stethoscope, 
  ShoppingCart, 
  Truck, 
  Wallet, 
  ShieldAlert, 
  Database, 
  Boxes, 
  Key, 
  Copy, 
  Check, 
  RotateCcw, 
  Layers, 
  Globe, 
  Package, 
  ClipboardList, 
  CheckCircle 
} from 'lucide-react';

const AVAILABLE_MODULES = [
  { id: 'showcase', label: "Page d'Accueil Vitrine", icon: <Globe className="w-3.5 h-3.5" />, description: "Présentation des soins et pharmacie" },
  { id: 'products', label: 'Catalogue & Produits', icon: <Package className="w-3.5 h-3.5" />, description: "Consultation et inventaire des produits" },
  { id: 'stock', label: 'Gestion du Stock & Ventes', icon: <Boxes className="w-3.5 h-3.5" />, description: "Suivi des quantités et alertes de rupture" },
  { id: 'visits', label: 'Registre des Visites', icon: <ClipboardList className="w-3.5 h-3.5" />, description: "Accueil des patients et parrainages" },
  { id: 'medical', label: 'Espace Médecin & Bilans', icon: <Stethoscope className="w-3.5 h-3.5" />, description: "Consultations et dossiers médicaux" },
  { id: 'pos', label: 'Caisse & Factures', icon: <ShoppingCart className="w-3.5 h-3.5" />, description: "Encaissements comptoir et reçus" },
  { id: 'suppliers', label: 'Commandes de Stock', icon: <Truck className="w-3.5 h-3.5" />, description: "Gestion des approvisionnements" },
  { id: 'overview', label: 'Finance, Dépenses & Bilan', icon: <Wallet className="w-3.5 h-3.5" />, description: "Trésorerie et suivi paiements" },
  { id: 'partners', label: 'Partenaires & MLM (PV)', icon: <Users className="w-3.5 h-3.5" />, description: "Arborescence réseau et calculs PV" },
  { id: 'users', label: 'Personnel & Accès (RBAC)', icon: <UserCog className="w-3.5 h-3.5" />, description: "Gestion des comptes employés" },
  { id: 'audit', label: "Journal d'Audit (Logs)", icon: <ShieldAlert className="w-3.5 h-3.5" />, description: "Traçabilité des actions sensibles" },
  { id: 'database', label: 'Script Supabase & Arch.', icon: <Database className="w-3.5 h-3.5" />, description: "Architecture technique" },
];

export const UsersView: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus, 
    currentUser, 
    roles, 
    addRole, 
    updateRole, 
    deleteRole, 
    resetDefaultCredentials 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'roles'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: 'Whieda@2026!',
    role: 'receptionist' as UserRole,
    department: 'Accueil & Registre',
  });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'receptionist' as UserRole,
    department: '',
    active: true,
  });

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [createRoleForm, setCreateRoleForm] = useState({
    name: '',
    description: '',
    color: 'blue',
    allowedTabs: ['showcase', 'products'],
  });

  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editRoleForm, setEditRoleForm] = useState({
    name: '',
    description: '',
    color: 'blue',
    allowedTabs: [] as string[],
  });

  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRoleDisplayName = (roleId: string) => {
    const found = roles.find(r => r.id === roleId);
    return found ? found.name : getRoleLabel(roleId as UserRole);
  };

  const handleOpenCreate = () => {
    setCreateForm({
      fullName: '',
      phone: '',
      email: '',
      password: `WHD${Math.floor(1000 + Math.random() * 9000)}!`,
      role: roles[0]?.id || 'receptionist',
      department: 'Opérations Générales',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim()) {
      showToast('Veuillez renseigner le nom complet.', 'error');
      return;
    }

    addUser({
      fullName: createForm.fullName.trim(),
      phone: createForm.phone.trim() || undefined,
      email: createForm.email.trim() || `${createForm.phone.trim()}@whieda.com`,
      role: createForm.role,
      department: createForm.department.trim() || undefined,
      active: true,
    }, createForm.password.trim() || 'Whieda@2026!');

    setIsCreateModalOpen(false);
    showToast(`Compte créé pour ${createForm.fullName}.`);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      phone: user.phone || '',
      email: user.email,
      password: user.password || 'Whieda@2026!',
      role: user.role,
      department: user.department || '',
      active: user.active,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim() || undefined,
      email: editForm.email.trim().toLowerCase(),
      password: editForm.password.trim(),
      role: editForm.role,
      department: editForm.department.trim() || undefined,
      active: editForm.active,
    });

    showToast(`Informations de ${editForm.fullName} mises à jour.`);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id);
    showToast(`Compte employé ${userToDelete.fullName} supprimé.`);
    setUserToDelete(null);
  };

  const handleResetCredentialsConfirm = () => {
    resetDefaultCredentials();
    setIsResetConfirmOpen(false);
    showToast('Identifiants par défaut restaurés avec succès.', 'success');
  };

  const toggleTabInForm = (tabId: string, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateRoleForm(prev => {
        const exists = prev.allowedTabs.includes(tabId);
        return { ...prev, allowedTabs: exists ? prev.allowedTabs.filter(t => t !== tabId) : [...prev.allowedTabs, tabId] };
      });
    } else {
      setEditRoleForm(prev => {
        const exists = prev.allowedTabs.includes(tabId);
        return { ...prev, allowedTabs: exists ? prev.allowedTabs.filter(t => t !== tabId) : [...prev.allowedTabs, tabId] };
      });
    }
  };

  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone && u.phone.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredRoles = roles.filter(r => {
    const q = roleSearchTerm.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 ${toastMessage.type === 'error' ? 'bg-rose-950 text-rose-100' : 'bg-neutral-900 text-white'}`}>
          <p className="text-xs font-medium">{toastMessage.text}</p>
          <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Gestion du Personnel, Accès & Rôles (RBAC)</h1>
          <p className="text-xs text-neutral-500 mt-1">Création des identifiants et affectation des rôles</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3.5 py-2 bg-white border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Accès par Défaut</span>
          </button>

          {activeSubTab === 'employees' ? (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Collaborateur</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setCreateRoleForm({ name: '', description: '', color: 'blue', allowedTabs: ['showcase', 'products'] });
                setIsCreateRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Rôle</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${activeSubTab === 'employees' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          <Users className="w-4 h-4" />
          <span>Personnel ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${activeSubTab === 'roles' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Rôles & Droits ({roles.length})</span>
        </button>
      </div>

      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
              <Key className="w-4 h-4 text-orange-600" />
              <span>Accès rapides par défaut (Tél : +237 600000001 / Pass : Whieda@2026!)</span>
            </div>
            <button
              onClick={() => copyToClipboard('+237 600000001', 'admin')}
              className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 flex items-center gap-1"
            >
              {copiedKey === 'admin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'admin' ? 'Copié !' : 'Copier Admin Tél'}</span>
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employé</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Téléphone</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{u.fullName} <span className="block text-[10px] text-neutral-400 font-mono">{u.email}</span></td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100">{getRoleDisplayName(u.role)}</span></td>
                    <td className="py-3.5 px-4 font-mono font-bold">{u.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => toggleUserStatus(u.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {u.active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={() => handleOpenEdit(u)} className="p-1.5 bg-neutral-100 text-neutral-700 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                      {u.id !== currentUser.id && (
                        <button onClick={() => setUserToDelete(u)} className="p-1.5 ml-2 bg-neutral-100 text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => (
              <div key={role.id} className="bg-white rounded-2xl border p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold">{role.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{role.description}</p>
                  <div className="mt-2 text-[10px] text-neutral-600">Modules : {role.allowedTabs.length} autorisés</div>
                </div>
                <div className="pt-3 border-t flex justify-end">
                  <button onClick={() => { setEditingRole(role); setEditRoleForm({ name: role.name, description: role.description, color: role.color, allowedTabs: [...role.allowedTabs] }); }} className="px-3 py-1 bg-neutral-100 rounded text-xs font-semibold">Modifier</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm">Nouveau Collaborateur</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <input type="text" placeholder="Nom complet" value={createForm.fullName} onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })} required className="w-full p-2 border rounded" />
              <input type="text" placeholder="Téléphone (ex: 699001122)" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} className="w-full p-2 border rounded font-mono" />
              <input type="text" placeholder="Mot de passe" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required className="w-full p-2 border rounded font-mono" />
              <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value as UserRole })} className="w-full p-2 border rounded bg-white font-bold">
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded font-bold">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-neutral-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm">Modifier le Collaborateur</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input type="text" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} required className="w-full p-2 border rounded" />
              <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full p-2 border rounded font-mono" />
              <input type="text" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} required className="w-full p-2 border rounded font-mono" />
              <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value as UserRole })} className="w-full p-2 border rounded bg-white font-bold">
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-3 py-1.5 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-1.5 bg-neutral-900 text-white rounded font-bold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(isCreateRoleModalOpen || editingRole) && (
        <div className="fixed inset-0 z-50 bg-neutral-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-sm">{editingRole ? 'Modifier le Rôle' : 'Créer un Rôle'}</h3>
            <form onSubmit={e => { e.preventDefault(); if (editingRole) { updateRole(editingRole.id, editRoleForm); setEditingRole(null); } else { addRole(createRoleForm); setIsCreateRoleModalOpen(false); } showToast('Rôle enregistré.'); }} className="space-y-3">
              <input type="text" placeholder="Nom du rôle" value={editingRole ? editRoleForm.name : createRoleForm.name} onChange={e => editingRole ? setEditRoleForm({ ...editRoleForm, name: e.target.value }) : setCreateRoleForm({ ...createRoleForm, name: e.target.value })} required className="w-full p-2 border rounded" />
              <input type="text" placeholder="Description" value={editingRole ? editRoleForm.description : createRoleForm.description} onChange={e => editingRole ? setEditRoleForm({ ...editRoleForm, description: e.target.value }) : setCreateRoleForm({ ...createRoleForm, description: e.target.value })} className="w-full p-2 border rounded" />
              
              <div className="space-y-1">
                <label className="font-semibold">Modules autorisés :</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2 rounded">
                  {AVAILABLE_MODULES.map(mod => {
                    const isChecked = editingRole ? editRoleForm.allowedTabs.includes(mod.id) : createRoleForm.allowedTabs.includes(mod.id);
                    return (
                      <div key={mod.id} onClick={() => toggleTabInForm(mod.id, editingRole ? 'edit' : 'create')} className={`p-2 rounded border cursor-pointer ${isChecked ? 'bg-orange-50 border-orange-300 font-bold' : 'bg-white'}`}>
                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="mr-1.5" />
                        <span>{mod.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setIsCreateRoleModalOpen(false); setEditingRole(null); }} className="px-3 py-1.5 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded font-bold">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-neutral-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-red-600">Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer le compte de <strong>{userToDelete.fullName}</strong> ?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setUserToDelete(null)} className="px-3 py-1.5 border rounded">Annuler</button>
              <button onClick={handleConfirmDelete} className="px-3 py-1.5 bg-red-600 text-white rounded font-bold">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/65 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-amber-600">Restaurer les Accès</h3>
            <p>Voulez-vous restaurer les identifiants par défaut des 4 comptes officiels ?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsResetConfirmOpen(false)} className="px-3 py-1.5 border rounded">Annuler</button>
              <button onClick={handleResetCredentialsConfirm} className="px-3 py-1.5 bg-amber-600 text-white rounded font-bold">Restaurer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
