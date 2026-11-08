import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, UserRole, RoleDefinition, Partner, Patient, Visit, ProductService, 
  Sale, SupplierOrder, MedicalRecord, VisitStatus, OrderStatus,
  SaleItem, PaymentMethod, PrescriptionItem, MedicalExamDefinition, ExamParameter,
  CompanySettings, AppointmentRequest, PartnerApplication, AssociatedCenter,
  Expense, PartnerPayoutRecord, AuditLog
} from '../types';

import { 
  INITIAL_USERS, INITIAL_ROLES, INITIAL_PARTNERS, INITIAL_PATIENTS, 
  INITIAL_PRODUCTS, INITIAL_VISITS, INITIAL_SALES, 
  INITIAL_ORDERS, INITIAL_RECORDS, INITIAL_EXAM_DEFINITIONS,
  INITIAL_COMPANY_SETTINGS, INITIAL_APPOINTMENTS, INITIAL_PARTNER_APPLICATIONS,
  INITIAL_ASSOCIATED_CENTERS, INITIAL_EXPENSES, INITIAL_PARTNER_PAYOUTS, INITIAL_AUDIT_LOGS
} from '../data/mockData';
import { syncOfficialProductsList, OFFICIAL_PRODUCTS_APP_SERVICES } from '../data/officialProducts';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  loginAs: (identifier: string, passwordAttempt?: string) => { success: boolean; message?: string };

  // Roles & Permissions Management (Admin)
  roles: RoleDefinition[];
  addRole: (roleData: Omit<RoleDefinition, 'id' | 'createdAt'>) => RoleDefinition;
  updateRole: (roleId: string, updatedData: Partial<RoleDefinition>) => void;
  deleteRole: (roleId: string) => { success: boolean; message?: string };
  resetDefaultCredentials: () => void;
  isTabAllowedForRole: (roleId: string, tabId: string) => boolean;

  // Company Showcase Settings (Admin)
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  // Associated Centers (Centres Whieda Associés - Admin réglable)
  associatedCenters: AssociatedCenter[];
  addAssociatedCenter: (center: Omit<AssociatedCenter, 'id'>) => void;
  updateAssociatedCenter: (id: string, center: Partial<AssociatedCenter>) => void;
  deleteAssociatedCenter: (id: string) => void;

  // Showcase Appointments
  appointmentRequests: AppointmentRequest[];
  addAppointmentRequest: (request: Omit<AppointmentRequest, 'id' | 'status' | 'createdAt'>) => AppointmentRequest;
  updateAppointmentStatus: (id: string, status: 'nouveau' | 'confirme' | 'annule') => void;

  // Showcase Partner Applications
  partnerApplications: PartnerApplication[];
  addPartnerApplication: (application: Omit<PartnerApplication, 'id' | 'status' | 'createdAt'>) => PartnerApplication;
  updatePartnerApplicationStatus: (id: string, status: 'en_attente' | 'valide' | 'rejete') => void;

  // Users (Admin)
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>, initialPassword?: string) => void;
  updateUser: (userId: string, updatedData: Partial<User>) => void;
  deleteUser: (userId: string) => { success: boolean; message?: string };
  toggleUserStatus: (userId: string) => void;

  // Partners (MLM)
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'totalDirectEarnings' | 'paidEarnings' | 'remainingEarnings' | 'totalPv' | 'placedPv' | 'remainingPv' | 'registeredAt'> & { initialPv?: number; cardStatus?: any; qualificationStatus?: any }) => void;
  updatePartner: (partnerId: string, data: Partial<Partner>) => void;
  deletePartner: (partnerId: string) => void;
  settlePartnerPayout: (partnerId: string, amount: number, paymentMethod?: string, notes?: string) => void;
  placePartnerPv: (partnerId: string, pvAmount: number) => void;

  // Patients / Clients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;

  // Visits
  visits: Visit[];
  addVisit: (visit: Omit<Visit, 'id' | 'date' | 'time' | 'registeredBy' | 'status'> & { status?: VisitStatus }) => void;
  updateVisitStatus: (visitId: string, status: VisitStatus) => void;

  // Products & Services & Stock
  products: ProductService[];
  addProduct: (product: Omit<ProductService, 'id' | 'sku' | 'directMargin'> & { customSku?: string }) => void;
  updateProduct: (id: string, product: Partial<ProductService>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (productId: string, quantityToAdd: number, notes?: string) => void;
  batchRestockProducts: (items: { productId: string; quantity: number }[], notes?: string) => void;
  seedOfficialCatalog: (mode?: 'merge' | 'reset_all') => void;

  // POS Sales
  sales: Sale[];
  completeSale: (saleData: {
    patientId?: string;
    patientName: string;
    sponsorPartnerId?: string;
    sponsorPartnerName?: string;
    sponsorPartnerCode?: string;
    items: SaleItem[];
    discountAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
  }) => Sale;
  updateSale: (saleId: string, updatedData: Partial<Sale>) => void;
  deleteSale: (saleId: string) => void;

  // Supplier Orders
  supplierOrders: SupplierOrder[];
  createSupplierOrder: (order: Omit<SupplierOrder, 'id' | 'orderNumber' | 'date'>) => void;
  updateSupplierOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Medical Records & Custom Health Exam Definitions (Admin)
  medicalRecords: MedicalRecord[];
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'doctorId' | 'doctorName' | 'date' | 'time'>) => MedicalRecord;
  examDefinitions: MedicalExamDefinition[];
  addExamDefinition: (exam: Omit<MedicalExamDefinition, 'id' | 'createdAt'>) => void;
  updateExamDefinition: (id: string, exam: Partial<MedicalExamDefinition>) => void;
  deleteExamDefinition: (id: string) => void;

  // Expenses (Gestion des Dépenses - Admin & Comptable)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }) => Expense;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Partner Payouts Tracking (Finances des Partenaires & Suivi des Paiements)
  partnerPayouts: PartnerPayoutRecord[];
  addPartnerPayout: (payout: Omit<PartnerPayoutRecord, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }) => PartnerPayoutRecord;

  // Audit Logs (Journal d'Audit - Admin Uniquement)
  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use defaults
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('whieda_roles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_ROLES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('whieda_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        // Ensure the updated staff members (Cyrille Oyono, etc.) are present
        const hasCyrille = parsed.some(u => u.fullName.toLowerCase().includes('cyrille') && u.role === 'admin');
        if (hasCyrille && parsed.length >= 4) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('whieda_current_user');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        if (parsed && (parsed.fullName.toLowerCase().includes('cyrille') || parsed.role === 'admin')) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USERS[0]; // Cyrille OYONO (Admin) by default
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('whieda_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('whieda_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('whieda_visits');
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const [products, setProducts] = useState<ProductService[]>(() => {
    const saved = localStorage.getItem('whieda_products');
    if (saved) {
      try {
        const parsed: ProductService[] = JSON.parse(saved);
        // Garantit que les 28 produits de la grille tarifaire officielle sont synchronisés
        return syncOfficialProductsList(parsed);
      } catch (e) {
        console.error('Erreur chargement produits:', e);
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('whieda_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>(() => {
    const saved = localStorage.getItem('whieda_supplier_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('whieda_medical_records');
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [examDefinitions, setExamDefinitions] = useState<MedicalExamDefinition[]>(() => {
    const saved = localStorage.getItem('whieda_exam_definitions');
    return saved ? JSON.parse(saved) : INITIAL_EXAM_DEFINITIONS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('whieda_company_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Whieda Smart' || !parsed.name) {
          parsed.name = 'Whieda Meyomessala';
          parsed.logoText = 'Whieda Meyomessala';
        }
        return parsed;
      } catch (e) {
        return INITIAL_COMPANY_SETTINGS;
      }
    }
    return INITIAL_COMPANY_SETTINGS;
  });

  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>(() => {
    const saved = localStorage.getItem('whieda_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [partnerApplications, setPartnerApplications] = useState<PartnerApplication[]>(() => {
    const saved = localStorage.getItem('whieda_partner_applications');
    return saved ? JSON.parse(saved) : INITIAL_PARTNER_APPLICATIONS;
  });

  const [associatedCenters, setAssociatedCenters] = useState<AssociatedCenter[]>(() => {
    const saved = localStorage.getItem('whieda_associated_centers');
    return saved ? JSON.parse(saved) : INITIAL_ASSOCIATED_CENTERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('whieda_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [partnerPayouts, setPartnerPayouts] = useState<PartnerPayoutRecord[]>(() => {
    const saved = localStorage.getItem('whieda_partner_payouts');
    return saved ? JSON.parse(saved) : INITIAL_PARTNER_PAYOUTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('whieda_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('whieda_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('whieda_current_user', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('whieda_partners', JSON.stringify(partners));
  }, [partners]);
  useEffect(() => {
    localStorage.setItem('whieda_patients', JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem('whieda_visits', JSON.stringify(visits));
  }, [visits]);
  useEffect(() => {
    localStorage.setItem('whieda_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('whieda_sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem('whieda_supplier_orders', JSON.stringify(supplierOrders));
  }, [supplierOrders]);
  useEffect(() => {
    localStorage.setItem('whieda_medical_records', JSON.stringify(medicalRecords));
  }, [medicalRecords]);
  useEffect(() => {
    localStorage.setItem('whieda_exam_definitions', JSON.stringify(examDefinitions));
  }, [examDefinitions]);
  useEffect(() => {
    localStorage.setItem('whieda_company_settings', JSON.stringify(companySettings));
  }, [companySettings]);
  useEffect(() => {
    localStorage.setItem('whieda_appointments', JSON.stringify(appointmentRequests));
  }, [appointmentRequests]);
  useEffect(() => {
    localStorage.setItem('whieda_partner_applications', JSON.stringify(partnerApplications));
  }, [partnerApplications]);
  useEffect(() => {
    localStorage.setItem('whieda_associated_centers', JSON.stringify(associatedCenters));
  }, [associatedCenters]);
  useEffect(() => {
    localStorage.setItem('whieda_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('whieda_partner_payouts', JSON.stringify(partnerPayouts));
  }, [partnerPayouts]);
  useEffect(() => {
    localStorage.setItem('whieda_roles', JSON.stringify(roles));
  }, [roles]);
  useEffect(() => {
    localStorage.setItem('whieda_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Phone normalization helper (e.g. "+237 699 00 11 22" -> "699001122")
  const normalizePhone = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('237') && digits.length > 9) {
      digits = digits.slice(3);
    }
    return digits;
  };

  // Auth helpers
  const switchRole = (role: UserRole) => {
    const user = users.find(u => u.role === role && u.active) || users[0];
    setCurrentUser(user);
  };

  const loginAs = (identifier: string, passwordAttempt?: string): { success: boolean; message?: string } => {
    const rawTrimmed = identifier.trim();
    if (!rawTrimmed) {
      return { success: false, message: 'Veuillez saisir votre identifiant (numéro de téléphone ou email).' };
    }

    const cleanInputPhone = normalizePhone(rawTrimmed);

    const found = users.find(u => {
      const matchEmail = u.email.toLowerCase() === rawTrimmed.toLowerCase();
      const matchPhone = cleanInputPhone && normalizePhone(u.phone) === cleanInputPhone;
      return matchEmail || matchPhone;
    });

    if (!found) {
      return { 
        success: false, 
        message: 'Identifiant introuvable. Veuillez renseigner votre numéro de téléphone (ex: 699001122) ou votre adresse email.' 
      };
    }

    if (!found.active) {
      return { 
        success: false, 
        message: 'Ce compte employé a été désactivé par l’administrateur.' 
      };
    }

    // Verify alphanumeric password if provided
    if (passwordAttempt !== undefined && passwordAttempt.trim() !== '') {
      const targetPass = (found.password || 'Whieda@2026!').trim();
      if (passwordAttempt.trim().toUpperCase() !== targetPass.toUpperCase()) {
        return { 
          success: false, 
          message: 'Mot de passe alphanumérique incorrect.' 
        };
      }
    }

    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    const visitorUser = users.find(u => u.role === 'visitor') || users[0];
    setCurrentUser(visitorUser);
  };

  // Reset to default credentials as requested by user
  const resetDefaultCredentials = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.setItem('whieda_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('whieda_current_user', JSON.stringify(INITIAL_USERS[0]));
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Réinitialisation des accès par défaut',
      module: 'Sécurité',
      details: 'Restauration des accès officiels avec identifiant téléphone et mot de passe alphanumérique pour Cyrille OYONO (Admin), Cyrille OYONO OYONO (Comptable), Sarah OYONO (Médecin) et Idris Awoulbe (Réceptionniste).',
      severity: 'warning',
    });
  };

  // Dynamic Roles Management (Admin)
  const addRole = (roleData: Omit<RoleDefinition, 'id' | 'createdAt'>): RoleDefinition => {
    const cleanId = roleData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_') || `role_${Date.now()}`;
    
    // Ensure unique ID
    let finalId = cleanId;
    let counter = 1;
    while (roles.some(r => r.id === finalId)) {
      finalId = `${cleanId}_${counter++}`;
    }

    const newRole: RoleDefinition = {
      ...roleData,
      id: finalId,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    setRoles(prev => [...prev, newRole]);

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Création de rôle RBAC',
      module: 'Sécurité',
      details: `Création du rôle "${newRole.name}" (ID: ${newRole.id}) avec ${newRole.allowedTabs.length} modules autorisés : [${newRole.allowedTabs.join(', ')}]`,
      severity: 'info',
    });

    return newRole;
  };

  const updateRole = (roleId: string, updatedData: Partial<RoleDefinition>) => {
    const target = roles.find(r => r.id === roleId);
    if (!target) return;

    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, ...updatedData } : r));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Modification de rôle RBAC',
      module: 'Sécurité',
      details: `Mise à jour du rôle "${target.name}" -> Nom: ${updatedData.name || target.name}, Description: ${updatedData.description || target.description}, Modules: [${(updatedData.allowedTabs || target.allowedTabs).join(', ')}]`,
      severity: 'warning',
    });
  };

  const deleteRole = (roleId: string): { success: boolean; message?: string } => {
    const target = roles.find(r => r.id === roleId);
    if (!target) {
      return { success: false, message: 'Rôle introuvable.' };
    }
    if (target.isSystem || target.id === 'admin') {
      return { 
        success: false, 
        message: 'Action refusée : Ce rôle est un rôle système fondamental et ne peut pas être supprimé.' 
      };
    }

    const assignedUsers = users.filter(u => u.role === roleId);
    if (assignedUsers.length > 0) {
      return {
        success: false,
        message: `Action refusée : ${assignedUsers.length} collaborateur(s) (${assignedUsers.map(u => u.fullName).join(', ')}) occupent ce rôle. Veuillez d'abord réassigner leur rôle.`
      };
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Suppression de rôle RBAC',
      module: 'Sécurité',
      details: `Suppression du rôle "${target.name}" (ID: ${target.id})`,
      severity: 'danger',
    });

    return { success: true };
  };

  const isTabAllowedForRole = (roleId: string, tabId: string): boolean => {
    if (roleId === 'admin') return true;
    const roleDef = roles.find(r => r.id === roleId);
    if (roleDef) {
      return roleDef.allowedTabs.includes(tabId);
    }
    return false;
  };

  // Add User (Admin)
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>, initialPassword?: string) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      password: initialPassword || 'Whieda@2026!',
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Création compte employé',
      module: 'Sécurité',
      details: `Création du compte employé pour ${newUser.fullName} (${newUser.email || newUser.phone}) - Rôle: ${newUser.role}, Département: ${newUser.department || 'N/A'}`,
      severity: 'info',
    });
  };

  const updateUser = (userId: string, updatedData: Partial<User>) => {
    const target = users.find(u => u.id === userId);
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, ...updatedData };
      }
      return u;
    }));

    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }

    if (target) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'Modification compte employé',
        module: 'Sécurité',
        details: `Mise à jour du profil de l'employé ${target.fullName} (${target.email}) -> Rôle: ${updatedData.role || target.role}, Département: ${updatedData.department || target.department}`,
        severity: 'warning',
      });
    }
  };

  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    if (userId === currentUser.id) {
      return { 
        success: false, 
        message: 'Action refusée : Vous ne pouvez pas supprimer votre propre compte actuellement actif.' 
      };
    }
    const target = users.find(u => u.id === userId);
    if (!target) {
      return { 
        success: false, 
        message: 'Employé introuvable dans la liste.' 
      };
    }
    const activeAdmins = users.filter(u => u.role === 'admin' && u.active);
    if (target.role === 'admin' && activeAdmins.length <= 1) {
      return { 
        success: false, 
        message: 'Action refusée : Le système doit conserver au moins un administrateur actif pour garantir la gestion.' 
      };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Suppression compte employé',
      module: 'Sécurité',
      details: `Suppression définitive du compte employé : ${target.fullName} (${target.email}) - Ancien rôle: ${target.role}, Département: ${target.department || 'N/A'}`,
      severity: 'danger',
    });

    return { success: true };
  };

  const toggleUserStatus = (userId: string) => {
    const target = users.find(u => u.id === userId);
    const newStatus = target ? !target.active : false;

    // Protection: cannot deactivate oneself
    if (userId === currentUser.id) {
      return;
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));

    if (target) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: newStatus ? 'Activation compte employé' : 'Désactivation compte employé',
        module: 'Sécurité',
        details: `${newStatus ? 'Activation' : 'Désactivation'} du compte de ${target.fullName} (${target.email})`,
        severity: newStatus ? 'info' : 'warning',
      });
    }
  };

  // Partner MLM Functions
  const addPartner = (data: Omit<Partner, 'id' | 'totalDirectEarnings' | 'paidEarnings' | 'remainingEarnings' | 'totalPv' | 'placedPv' | 'remainingPv' | 'registeredAt'> & { initialPv?: number; cardStatus?: any; qualificationStatus?: any }) => {
    const initPv = Number(data.initialPv) || 0;
    const newPartner: Partner = {
      ...data,
      id: `ptn-${Date.now()}`,
      cardStatus: data.cardStatus || 'Start',
      qualificationStatus: data.qualificationStatus || 'Qualifié',
      totalDirectEarnings: 0,
      paidEarnings: 0,
      remainingEarnings: 0,
      totalPv: initPv,
      placedPv: 0,
      remainingPv: initPv,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setPartners(prev => [newPartner, ...prev]);
  };

  const updatePartner = (partnerId: string, data: Partial<Partner>) => {
    setPartners(prev => prev.map(p => {
      if (p.id === partnerId) {
        return { ...p, ...data };
      }
      return p;
    }));
  };

  const deletePartner = (partnerId: string) => {
    const target = partners.find(p => p.id === partnerId);
    if (target) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'Suppression partenaire',
        module: 'Partenaires',
        details: `Suppression du partenaire ${target.firstName} ${target.lastName} (${target.code}) - Total PV: ${target.totalPv}, Gains accumulés: ${target.totalDirectEarnings.toLocaleString()} FCFA`,
        severity: 'danger',
      });
    }
    setPartners(prev => prev.filter(p => p.id !== partnerId));
  };

  const settlePartnerPayout = (partnerId: string, amount: number) => {
    setPartners(prev => prev.map(p => {
      if (p.id === partnerId) {
        const actualAmount = Math.min(amount, p.remainingEarnings);
        return {
          ...p,
          paidEarnings: p.paidEarnings + actualAmount,
          remainingEarnings: Math.max(0, p.remainingEarnings - actualAmount),
        };
      }
      return p;
    }));
  };

  const placePartnerPv = (partnerId: string, pvAmount: number) => {
    setPartners(prev => prev.map(p => {
      if (p.id === partnerId) {
        const actualPv = Math.min(pvAmount, p.remainingPv);
        return {
          ...p,
          placedPv: p.placedPv + actualPv,
          remainingPv: Math.max(0, p.remainingPv - actualPv),
        };
      }
      return p;
    }));
  };

  // Patient / Visitor
  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients(prev => [newPatient, ...prev]);
    return newPatient;
  };

  // Visits
  const addVisit = (data: Omit<Visit, 'id' | 'date' | 'time' | 'registeredBy' | 'status'> & { status?: VisitStatus }) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    const newVisit: Visit = {
      ...data,
      id: `vis-${Date.now()}`,
      date,
      time,
      registeredBy: currentUser.fullName,
      status: data.status || 'en_attente',
    };
    setVisits(prev => [newVisit, ...prev]);
  };

  const updateVisitStatus = (visitId: string, status: VisitStatus) => {
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, status } : v));
  };

  // Products & Services
  const addProduct = (data: Omit<ProductService, 'id' | 'sku' | 'directMargin'> & { customSku?: string; code?: string }) => {
    // Auto-generate SKU based on category
    let prefix = 'WH-GEN';
    if (data.category === 'regulateur') prefix = 'WH-REG';
    if (data.category === 'nettoyage') prefix = 'WH-NET';
    if (data.category === 'entretien') prefix = 'WH-ENT';
    if (data.category === 'alimentation') prefix = 'WH-ALM';
    if (data.category === 'soins') prefix = 'WH-SOI';
    if (data.category === 'appareils') prefix = 'WH-APP';
    if (data.category === 'services') prefix = 'WH-SRV';

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sku = data.customSku ? data.customSku.toUpperCase() : (data.code ? data.code.toUpperCase() : `${prefix}-${randomSuffix}`);
    const directMargin = Math.max(0, data.patientPrice - data.partnerPrice);

    const newProduct: ProductService = {
      ...data,
      id: `prod-${Date.now()}`,
      code: data.code || sku,
      sku,
      publicPrice: data.patientPrice,
      directMargin,
    };
    setProducts(prev => [newProduct, ...prev]);

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Création produit au catalogue',
      module: 'Ventes',
      details: `Ajout du produit "${newProduct.name}" (Code/SKU: ${sku}, Prix Public: ${data.patientPrice} FCFA, PV: ${data.pv})`,
      severity: 'info',
    });
  };

  const seedOfficialCatalog = (mode: 'merge' | 'reset_all' = 'merge') => {
    if (mode === 'reset_all') {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('whieda_products', JSON.stringify(INITIAL_PRODUCTS));
    } else {
      setProducts(prev => {
        const synced = syncOfficialProductsList(prev);
        localStorage.setItem('whieda_products', JSON.stringify(synced));
        return synced;
      });
    }

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Initialisation grille tarifaire officielle',
      module: 'Ventes',
      details: `Synchronisation automatique des 28 produits officiels Whieda Meyomessala (mode: ${mode})`,
      severity: 'info',
    });
  };

  const updateProduct = (id: string, updates: Partial<ProductService>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updates };
        merged.directMargin = Math.max(0, merged.patientPrice - merged.partnerPrice);
        return merged;
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const restockProduct = (productId: string, quantityToAdd: number, notes?: string) => {
    if (quantityToAdd <= 0) return;
    const target = products.find(p => p.id === productId);
    if (!target) return;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newQty = p.stockQuantity + quantityToAdd;
        const newTotal = (p.totalStockReceived ?? p.stockQuantity) + quantityToAdd;
        return {
          ...p,
          stockQuantity: newQty,
          totalStockReceived: newTotal,
        };
      }
      return p;
    }));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Ravitaillement de stock',
      module: 'Ventes',
      details: `Ravitaillement de ${quantityToAdd} unité(s) pour "${target.name}" (${target.sku}). Nouveau stock disponible : ${target.stockQuantity + quantityToAdd}${notes ? ` - Réf/Note : ${notes}` : ''}`,
      severity: 'info',
    });
  };

  const batchRestockProducts = (items: { productId: string; quantity: number }[], notes?: string) => {
    const validItems = items.filter(i => i.quantity > 0);
    if (validItems.length === 0) return;

    setProducts(prev => prev.map(p => {
      const match = validItems.find(i => i.productId === p.id);
      if (match) {
        return {
          ...p,
          stockQuantity: p.stockQuantity + match.quantity,
          totalStockReceived: (p.totalStockReceived ?? p.stockQuantity) + match.quantity,
        };
      }
      return p;
    }));

    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Ravitaillement groupé de stock',
      module: 'Ventes',
      details: `Ravitaillement groupé de ${validItems.length} référence(s) de stock.${notes ? ` Note : ${notes}` : ''}`,
      severity: 'info',
    });
  };

  // POS Checkout & Auto MLM Trigger
  const completeSale = (saleData: {
    patientId?: string;
    patientName: string;
    sponsorPartnerId?: string;
    sponsorPartnerName?: string;
    sponsorPartnerCode?: string;
    items: SaleItem[];
    discountAmount: number;
    paymentMethod: PaymentMethod;
    paymentReference?: string;
  }): Sale => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    const totalAmount = saleData.items.reduce((acc, item) => acc + item.subtotal, 0);
    const netAmount = Math.max(0, totalAmount - saleData.discountAmount);
    const totalPv = saleData.items.reduce((acc, item) => acc + (item.pv * item.quantity), 0);
    const totalPartnerGain = saleData.items.reduce((acc, item) => acc + (item.itemGain * item.quantity), 0);

    const receiptNumber = `REC-${now.getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;

    const newSale: Sale = {
      id: `sal-${Date.now()}`,
      receiptNumber,
      date,
      time,
      cashierId: currentUser.id,
      cashierName: currentUser.fullName,
      patientId: saleData.patientId,
      patientName: saleData.patientName,
      sponsorPartnerId: saleData.sponsorPartnerId,
      sponsorPartnerName: saleData.sponsorPartnerName,
      sponsorPartnerCode: saleData.sponsorPartnerCode,
      items: saleData.items,
      totalAmount,
      discountAmount: saleData.discountAmount,
      netAmount,
      totalPv,
      totalPartnerGain,
      paymentMethod: saleData.paymentMethod,
      paymentReference: saleData.paymentReference,
      status: 'complete',
    };

    // 1. Add to sales history
    setSales(prev => [newSale, ...prev]);

    // 2. Deduct physical stock for physical categories (all except services)
    setProducts(prev => prev.map(prod => {
      const soldItem = saleData.items.find(i => i.productId === prod.id);
      if (soldItem && prod.category !== 'services') {
        return {
          ...prod,
          stockQuantity: Math.max(0, prod.stockQuantity - soldItem.quantity),
        };
      }
      return prod;
    }));

    // 3. Trigger partner MLM earnings & PV accumulation if sponsor partner attached
    if (saleData.sponsorPartnerId) {
      setPartners(prev => prev.map(partner => {
        if (partner.id === saleData.sponsorPartnerId) {
          return {
            ...partner,
            totalDirectEarnings: partner.totalDirectEarnings + totalPartnerGain,
            remainingEarnings: partner.remainingEarnings + totalPartnerGain,
            totalPv: partner.totalPv + totalPv,
            remainingPv: partner.remainingPv + totalPv,
          };
        }
        return partner;
      }));
    }

    return newSale;
  };

  const updateSale = (saleId: string, updatedData: Partial<Sale>) => {
    const existing = sales.find(s => s.id === saleId);
    if (!existing) return;

    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        const discountAmount = updatedData.discountAmount !== undefined ? updatedData.discountAmount : s.discountAmount;
        const totalAmount = updatedData.totalAmount !== undefined ? updatedData.totalAmount : s.totalAmount;
        const netAmount = Math.max(0, totalAmount - discountAmount);

        return {
          ...s,
          ...updatedData,
          discountAmount,
          netAmount,
        };
      }
      return s;
    }));

    // Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Modification de reçu caisse',
      module: 'Ventes',
      details: `Mise à jour du reçu ${existing.receiptNumber} : Client: "${updatedData.patientName || existing.patientName}", Mode: ${updatedData.paymentMethod || existing.paymentMethod}, Net: ${(updatedData.netAmount ?? existing.netAmount).toLocaleString('fr-FR')} FCFA`,
      severity: 'warning',
    });
  };

  const deleteSale = (saleId: string) => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) return;

    // 1. Restock physical products
    if (targetSale.status !== 'annule') {
      setProducts(prev => prev.map(prod => {
        const soldItem = targetSale.items.find(i => i.productId === prod.id);
        if (soldItem && prod.category !== 'services') {
          return {
            ...prod,
            stockQuantity: prod.stockQuantity + soldItem.quantity,
          };
        }
        return prod;
      }));

      // 2. Adjust partner MLM earnings and PV if a sponsor was attached
      if (targetSale.sponsorPartnerId) {
        setPartners(prev => prev.map(partner => {
          if (partner.id === targetSale.sponsorPartnerId) {
            return {
              ...partner,
              totalDirectEarnings: Math.max(0, partner.totalDirectEarnings - targetSale.totalPartnerGain),
              remainingEarnings: Math.max(0, partner.remainingEarnings - targetSale.totalPartnerGain),
              totalPv: Math.max(0, partner.totalPv - targetSale.totalPv),
              remainingPv: Math.max(0, partner.remainingPv - targetSale.totalPv),
            };
          }
          return partner;
        }));
      }
    }

    // 3. Remove from sales
    setSales(prev => prev.filter(s => s.id !== saleId));

    // 4. Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Suppression de reçu caisse',
      module: 'Ventes',
      details: `Suppression du reçu ${targetSale.receiptNumber} (${targetSale.netAmount.toLocaleString('fr-FR')} FCFA) pour ${targetSale.patientName}. Rétablissement des stocks et réajustement PV parrain.`,
      severity: 'danger',
    });
  };

  // Supplier Orders
  const createSupplierOrder = (orderData: Omit<SupplierOrder, 'id' | 'orderNumber' | 'date'>) => {
    const orderNumber = `BC-${new Date().getFullYear()}-${String(supplierOrders.length + 1).padStart(4, '0')}`;
    const newOrder: SupplierOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().split('T')[0],
    };
    setSupplierOrders(prev => [newOrder, ...prev]);
  };

  const updateSupplierOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setSupplierOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // If transitioning to 'recue', automatically restock inventory!
        if (newStatus === 'recue' && order.status !== 'recue') {
          setProducts(currProducts => currProducts.map(prod => {
            const itemInOrder = order.items.find(i => i.productId === prod.id);
            if (itemInOrder) {
              return {
                ...prod,
                stockQuantity: prod.stockQuantity + itemInOrder.quantity,
              };
            }
            return prod;
          }));
          return { ...order, status: newStatus, receivedAt: new Date().toISOString() };
        }
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  // Medical Records
  const addMedicalRecord = (data: Omit<MedicalRecord, 'id' | 'doctorId' | 'doctorName' | 'date' | 'time'>): MedicalRecord => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    const newRecord: MedicalRecord = {
      ...data,
      id: `med-${Date.now()}`,
      doctorId: currentUser.id,
      doctorName: currentUser.fullName,
      date,
      time,
    };
    setMedicalRecords(prev => [newRecord, ...prev]);
    return newRecord;
  };

  // Custom Health Exam Definitions Management (Admin)
  const addExamDefinition = (data: Omit<MedicalExamDefinition, 'id' | 'createdAt'>) => {
    const newExamDef: MedicalExamDefinition = {
      ...data,
      id: `exam-def-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExamDefinitions(prev => [newExamDef, ...prev]);
  };

  const updateExamDefinition = (id: string, updates: Partial<MedicalExamDefinition>) => {
    setExamDefinitions(prev => prev.map(def => def.id === id ? { ...def, ...updates } : def));
  };

  const deleteExamDefinition = (id: string) => {
    setExamDefinitions(prev => prev.filter(def => def.id !== id));
  };

  // Company Showcase Settings
  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...updates }));
  };

  // Appointments (Showcase)
  const addAppointmentRequest = (data: Omit<AppointmentRequest, 'id' | 'status' | 'createdAt'>): AppointmentRequest => {
    const newApt: AppointmentRequest = {
      ...data,
      id: `apt-${Date.now()}`,
      status: 'nouveau',
      createdAt: new Date().toISOString(),
    };
    setAppointmentRequests(prev => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: 'nouveau' | 'confirme' | 'annule') => {
    setAppointmentRequests(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Partner Applications (Showcase)
  const addPartnerApplication = (data: Omit<PartnerApplication, 'id' | 'status' | 'createdAt'>): PartnerApplication => {
    const newApp: PartnerApplication = {
      ...data,
      id: `app-${Date.now()}`,
      status: 'en_attente',
      createdAt: new Date().toISOString(),
    };
    setPartnerApplications(prev => [newApp, ...prev]);
    return newApp;
  };

  const updatePartnerApplicationStatus = (id: string, status: 'en_attente' | 'valide' | 'rejete') => {
    setPartnerApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  // Associated Centers (Centres Whieda Associés)
  const addAssociatedCenter = (data: Omit<AssociatedCenter, 'id'>) => {
    const newCenter: AssociatedCenter = {
      ...data,
      id: `ctr-${Date.now()}`,
    };
    setAssociatedCenters(prev => [...prev, newCenter]);
  };

  const updateAssociatedCenter = (id: string, data: Partial<AssociatedCenter>) => {
    setAssociatedCenters(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteAssociatedCenter = (id: string) => {
    setAssociatedCenters(prev => prev.filter(c => c.id !== id));
  };

  // Audit Logs Functions (Journal d'Audit - Sécurisé)
  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  // Expenses Functions (Gestion des Dépenses)
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }): Expense => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      recordedBy: data.recordedBy || currentUser.fullName,
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Enregistrement de dépense',
      module: 'Dépenses',
      details: `Ajout dépense [${newExpense.category}] : "${newExpense.title}" d'un montant de ${newExpense.amount.toLocaleString('fr-FR')} FCFA`,
      severity: 'info',
    });

    return newExpense;
  };

  const updateExpense = (id: string, updatedData: Partial<Expense>) => {
    const existing = expenses.find(e => e.id === id);
    if (!existing) return;

    setExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, ...updatedData };
      }
      return e;
    }));

    // Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Modification de dépense',
      module: 'Dépenses',
      details: `Modification de la dépense #${id} "${existing.title}". Montant précédent: ${existing.amount.toLocaleString('fr-FR')} FCFA -> Nouveau: ${(updatedData.amount ?? existing.amount).toLocaleString('fr-FR')} FCFA`,
      severity: 'warning',
    });
  };

  const deleteExpense = (id: string) => {
    const existing = expenses.find(e => e.id === id);
    if (!existing) return;

    setExpenses(prev => prev.filter(e => e.id !== id));

    // Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Suppression de dépense',
      module: 'Dépenses',
      details: `Suppression définitive de la dépense [${existing.category}] : "${existing.title}" d'un montant de ${existing.amount.toLocaleString('fr-FR')} FCFA`,
      severity: 'danger',
    });
  };

  // Partner Payouts Tracking (Finances des Partenaires & Suivi des Paiements)
  const addPartnerPayout = (data: Omit<PartnerPayoutRecord, 'id' | 'createdAt' | 'recordedBy'> & { recordedBy?: string }): PartnerPayoutRecord => {
    const newPayout: PartnerPayoutRecord = {
      ...data,
      id: `pay-${Date.now()}`,
      recordedBy: data.recordedBy || currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    setPartnerPayouts(prev => [newPayout, ...prev]);

    // Also update Partner's financials and placed PV in real time
    setPartners(prev => prev.map(p => {
      if (p.id === data.partnerId) {
        const actualAmount = Math.min(data.amountPaid, p.remainingEarnings);
        const actualPv = Math.min(data.pvPlaced, p.remainingPv);
        return {
          ...p,
          paidEarnings: p.paidEarnings + actualAmount,
          remainingEarnings: Math.max(0, p.remainingEarnings - actualAmount),
          placedPv: p.placedPv + actualPv,
          remainingPv: Math.max(0, p.remainingPv - actualPv),
        };
      }
      return p;
    }));

    // Trace in Audit Log
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'Validation de paiement partenaire',
      module: 'Paiements Partenaires',
      details: `Paiement de ${data.amountPaid.toLocaleString('fr-FR')} FCFA et placement de ${data.pvPlaced} PV validés pour le partenaire ${data.partnerName} (${data.partnerCode})`,
      severity: 'info',
    });

    return newPayout;
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      logout,
      loginAs,
      companySettings,
      updateCompanySettings,
      associatedCenters,
      addAssociatedCenter,
      updateAssociatedCenter,
      deleteAssociatedCenter,
      appointmentRequests,
      addAppointmentRequest,
      updateAppointmentStatus,
      partnerApplications,
      addPartnerApplication,
      updatePartnerApplicationStatus,
      users,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      roles,
      addRole,
      updateRole,
      deleteRole,
      resetDefaultCredentials,
      isTabAllowedForRole,
      partners,
      addPartner,
      updatePartner,
      deletePartner,
      settlePartnerPayout,
      placePartnerPv,
      patients,
      addPatient,
      visits,
      addVisit,
      updateVisitStatus,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      restockProduct,
      batchRestockProducts,
      seedOfficialCatalog,
      sales,
      completeSale,
      updateSale,
      deleteSale,
      supplierOrders,
      createSupplierOrder,
      updateSupplierOrderStatus,
      medicalRecords,
      addMedicalRecord,
      examDefinitions,
      addExamDefinition,
      updateExamDefinition,
      deleteExamDefinition,
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      partnerPayouts,
      addPartnerPayout,
      auditLogs,
      addAuditLog,
      clearAuditLogs,
    }}>
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
