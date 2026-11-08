import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User, RoleDefinition } from '../types';
import { getRoleLabel } from '../utils/formatters';
import { 
  UserCog, 
  Plus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle, 
  XCircle, 
  X,
  AlertTriangle,
  Edit3,
  Trash2,
  Search,
  Users,
  Shield,
  Stethoscope,
  Receipt,
  UserCheck,
  Key,
  Copy,
  Check,
  RotateCcw,
  Lock,
  Layers,
  Globe,
  Package,
  ClipboardList,
  ShoppingCart,
  Truck,
  Wallet,
  ShieldAlert,
  Database,
  Boxes
} from 'lucide-react';

const AVAILABLE_MODULES: { id: string; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'showcase', label: "Page d'Accueil Vitrine", icon: <Globe className="w-3.5 h-3.5" />, description: "Présentation des soins, pharmacie et rendez-vous" },
  { id: 'products', label: 'Catalogue & Produits', icon: <Package className="w-3.5 h-3.5" />, description: "Consultation et inventaire des produits" },
  { id: 'stock', label: 'Gestion du Stock & Ventes', icon: <Boxes className="w-3.5 h-3.5" />, description: "Suivi des quantités, alertes de rupture, réapprovisionnement et commandes" },
  { id: 'visits', label: 'Registre des Visites', icon: <ClipboardList className="w-3.5 h-3.5" />, description: "Accueil des patients, orientation et parrainages" },
  { id: 'medical', label: 'Espace Médecin & Bilans', icon: <Stethoscope className="w-3.5 h-3.5" />, description: "Consultations, dossiers médicaux et examens" },
  { id: 'pos', label: 'Caisse & Factures', icon: <ShoppingCart className="w-3.5 h-3.5" />, description: "Encaissements comptoir, reçus et historique ventes" },
  { id: 'suppliers', label: 'Commandes de Stock', icon: <Truck className="w-3.5 h-3.5" />, description: "Gestion des approvisionnements fournisseurs" },
  { id: 'overview', label: 'Finance, Dépenses & Bilan', icon: <Wallet className="w-3.5 h-3.5" />, description: "Trésorerie, enregistrement des dépenses et suivi paiements" },
  { id: 'partners', label: 'Partenaires & MLM (PV)', icon: <Users className="w-3.5 h-3.5" />, description: "Arborescence réseau, calculs des PV et commissions" },
  { id: 'users', label: 'Personnel & Accès (RBAC)', icon: <UserCog className="w-3.5 h-3.5" />, description: "Gestion des comptes employés et rôles d'accès" },
  { id: 'audit', label: "Journal d'Audit (Logs)", icon: <ShieldAlert className="w-3.5 h-3.5" />, description: "Traçabilité des actions sensibles de sécurité" },
  { id: 'database', label: 'Script Supabase & Arch.', icon: <Database className="w-3.5 h-3.5" />, description: "Architecture technique et schémas relationnels" },
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

  // Sub-tabs: 'employees' or 'roles'
  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'roles'>('employees');

  // Search & Filters for employees
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Search for roles
  const [roleSearchTerm, setRoleSearchTerm] = useState('');

  // Create User Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: 'Whieda@2026!',
    role: 'receptionist' as UserRole,
    department: 'Accueil & Registre des Visites',
  });

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    active: boolean;
  }>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'receptionist',
    department: '',
    active: true,
  });

  // Delete User Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Create Role Modal
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [createRoleForm, setCreateRoleForm] = useState<{
    name: string;
    description: string;
    color: string;
    allowedTabs: string[];
  }>({
    name: '',
    description: '',
    color: 'blue',
    allowedTabs: ['showcase', 'products'],
  });

  // Edit Role Modal
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [editRoleForm, setEditRoleForm] = useState<{
    name: string;
    description: string;
    color: string;
    allowedTabs: string[];
  }>({
    name: '',
    description: '',
    color: 'blue',
    allowedTabs: [],
  });

  // Delete Role Modal
  const [roleToDelete, setRoleToDelete] = useState<RoleDefinition | null>(null);

  // Reset Credentials Confirm Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Notification Toast
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

  // Helper to get role display name
  const getRoleDisplayName = (roleId: string) => {
    const found = roles.find(r => r.id === roleId);
    if (found) return found.name;
    return getRoleLabel(roleId as UserRole);
  };

  // ==========================================
  // EMPLOYEE HANDLERS
  // ==========================================
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
      showToast('Veuillez renseigner le nom complet de l’employé.', 'error');
      return;
    }
    if (!createForm.phone.trim() && !createForm.email.trim()) {
      showToast('Veuillez saisir au moins un numéro de téléphone ou un email comme identifiant.', 'error');
      return;
    }

    // Check collisions
    const phoneTrimmed = createForm.phone.trim();
    const emailTrimmed = createForm.email.trim().toLowerCase();
    
    if (emailTrimmed) {
      const emailConflict = users.some(u => u.email.toLowerCase() === emailTrimmed);
      if (emailConflict) {
        showToast(`Un compte utilise déjà l'email ${emailTrimmed}.`, 'error');
        return;
      }
    }

    if (phoneTrimmed) {
      const phoneConflict = users.some(u => u.phone && u.phone.replace(/\D/g, '') === phoneTrimmed.replace(/\D/g, ''));
      if (phoneConflict) {
        showToast(`Un compte utilise déjà ce numéro de téléphone (${phoneTrimmed}).`, 'error');
        return;
      }
    }

    addUser({
      fullName: createForm.fullName.trim(),
      phone: phoneTrimmed || undefined,
      email: emailTrimmed || `${phoneTrimmed}@whieda.com`,
      role: createForm.role,
      department: createForm.department.trim() || undefined,
      active: true,
    }, createForm.password.trim() || 'Whieda@2026!');

    setIsCreateModalOpen(false);
    showToast(`Compte créé pour ${createForm.fullName} avec le rôle ${getRoleDisplayName(createForm.role)}.`);
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

    if (!editForm.fullName.trim()) {
      showToast('Veuillez renseigner le nom de l’employé.', 'error');
      return;
    }

    // Collision check
    const emailConflict = users.some(u => u.id !== editingUser.id && u.email.toLowerCase() === editForm.email.trim().toLowerCase());
    if (emailConflict) {
      showToast(`L'email ${editForm.email} est déjà utilisé par un autre collaborateur.`, 'error');
      return;
    }

    // Admin safety: ensure at least one active admin
    if (editingUser.role === 'admin' && editForm.role !== 'admin') {
      const activeAdmins = users.filter(u => u.role === 'admin' && u.active && u.id !== editingUser.id);
      if (activeAdmins.length === 0) {
        showToast('Impossible de retirer le rôle Admin : au moins un administrateur actif est requis.', 'error');
        return;
      }
    }

    updateUser(editingUser.id, {
      fullName: editForm.fullName.trim(),
      phone: editForm.phone.trim() || undefined,
      email: editForm.email.trim().toLowerCase(),
      password: editForm.password.trim(),
      role: editForm.role,
      department: editForm.department.trim() || undefined,
      active: editForm.active,
    });

    showToast(`Informations et accès de ${editForm.fullName} mis à jour avec succès.`);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const result = deleteUser(userToDelete.id);
    if (!result.success) {
      showToast(result.message || 'Impossible de supprimer cet employé.', 'error');
      setUserToDelete(null);
      return;
    }
    showToast(`Compte employé ${userToDelete.fullName} supprimé avec succès.`);
    setUserToDelete(null);
  };

  const handleResetCredentialsConfirm = () => {
    resetDefaultCredentials();
    setIsResetConfirmOpen(false);
    showToast('Identifiants par défaut restaurés avec succès (Admin, Comptable, Médecin, Réceptionniste).', 'success');
  };

  // ==========================================
  // ROLE HANDLERS
  // ==========================================
  const handleOpenCreateRole = () => {
    setCreateRoleForm({
      name: '',
      description: '',
      color: 'blue',
      allowedTabs: ['showcase', 'products'],
    });
    setIsCreateRoleModalOpen(true);
  };

  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRoleForm.name.trim()) {
      showToast('Veuillez spécifier un nom pour le nouveau rôle.', 'error');
      return;
    }
    if (createRoleForm.allowedTabs.length === 0) {
      showToast('Veuillez sélectionner au moins un module autorisé pour ce rôle.', 'error');
      return;
    }

    const created = addRole({
      name: createRoleForm.name.trim(),
      description: createRoleForm.description.trim() || 'Rôle opérationnel personnalisé',
      color: createRoleForm.color,
      allowedTabs: createRoleForm.allowedTabs,
    });

    setIsCreateRoleModalOpen(false);
    showToast(`Rôle "${created.name}" créé avec succès avec ${created.allowedTabs.length} module(s) assigné(s).`);
  };

  const handleOpenEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setEditRoleForm({
      name: role.name,
      description: role.description,
      color: role.color,
      allowedTabs: [...role.allowedTabs],
    });
  };

  const handleEditRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    if (!editRoleForm.name.trim()) {
      showToast('Le nom du rôle ne peut pas être vide.', 'error');
      return;
    }
    if (editRoleForm.allowedTabs.length === 0) {
      showToast('Veuillez sélectionner au moins un module pour ce rôle.', 'error');
      return;
    }

    updateRole(editingRole.id, {
      name: editRoleForm.name.trim(),
      description: editRoleForm.description.trim(),
      color: editRoleForm.color,
      allowedTabs: editRoleForm.allowedTabs,
    });

    setIsCreateRoleModalOpen(false);
    setEditingRole(null);
    showToast(`Rôle "${editRoleForm.name}" mis à jour avec succès.`);
  };

  const handleConfirmDeleteRole = () => {
    if (!roleToDelete) return;
    const result = deleteRole(roleToDelete.id);
    if (!result.success) {
      showToast(result.message || 'Impossible de supprimer ce rôle.', 'error');
      setRoleToDelete(null);
      return;
    }
    showToast(`Rôle "${roleToDelete.name}" supprimé avec succès.`);
    setRoleToDelete(null);
  };

  const toggleTabInForm = (tabId: string, formType: 'create' | 'edit') => {
    if (formType === 'create') {
      setCreateRoleForm(prev => {
        const exists = prev.allowedTabs.includes(tabId);
        return {
          ...prev,
          allowedTabs: exists ? prev.allowedTabs.filter(t => t !== tabId) : [...prev.allowedTabs, tabId],
        };
      });
    } else {
      setEditRoleForm(prev => {
        const exists = prev.allowedTabs.includes(tabId);
        return {
          ...prev,
          allowedTabs: exists ? prev.allowedTabs.filter(t => t !== tabId) : [...prev.allowedTabs, tabId],
        };
      });
    }
  };

  // Filtered employees
  const filteredUsers = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered roles
  const filteredRoles = roles.filter(r => {
    const q = roleSearchTerm.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/95 text-rose-100 border-rose-800'
            : toastMessage.type === 'info'
            ? 'bg-blue-950/95 text-blue-100 border-blue-800'
            : 'bg-neutral-900/95 text-white border-neutral-700/80'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <p className="text-xs font-medium">{toastMessage.text}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl shadow-xs">
              <UserCog className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestion du Personnel, Accès & Rôles (RBAC)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Création des identifiants (Téléphone & Mots de passe alphanumériques), affectation des employés et gestion dynamique des rôles.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            title="Restaurer les 4 comptes officiels avec téléphones et mots de passe par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Accès par Défaut</span>
          </button>

          {activeSubTab === 'employees' ? (
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Collaborateur</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateRole}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Nouveau Rôle</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'employees'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personnel & Identifiants Connexion ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'roles'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Gestion des Rôles & Droits RBAC ({roles.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EMPLOYEES & CREDENTIALS                            */}
      {/* ========================================================= */}
      {activeSubTab === 'employees' && (
        <div className="space-y-6">
          {/* Quick Default Credentials Banner */}
          <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 border border-orange-200/90 rounded-2xl shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-orange-600 text-white rounded-lg">
                  <Key className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-orange-950">
                  Données de connexion par défaut (Identifiant : Téléphone · Mot de passe : Code Alphanumérique)
                </span>
              </div>
              <span className="text-[11px] text-orange-800 font-medium">
                Cliquez pour copier les codes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {/* Admin */}
              <div className="p-3 bg-white rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-red-900 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      Admin : Cyrille OYONO
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono">Tél : <strong>699001122</strong></div>
                  <div className="text-[11px] text-neutral-600 font-mono mt-0.5">Code : <strong className="text-red-700">ADMIN2026CYR</strong></div>
                </div>
                <button
                  onClick={() => copyToClipboard('699001122 | ADMIN2026CYR', 'admin')}
                  className="mt-2.5 w-full py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'admin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'admin' ? 'Copié !' : 'Copier accès'}</span>
                </button>
              </div>

              {/* Comptable */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-amber-900 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      Comptable : Cyrille O. O.
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono">Tél : <strong>677334455</strong></div>
                  <div className="text-[11px] text-neutral-600 font-mono mt-0.5">Code : <strong className="text-amber-700">COMPTA2026OYO</strong></div>
                </div>
                <button
                  onClick={() => copyToClipboard('677334455 | COMPTA2026OYO', 'compta')}
                  className="mt-2.5 w-full py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'compta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'compta' ? 'Copié !' : 'Copier accès'}</span>
                </button>
              </div>

              {/* Médecin */}
              <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-rose-900 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                      Médecin : Sarah OYONO
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono">Tél : <strong>690123456</strong></div>
                  <div className="text-[11px] text-neutral-600 font-mono mt-0.5">Code : <strong className="text-rose-700">MED2026SARAH</strong></div>
                </div>
                <button
                  onClick={() => copyToClipboard('690123456 | MED2026SARAH', 'med')}
                  className="mt-2.5 w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'med' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'med' ? 'Copié !' : 'Copier accès'}</span>
                </button>
              </div>

              {/* Réceptionniste */}
              <div className="p-3 bg-white rounded-xl border border-orange-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-orange-900 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                      Réception : Idris Awoulbe
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono">Tél : <strong>675678901</strong></div>
                  <div className="text-[11px] text-neutral-600 font-mono mt-0.5">Code : <strong className="text-orange-700">RECEP2026IDRIS</strong></div>
                </div>
                <button
                  onClick={() => copyToClipboard('675678901 | RECEP2026IDRIS', 'recep')}
                  className="mt-2.5 w-full py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'recep' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'recep' ? 'Copié !' : 'Copier accès'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, email ou poste..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium pb-1 md:pb-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  roleFilter === 'all'
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                Tous
              </button>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    roleFilter === r.id
                      ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Employé</th>
                    <th className="py-3 px-4">Identifiant (Tél & Email)</th>
                    <th className="py-3 px-4">Code Alphanumérique</th>
                    <th className="py-3 px-4">Rôle Attribué</th>
                    <th className="py-3 px-4">Département</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-medium text-xs">Aucun collaborateur ne correspond à vos critères.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                        {/* Name & Avatar */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {u.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900">{u.fullName}</div>
                              {u.id === currentUser.id ? (
                                <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 inline-block mt-0.5">
                                  (Votre session)
                                </span>
                              ) : (
                                <span className="text-[10px] text-neutral-400">ID: {u.id.slice(0, 10)}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Phone & Email */}
                        <td className="py-3 px-4 font-mono text-neutral-600">
                          <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{u.phone || 'Non défini'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                            <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                        </td>

                        {/* Password */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200 text-[11px] font-semibold">
                              {u.password || 'Whieda@2026!'}
                            </span>
                            <button
                              onClick={() => copyToClipboard(u.password || 'Whieda@2026!', u.id)}
                              title="Copier le code"
                              className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-700 transition-colors"
                            >
                              {copiedKey === u.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200">
                            {u.role === 'admin' && <Shield className="w-3 h-3 text-red-600" />}
                            {u.role === 'receptionist' && <UserCheck className="w-3 h-3 text-orange-600" />}
                            {u.role === 'doctor' && <Stethoscope className="w-3 h-3 text-rose-600" />}
                            {u.role === 'accountant' && <Receipt className="w-3 h-3 text-amber-600" />}
                            <span>{getRoleDisplayName(u.role)}</span>
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-neutral-700">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{u.department || 'Général'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            u.active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                          }`}>
                            {u.active ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-neutral-400" />}
                            <span>{u.active ? 'Actif' : 'Désactivé'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Modifier les informations"
                              className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Modifier</span>
                            </button>

                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => toggleUserStatus(u.id)}
                                title={u.active ? 'Désactiver' : 'Activer'}
                                className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                                  u.active
                                    ? 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {u.active ? 'Bloquer' : 'Activer'}
                              </button>
                            )}

                            {u.id !== currentUser.id ? (
                              <button
                                onClick={() => setUserToDelete(u)}
                                title="Supprimer cet employé"
                                className="p-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed">
                                <Trash2 className="w-3.5 h-3.5" />
                              </span>
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
      {/* TAB 2: DYNAMIC ROLES & PERMISSIONS                        */}
      {/* ========================================================= */}
      {activeSubTab === 'roles' && (
        <div className="space-y-6">
          {/* Info Card */}
          <div className="p-4 bg-red-50/60 border border-red-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-red-950 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-900">
                Gestion Dynamique des Rôles & Habilitations (RBAC) :
              </span>
              <p className="text-[11px] text-red-850 leading-relaxed">
                L'administrateur peut créer de nouveaux rôles sur mesure, modifier le nom, la description et cocher précisément les modules de l'application autorisés pour chaque rôle. Tout collaborateur auquel ce rôle est assigné bénéficiera automatiquement des permissions configurées.
              </p>
            </div>
          </div>

          {/* Roles Search Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un rôle par nom, description ou identifiant..."
                value={roleSearchTerm}
                onChange={e => setRoleSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              {roleSearchTerm && (
                <button onClick={() => setRoleSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleOpenCreateRole}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Rôle</span>
            </button>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map(role => {
              const assignedCount = users.filter(u => u.role === role.id).length;
              return (
                <div key={role.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow space-y-4">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900">{role.name}</span>
                          {role.isSystem ? (
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-semibold border border-neutral-200">
                              Système
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-200">
                              Personnalisé
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400">ID: {role.id}</span>
                      </div>

                      <span className="px-2 py-1 bg-neutral-50 text-neutral-700 rounded-lg text-xs font-bold border border-neutral-200 shrink-0">
                        {assignedCount} employé{assignedCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>

                    {/* Allowed Tabs Badges */}
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <div className="text-[11px] font-bold text-neutral-700 mb-2 flex items-center justify-between">
                        <span>Modules Autorisés :</span>
                        <span className="text-orange-600 font-semibold">{role.allowedTabs.length} / {AVAILABLE_MODULES.length}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {role.id === 'admin' ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-800 rounded-lg text-[10px] font-bold border border-red-200 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-red-600" />
                            <span>Accès Total Sans Restriction (Tous les modules)</span>
                          </span>
                        ) : (
                          role.allowedTabs.map(tabId => {
                            const mod = AVAILABLE_MODULES.find(m => m.id === tabId);
                            return (
                              <span key={tabId} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-[10px] font-medium border border-neutral-200/80 flex items-center gap-1">
                                {mod?.icon}
                                <span>{mod?.label || tabId}</span>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Role Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditRole(role)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>

                    {!role.isSystem && role.id !== 'admin' ? (
                      <button
                        onClick={() => setRoleToDelete(role)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Supprimer</span>
                      </button>
                    ) : (
                      <span 
                        title="Ce rôle système est protégé contre la suppression"
                        className="px-2 py-1.5 bg-neutral-50 text-neutral-300 rounded-xl text-[11px] font-semibold cursor-not-allowed"
                      >
                        Protégé
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER UN NOUVEAU RÔLE                             */}
      {/* ========================================================= */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-red-50 to-orange-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-600 text-white rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Créer un Nouveau Rôle RBAC
                </h3>
              </div>
              <button onClick={() => setIsCreateRoleModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Intitulé du Rôle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Superviseur Réseau MLM, Pharmacien, Infirmier..."
                  value={createRoleForm.name}
                  onChange={e => setCreateRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description du Rôle & Responsabilités
                </label>
                <textarea
                  rows={2}
                  placeholder="Précisez les missions et le périmètre d'action de ce poste..."
                  value={createRoleForm.description}
                  onChange={e => setCreateRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Module Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800">
                    Modules & Pages Autorisés ({createRoleForm.allowedTabs.length} sélectionnés) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (createRoleForm.allowedTabs.length === AVAILABLE_MODULES.length) {
                        setCreateRoleForm(prev => ({ ...prev, allowedTabs: ['showcase'] }));
                      } else {
                        setCreateRoleForm(prev => ({ ...prev, allowedTabs: AVAILABLE_MODULES.map(m => m.id) }));
                      }
                    }}
                    className="text-[11px] text-orange-600 hover:text-orange-700 font-bold"
                  >
                    {createRoleForm.allowedTabs.length === AVAILABLE_MODULES.length ? 'Décocher tout' : 'Tout cocher'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {AVAILABLE_MODULES.map(mod => {
                    const isChecked = createRoleForm.allowedTabs.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleTabInForm(mod.id, 'create')}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? 'border-orange-500 bg-orange-50/60 text-orange-950 font-semibold shadow-2xs'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            {mod.icon}
                            <span>{mod.label}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all"
                >
                  Enregistrer le Rôle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : MODIFIER UN RÔLE                                  */}
      {/* ========================================================= */}
      {editingRole && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Modifier le Rôle : {editingRole.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500">ID : {editingRole.id}</p>
                </div>
              </div>
              <button onClick={() => setEditingRole(null)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Intitulé du Rôle *
                </label>
                <input
                  type="text"
                  required
                  value={editRoleForm.name}
                  onChange={e => setEditRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editRoleForm.description}
                  onChange={e => setEditRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Module Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-800">
                    Modules Autorisés ({editRoleForm.allowedTabs.length} sélectionnés) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editRoleForm.allowedTabs.length === AVAILABLE_MODULES.length) {
                        setEditRoleForm(prev => ({ ...prev, allowedTabs: ['showcase'] }));
                      } else {
                        setEditRoleForm(prev => ({ ...prev, allowedTabs: AVAILABLE_MODULES.map(m => m.id) }));
                      }
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                  >
                    {editRoleForm.allowedTabs.length === AVAILABLE_MODULES.length ? 'Décocher tout' : 'Tout cocher'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {AVAILABLE_MODULES.map(mod => {
                    const isChecked = editRoleForm.allowedTabs.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => toggleTabInForm(mod.id, 'edit')}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50/60 text-blue-950 font-semibold shadow-2xs'
                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            {mod.icon}
                            <span>{mod.label}</span>
                          </div>
                          <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{mod.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : SUPPRIMER UN RÔLE                                 */}
      {/* ========================================================= */}
      {roleToDelete && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <span className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Supprimer définitivement ce rôle ?
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Le rôle <strong>{roleToDelete.name}</strong> sera retiré du système. Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setRoleToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRole}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la Suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CRÉER UN COLLABORATEUR                            */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg">
                  <UserCog className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">
                  Nouveau Compte Employé (RBAC)
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom Complet du Collaborateur *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Sarah OYONO"
                  value={createForm.fullName}
                  onChange={e => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numéro de Téléphone (Identifiant) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: 699001122"
                    value={createForm.phone}
                    onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mot de Passe Alphanumérique *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Professionnel
                </label>
                <input
                  type="email"
                  placeholder="nom@whieda.com"
                  value={createForm.email}
                  onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              {/* Rôle Attribué */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Rôle Système Attribué *
                </label>
                <select
                  value={createForm.role}
                  onChange={e => setCreateForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-neutral-900"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.allowedTabs.length} modules)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Département / Affectation
                </label>
                <input
                  type="text"
                  value={createForm.department}
                  onChange={e => setCreateForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded-xl shadow-xs transition-all"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : MODIFIER UN COLLABORATEUR                         */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-neutral-50 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Modifier l'Employé : {editingUser.fullName}
                  </h3>
                  <p className="text-[11px] text-neutral-500">Mise à jour des identifiants et des permissions</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom Complet de l'Employé *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Téléphone (Identifiant de Connexion) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mot de Passe Alphanumérique *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.password}
                    onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Professionnel
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {/* Rôle Attribué */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Rôle Attribué (RBAC) *
                </label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-neutral-900"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.allowedTabs.length} modules)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Département / Service
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Statut du compte */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900">État du Compte</span>
                  <p className="text-[11px] text-neutral-500">Un compte désactivé ne peut plus se connecter</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm(prev => ({ ...prev, active: true }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      editForm.active ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    Actif
                  </button>
                  <button
                    type="button"
                    disabled={editingUser.id === currentUser.id}
                    onClick={() => setEditForm(prev => ({ ...prev, active: false }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      !editForm.active ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-200 text-neutral-600'
                    } ${editingUser.id === currentUser.id ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    Désactivé
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
                >
                  Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : SUPPRIMER UN COLLABORATEUR                        */}
      {/* ========================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <span className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Supprimer définitivement cet employé ?
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  L'accès de l'utilisateur sera révoqué immédiatement et son compte supprimé.
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div className="font-bold text-neutral-800">{userToDelete.fullName}</div>
              <div className="font-mono text-neutral-600">Tél : {userToDelete.phone || 'Non renseigné'}</div>
              <div className="font-mono text-neutral-500">Email : {userToDelete.email}</div>
              <div className="text-neutral-600">
                Rôle : <span className="font-semibold text-neutral-900">{getRoleDisplayName(userToDelete.role)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmer la Suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : CONFIRMATION RESTAURATION IDENTIFIANTS PAR DÉFAUT */}
      {/* ========================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <span className="p-2.5 bg-orange-100 text-orange-600 rounded-xl shrink-0">
                <RotateCcw className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Restaurer les identifiants par défaut ?
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Cette action réinitialise les accès officiels des 4 collaborateurs :
                </p>
              </div>
            </div>

            <div className="my-4 p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-xs space-y-1.5">
              <div>• <strong>Cyrille OYONO</strong> (Admin) : 699001122 | ADMIN2026CYR</div>
              <div>• <strong>Cyrille OYONO OYONO</strong> (Comptable) : 677334455 | COMPTA2026OYO</div>
              <div>• <strong>Sarah OYONO</strong> (Médecin) : 690123456 | MED2026SARAH</div>
              <div>• <strong>Idris Awoulbe</strong> (Réceptionniste) : 675678901 | RECEP2026IDRIS</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleResetCredentialsConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Restaurer les 4 Comptes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
