export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- WHIEDA SMART - SCRIPT COMPLET BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Architecture: Boutique, Pharmacie, Cabinet Médical & Système MLM Partenaire
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'doctor', 'accountant');
CREATE TYPE visitor_type AS ENUM ('patient', 'client', 'staff');
CREATE TYPE visit_status AS ENUM ('en_attente', 'en_consultation', 'termine', 'annule');
CREATE TYPE product_category AS ENUM ('regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'services');

CREATE TYPE payment_method AS ENUM ('especes', 'orange_money', 'mtn_momo', 'carte');
CREATE TYPE supplier_order_status AS ENUM ('brouillon', 'envoyee', 'recue', 'annulee');
CREATE TYPE medical_record_status AS ENUM ('en_cours', 'cloture');

-- ====================================================================
-- 3. TABLES DU SYSTÈME
-- ====================================================================

-- Table des Profils Utilisateurs (liée à Supabase Auth auth.users)
-- Pas de sign-up public : création exclusive par l'Admin via l'API Supabase Admin
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'receptionist',
    phone TEXT,
    department TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table des Partenaires (MLM & Réseau d'Affiliation)
CREATE TABLE public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- ex: 'WH-PTN-001'
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    sponsor_id UUID REFERENCES public.partners(id) ON DELETE SET NULL, -- Parrain (Partenaire Up)
    total_direct_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Total gains directs accumulés
    paid_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,        -- Gains déjà réglés/soldés
    remaining_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0.00,    -- Reste à payer au partenaire
    total_pv NUMERIC(10, 2) NOT NULL DEFAULT 0.00,              -- Total Points de Valeur accumulés
    placed_pv NUMERIC(10, 2) NOT NULL DEFAULT 0.00,             -- PV déjà placés dans l'arbre binaire
    remaining_pv NUMERIC(10, 2) NOT NULL DEFAULT 0.00,          -- PV en attente de placement
    level TEXT NOT NULL DEFAULT 'Bronze',                       -- Grade MLM (Bronze, Argent, Or, Diamant)
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table des Patients et Clients
-- RÈGLE : Rattachement obligatoire à un partenaire parrain pour rétribution des achats
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    type visitor_type NOT NULL DEFAULT 'patient',
    sponsor_partner_id UUID REFERENCES public.partners(id) ON DELETE RESTRICT, -- Parrain partenaire
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table du Registre Journalier des Entrées / Visites
CREATE TABLE public.daily_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_time TIME NOT NULL DEFAULT CURRENT_TIME,
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    visitor_type visitor_type NOT NULL, -- 'patient', 'client', 'staff'
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    sponsor_partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
    purpose TEXT NOT NULL, -- ex: 'Consultation Médecin', 'Achat Boutique', 'Prise de Poste'
    registered_by_id UUID REFERENCES public.profiles(id),
    status visit_status NOT NULL DEFAULT 'en_attente',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table Produits & Services (Boutique, Pharmacie, Cabinet)
CREATE TABLE public.products_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT NOT NULL UNIQUE, -- Code produit unique auto-généré (ex: 'WH-BTQ-041')
    name TEXT NOT NULL,
    category product_category NOT NULL,
    patient_price NUMERIC(10, 2) NOT NULL CHECK (patient_price >= 0),
    partner_price NUMERIC(10, 2) NOT NULL CHECK (partner_price >= 0),
    -- Gain direct calculé automatiquement : Prix Patient - Prix Partenaire
    direct_margin NUMERIC(10, 2) GENERATED ALWAYS AS (patient_price - partner_price) STORED,
    pv NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (pv >= 0), -- Points de Valeur MLM
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_threshold INT NOT NULL DEFAULT 5, -- Seuil d'alerte réapprovisionnement
    image_url TEXT,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table des Ventes (Caisse POS)
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT NOT NULL UNIQUE, -- ex: 'REC-2026-0001'
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    sale_time TIME NOT NULL DEFAULT CURRENT_TIME,
    cashier_id UUID REFERENCES public.profiles(id),
    patient_id UUID REFERENCES public.patients(id),
    patient_name TEXT NOT NULL,
    sponsor_partner_id UUID REFERENCES public.partners(id), -- Partenaire qui bénéficie des gains & PV
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_pv NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_partner_gain NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method payment_method NOT NULL DEFAULT 'especes',
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'complete',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Lignes de Vente (Items de la facture)
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products_services(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    patient_price NUMERIC(10, 2) NOT NULL,
    partner_price NUMERIC(10, 2) NOT NULL,
    item_gain NUMERIC(10, 2) NOT NULL, -- (patient_price - partner_price) * quantity
    item_pv NUMERIC(8, 2) NOT NULL,    -- pv * quantity
    subtotal NUMERIC(10, 2) NOT NULL
);

-- Table Commandes Fournisseurs (Réapprovisionnement)
CREATE TABLE public.orders_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE, -- ex: 'BC-2026-001'
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_name TEXT NOT NULL,
    status supplier_order_status NOT NULL DEFAULT 'brouillon',
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ product_id, product_name, quantity, unit_cost }]
    notes TEXT,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table Dossiers Médicaux & Bilans de Santé (Espace Médecin)
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id),
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consultation_time TIME NOT NULL DEFAULT CURRENT_TIME,
    -- Paramètres vitaux
    blood_pressure TEXT, -- ex: '125/80 mmHg'
    heart_rate INT,      -- bpm
    temperature NUMERIC(4, 1), -- °C
    weight NUMERIC(5, 2),      -- kg
    blood_sugar NUMERIC(4, 2), -- g/L
    symptoms TEXT NOT NULL,
    anamnesis TEXT,
    diagnosis TEXT NOT NULL,
    treatment_notes TEXT,
    prescriptions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Médicaments/produits, posologie, durée
    recommended_exams JSONB NOT NULL DEFAULT '[]'::jsonb,
    status medical_record_status NOT NULL DEFAULT 'cloture',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table Historique des Règlements de Commissions Partenaires
CREATE TABLE public.partner_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL, -- 'Orange Money', 'MTN MoMo', 'Virement', 'Espèces'
    reference_tx TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ====================================================================
-- 4. TRIGGERS AUTOMATIQUES (FONCTIONS DE CALCUL ET SYNCHRONISATION)
-- ====================================================================

-- A. Synchronisation automatique des Gains Directs et PV du Partenaire Parrain
CREATE OR REPLACE FUNCTION public.fn_sync_partner_earnings_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la vente a un partenaire parrain rattaché et des gains/PV
    IF NEW.sponsor_partner_id IS NOT NULL AND NEW.status = 'complete' THEN
        UPDATE public.partners
        SET 
            total_direct_earnings = total_direct_earnings + NEW.total_partner_gain,
            remaining_earnings = remaining_earnings + NEW.total_partner_gain,
            total_pv = total_pv + NEW.total_pv,
            remaining_pv = remaining_pv + NEW.total_pv,
            updated_at = timezone('utc', now())
        WHERE id = NEW.sponsor_partner_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_partner_earnings
AFTER INSERT ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.fn_sync_partner_earnings_on_sale();

-- B. Déduction automatique du Stock lors d'une vente d'article
CREATE OR REPLACE FUNCTION public.fn_deduct_stock_on_sale_item()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products_services
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
        updated_at = timezone('utc', now())
    WHERE id = NEW.product_id
      AND category IN ('boutique', 'pharmacie');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_deduct_stock
AFTER INSERT ON public.sale_items
FOR EACH ROW
EXECUTE FUNCTION public.fn_deduct_stock_on_sale_item();

-- C. Réapprovisionnement automatique lors de la réception d'une commande fournisseur
CREATE OR REPLACE FUNCTION public.fn_restock_on_supplier_order_received()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    IF NEW.status = 'recue' AND (OLD.status IS NULL OR OLD.status != 'recue') THEN
        -- Parcourt les éléments de la commande stockés en JSONB
        FOR item IN SELECT * FROM jsonb_to_recordset(NEW.items) AS x(product_id UUID, quantity INT)
        LOOP
            UPDATE public.products_services
            SET stock_quantity = stock_quantity + item.quantity,
                updated_at = timezone('utc', now())
            WHERE id = item.product_id;
        END LOOP;
        NEW.received_at = timezone('utc', now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_restock_supplier_order
BEFORE UPDATE ON public.orders_suppliers
FOR EACH ROW
EXECUTE FUNCTION public.fn_restock_on_supplier_order_received();

-- D. Mise à jour des soldes partenaire lors d'un paiement de commission
CREATE OR REPLACE FUNCTION public.fn_update_partner_balances_on_payout()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.partners
    SET 
        paid_earnings = paid_earnings + NEW.amount,
        remaining_earnings = GREATEST(0, remaining_earnings - NEW.amount),
        updated_at = timezone('utc', now())
    WHERE id = NEW.partner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_partner_payout
AFTER INSERT ON public.partner_payouts
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_partner_balances_on_payout();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) & POLITIQUES PAR RÔLE (RBAC)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

-- Helper function pour récupérer le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- POLITIQUES ADMIN : Accès universel en lecture et écriture
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access partners" ON public.partners FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access patients" ON public.patients FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access daily_visits" ON public.daily_visits FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access products_services" ON public.products_services FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access sales" ON public.sales FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access sale_items" ON public.sale_items FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access orders_suppliers" ON public.orders_suppliers FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access medical_records" ON public.medical_records FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');
CREATE POLICY "Admin full access partner_payouts" ON public.partner_payouts FOR ALL TO authenticated USING (public.get_auth_role() = 'admin');

-- POLITIQUES RÉCEPTIONNISTE :
-- Gestion de l'accueil, registre des visites, ajout de patients avec parrain, lecture produits & partenaires
CREATE POLICY "Receptionist can read/insert/update visits" ON public.daily_visits FOR ALL TO authenticated USING (public.get_auth_role() = 'receptionist');
CREATE POLICY "Receptionist can read/insert patients" ON public.patients FOR ALL TO authenticated USING (public.get_auth_role() = 'receptionist');
CREATE POLICY "Receptionist can view partners list" ON public.partners FOR SELECT TO authenticated USING (public.get_auth_role() = 'receptionist');
CREATE POLICY "Receptionist can view catalog" ON public.products_services FOR SELECT TO authenticated USING (public.get_auth_role() = 'receptionist');

-- POLITIQUES MÉDECIN :
-- Gestion complète des dossiers médicaux, consultations, bilans et ordonnances
CREATE POLICY "Doctor can manage medical records" ON public.medical_records FOR ALL TO authenticated USING (public.get_auth_role() = 'doctor');
CREATE POLICY "Doctor can view patients and visits" ON public.daily_visits FOR SELECT TO authenticated USING (public.get_auth_role() = 'doctor');
CREATE POLICY "Doctor can read patient info" ON public.patients FOR SELECT TO authenticated USING (public.get_auth_role() = 'doctor');
CREATE POLICY "Doctor can view products for prescriptions" ON public.products_services FOR SELECT TO authenticated USING (public.get_auth_role() = 'doctor');

-- POLITIQUES COMPTABLE :
-- Vente caisse POS, suivi financier des partenaires, gestion des commandes fournisseurs, versements
CREATE POLICY "Accountant manage sales" ON public.sales FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant manage sale items" ON public.sale_items FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant manage supplier orders" ON public.orders_suppliers FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant manage partner payouts" ON public.partner_payouts FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant read/update partners" ON public.partners FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant read/update products inventory" ON public.products_services FOR ALL TO authenticated USING (public.get_auth_role() = 'accountant');
CREATE POLICY "Accountant read visits" ON public.daily_visits FOR SELECT TO authenticated USING (public.get_auth_role() = 'accountant');

-- ====================================================================
-- 6. CONFIGURATION STORAGE (SUPABASE STORAGE)
-- ====================================================================
-- Création du bucket 'products' pour l'upload d'images depuis mobile/desktop
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Product Images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated Staff Upload Images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'products' AND auth.role() = 'authenticated'
);
`;

export const NEXTJS_PROJECT_TREE = `whieda-smart/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx           # Page de Connexion sécurisée (RBAC)
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Layout global avec Sidebar & Navbar Thème Orange/Rouge
│   │   ├── page.tsx               # Tableau de bord général (KPIs & Métriques)
│   │   ├── visits/
│   │   │   └── page.tsx           # Registre des Visites Journalières (Staff vs Patients + Parrain)
│   │   ├── products/
│   │   │   └── page.tsx           # CRUD Produits & Services (Prix Patient, Prix Partenaire, Gain Auto, PV, Upload Image)
│   │   ├── partners/
│   │   │   └── page.tsx           # Gestion Partenaires & MLM (Gains directs, PV placés/restants, Paiement)
│   │   ├── pos/
│   │   │   └── page.tsx           # Caisse Enregistreuse POS (Reçus thermiques, modes de paiement, déduction stock)
│   │   ├── suppliers/
│   │   │   └── page.tsx           # Commandes Fournisseurs & Réapprovisionnement automatique
│   │   ├── medical/
│   │   │   ├── page.tsx           # Espace Médecin (Consultations, Bilans, Antécédents)
│   │   │   └── report/[id]/
│   │   │       └── page.tsx       # Bilan de Santé & Ordonnance PDF A4 téléchargeable / imprimable
│   │   ├── users/
│   │   │   └── page.tsx           # Gestion des Employés & Rôles (Création par l'Admin)
│   │   └── database/
│   │       └── page.tsx           # Script SQL Supabase & Architecture du système
│   ├── globals.css                # Tailwind CSS v4 & styles d'impression PDF
│   └── layout.tsx                 # Balises HTML, Polices Plus Jakarta Sans & JetBrains Mono
├── components/
│   ├── ui/                        # Composants d'interface (Button, Modal, Input, Table)
│   ├── Navbar.tsx                 # Header avec indicateur de rôle et profil
│   ├── Sidebar.tsx                # Barre latérale dynamique selon les permissions RBAC
│   ├── MedicalReportPrint.tsx     # Template certifié A4 du Bilan de Santé & Ordonnance Médicale
│   └── ThermalReceiptModal.tsx    # Modal du ticket de caisse POS prêt pour impression
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Client Supabase navigateur
│   │   ├── server.ts              # Client Supabase côté serveur Next.js
│   │   └── admin.ts               # Client Supabase Service Role pour création d'utilisateurs
│   └── utils.ts                   # Formatage FCFA, calculs de marges, générateur de SKU
├── types/
│   └── index.ts                   # Interfaces TypeScript complètes
├── public/
│   └── images/                    # Logos Whieda Smart et assets visuels
├── schema.sql                     # Script SQL complet pour Supabase
├── package.json
└── tailwind.config.ts`;
