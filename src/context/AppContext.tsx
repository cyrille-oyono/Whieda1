import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, UserRole, Partner, Patient, Visit, ProductService, 
  Sale, SupplierOrder, MedicalRecord, VisitStatus, OrderStatus,
  SaleItem, PaymentMethod, PrescriptionItem, MedicalExamDefinition, ExamParameter,
  CompanySettings, AppointmentRequest, PartnerApplication
} from '../types';

import { 
  INITIAL_USERS, INITIAL_PARTNERS, INITIAL_PATIENTS, 
  INITIAL_PRODUCTS, INITIAL_VISITS, INITIAL_SALES, 
  INITIAL_ORDERS, INITIAL_RECORDS, INITIAL_EXAM_DEFINITIONS,
  INITIAL_COMPANY_SETTINGS, INITIAL_APPOINTMENTS, INITIAL_PARTNER_APPLICATIONS
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  loginAs: (email: string) => boolean;

  // Company Showcase Settings (Admin)
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

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
  toggleUserStatus: (userId: string) => void;

  // Partners (MLM)
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'totalDirectEarnings' | 'paidEarnings' | 'remainingEarnings' | 'totalPv' | 'placedPv' | 'remainingPv' | 'registeredAt'>) => void;
  settlePartnerPayout: (partnerId: string, amount: number, paymentMethod: string, notes?: string) => void;
  placePartnerPv: (partnerId: string, pvAmount: number) => void;

  // Patients / Clients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;

  // Visits
  visits: Visit[];
  addVisit: (visit: Omit<Visit, 'id' | 'date' | 'time' | 'registeredBy' | 'status'> & { status?: VisitStatus }) => void;
  updateVisitStatus: (visitId: string, status: VisitStatus) => void;

  // Products & Services
  products: ProductService[];
  addProduct: (product: Omit<ProductService, 'id' | 'sku' | 'directMargin'> & { customSku?: string }) => void;
  updateProduct: (id: string, product: Partial<ProductService>) => void;
  deleteProduct: (id: string) => void;

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
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('whieda_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('whieda_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Admin by default
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
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
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
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>(() => {
    const saved = localStorage.getItem('whieda_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [partnerApplications, setPartnerApplications] = useState<PartnerApplication[]>(() => {
    const saved = localStorage.getItem('whieda_partner_applications');
    return saved ? JSON.parse(saved) : INITIAL_PARTNER_APPLICATIONS;
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

  // Auth helpers
  const switchRole = (role: UserRole) => {
    const user = users.find(u => u.role === role && u.active) || users[0];
    setCurrentUser(user);
  };

  const loginAs = (email: string): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found && found.active) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    const visitorUser = users.find(u => u.role === 'visitor') || users[0];
    setCurrentUser(visitorUser);
  };

  // Add User (Admin)
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  };

  // Partner MLM Functions
  const addPartner = (data: Omit<Partner, 'id' | 'totalDirectEarnings' | 'paidEarnings' | 'remainingEarnings' | 'totalPv' | 'placedPv' | 'remainingPv' | 'registeredAt'>) => {
    const newPartner: Partner = {
      ...data,
      id: `ptn-${Date.now()}`,
      totalDirectEarnings: 0,
      paidEarnings: 0,
      remainingEarnings: 0,
      totalPv: 0,
      placedPv: 0,
      remainingPv: 0,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setPartners(prev => [newPartner, ...prev]);
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
  const addProduct = (data: Omit<ProductService, 'id' | 'sku' | 'directMargin'> & { customSku?: string }) => {
    // Auto-generate SKU based on category
    let prefix = 'WH-GEN';
    if (data.category === 'regulateur') prefix = 'WH-REG';
    if (data.category === 'nettoyage') prefix = 'WH-NET';
    if (data.category === 'entretien') prefix = 'WH-ENT';
    if (data.category === 'alimentation') prefix = 'WH-ALM';
    if (data.category === 'soins') prefix = 'WH-SOI';
    if (data.category === 'services') prefix = 'WH-SRV';

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sku = data.customSku ? data.customSku.toUpperCase() : `${prefix}-${randomSuffix}`;
    const directMargin = Math.max(0, data.patientPrice - data.partnerPrice);


    const newProduct: ProductService = {
      ...data,
      id: `prod-${Date.now()}`,
      sku,
      directMargin,
    };
    setProducts(prev => [newProduct, ...prev]);
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

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      logout,
      loginAs,
      companySettings,
      updateCompanySettings,
      appointmentRequests,
      addAppointmentRequest,
      updateAppointmentStatus,
      partnerApplications,
      addPartnerApplication,
      updatePartnerApplicationStatus,
      users,
      addUser,
      toggleUserStatus,
      partners,
      addPartner,
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
      sales,
      completeSale,
      supplierOrders,
      createSupplierOrder,
      updateSupplierOrderStatus,
      medicalRecords,
      addMedicalRecord,
      examDefinitions,
      addExamDefinition,
      updateExamDefinition,
      deleteExamDefinition,
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
