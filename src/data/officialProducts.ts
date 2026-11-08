import { ProductService, ProductCategory } from '../types';

export interface OfficialProductDefinition {
  code: string;
  name: string;
  partner_price: number;
  public_price: number;
  pv: number;
  category_id: string; // ex: 'regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'appareils'
  category_name: string;
  description: string;
}

// 28 Produits officiels de la grille tarifaire Whieda Meyomessala
export const OFFICIAL_PRODUCTS_CATALOG: OfficialProductDefinition[] = [
  {
    code: 'F001',
    name: 'ORAL LIQUID',
    partner_price: 17500,
    public_price: 20500,
    pv: 25,
    category_id: 'regulateur',
    category_name: 'Régulateur & Équilibre',
    description: 'Élixir liquide bio-actif au Cordyceps Sinensis pour la régulation du système immunitaire et de l’énergie vitale.',
  },
  {
    code: 'F003',
    name: 'LINCHZI',
    partner_price: 21000,
    public_price: 24500,
    pv: 25,
    category_id: 'regulateur',
    category_name: 'Régulateur & Équilibre',
    description: 'Gélules de Ganoderma / Reishi de haute pureté pour le renforcement immunitaire et la microcirculation.',
  },
  {
    code: 'F539-A',
    name: 'ALKALINE CUP',
    partner_price: 36000,
    public_price: 41000,
    pv: 35,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Gobelet ioniseur d’eau alcaline enrichissant l’eau en minéraux et neutralisant l’acidité organique.',
  },
  {
    code: 'F004',
    name: 'THE',
    partner_price: 10700,
    public_price: 12250,
    pv: 13,
    category_id: 'nettoyage',
    category_name: 'Nettoyage & Détox',
    description: 'Thé Détox aux herbes précieuses (Liuwei Cha) pour l’élimination des toxines digestives et la purification rénale.',
  },
  {
    code: 'F007',
    name: 'ROSE OLIGOSE',
    partner_price: 8500,
    public_price: 9750,
    pv: 10,
    category_id: 'nettoyage',
    category_name: 'Nettoyage & Détox',
    description: 'Pâte prébiotique aux extraits de rose pour l’équilibre de la flore intestinale et le transit.',
  },
  {
    code: 'F017-A',
    name: 'CUDAN POWER',
    partner_price: 28000,
    public_price: 32500,
    pv: 40,
    category_id: 'entretien',
    category_name: 'Entretien & Vitalité',
    description: 'Formule tonique avancée pour stimuler la puissance physique, la résistance à l’effort et la vitalité rénale.',
  },
  {
    code: 'BA-02',
    name: 'LAVEUR DE SANG',
    partner_price: 42000,
    public_price: 47500,
    pv: 60,
    category_id: 'nettoyage',
    category_name: 'Nettoyage & Détox',
    description: 'Complexe puissant de purification sanguine, de désengorgement vasculaire et de protection hépatobiliaire.',
  },
  {
    code: 'BA-03',
    name: 'GARLIC OIL',
    partner_price: 6500,
    public_price: 7500,
    pv: 7,
    category_id: 'alimentation',
    category_name: 'Alimentation & Nutrition',
    description: 'Huile d’ail pure en capsules pour la santé cardiovasculaire, la tension et les défenses naturelles.',
  },
  {
    code: 'BA-04',
    name: 'SALVIA',
    partner_price: 6500,
    public_price: 7500,
    pv: 7,
    category_id: 'regulateur',
    category_name: 'Régulateur & Équilibre',
    description: 'Salvia miltiorrhiza (Danshen) pour fluidifier la circulation coronaire et apaiser les tensions nerveuses.',
  },
  {
    code: 'BA-05',
    name: 'LONGLU',
    partner_price: 8500,
    public_price: 9750,
    pv: 6,
    category_id: 'entretien',
    category_name: 'Entretien & Vitalité',
    description: 'Tonique yang réchauffant et fortifiant osseux pour revitaliser le tonus lombaire et articulaire.',
  },
  {
    code: 'F002',
    name: 'SANBAO',
    partner_price: 28000,
    public_price: 32500,
    pv: 32,
    category_id: 'regulateur',
    category_name: 'Régulateur & Équilibre',
    description: 'Sanbao Oral Liquid réunissant les trois trésors de la médecine orientale pour l’immunité et la longévité.',
  },
  {
    code: 'BA-01',
    name: 'HAIZAO CALCIUM',
    partner_price: 21000,
    public_price: 24500,
    pv: 25,
    category_id: 'alimentation',
    category_name: 'Alimentation & Nutrition',
    description: 'Calcium marin ionisé issu d’algues naturelles pour la densité minérale osseuse et la santé dentaire.',
  },
  {
    code: 'FC24-A',
    name: 'CREME DE MASSAGE',
    partner_price: 8500,
    public_price: 9750,
    pv: 6,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Crème onctueuse aux extraits végétaux pour délier les tensions myofasciales et soulager la fatigue.',
  },
  {
    code: 'FC25-A',
    name: 'CREME ENERGETIQUE',
    partner_price: 8500,
    public_price: 9750,
    pv: 6,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Crème bio-énergétique thermogène pour l’activation des canaux d’énergie et le soulagement localisé.',
  },
  {
    code: 'F504',
    name: 'SERVIETTES',
    partner_price: 10700,
    public_price: 12250,
    pv: 8,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Serviettes hygiéniques enrichies en ions négatifs, nano-argent et infrarouges lointains pour la santé intime.',
  },
  {
    code: 'F010-A',
    name: 'PROSTA BOOSTA',
    partner_price: 21000,
    public_price: 24500,
    pv: 20,
    category_id: 'entretien',
    category_name: 'Entretien & Vitalité',
    description: 'Complexe végétal ciblé pour le confort prostatique, la fluidité urinaire et le tonus masculin.',
  },
  {
    code: 'F5155-B',
    name: 'PATE',
    partner_price: 4300,
    public_price: 5000,
    pv: 6,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Pâte dentifrice thérapeutique aux extraits de plantes pour la protection des gencives et l’haleine fraîche.',
  },
  {
    code: 'FY001',
    name: 'GUIFEI BAO (OVULES)',
    partner_price: 17500,
    public_price: 20500,
    pv: 17,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Tampons ovulaires traditionnels purifiants pour la détoxification et l’hygiène gynécologique féminine.',
  },
  {
    code: 'F544-A',
    name: 'GEL ANTIBACTERIAL',
    partner_price: 17500,
    public_price: 20500,
    pv: 17,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Gel intime antibactérien et régénérateur muqueux aux extraits botaniques apaisants.',
  },
  {
    code: 'D013-01',
    name: 'SEMELLES',
    partner_price: 76000,
    public_price: 79000,
    pv: 100,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Semelles magnétiques de réflexologie plantaire stimulant les points d’acupuncture et la posture.',
  },
  {
    code: 'M015-00',
    name: 'PORTABLE MAGIC DEVICE',
    partner_price: 342000,
    public_price: 36000,
    pv: 400,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Dispositif portable de bio-massage et stimulation des méridiens par micro-courants physiologiques.',
  },
  {
    code: 'D014-10',
    name: 'WENTONG DEVICE 1.0 SET',
    partner_price: 1365000,
    public_price: 1385000,
    pv: 1500,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Station complète de thermothérapie et de physiothérapie bio-énergétique Wentong de haute précision clinique.',
  },
  {
    code: 'T015-30',
    name: 'LUNETTES',
    partner_price: 38000,
    public_price: 42500,
    pv: 50,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Lunettes énergétiques à émission d’anions et protection oculaire contre la fatigue visuelle et les radiations.',
  },
  {
    code: 'F034-00',
    name: 'CHALE ENERGY',
    partner_price: 92500,
    public_price: 97500,
    pv: 100,
    category_id: 'appareils',
    category_name: 'Appareils & Dispositifs',
    description: 'Châle thérapeutique chauffant à infrarouge lointain pour soulager les raideurs cervicales et scapulaires.',
  },
  {
    code: 'F036-00',
    name: 'CORDYCEPS AND COLLAGEN',
    partner_price: 35000,
    public_price: 40000,
    pv: 30,
    category_id: 'alimentation',
    category_name: 'Alimentation & Nutrition',
    description: 'Synergie nutritionnelle de peptides de collagène marin et de cordyceps pour la jeunesse cutanée et articulaire.',
  },
  {
    code: 'D038-00',
    name: 'SPIRULINA TABLETS',
    partner_price: 48500,
    public_price: 52500,
    pv: 50,
    category_id: 'alimentation',
    category_name: 'Alimentation & Nutrition',
    description: 'Comprimés de spiruline pure à 100% riche en chlorophylle, fer, acides aminés et antioxydants majeurs.',
  },
  {
    code: 'D038-00',
    name: 'SMALL MOLECULAR PEPTIDES SOY FLOUR',
    partner_price: 38000,
    public_price: 42500,
    pv: 50,
    category_id: 'alimentation',
    category_name: 'Alimentation & Nutrition',
    description: 'Poudre de peptides de soja à petites molécules ultra-assimilables pour la régénération cellulaire.',
  },
  {
    code: 'D002-00',
    name: 'WARMING AND RELAXING GEL',
    partner_price: 10700,
    public_price: 12500,
    pv: 100,
    category_id: 'soins',
    category_name: 'Soins & Bien-être',
    description: 'Gel chauffant et relaxant à pénétration rapide pour détendre les zones articulaires et musculaires nouées.',
  },
];

// Conversion des produits officiels en format ProductService pour l'application
export const OFFICIAL_PRODUCTS_APP_SERVICES: ProductService[] = OFFICIAL_PRODUCTS_CATALOG.map((item, idx) => {
  const directMargin = item.public_price - item.partner_price;
  // SKU unique pour la base de données et l'application
  const uniqueSku = item.name === 'SMALL MOLECULAR PEPTIDES SOY FLOUR' 
    ? 'D038-00-PEP' 
    : item.code;

  // Définir des stocks initiaux réalistes
  let initialStock = 30;
  let minThreshold = 6;
  if (item.category_id === 'appareils') {
    initialStock = item.name.includes('WENTONG') ? 4 : item.name.includes('MAGIC') ? 8 : 15;
    minThreshold = 2;
  } else if (item.name === 'ORAL LIQUID' || item.name === 'THE' || item.name === 'LINCHZI') {
    initialStock = 50;
    minThreshold = 10;
  }

  return {
    id: `prod-off-${idx + 1}-${item.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    code: item.code,
    sku: uniqueSku,
    name: item.name,
    category: item.category_id as ProductCategory,
    categoryId: `cat-${item.category_id}`,
    patientPrice: item.public_price,
    publicPrice: item.public_price,
    partnerPrice: item.partner_price,
    directMargin,
    pv: item.pv,
    stockQuantity: initialStock,
    initialStockQuantity: initialStock,
    totalStockReceived: initialStock,
    minStockThreshold: minThreshold,
    imageUrl: item.category_id === 'appareils' 
      ? '/src/assets/images/whieda_brand_hero_1793253158805.jpg' 
      : '/src/assets/images/whieda_supplement_bottle_1793253158824.jpg',
    description: item.description,
    active: true,
  };
});

// SCRIPT D'INSERTION SUPABASE (SQL Migration & Seed)
export const SUPABASE_OFFICIAL_PRODUCTS_SEED_SQL = `-- ====================================================================
-- WHIEDA MEYOMESSALA - SCRIPT SUPABASE D'INITIALISATION DE LA GRILLE TARIFAIRE
-- Insertion en masse des 28 produits officiels avec catégories et calcul de marge
-- Colonnes requises : code, name, partner_price, public_price, pv, category_id
-- ====================================================================

-- 1. MISE À JOUR DE L'ENUM ET DES TABLES (SI NÉCESSAIRE)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_category') THEN
    CREATE TYPE product_category AS ENUM ('regulateur', 'nettoyage', 'entretien', 'alimentation', 'soins', 'appareils', 'services');
  ELSE
    ALTER TYPE product_category ADD VALUE IF NOT EXISTS 'appareils';
  END IF;
END$$;

-- Table des catégories normalisées (optionnelle pour architecture modulaire)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

INSERT INTO public.categories (id, name, description) VALUES
    ('regulateur', 'Régulateur & Équilibre', 'Produits d''harmonisation bio-énergétique et régulation vitale'),
    ('nettoyage', 'Nettoyage & Détox', 'Produits de purification digestive, hépatique et sanguine'),
    ('entretien', 'Entretien & Vitalité', 'Toniques musculaires, rénaux et endurance physique'),
    ('alimentation', 'Alimentation & Nutrition', 'Compléments alimentaires essentiels et superaliments'),
    ('soins', 'Soins & Bien-être', 'Crèmes thérapeutiques, baumes et hygiène spécialisée'),
    ('appareils', 'Appareils & Dispositifs', 'Équipements biomagnétiques, wentong et dispositifs quantiques'),
    ('services', 'Services & Bilans', 'Consultations médicales et bilans bio-électroniques')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. TABLE DES PRODUITS (Colonnes requises : code, name, partner_price, public_price, pv, category_id)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    partner_price NUMERIC(12, 2) NOT NULL CHECK (partner_price >= 0),
    public_price NUMERIC(12, 2) NOT NULL CHECK (public_price >= 0),
    patient_price NUMERIC(12, 2) GENERATED ALWAYS AS (public_price) STORED,
    direct_margin NUMERIC(12, 2) GENERATED ALWAYS AS (public_price - partner_price) STORED,
    pv NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (pv >= 0),
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 25,
    min_stock_threshold INT NOT NULL DEFAULT 5,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);

-- 3. INSERTION EN MASSE (SEED) DES 28 PRODUITS OFFICIELS
INSERT INTO public.products (code, sku, name, partner_price, public_price, pv, category_id, stock_quantity, min_stock_threshold, description) VALUES
    ('F001', 'F001', 'ORAL LIQUID', 17500, 20500, 25, 'regulateur', 50, 10, 'Élixir liquide bio-actif au Cordyceps Sinensis pour la régulation du système immunitaire.'),
    ('F003', 'F003', 'LINCHZI', 21000, 24500, 25, 'regulateur', 40, 8, 'Gélules de Ganoderma / Reishi de haute pureté pour le renforcement immunitaire.'),
    ('F539-A', 'F539-A', 'ALKALINE CUP', 36000, 41000, 35, 'appareils', 20, 4, 'Gobelet ioniseur d''eau alcaline enrichissant l''eau en minéraux actifs.'),
    ('F004', 'F004', 'THE', 10700, 12250, 13, 'nettoyage', 60, 12, 'Thé Détox aux herbes précieuses (Liuwei Cha) pour l''élimination des toxines digestives.'),
    ('F007', 'F007', 'ROSE OLIGOSE', 8500, 9750, 10, 'nettoyage', 35, 6, 'Pâte prébiotique aux extraits de rose pour l''équilibre de la flore intestinale.'),
    ('F017-A', 'F017-A', 'CUDAN POWER', 28000, 32500, 40, 'entretien', 30, 6, 'Formule tonique avancée pour stimuler la puissance physique et l''énergie rénale.'),
    ('BA-02', 'BA-02', 'LAVEUR DE SANG', 42000, 47500, 60, 'nettoyage', 25, 5, 'Complexe puissant de purification sanguine et désengorgement vasculaire.'),
    ('BA-03', 'BA-03', 'GARLIC OIL', 6500, 7500, 7, 'alimentation', 45, 8, 'Huile d''ail pure en capsules pour la santé cardiovasculaire et la tension.'),
    ('BA-04', 'BA-04', 'SALVIA', 6500, 7500, 7, 'regulateur', 40, 8, 'Salvia miltiorrhiza (Danshen) pour fluidifier la microcirculation sanguine.'),
    ('BA-05', 'BA-05', 'LONGLU', 8500, 9750, 6, 'entretien', 35, 6, 'Tonique yang fortifiant pour revitaliser le tonus lombaire et articulaire.'),
    ('F002', 'F002', 'SANBAO', 28000, 32500, 32, 'regulateur', 30, 6, 'Sanbao Oral Liquid réunissant les trois trésors de la pharmacopée naturelle.'),
    ('BA-01', 'BA-01', 'HAIZAO CALCIUM', 21000, 24500, 25, 'alimentation', 40, 8, 'Calcium marin ionisé issu d''algues pour la solidité osseuse et dentaire.'),
    ('FC24-A', 'FC24-A', 'CREME DE MASSAGE', 8500, 9750, 6, 'soins', 50, 10, 'Crème onctueuse aux extraits végétaux pour délier les tensions musculaires.'),
    ('FC25-A', 'FC25-A', 'CREME ENERGETIQUE', 8500, 9750, 6, 'soins', 50, 10, 'Crème bio-énergétique thermogène pour l''activation des canaux méridiens.'),
    ('F504', 'F504', 'SERVIETTES', 10700, 12250, 8, 'soins', 60, 12, 'Serviettes hygiéniques aux ions négatifs et infrarouges lointains.'),
    ('F010-A', 'F010-A', 'PROSTA BOOSTA', 21000, 24500, 20, 'entretien', 35, 6, 'Complexe végétal ciblé pour le confort prostatique et urinaire masculin.'),
    ('F5155-B', 'F5155-B', 'PATE', 4300, 5000, 6, 'soins', 80, 15, 'Pâte dentifrice thérapeutique aux herbes pour des gencives saines.'),
    ('FY001', 'FY001', 'GUIFEI BAO (OVULES)', 17500, 20500, 17, 'soins', 35, 6, 'Tampons ovulaires traditionnels purifiants pour l''hygiène gynécologique.'),
    ('F544-A', 'F544-A', 'GEL ANTIBACTERIAL', 17500, 20500, 17, 'soins', 40, 8, 'Gel intime antibactérien et réparateur aux extraits botaniques.'),
    ('D013-01', 'D013-01', 'SEMELLES', 76000, 79000, 100, 'appareils', 15, 3, 'Semelles magnétiques de réflexologie plantaire stimulant l''énergie corporelle.'),
    ('M015-00', 'M015-00', 'PORTABLE MAGIC DEVICE', 342000, 360000, 400, 'appareils', 8, 2, 'Dispositif de bio-massage portable stimulant les points d''acupuncture.'),
    ('D014-10', 'D014-10', 'WENTONG DEVICE 1.0 SET', 1365000, 1385000, 1500, 'appareils', 4, 1, 'Station complète de thermothérapie et de physiothérapie Wentong.'),
    ('T015-30', 'T015-30', 'LUNETTES', 38000, 42500, 50, 'appareils', 20, 4, 'Lunettes énergétiques à ions négatifs protégeant les yeux et stimulant la vue.'),
    ('F034-00', 'F034-00', 'CHALE ENERGY', 92500, 97500, 100, 'appareils', 12, 2, 'Châle thérapeutique chauffant à infrarouge pour épaules et nuque.'),
    ('F036-00', 'F036-00', 'CORDYCEPS AND COLLAGEN', 35000, 40000, 30, 'alimentation', 30, 6, 'Peptides de collagène marin et cordyceps pour la fermeté et les articulations.'),
    ('D038-00', 'D038-00', 'SPIRULINA TABLETS', 48500, 52500, 50, 'alimentation', 35, 6, 'Comprimés de spiruline 100% pure riche en protéines et vitamines.'),
    ('D038-00', 'D038-00-PEP', 'SMALL MOLECULAR PEPTIDES SOY FLOUR', 38000, 42500, 50, 'alimentation', 30, 6, 'Poudre de peptides de soja à petites molécules hautement régénératrices.'),
    ('D002-00', 'D002-00', 'WARMING AND RELAXING GEL', 10700, 12500, 100, 'soins', 45, 8, 'Gel chauffant et relaxant pour décontracter rapidement les muscles et articulations.')
ON CONFLICT (sku) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    partner_price = EXCLUDED.partner_price,
    public_price = EXCLUDED.public_price,
    pv = EXCLUDED.pv,
    category_id = EXCLUDED.category_id,
    description = EXCLUDED.description,
    updated_at = timezone('utc', now());

-- 4. VÉRIFICATION DU NOMBRE DE PRODUITS INSÉRÉS
SELECT category_id, COUNT(*) AS total_produits, 
       SUM(public_price) AS valeur_publique_totale, 
       SUM(pv) AS total_pv
FROM public.products
GROUP BY category_id
ORDER BY total_produits DESC;
`;

/**
 * Fonction d'initialisation et synchronisation automatique du catalogue officiel
 * Préserve les modifications utilisateur tout en garantissant la présence des 28 produits officiels
 */
export const syncOfficialProductsList = (currentProducts: ProductService[]): ProductService[] => {
  const result: ProductService[] = [...currentProducts];

  OFFICIAL_PRODUCTS_APP_SERVICES.forEach(official => {
    // Vérifier si le produit existe déjà par son code officiel ou son nom exact
    const existingIndex = result.findIndex(
      p => (p.code && p.code === official.code && p.name.toUpperCase() === official.name.toUpperCase()) ||
           p.sku === official.sku ||
           p.name.trim().toUpperCase() === official.name.trim().toUpperCase()
    );

    if (existingIndex >= 0) {
      // Mettre à jour les informations tarifaires et le code officiel sans écraser le stock en cours
      result[existingIndex] = {
        ...result[existingIndex],
        code: official.code,
        sku: official.sku,
        name: official.name,
        category: official.category,
        categoryId: official.categoryId,
        patientPrice: official.patientPrice,
        publicPrice: official.publicPrice,
        partnerPrice: official.partnerPrice,
        directMargin: official.directMargin,
        pv: official.pv,
        description: official.description,
        initialStockQuantity: result[existingIndex].initialStockQuantity ?? official.initialStockQuantity,
        totalStockReceived: result[existingIndex].totalStockReceived ?? official.totalStockReceived,
      };
    } else {
      // Ajouter le nouveau produit officiel
      result.push(official);
    }
  });

  return result;
};
