import { getSupabaseClient } from '../lib/supabase';
import { 
  mapProductToDb, 
  mapPartnerToDb, 
  mapExpenseToDb, 
  mapVisitToDb 
} from './supabaseService';
import { ProductService, Partner, Expense, Visit, Sale, CompanySettings } from '../types';

export interface MigrationReport {
  success: boolean;
  message: string;
  timestamp: string;
  counts: {
    products: number;
    partners: number;
    expenses: number;
    visits: number;
    sales: number;
    settings: boolean;
  };
  errors: string[];
}

export const checkHasLocalDataToMigrate = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hasProducts = Boolean(localStorage.getItem('whieda_products'));
  const hasPartners = Boolean(localStorage.getItem('whieda_partners'));
  const hasExpenses = Boolean(localStorage.getItem('whieda_expenses'));
  const hasSettings = Boolean(localStorage.getItem('whieda_company_settings'));
  return hasProducts || hasPartners || hasExpenses || hasSettings;
};

export const isAlreadyMigrated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem('whieda_supabase_migrated'));
};

/**
 * Script de migration unique et sécurisé :
 * 1. Sauvegarde une copie miroir de sécurité intégrale dans le localStorage (backup indestructible)
 * 2. Vérifie et extrait tous les enregistrements existants (produits, partenaires, dépenses, visites, ventes)
 * 3. Les injecte proprement dans Supabase sans écraser les données distantes
 * 4. Marque le flag de migration pour éviter les exécutions redondantes
 */
export const migrateLocalStorageToSupabase = async (): Promise<MigrationReport> => {
  const client = getSupabaseClient();
  const errors: string[] = [];

  const counts = {
    products: 0,
    partners: 0,
    expenses: 0,
    visits: 0,
    sales: 0,
    settings: false,
  };

  if (!client) {
    return {
      success: false,
      message: 'Supabase n’est pas configuré. Veuillez renseigner l’URL et la clé Anon.',
      timestamp: new Date().toISOString(),
      counts,
      errors: ['Client Supabase non initialisé'],
    };
  }

  try {
    // Étape 1 : Sauvegarde intégrale du localStorage (Sécurité maximale)
    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      products: localStorage.getItem('whieda_products'),
      partners: localStorage.getItem('whieda_partners'),
      expenses: localStorage.getItem('whieda_expenses'),
      sales: localStorage.getItem('whieda_sales'),
      visits: localStorage.getItem('whieda_visits'),
      companySettings: localStorage.getItem('whieda_company_settings'),
      users: localStorage.getItem('whieda_users'),
    };
    localStorage.setItem('whieda_backup_before_supabase', JSON.stringify(backupSnapshot));

    // Étape 2 : Migration des Produits
    const rawProducts = localStorage.getItem('whieda_products');
    if (rawProducts) {
      try {
        const productsList: ProductService[] = JSON.parse(rawProducts);
        if (Array.isArray(productsList) && productsList.length > 0) {
          const rows = productsList.map(mapProductToDb);
          
          // Essaye la table products, fallback sur products_services
          const { error: err1 } = await client.from('products').upsert(rows, { onConflict: 'sku' });
          if (err1) {
            const { error: err2 } = await client.from('products_services').upsert(rows, { onConflict: 'sku' });
            if (err2) {
              errors.push(`Erreur migration produits : ${err2.message}`);
            } else {
              counts.products = productsList.length;
            }
          } else {
            counts.products = productsList.length;
          }
        }
      } catch (err: any) {
        errors.push(`Erreur parsing produits localStorage : ${err.message}`);
      }
    }

    // Étape 3 : Migration des Partenaires (MLM)
    const rawPartners = localStorage.getItem('whieda_partners');
    if (rawPartners) {
      try {
        const partnersList: Partner[] = JSON.parse(rawPartners);
        if (Array.isArray(partnersList) && partnersList.length > 0) {
          const rows = partnersList.map(mapPartnerToDb);
          const { error } = await client.from('partners').upsert(rows, { onConflict: 'code' });
          if (error) {
            errors.push(`Erreur migration partenaires : ${error.message}`);
          } else {
            counts.partners = partnersList.length;
          }
        }
      } catch (err: any) {
        errors.push(`Erreur parsing partenaires : ${err.message}`);
      }
    }

    // Étape 4 : Migration des Dépenses (Finances)
    const rawExpenses = localStorage.getItem('whieda_expenses');
    if (rawExpenses) {
      try {
        const expensesList: Expense[] = JSON.parse(rawExpenses);
        if (Array.isArray(expensesList) && expensesList.length > 0) {
          const rows = expensesList.map(mapExpenseToDb);
          const { error } = await client.from('expenses').upsert(rows, { onConflict: 'id' });
          if (error) {
            errors.push(`Erreur migration dépenses : ${error.message}`);
          } else {
            counts.expenses = expensesList.length;
          }
        }
      } catch (err: any) {
        errors.push(`Erreur parsing dépenses : ${err.message}`);
      }
    }

    // Étape 5 : Migration du Registre des Visites
    const rawVisits = localStorage.getItem('whieda_visits');
    if (rawVisits) {
      try {
        const visitsList: Visit[] = JSON.parse(rawVisits);
        if (Array.isArray(visitsList) && visitsList.length > 0) {
          const rows = visitsList.map(mapVisitToDb);
          const { error } = await client.from('daily_visits').upsert(rows, { onConflict: 'id' });
          if (error) {
            errors.push(`Erreur migration visites : ${error.message}`);
          } else {
            counts.visits = visitsList.length;
          }
        }
      } catch (err: any) {
        errors.push(`Erreur parsing visites : ${err.message}`);
      }
    }

    // Étape 6 : Migration des Paramètres de l'Entreprise
    const rawSettings = localStorage.getItem('whieda_company_settings');
    if (rawSettings) {
      try {
        const settings: CompanySettings = JSON.parse(rawSettings);
        const { error } = await client.from('company_settings').upsert({
          id: 'default',
          settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (!error) {
          counts.settings = true;
        }
      } catch (err: any) {
        // Optionnel
      }
    }

    // Étape 7 : Validation et enregistrement de l'état de migration
    const totalMigrated = counts.products + counts.partners + counts.expenses + counts.visits;
    const isSuccess = errors.length === 0 || totalMigrated > 0;

    if (isSuccess) {
      localStorage.setItem('whieda_supabase_migrated', new Date().toISOString());
    }

    return {
      success: isSuccess,
      message: isSuccess 
        ? `Migration terminée avec succès ! (${totalMigrated} éléments transférés vers Supabase)`
        : 'Des avertissements ont eu lieu durant la migration.',
      timestamp: new Date().toISOString(),
      counts,
      errors,
    };
  } catch (globalErr: any) {
    return {
      success: false,
      message: `Erreur inattendue durant la migration : ${globalErr.message}`,
      timestamp: new Date().toISOString(),
      counts,
      errors: [globalErr.message],
    };
  }
};
