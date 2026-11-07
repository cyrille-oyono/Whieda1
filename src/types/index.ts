export type UserRole = 
  | 'visitor'       // Visiteur public
  | 'receptionist'  // Réceptionniste
  | 'doctor'        // Médecin
  | 'cashier'       // Caissière
  | 'accountant'    // Comptable
  | 'admin';        // Administrateur (Toutes les pages)

export interface CompanySettings {
  name: string;
  tagline: string;
  vision: string;
  logoText: string;
  logoUrl?: string;
  address: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  workingHours: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl?: string;
  // Réseaux Sociaux
  whatsappPhone?: string;
  whatsappLink?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
}

export interface AssociatedCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string; // Responsable
  city: string;
  workingHours?: string;
  email?: string;
  status?: 'actif' | 'en_ouverture';
}

export interface AppointmentRequest {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  reason: string;
  serviceType: string;
  sponsorCode?: string;
  status: 'nouveau' | 'confirme' | 'annule';
  createdAt: string;
}

export interface PartnerApplication {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  sponsorCode?: string;
  motivation?: string;
  status: 'en_attente' | 'valide' | 'rejete';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  active: boolean;
  createdAt: string;
}


export type PartnerCardStatus = 'Start' | 'Standard' | 'Premium' | 'VIP';
export type PartnerQualification = 'Qualifié' | 'Non qualifié';

export type PartnerGrade = 
  | 'Sans grade'
  | 'Directeur'
  | 'Directeur Régional'
  | 'Directeur National'
  | 'Directeur Continental'
  | 'Ambassadeur'
  | 'Diamant 7'
  | 'Diamant 3'
  | 'Diamant 1'
  | 'Diamant'
  | 'Émeraude'
  | 'Ruby';

export const PARTNER_GRADES: PartnerGrade[] = [
  'Sans grade',
  'Directeur',
  'Directeur Régional',
  'Directeur National',
  'Directeur Continental',
  'Ambassadeur',
  'Diamant 7',
  'Diamant 3',
  'Diamant 1',
  'Diamant',
  'Émeraude',
  'Ruby'
];

export interface Partner {
  id: string;
  code: string; // e.g. WH-PTN-101
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  sponsorId?: string; // Partenaire Up
  sponsorName?: string;
  sponsorCode?: string;
  cardStatus?: PartnerCardStatus; // Statut carte (Start, Standard, Premium, VIP)
  qualificationStatus?: PartnerQualification; // Qualifié / Non qualifié
  binaryPosition?: 'left' | 'right'; // Position dans l'arbre binaire (Branche Gauche ou Droite)
  totalDirectEarnings: number; // Gains directs accumulés (FCFA)
  paidEarnings: number; // Déjà réglé
  remainingEarnings: number; // Reste à payer
  totalPv: number; // Total Points de Valeur
  placedPv: number; // PV placés
  remainingPv: number; // PV restants
  level: PartnerGrade | string; // ex: 'Directeur', 'Ambassadeur', 'Diamant 7', 'Ruby'
  registeredAt: string; // Date d'entrée
}

export type VisitorType = 'patient' | 'client' | 'staff';

export type RequestedService = 
  | 'Achat produit'
  | 'Massage'
  | 'Bilan de santé'
  | 'Formation'
  | 'Simple visite';

export const REQUESTED_SERVICES: RequestedService[] = [
  'Achat produit',
  'Massage',
  'Bilan de santé',
  'Formation',
  'Simple visite'
];

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  type: VisitorType;
  sponsorPartnerId?: string; // Partenaire parrain obligatoire pour patient/client
  sponsorPartnerName?: string;
  sponsorPartnerCode?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export type VisitStatus = 'en_attente' | 'en_consultation' | 'termine' | 'annule';

export interface Visit {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  visitorName: string;
  visitorPhone?: string;
  visitorAddress?: string; // Adresse du patient / visiteur
  visitorType: VisitorType;
  sponsorPartnerId?: string;
  sponsorPartnerName?: string;
  sponsorPartnerCode?: string;
  purpose: string; // Service sollicité (Achat produit, Massage, Bilan de santé, Formation, Simple visite)
  requestedService?: RequestedService | string;
  registeredBy: string; // Nom du réceptionniste
  status: VisitStatus;
  notes?: string;
}

export type ProductCategory = 
  | 'regulateur' 
  | 'nettoyage' 
  | 'entretien' 
  | 'alimentation' 
  | 'soins' 
  | 'services';

export interface ProductService {
  id: string;
  sku: string; // Code Produit unique auto-généré (ex: WH-REG-084)
  name: string;
  category: ProductCategory;
  patientPrice: number; // Prix Patient (Prix de vente standard)
  partnerPrice: number; // Prix Partenaire (Prix d'achat réseau)
  directMargin: number; // Gain direct calculé: patientPrice - partnerPrice
  pv: number; // Points de Valeur
  stockQuantity: number; // Quantité en stock (pour produits physiques, 9999 pour services)
  minStockThreshold: number; // Seuil d'alerte stock bas
  imageUrl?: string;
  description?: string;
  active: boolean;
}

// Paramètre mesuré dans un examen médical
export interface ExamParameter {
  id: string;
  name: string; // Nom du paramètre (ex: "Cholestérol Total", "Bilirubine", "Hémoglobine Glyquée")
  unit: string; // Unité de mesure (ex: "g/L", "mg/dL", "%", "mmol/L")
  normalRange: string; // Valeur normale ou plage de référence (ex: "1.50 - 2.00", "< 1.20", "12 - 16")
  description?: string;
}

// Définition d'un type d'examen paramétrable par l'Admin
export interface MedicalExamDefinition {
  id: string;
  code: string; // ex: "BIO-01", "CARDIO-02"
  title: string; // ex: "Bilan Lipidique & Cardiovasculaire", "Bilan Bio-Électronique Hépatique"
  category: string; // ex: "Biochimie", "Bio-Électronique", "Hématologie", "Métabolique"
  description?: string;
  price?: number;
  parameters: ExamParameter[]; // Paramètres à mesurer avec leurs valeurs normales
  createdAt: string;
}

// Résultat mesuré d'un paramètre lors d'une consultation
export interface ExamParamResult {
  parameterId: string;
  parameterName: string;
  measuredValue: string; // Valeur constatée (ex: "2.35")
  unit: string;
  normalRange: string;
  status: 'normal' | 'eleve' | 'bas' | 'critique'; // Interprétation clinique
  comment?: string;
}

export interface MedicalExamRecordItem {
  examDefinitionId: string;
  examTitle: string;
  notes?: string;
  results: ExamParamResult[];
}


export interface SaleItem {
  productId: string;
  sku: string;
  productName: string;
  category: ProductCategory;
  patientPrice: number;
  partnerPrice: number;
  itemGain: number; // Gain unitaire
  pv: number;
  quantity: number;
  subtotal: number;
}

export type PaymentMethod = 'especes' | 'orange_money' | 'mtn_momo' | 'carte';

export interface Sale {
  id: string;
  receiptNumber: string; // ex: REC-2026-0042
  date: string;
  time: string;
  cashierId: string;
  cashierName: string;
  patientId?: string;
  patientName: string;
  sponsorPartnerId?: string;
  sponsorPartnerName?: string;
  sponsorPartnerCode?: string;
  items: SaleItem[];
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  totalPv: number;
  totalPartnerGain: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  status: 'complete' | 'annule';
}

export type OrderStatus = 'brouillon' | 'envoyee' | 'recue' | 'annulee';

export interface SupplierOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string; // ex: BC-2026-0012
  date: string;
  supplierName: string;
  status: OrderStatus;
  totalCost: number;
  items: SupplierOrderItem[];
  notes?: string;
  receivedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medication: string; // Nom du produit ou médicament Whieda
  dosage: string; // ex: "2 gélules"
  frequency: string; // ex: "Matin et Soir"
  duration: string; // ex: "15 jours"
  instructions: string; // ex: "À prendre avec un grand verre d'eau tiède"
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'M' | 'F';
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  vitals: {
    bloodPressure: string; // ex: "125/80 mmHg"
    heartRate: number; // ex: 74 bpm
    temperature: number; // ex: 37.1 °C
    weight: number; // ex: 68.5 kg
    bloodSugar: number; // ex: 0.95 g/L
  };
  symptoms: string;
  anamnesis?: string;
  diagnosis: string;
  treatmentNotes: string;
  prescriptions: PrescriptionItem[];
  recommendedExams: string[];
  examRecords?: MedicalExamRecordItem[];
  status: 'en_cours' | 'cloture';
}

