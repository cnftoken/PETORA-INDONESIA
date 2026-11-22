import { createServerClient } from '@/lib/supabase/server';

export async function getCategories() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getProducts() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('sku', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getProductBySku(sku: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('sku', sku)
    .single();
  if (error) throw error;
  return data;
}

export async function getServices() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('services')
    .select('*, categories(name)')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getServiceById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('services')
    .select('*, categories(name)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPriceHistory({
  page = 1,
  pageSize = 20,
  itemType,
  itemId,
}: {
  page?: number;
  pageSize?: number;
  itemType?: 'product' | 'service';
  itemId?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('price_history')
    .select('*')
    .order('effective_from', { ascending: false });

  if (itemType) query = query.eq('item_type', itemType);
  if (itemId) query = query.eq('item_id', itemId);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
