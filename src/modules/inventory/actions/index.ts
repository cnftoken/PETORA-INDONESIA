'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  stockAdjustmentSchema,
  stockDecrementSchema,
  stockReturnSchema,
} from '@/modules/inventory/schemas';
import type {
  StockAdjustmentInput,
  StockDecrementInput,
  StockReturnInput,
} from '@/modules/inventory/schemas';

export async function adjustStock(input: StockAdjustmentInput) {
  const validated = stockAdjustmentSchema.parse(input);
  const supabase = await createServerClient();

  // Cek saldo stok saat ini
  const { data: balance, error: balanceError } = await supabase
    .from('stock_balances')
    .select('*')
    .eq('branch_id', validated.branch_id)
    .eq('product_id', validated.product_id)
    .single();

  if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

  let newQuantity = balance?.quantity ?? 0;

  if (validated.type === 'add') {
    newQuantity += validated.quantity;
  } else if (validated.type === 'subtract') {
    newQuantity -= validated.quantity;
    if (newQuantity < 0) {
      throw new Error('Stok tidak cukup. Penyesuaian akan menyebabkan stok minus.');
    }
  } else if (validated.type === 'set') {
    newQuantity = validated.quantity;
  }

  // Upsert saldo stok
  const { data: upserted, error: upsertError } = await supabase
    .from('stock_balances')
    .upsert(
      {
        branch_id: validated.branch_id,
        product_id: validated.product_id,
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'branch_id, product_id' }
    )
    .select()
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Catat mutasi
  const { error: mutationError } = await supabase.from('stock_mutations').insert({
    branch_id: validated.branch_id,
    product_id: validated.product_id,
    mutation_type: 'adjustment',
    quantity:
      validated.type === 'subtract' ? -validated.quantity : validated.quantity,
    reference: `OPNAME-${validated.reason}`,
  });

  if (mutationError) throw new Error(mutationError.message);

  return upserted;
}

export async function decrementStock(input: StockDecrementInput) {
  const validated = stockDecrementSchema.parse(input);
  const supabase = await createServerClient();

  // Cek total saldo stok tersedia (BR-006: tidak boleh minus)
  const { data: balance, error: balanceError } = await supabase
    .from('stock_balances')
    .select('quantity')
    .eq('branch_id', validated.branch_id)
    .eq('product_id', validated.product_id)
    .single();

  if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

  const available = balance?.quantity ?? 0;
  if (available < validated.quantity) {
    throw new Error(
      `Stok tidak cukup. Tersedia ${available} pcs, diminta ${validated.quantity} pcs.`
    );
  }

  // Ambil batch urut FEFO (kedaluwarsa terdekat dulu) untuk pengurangan
  const { data: batches, error: batchesError } = await supabase
    .from('stock_batches')
    .select('id, quantity, expiry_date')
    .eq('branch_id', validated.branch_id)
    .eq('product_id', validated.product_id)
    .gt('quantity', 0)
    .order('expiry_date', { ascending: true });

  if (batchesError) throw batchesError;

  let remaining = validated.quantity;
  const batchUpdates: { id: string; quantity: number }[] = [];

  for (const batch of batches ?? []) {
    if (remaining <= 0) break;
    const take = Math.min(batch.quantity, remaining);
    batchUpdates.push({ id: batch.id, quantity: batch.quantity - take });
    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error(
      'Stok batch tidak mencukupi meski saldo mencukupi. Silakan periksa batch kedaluwarsa.'
    );
  }

  // Kurangi saldo stok
  const newQuantity = available - validated.quantity;
  const { data: updatedBalance, error: balanceUpdateError } = await supabase
    .from('stock_balances')
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('branch_id', validated.branch_id)
    .eq('product_id', validated.product_id)
    .select()
    .single();

  if (balanceUpdateError) throw new Error(balanceUpdateError.message);

  // Kurangi quantity batch (FEFO)
  for (const bu of batchUpdates) {
    const { error: batchError } = await supabase
      .from('stock_batches')
      .update({ quantity: bu.quantity, updated_at: new Date().toISOString() })
      .eq('id', bu.id);
    if (batchError) throw new Error(batchError.message);
  }

  // Catat mutasi out
  const { error: mutationError } = await supabase.from('stock_mutations').insert({
    branch_id: validated.branch_id,
    product_id: validated.product_id,
    mutation_type: 'out',
    quantity: -validated.quantity,
    reference: `${validated.reference_type.toUpperCase()}-${validated.reference}`,
  });

  if (mutationError) throw new Error(mutationError.message);

  return updatedBalance;
}

export async function returnStock(input: StockReturnInput) {
  const validated = stockReturnSchema.parse(input);
  const supabase = await createServerClient();

  // Tambah saldo stok (retur mengembalikan stok)
  const { data: balance, error: balanceError } = await supabase
    .from('stock_balances')
    .select('quantity')
    .eq('branch_id', validated.branch_id)
    .eq('product_id', validated.product_id)
    .single();

  if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

  const newQuantity = (balance?.quantity ?? 0) + validated.quantity;

  const { data: upserted, error: upsertError } = await supabase
    .from('stock_balances')
    .upsert(
      {
        branch_id: validated.branch_id,
        product_id: validated.product_id,
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'branch_id, product_id' }
    )
    .select()
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Catat mutasi return
  const { error: mutationError } = await supabase.from('stock_mutations').insert({
    branch_id: validated.branch_id,
    product_id: validated.product_id,
    mutation_type: 'return',
    quantity: validated.quantity,
    reference: `RETUR-${validated.reference}`,
  });

  if (mutationError) throw new Error(mutationError.message);

  return upserted;
}

export async function receiveStock(input: {
  branch_id: string;
  product_id: string;
  quantity: number;
  batch_no: string;
  expiry_date: string;
  reference: string;
}) {
  const supabase = await createServerClient();

  // Tambah atau buat batch
  const { data: existingBatch } = await supabase
    .from('stock_batches')
    .select('id, quantity')
    .eq('branch_id', input.branch_id)
    .eq('product_id', input.product_id)
    .eq('batch_no', input.batch_no)
    .single();

  if (existingBatch) {
    await supabase
      .from('stock_batches')
      .update({ quantity: existingBatch.quantity + input.quantity, updated_at: new Date().toISOString() })
      .eq('id', existingBatch.id);
  } else {
    await supabase.from('stock_batches').insert({
      branch_id: input.branch_id,
      product_id: input.product_id,
      batch_no: input.batch_no,
      expiry_date: input.expiry_date,
      quantity: input.quantity,
    });
  }

  // Tambah saldo stok
  const { data: balance } = await supabase
    .from('stock_balances')
    .select('quantity')
    .eq('branch_id', input.branch_id)
    .eq('product_id', input.product_id)
    .single();

  const newQuantity = (balance?.quantity ?? 0) + input.quantity;

  await supabase.from('stock_balances').upsert(
    {
      branch_id: input.branch_id,
      product_id: input.product_id,
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'branch_id, product_id' }
  );

  // Catat mutasi in
  const { data: batch } = await supabase
    .from('stock_batches')
    .select('id')
    .eq('branch_id', input.branch_id)
    .eq('product_id', input.product_id)
    .eq('batch_no', input.batch_no)
    .single();

  const { error: mutationError } = await supabase.from('stock_mutations').insert({
    branch_id: input.branch_id,
    product_id: input.product_id,
    batch_id: batch?.id ?? null,
    mutation_type: 'in',
    quantity: input.quantity,
    reference: `TERIMA-${input.reference}`,
  });

  if (mutationError) throw new Error(mutationError.message);

  return { success: true, newQuantity };
}
