import { createServerClient } from '@/lib/supabase/server';

export async function getStockBalances({
  page = 1,
  pageSize = 50,
  branchId,
  productId,
  belowMin,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  productId?: string;
  belowMin?: boolean;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('stock_balances')
    .select('*, products(sku, name, min_stock, is_active)', { count: 'exact' })
    .order('products(sku)', { ascending: true });

  if (branchId) query = query.eq('branch_id', branchId);
  if (productId) query = query.eq('product_id', productId);
  if (belowMin) {
    query = query.lt('quantity', supabase.from('products').select('min_stock').eq('id', productId ?? '').single());
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getStockBatches({
  page = 1,
  pageSize = 50,
  branchId,
  productId,
  expired,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  productId?: string;
  expired?: boolean;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('stock_batches')
    .select('*, products(sku, name)', { count: 'exact' })
    .order('expiry_date', { ascending: true });

  if (branchId) query = query.eq('branch_id', branchId);
  if (productId) query = query.eq('product_id', productId);
  if (expired) {
    query = query.lt('expiry_date', new Date().toISOString().split('T')[0]);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getStockMutations({
  page = 1,
  pageSize = 50,
  branchId,
  productId,
  mutationType,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  productId?: string;
  mutationType?: 'in' | 'out' | 'adjustment' | 'return';
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('stock_mutations')
    .select('*, products(sku, name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);
  if (productId) query = query.eq('product_id', productId);
  if (mutationType) query = query.eq('mutation_type', mutationType);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getStockCard({
  branchId,
  productId,
  startDate,
  endDate,
}: {
  branchId?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('stock_mutations')
    .select('*, products(sku, name)', { count: 'exact' })
    .order('created_at', { ascending: true });

  if (branchId) query = query.eq('branch_id', branchId);
  if (productId) query = query.eq('product_id', productId);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getStockTransfers({
  page = 1,
  pageSize = 50,
  branchId,
  destinationBranchId,
  status,
}: {
  page?: number;
  pageSize?: number;
  branchId?: string;
  destinationBranchId?: string;
  status?: string;
} = {}) {
  const supabase = await createServerClient();
  let query = supabase
    .from('stock_transfers')
    .select('*, branches(code, name), destination_branch:branches(code, name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (branchId) query = query.eq('branch_id', branchId);
  if (destinationBranchId) query = query.eq('destination_branch_id', destinationBranchId);
  if (status) query = query.eq('status', status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

export async function getStockTransferById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('stock_transfers')
    .select('*, branches(code, name), destination_branch:branches(code, name), stock_transfer_details(*, products(sku, name))')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
