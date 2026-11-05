import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { getRoleLabel } from '../utils/formatters';
import { 
  UserCog, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Building, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  X,
  AlertTriangle,
  Key
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const { users, addUser, toggleUserStatus, currentUser } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [role, setRole] = useState<UserRole>('receptionist');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Accueil & Enregistrement');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOpenAdd = () => {
    setFullName('');
    setEmail('');
    setInitialPassword('Whieda@2026!');
    setRole('receptionist');
    setPhone('');
    setDepartment('Accueil & Enregistrement');
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'admin') setDepartment('Direction Générale');
    if (newRole === 'receptionist') setDepartment('Accueil & Registre des Visites');
    if (newRole === 'doctor') setDepartment('Cabinet Médical & Bilans');
    if (newRole === 'accountant') setDepartment('Caisse & Comptabilité');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      fullName,
      email,
      role,
      phone,
      department,
      active: true,
    }, initialPassword);

    setIsModalOpen(false);
    setSuccessMessage(`Compte créé pour ${fullName} avec le rôle ${getRoleLabel(role)}.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Gestion du Personnel & Droits d'Accès (RBAC)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Création exclusive des accès employés par l'administrateur sans inscription publique
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Compte Employé</span>
        </button>
      </div>

      {/* Security Info Card */}
      <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-950">
        <ShieldCheck className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-red-900">
            Politique de Cloisonnement et Sécurité RBAC :
          </span>
          <p className="text-[11px] text-red-800 leading-relaxed">
            Conformément aux directives de sécurité, aucun utilisateur ne peut s'inscrire librement. C'est l'administrateur qui provisionne chaque compte avec un identifiant, un mot de passe temporaire et des privilèges stricts (Admin, Réceptionniste, Médecin, Comptable).
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Employé</th>
                <th className="py-3 px-4">Identifiant / Email</th>
                <th className="py-3 px-4">Rôle Attribué</th>
                <th className="py-3 px-4">Département</th>
                <th className="py-3 px-4">Téléphone</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900">{u.fullName}</div>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] text-orange-600 font-bold">(Votre compte actuel)</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-neutral-600">
                    {u.email}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      u.role === 'admin'
                        ? 'bg-red-50 text-red-700'
                        : u.role === 'receptionist'
                        ? 'bg-orange-50 text-orange-700'
                        : u.role === 'doctor'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-neutral-600">
                    {u.department || 'Opérations'}
                  </td>

                  <td className="py-3 px-4 font-mono text-neutral-500">
                    {u.phone || 'N/A'}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                      u.active ? 'text-emerald-700' : 'text-neutral-400'
                    }`}>
                      {u.active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{u.active ? 'Actif' : 'Désactivé'}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          u.active
                            ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {u.active ? 'Désactiver' : 'Activer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Créer un Compte Employé */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-2">
                <UserCog className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Créer un Compte Employé (RBAC)
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nom Complet de l'Employé *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Dr. Samuel Nguemo"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mot de Passe Initial *
                  </label>
                  <input
                    type="text"
                    required
                    value={initialPassword}
                    onChange={e => setInitialPassword(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
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
                    onClick={() => handleRoleChange('admin')}
                    className={`p-2.5 rounded-lg border font-medium text-left transition-all ${
                      role === 'admin'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="font-bold">1. Admin</div>
                    <div className="text-[10px] text-neutral-500">Gestion globale & comptes</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('receptionist')}
                    className={`p-2.5 rounded-lg border font-medium text-left transition-all ${
                      role === 'receptionist'
                        ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="font-bold">2. Réceptionniste</div>
                    <div className="text-[10px] text-neutral-500">Accueil & parrainage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('doctor')}
                    className={`p-2.5 rounded-lg border font-medium text-left transition-all ${
                      role === 'doctor'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="font-bold">3. Médecin</div>
                    <div className="text-[10px] text-neutral-500">Consultations & PDF</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('accountant')}
                    className={`p-2.5 rounded-lg border font-medium text-left transition-all ${
                      role === 'accountant'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="font-bold">4. Comptable</div>
                    <div className="text-[10px] text-neutral-500">Caisse POS & MLM</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Département
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
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
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

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
