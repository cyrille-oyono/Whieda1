import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';
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
  UserCheck
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserStatus, currentUser } = useApp();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    initialPassword: 'Whieda@2026!',
    role: 'receptionist' as UserRole,
    phone: '',
    department: 'Accueil & Registre des Visites',
  });

  // Edit Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    email: string;
    role: UserRole;
    phone: string;
    department: string;
    active: boolean;
  }>({
    fullName: '',
    email: '',
    role: 'receptionist',
    phone: '',
    department: '',
    active: true,
  });

  // Delete Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers for Create
  const handleOpenCreate = () => {
    setCreateForm({
      fullName: '',
      email: '',
      initialPassword: 'Whieda@2026!',
      role: 'receptionist',
      phone: '',
      department: 'Accueil & Registre des Visites',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateRoleChange = (newRole: UserRole) => {
    let defDept = 'Opérations';
    if (newRole === 'admin') defDept = 'Direction Générale';
    if (newRole === 'receptionist') defDept = 'Accueil & Registre des Visites';
    if (newRole === 'doctor') defDept = 'Cabinet Médical & Bilans';
    if (newRole === 'accountant') defDept = 'Caisse & Comptabilité';
    setCreateForm(prev => ({ ...prev, role: newRole, department: defDept }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      showToast('Veuillez renseigner un nom et un email valide.', 'error');
      return;
    }

    // Check email uniqueness
    const exists = users.some(u => u.email.toLowerCase() === createForm.email.trim().toLowerCase());
    if (exists) {
      showToast(`Un compte existe déjà avec l'email ${createForm.email}.`, 'error');
      return;
    }

    addUser({
      fullName: createForm.fullName.trim(),
      email: createForm.email.trim().toLowerCase(),
      role: createForm.role,
      phone: createForm.phone.trim() || undefined,
      department: createForm.department.trim() || undefined,
      active: true,
    }, createForm.initialPassword);

    setIsCreateModalOpen(false);
    showToast(`Compte créé avec succès pour ${createForm.fullName} (${getRoleLabel(createForm.role)}).`);
  };

  // Handlers for Edit
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      active: user.active,
    });
  };

  const handleEditRoleChange = (newRole: UserRole) => {
    let dept = editForm.department;
    if (!dept || dept === 'Direction Générale' || dept === 'Accueil & Registre des Visites' || dept === 'Cabinet Médical & Bilans' || dept === 'Caisse & Comptabilité') {
      if (newRole === 'admin') dept = 'Direction Générale';
      if (newRole === 'receptionist') dept = 'Accueil & Registre des Visites';
      if (newRole === 'doctor') dept = 'Cabinet Médical & Bilans';
      if (newRole === 'accountant') dept = 'Caisse & Comptabilité';
    }
    setEditForm(prev => ({ ...prev, role: newRole, department: dept }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.fullName.trim() || !editForm.email.trim()) {
      showToast('Veuillez remplir le nom et une adresse email valide.', 'error');
      return;
    }

    // Email collision check with other users
    const emailConflict = users.some(u => u.id !== editingUser.id && u.email.toLowerCase() === editForm.email.trim().toLowerCase());
    if (emailConflict) {
      showToast(`L'adresse email ${editForm.email} est déjà utilisée par un autre employé.`, 'error');
      return;
    }

    // Admin safety: if changing role of an admin, ensure at least one active admin remains
    if (editingUser.role === 'admin' && editForm.role !== 'admin') {
      const activeAdmins = users.filter(u => u.role === 'admin' && u.active && u.id !== editingUser.id);
      if (activeAdmins.length === 0) {
        showToast('Impossible de retirer le rôle Admin : au moins un administrateur actif est requis.', 'error');
        return;
      }
    }

    updateUser(editingUser.id, {
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim().toLowerCase(),
      role: editForm.role,
      phone: editForm.phone.trim() || undefined,
      department: editForm.department.trim() || undefined,
      active: editForm.active,
    });

    showToast(`Informations de ${editForm.fullName} mises à jour avec succès !`);
    setEditingUser(null);
  };

  // Handlers for Delete
  const handleOpenDelete = (user: User) => {
    if (user.id === currentUser.id) {
      showToast('Action impossible : Vous ne pouvez pas supprimer votre propre compte actuellement actif.', 'error');
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;

    const result = deleteUser(userToDelete.id);
    if (!result.success) {
      showToast(result.message || 'Impossible de supprimer cet employé.', 'error');
      setUserToDelete(null);
      return;
    }

    showToast(`Employé ${userToDelete.fullName} (${userToDelete.email}) supprimé avec succès.`);
    setUserToDelete(null);
  };

  // Filtered list
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

  // Role counters
  const totalEmployees = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const receptionistCount = users.filter(u => u.role === 'receptionist').length;
  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const accountantCount = users.filter(u => u.role === 'accountant').length;
  const activeCount = users.filter(u => u.active).length;

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
              Gestion du Personnel & Droits d'Accès (RBAC)
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Création, modification des fiches, gestion des privilèges et révocation sécurisée des accès employés par l'administrateur.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all whitespace-nowrap active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Compte Employé</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1">
            <span className="text-[11px] font-medium">Total Effectif</span>
            <Users className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="text-xl font-bold text-neutral-900">{totalEmployees}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{activeCount} actifs</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-red-100 shadow-2xs bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between text-red-600 mb-1">
            <span className="text-[11px] font-semibold">Administrateurs</span>
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-red-700">{adminCount}</div>
          <span className="text-[10px] text-neutral-400">Direction & sécurité</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-orange-100 shadow-2xs bg-gradient-to-br from-white to-orange-50/20">
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-[11px] font-semibold">Réceptionnistes</span>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-orange-700">{receptionistCount}</div>
          <span className="text-[10px] text-neutral-400">Accueil & Visites</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs bg-gradient-to-br from-white to-rose-50/20">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-semibold">Médecins</span>
            <Stethoscope className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-rose-700">{doctorCount}</div>
          <span className="text-[10px] text-neutral-400">Consultations & soins</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-semibold">Comptables</span>
            <Receipt className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-amber-700">{accountantCount}</div>
          <span className="text-[10px] text-neutral-400">Caisse, MLM & Audit</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-semibold">Taux d'Activité</span>
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {totalEmployees > 0 ? Math.round((activeCount / totalEmployees) * 100) : 0}%
          </div>
          <span className="text-[10px] text-neutral-400">{totalEmployees - activeCount} inactifs</span>
        </div>
      </div>

      {/* Security Info Card */}
      <div className="p-4 bg-red-50/50 border border-red-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-red-950 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-red-900">
            Gouvernance & Sécurité Stricte des Droits Employés :
          </span>
          <p className="text-[11px] text-red-850 leading-relaxed">
            Seul l'administrateur est habilité à créer, ajuster les affectations (département, rôle, contact) ou révoquer définitivement les comptes des collaborateurs de <strong>Whieda Meyomessala</strong>. Toute action de modification ou de suppression est consignée en temps réel dans le <strong>Journal d'Audit</strong>.
          </p>
        </div>
      </div>

      {/* Search & Role Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un employé (nom, email, poste, téléphone)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'admin', label: 'Admin' },
            { id: 'receptionist', label: 'Réception' },
            { id: 'doctor', label: 'Médecin' },
            { id: 'accountant', label: 'Comptable' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRoleFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                roleFilter === f.id
                  ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                  : 'bg-neutral-100 hover:bg-neutral-200/70 text-neutral-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employé</th>
                <th className="py-3 px-4">Identifiant / Email</th>
                <th className="py-3 px-4">Rôle Attribué</th>
                <th className="py-3 px-4">Département / Service</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions Administrateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <UserCog className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-xs">Aucun employé ne correspond à vos critères de recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : u.role === 'receptionist'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : u.role === 'doctor'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {u.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{u.fullName}</div>
                          {u.id === currentUser.id ? (
                            <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 inline-block mt-0.5">
                              (Votre session active)
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">
                              ID: {u.id.slice(0, 10)}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 font-mono text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : u.role === 'receptionist'
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : u.role === 'doctor'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role === 'receptionist' && <UserCheck className="w-3 h-3" />}
                        {u.role === 'doctor' && <Stethoscope className="w-3 h-3" />}
                        {u.role === 'accountant' && <Receipt className="w-3 h-3" />}
                        <span>{getRoleLabel(u.role)}</span>
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-neutral-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{u.department || 'Opérations Générales'}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{u.phone || 'Non renseigné'}</span>
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
                        {/* Modifier Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          title="Modifier les informations de l'employé"
                          className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>

                        {/* Toggle Active Button */}
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            title={u.active ? 'Désactiver le compte' : 'Activer le compte'}
                            className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                              u.active
                                ? 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.active ? 'Bloquer' : 'Activer'}
                          </button>
                        )}

                        {/* Supprimer Button */}
                        {u.id !== currentUser.id ? (
                          <button
                            onClick={() => handleOpenDelete(u)}
                            title="Supprimer définitivement cet employé"
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span 
                            title="Vous ne pouvez pas supprimer votre propre compte actif"
                            className="p-1.5 rounded-lg border border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed"
                          >
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

      {/* ========================================================= */}
      {/* MODAL : MODIFIER UN EMPLOYÉ                               */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-blue-50 to-neutral-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Modifier l'Employé : {editingUser.fullName}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Mise à jour des informations professionnelles et des permissions
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
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
                    Email / Identifiant *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Rôle Attribué (RBAC) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Rôle Système (RBAC) *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleEditRoleChange('admin')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      editForm.role === 'admin'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold ring-2 ring-red-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      <span>1. Admin</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Accès total, comptes & finances</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditRoleChange('receptionist')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      editForm.role === 'receptionist'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold ring-2 ring-orange-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                      <span>2. Réceptionniste</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Accueil, visites & clients</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditRoleChange('doctor')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      editForm.role === 'doctor'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                      <span>3. Médecin</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Consultations & ordonnances</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditRoleChange('accountant')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      editForm.role === 'accountant'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>4. Comptable</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Caisse POS & module financier</div>
                  </button>
                </div>
              </div>

              {/* Département */}
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
                      editForm.active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                    }`}
                  >
                    Actif
                  </button>
                  <button
                    type="button"
                    disabled={editingUser.id === currentUser.id}
                    onClick={() => setEditForm(prev => ({ ...prev, active: false }))}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      !editForm.active
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
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
      {/* MODAL : CONFIRMATION SUPPRESSION                          */}
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
                  Cette opération est irréversible. L'accès de l'utilisateur sera immédiatement révoqué et son compte supprimé.
                </p>
              </div>
            </div>

            <div className="my-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
              <div className="font-bold text-neutral-800">{userToDelete.fullName}</div>
              <div className="font-mono text-neutral-500">{userToDelete.email}</div>
              <div className="text-neutral-600">
                Rôle : <span className="font-semibold text-neutral-900">{getRoleLabel(userToDelete.role)}</span>
              </div>
              <div className="text-neutral-600">
                Département : <span className="font-medium text-neutral-800">{userToDelete.department || 'N/A'}</span>
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
      {/* MODAL : CRÉER UN COMPTE EMPLOYÉ                           */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-orange-50 to-neutral-50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-lg">
                  <UserCog className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Créer un Compte Employé (RBAC)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Attribution exclusive d'identifiants et de prérogatives opérationnelles
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom Complet de l'Employé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dr. Samuel Nguemo"
                  value={createForm.fullName}
                  onChange={e => setCreateForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Identifiant / Email Professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nom@whieda.com"
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mot de Passe Initial *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.initialPassword}
                    onChange={e => setCreateForm(prev => ({ ...prev, initialPassword: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Rôle Système (RBAC) *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCreateRoleChange('admin')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      createForm.role === 'admin'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold ring-2 ring-red-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      <span>1. Admin</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Gestion globale & comptes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateRoleChange('receptionist')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      createForm.role === 'receptionist'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold ring-2 ring-orange-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                      <span>2. Réceptionniste</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Accueil & registre visites</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateRoleChange('doctor')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      createForm.role === 'doctor'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                      <span>3. Médecin</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Consultations & bilans</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateRoleChange('accountant')}
                    className={`p-2.5 rounded-xl border font-medium text-left transition-all ${
                      createForm.role === 'accountant'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400/20'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>4. Comptable</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Caisse POS & module financier</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Département / Service
                  </label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={e => setCreateForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={createForm.phone}
                    onChange={e => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
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
    </div>
  );
};
