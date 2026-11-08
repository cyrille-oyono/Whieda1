import { UserRole, ProductCategory, VisitStatus, OrderStatus } from '../types';

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

export const formatPV = (pv: number): string => {
  return `${pv.toFixed(pv % 1 === 0 ? 0 : 1)} PV`;
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'receptionist':
      return 'Réceptionniste';
    case 'doctor':
      return 'Médecin';
    case 'cashier':
      return 'Caissière';
    case 'accountant':
      return 'Comptable';
    case 'visitor':
      return 'Visiteur Public';
    default:
      return role;
  }
};

export const getCategoryLabel = (category: ProductCategory): string => {
  switch (category) {
    case 'regulateur':
      return 'Régulateur & Équilibre';
    case 'nettoyage':
      return 'Nettoyage & Détox';
    case 'entretien':
      return 'Entretien & Vitalité';
    case 'alimentation':
      return 'Alimentation & Nutrition';
    case 'soins':
      return 'Soins & Bien-être';
    case 'appareils':
      return 'Appareils & Dispositifs';
    case 'services':
      return 'Services & Bilans';
    default:
      return category;
  }
};


export const getVisitStatusLabel = (status: VisitStatus): { label: string; bg: string; text: string } => {
  switch (status) {
    case 'en_attente':
      return { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700' };
    case 'en_consultation':
      return { label: 'En consultation', bg: 'bg-orange-50', text: 'text-orange-700' };
    case 'termine':
      return { label: 'Terminé', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'annule':
      return { label: 'Annulé', bg: 'bg-neutral-100', text: 'text-neutral-600' };
  }
};

export const getOrderStatusLabel = (status: OrderStatus): { label: string; bg: string; text: string } => {
  switch (status) {
    case 'brouillon':
      return { label: 'Brouillon', bg: 'bg-neutral-100', text: 'text-neutral-700' };
    case 'envoyee':
      return { label: 'Envoyée au Fournisseur', bg: 'bg-blue-50', text: 'text-blue-700' };
    case 'recue':
      return { label: 'Reçue & Réapprovisionnée', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'annulee':
      return { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-700' };
  }
};
