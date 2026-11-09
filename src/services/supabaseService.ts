import { getSupabaseClient } from '../lib/supabase';
import { 
  ProductService, 
  Partner, 
  Expense, 
  Sale, 
  Visit, 
  SupplierOrder, 
  CompanySettings, 
  AuditLog, 
  User,
  SaleItem,
  SupplierOrderItem,
  ProductCategory
} from '../types';

// ====================================================================
// MAPPERS: Convert between Frontend Types and Supabase Table Schemas
// ====================================================================

export const mapProductFromDb = (row: any): ProductService => {
  return {
    id: row.id,
    code: row.code || row.sku,
    sku: row.sku || row.code,
    name: row.name,
    category: (row.category_id || row.category || 'regulateur') as ProductCategory,
    categoryId: row.category_id || `cat-${row.category}`,
    patientPrice: Number(row.public_price || row.patient_price || 0),
    publicPrice: Number(row.public_price || row.patient_price || 0),
    partnerPrice: Number(row.partner_price || 0),
    directMargin: Number(row.direct_margin ?? (Number(row.public_price || row.patient_price || 0) - Number(row.partner_price || 0))),
    pv: Number(row.pv || 0),
    stockQuantity: Number(row.stock_quantity ?? 0),
    initialStockQuantity: Number(row.initial_stock_quantity ?? row.stock_quantity ?? 0),
    totalStockReceived: Number(row.total_stock_received ?? row.stock_quantity ?? 0),
    minStockThreshold: Number(row.min_stock_threshold ?? 5),
    imageUrl: row.image_url || undefined,
    description: row.description || undefined,
    active: row.active ?? true,
  };
};

export const mapProductToDb = (product: ProductService): any => {
  return {
    id: product.id,
    code: product.code || product.sku,
    sku: product.sku || product.code,
    name: product.name,
    category_id: product.category,
    public_price: product.patientPrice,
    partner_price: product.partnerPrice,
    pv: product.pv,
    stock_quantity: product.stockQuantity,
    min_stock_threshold: product.minStockThreshold,
    image_url: product.imageUrl || null,
    description: product.description || null,
    active: product.active ?? true,
    updated_at: new Date().toISOString(),
  };
};

export const mapPartnerFromDb = (row: any): Partner => {
  return {
    id: row.id,
    code: row.code,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    phone: row.phone || '',
    email: row.email || '',
    sponsorId: row.sponsor_id || undefined,
    sponsorName: row.sponsor_name || undefined,
    sponsorCode: row.sponsor_code || undefined,
    cardStatus: row.card_status || 'Start',
    qualificationStatus: row.qualification_status || 'Qualifié',
    binaryPosition: row.binary_position || 'left',
    totalDirectEarnings: Number(row.total_direct_earnings || 0),
    paidEarnings: Number(row.paid_earnings || 0),
    remainingEarnings: Number(row.remaining_earnings || 0),
    totalPv: Number(row.total_pv || 0),
    placedPv: Number(row.placed_pv || 0),
    remainingPv: Number(row.remaining_pv || 0),
    level: row.level || 'Sans grade',
    isFounder: Boolean(row.is_founder),
    registeredAt: row.created_at || new Date().toISOString(),
  };
};

export const mapPartnerToDb = (partner: Partner): any => {
  return {
    id: partner.id,
    code: partner.code,
    first_name: partner.firstName,
    last_name: partner.lastName,
    phone: partner.phone,
    email: partner.email,
    sponsor_id: partner.sponsorId || null,
    total_direct_earnings: partner.totalDirectEarnings,
    paid_earnings: partner.paidEarnings,
    remaining_earnings: partner.remainingEarnings,
    total_pv: partner.totalPv,
    placed_pv: partner.placedPv,
    remaining_pv: partner.remainingPv,
    level: partner.level,
    updated_at: new Date().toISOString(),
  };
};

export const mapExpenseFromDb = (row: any): Expense => {
  return {
    id: row.id,
    date: row.expense_date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    title: row.title,
    category: row.category,
    amount: Number(row.amount || 0),
    recordedBy: row.recorded_by_name || 'Admin',
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
};

export const mapExpenseToDb = (expense: Expense): any => {
  return {
    id: expense.id,
    expense_date: expense.date,
    title: expense.title,
    category: expense.category,
    amount: expense.amount,
    recorded_by_name: expense.recordedBy,
    notes: expense.notes || null,
    created_at: expense.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const mapVisitFromDb = (row: any): Visit => {
  return {
    id: row.id,
    date: row.visit_date || (row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
    time: row.visit_time || '08:00',
    visitorName: row.visitor_name,
    visitorPhone: row.visitor_phone || undefined,
    visitorType: row.visitor_type || 'patient',
    purpose: row.purpose || 'Simple visite',
    status: row.status || 'en_attente',
    registeredBy: row.registered_by || row.registered_by_name || 'Réception',
    notes: row.notes || undefined,
    sponsorPartnerId: row.sponsor_partner_id || undefined,
  };
};

export const mapVisitToDb = (visit: Visit): any => {
  return {
    id: visit.id,
    visit_date: visit.date,
    visit_time: visit.time,
    visitor_name: visit.visitorName,
    visitor_phone: visit.visitorPhone || null,
    visitor_type: visit.visitorType,
    purpose: visit.purpose,
    status: visit.status,
    notes: visit.notes || null,
    sponsor_partner_id: visit.sponsorPartnerId || null,
    created_at: new Date().toISOString(),
  };
};

// ====================================================================
// SERVICE API: PRODUCTS
// ====================================================================

export const fetchProductsFromSupabase = async (): Promise<ProductService[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Try 'products' table first, then 'products_services'
    let { data, error } = await client.from('products').select('*').order('name');
    if (error && error.code === '42P01') {
      const resAlt = await client.from('products_services').select('*').order('name');
      data = resAlt.data;
      error = resAlt.error;
    }

    if (error) {
      console.warn('Supabase fetchProducts warning:', error.message);
      return null;
    }

    return (data || []).map(mapProductFromDb);
  } catch (err) {
    console.error('Supabase fetchProducts exception:', err);
    return null;
  }
};

export const saveProductToSupabase = async (product: ProductService): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapProductToDb(product);
    const { error } = await client.from('products').upsert(row, { onConflict: 'sku' });
    if (error) {
      // Fallback to products_services
      await client.from('products_services').upsert(row, { onConflict: 'sku' });
    }
    return true;
  } catch (err) {
    console.error('Supabase saveProduct error:', err);
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client.from('products').delete().eq('id', productId);
    await client.from('products_services').delete().eq('id', productId);
    return true;
  } catch (err) {
    console.error('Supabase deleteProduct error:', err);
    return false;
  }
};

// ====================================================================
// SERVICE API: PARTNERS (MLM)
// ====================================================================

export const fetchPartnersFromSupabase = async (): Promise<Partner[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('partners').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchPartners warning:', error.message);
      return null;
    }
    return (data || []).map(mapPartnerFromDb);
  } catch (err) {
    console.error('Supabase fetchPartners exception:', err);
    return null;
  }
};

export const savePartnerToSupabase = async (partner: Partner): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapPartnerToDb(partner);
    const { error } = await client.from('partners').upsert(row, { onConflict: 'code' });
    if (error) {
      console.error('Supabase savePartner error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase savePartner error:', err);
    return false;
  }
};

export const deletePartnerFromSupabase = async (partnerId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client.from('partners').delete().eq('id', partnerId);
    return true;
  } catch (err) {
    console.error('Supabase deletePartner error:', err);
    return false;
  }
};

// ====================================================================
// SERVICE API: EXPENSES (FINANCES)
// ====================================================================

export const fetchExpensesFromSupabase = async (): Promise<Expense[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('expenses').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchExpenses warning:', error.message);
      return null;
    }
    return (data || []).map(mapExpenseFromDb);
  } catch (err) {
    console.error('Supabase fetchExpenses exception:', err);
    return null;
  }
};

export const saveExpenseToSupabase = async (expense: Expense): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapExpenseToDb(expense);
    const { error } = await client.from('expenses').upsert(row, { onConflict: 'id' });
    if (error) {
      console.error('Supabase saveExpense error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase saveExpense error:', err);
    return false;
  }
};

export const deleteExpenseFromSupabase = async (expenseId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    await client.from('expenses').delete().eq('id', expenseId);
    return true;
  } catch (err) {
    console.error('Supabase deleteExpense error:', err);
    return false;
  }
};

// ====================================================================
// SERVICE API: VISITS
// ====================================================================

export const fetchVisitsFromSupabase = async (): Promise<Visit[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('daily_visits').select('*').order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetchVisits warning:', error.message);
      return null;
    }
    return (data || []).map(mapVisitFromDb);
  } catch (err) {
    console.error('Supabase fetchVisits error:', err);
    return null;
  }
};

export const saveVisitToSupabase = async (visit: Visit): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const row = mapVisitToDb(visit);
    const { error } = await client.from('daily_visits').upsert(row, { onConflict: 'id' });
    return !error;
  } catch (err) {
    console.error('Supabase saveVisit error:', err);
    return false;
  }
};

// ====================================================================
// SERVICE API: COMPANY SETTINGS
// ====================================================================

export const fetchCompanySettingsFromSupabase = async (): Promise<CompanySettings | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('company_settings').select('*').limit(1).maybeSingle();
    if (error || !data) return null;
    return data.settings as CompanySettings;
  } catch (err) {
    return null;
  }
};

export const saveCompanySettingsToSupabase = async (settings: CompanySettings): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('company_settings').upsert({
      id: 'default',
      settings,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    return !error;
  } catch (err) {
    return false;
  }
};

// ====================================================================
// SUPABASE REALTIME SUBSCRIPTION
// Listens to multi-user database events across all connected clients
// ====================================================================

export interface RealtimeChangePayload {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
}

export const subscribeToSupabaseRealtime = (
  onEvent: (payload: RealtimeChangePayload) => void,
  onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void
) => {
  const client = getSupabaseClient();
  if (!client) {
    onStatusChange?.('disconnected');
    return () => {};
  }

  onStatusChange?.('connecting');

  const channel = client
    .channel('whieda_realtime_sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload: any) => {
        onEvent({
          table: payload.table,
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onStatusChange?.('connected');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        onStatusChange?.('error');
      } else if (status === 'CLOSED') {
        onStatusChange?.('disconnected');
      }
    });

  return () => {
    client.removeChannel(channel);
  };
};
