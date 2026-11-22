'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  stockAdjustmentSchema,
  stockAdjustmentApproveSchema,
  stockAdjustmentRejectSchema,
  stockDecrementSchema,
  stockReturnSchema,
  stockTransferSchema,
  stockTransferSendSchema,
  stockTransferReceiveSchema,
} from '@/modules/inventory/schemas';
import type {
  StockAdjustmentInput,
  StockAdjustmentApproveInput,
  StockAdjustmentRejectInput,
  StockDecrementInput,
  StockReturnInput,
  StockTransferInput,
  StockTransferSendInput,
  StockTransferReceiveInput,
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

export async function createStockTransfer(input: StockTransferInput) {
  const validated = stockTransferSchema.parse(input);
  const supabase = await createServerClient();

  // Validasi cabang asal dan tujuan berbeda
  if (validated.branch_id === validated.destination_branch_id) {
    throw new Error('Cabang tujuan harus berbeda dari cabang asal.');
  }

  // Validasi stok mencukupi di cabang asal (BR-006: tidak boleh minus)
  for (const detail of validated.details) {
    const { data: balance, error: balanceError } = await supabase
      .from('stock_balances')
      .select('quantity')
      .eq('branch_id', validated.branch_id)
      .eq('product_id', detail.product_id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

    const available = balance?.quantity ?? 0;
    if (available < detail.quantity) {
      throw new Error(
        `Stok tidak cukup untuk ${detail.product_id}. Tersedia ${available} pcs, diminta ${detail.quantity} pcs.`
      );
    }
  }

  const { data: transfer, error: transferError } = await supabase
    .from('stock_transfers')
    .insert({
      branch_id: validated.branch_id,
      destination_branch_id: validated.destination_branch_id,
      status: 'draft',
      reference: validated.reference,
      notes: validated.notes,
    })
    .select()
    .single();

  if (transferError) throw new Error(transferError.message);

  const detailsWithTransfer = validated.details.map((detail) => ({
    transfer_id: transfer.id,
    product_id: detail.product_id,
    quantity: detail.quantity,
    batch_no: detail.batch_no ?? null,
    expiry_date: detail.expiry_date ?? null,
  }));

  const { error: detailsError } = await supabase
    .from('stock_transfer_details')
    .insert(detailsWithTransfer);

  if (detailsError) throw new Error(detailsError.message);

  return transfer;
}

export async function sendStockTransfer(input: StockTransferSendInput) {
  const validated = stockTransferSendSchema.parse(input);
  const supabase = await createServerClient();

  // Ambil transfer dengan cek status draft
  const { data: transfer, error: transferError } = await supabase
    .from('stock_transfers')
    .select('*, stock_transfer_details(*)')
    .eq('id', validated.transfer_id)
    .eq('status', 'draft')
    .single();

  if (transferError) throw new Error('Transfer tidak ditemukan atau belum dalam status draft.');

  // Kurangi stok asal per detail
  for (const detail of transfer.stock_transfer_details) {
    // Kurangi saldo stok asal
    const { data: balance, error: balanceError } = await supabase
      .from('stock_balances')
      .select('quantity')
      .eq('branch_id', transfer.branch_id)
      .eq('product_id', detail.product_id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

    const available = balance?.quantity ?? 0;
    if (available < detail.quantity) {
      throw new Error(
        `Stok tidak cukup untuk produk ${detail.product_id}. Tersedia ${available} pcs, diminta ${detail.quantity} pcs.`
      );
    }

    await supabase
      .from('stock_balances')
      .update({ quantity: available - detail.quantity, updated_at: new Date().toISOString() })
      .eq('branch_id', transfer.branch_id)
      .eq('product_id', detail.product_id);

    // Kurangi batch FEFO di cabang asal (jika batch tersedia)
    if (detail.batch_no) {
      const { data: batch } = await supabase
        .from('stock_batches')
        .select('id, quantity')
        .eq('branch_id', transfer.branch_id)
        .eq('product_id', detail.product_id)
        .eq('batch_no', detail.batch_no)
        .single();

      if (batch) {
        await supabase
          .from('stock_batches')
          .update({ quantity: batch.quantity - detail.quantity, updated_at: new Date().toISOString() })
          .eq('id', batch.id);
      }
    }

    // Catat mutasi out
    let batchIdOut: string | null = null;
    if (detail.batch_no) {
      const { data: batchRow } = await supabase
        .from('stock_batches')
        .select('id')
        .eq('branch_id', transfer.branch_id)
        .eq('product_id', detail.product_id)
        .eq('batch_no', detail.batch_no)
        .single();
      batchIdOut = batchRow?.id ?? null;
    }

    await supabase.from('stock_mutations').insert({
      branch_id: transfer.branch_id,
      product_id: detail.product_id,
      batch_id: batchIdOut,
      mutation_type: 'out',
      quantity: -detail.quantity,
      reference: `TRF-KIRIM-${transfer.reference}`,
    });
  }

  const { data: updated, error: updateError } = await supabase
    .from('stock_transfers')
    .update({ status: 'dikirim', updated_at: new Date().toISOString() })
    .eq('id', validated.transfer_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
}

export async function receiveStockTransfer(input: StockTransferReceiveInput) {
  const validated = stockTransferReceiveSchema.parse(input);
  const supabase = await createServerClient();

  // Ambil transfer dengan status dikirim
  const { data: transfer, error: transferError } = await supabase
    .from('stock_transfers')
    .select('*, stock_transfer_details(*)')
    .eq('id', validated.transfer_id)
    .eq('status', 'dikirim')
    .single();

  if (transferError) throw new Error('Transfer tidak ditemukan atau belum dalam status dikirim.');

  // Tambah stok tujuan per detail
  for (const detail of transfer.stock_transfer_details) {
    // Tambah saldo stok tujuan
    const { data: balance, error: balanceError } = await supabase
      .from('stock_balances')
      .select('quantity')
      .eq('branch_id', transfer.destination_branch_id)
      .eq('product_id', detail.product_id)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

    const newQuantity = (balance?.quantity ?? 0) + detail.quantity;

    await supabase
      .from('stock_balances')
      .upsert(
        {
          branch_id: transfer.destination_branch_id,
          product_id: detail.product_id,
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'branch_id, product_id' }
      );

    // Tambah batch di cabang tujuan
    if (detail.batch_no) {
      const { data: existingBatch } = await supabase
        .from('stock_batches')
        .select('id, quantity')
        .eq('branch_id', transfer.destination_branch_id)
        .eq('product_id', detail.product_id)
        .eq('batch_no', detail.batch_no)
        .single();

      if (existingBatch) {
        await supabase
          .from('stock_batches')
          .update({ quantity: existingBatch.quantity + detail.quantity, updated_at: new Date().toISOString() })
          .eq('id', existingBatch.id);
      } else {
        await supabase.from('stock_batches').insert({
          branch_id: transfer.destination_branch_id,
          product_id: detail.product_id,
          batch_no: detail.batch_no,
          expiry_date: detail.expiry_date ?? null,
          quantity: detail.quantity,
        });
      }
    }

    // Catat mutasi in di cabang tujuan
    let batchIdIn: string | null = null;
    if (detail.batch_no) {
      const { data: batchRow } = await supabase
        .from('stock_batches')
        .select('id')
        .eq('branch_id', transfer.destination_branch_id)
        .eq('product_id', detail.product_id)
        .eq('batch_no', detail.batch_no)
        .single();
      batchIdIn = batchRow?.id ?? null;
    }

    await supabase.from('stock_mutations').insert({
      branch_id: transfer.destination_branch_id,
      product_id: detail.product_id,
      batch_id: batchIdIn,
      mutation_type: 'in',
      quantity: detail.quantity,
      reference: `TRF-TERIMA-${transfer.reference}`,
    });
  }

  const { data: updated, error: updateError } = await supabase
    .from('stock_transfers')
    .update({
      status: 'diterima',
      checked_by: validated.checked_by ?? null,
      checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', validated.transfer_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
}

export async function cancelStockTransfer(input: StockTransferSendInput) {
  const validated = stockTransferSendSchema.parse(input);
  const supabase = await createServerClient();

  const { data: transfer } = await supabase
    .from('stock_transfers')
    .select('*')
    .eq('id', validated.transfer_id)
    .in('status', ['draft', 'dikirim'])
    .single();

  if (!transfer) throw new Error('Transfer tidak ditemukan atau tidak dapat dibatalkan.');

  // Jika sudah dikirim, kembalikan stok yang dikurangi
  if (transfer.status === 'dikirim') {
    const { data: details } = await supabase
      .from('stock_transfer_details')
      .select('*')
      .eq('transfer_id', validated.transfer_id);

    for (const detail of details ?? []) {
      const { data: balance } = await supabase
        .from('stock_balances')
        .select('quantity')
        .eq('branch_id', transfer.branch_id)
        .eq('product_id', detail.product_id)
        .single();

      const newQuantity = (balance?.quantity ?? 0) + detail.quantity;
      await supabase
        .from('stock_balances')
        .upsert(
          {
            branch_id: transfer.branch_id,
            product_id: detail.product_id,
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'branch_id, product_id' }
        );
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('stock_transfers')
    .update({ status: 'dibatalkan', updated_at: new Date().toISOString() })
    .eq('id', validated.transfer_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
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

export async function createStockAdjustment(input: StockAdjustmentInput) {
  const validated = stockAdjustmentSchema.parse(input);
  const supabase = await createServerClient();

  const { data: adjustment, error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .insert({
      branch_id: validated.branch_id,
      product_id: validated.product_id,
      type: validated.type,
      quantity: validated.quantity,
      reason: validated.reason,
      status: 'draft',
    })
    .select()
    .single();

  if (adjustmentError) throw new Error(adjustmentError.message);

  return adjustment;
}

export async function requestApprovalStockAdjustment(input: StockAdjustmentApproveInput) {
  const validated = stockAdjustmentApproveSchema.parse(input);
  const supabase = await createServerClient();

  const { data: adjustment, error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .select('*')
    .eq('id', validated.adjustment_id)
    .eq('status', 'draft')
    .single();

  if (adjustmentError) throw new Error('Penyesuaian tidak ditemukan atau bukan dalam status draft.');

  const { data: updated, error: updateError } = await supabase
    .from('stock_adjustments')
    .update({ status: 'approval', updated_at: new Date().toISOString() })
    .eq('id', validated.adjustment_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
}

export async function approveStockAdjustment(input: StockAdjustmentApproveInput) {
  const validated = stockAdjustmentApproveSchema.parse(input);
  const supabase = await createServerClient();

  const { data: adjustment, error: adjustmentError } = await supabase
    .from('stock_adjustments')
    .select('*')
    .eq('id', validated.adjustment_id)
    .eq('status', 'approval')
    .single();

  if (adjustmentError) throw new Error('Penyesuaian tidak ditemukan atau belum dalam status approval.');

  // Hitung saldo baru berdasarkan type
  const { data: balance, error: balanceError } = await supabase
    .from('stock_balances')
    .select('quantity')
    .eq('branch_id', adjustment.branch_id)
    .eq('product_id', adjustment.product_id)
    .single();

  if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

  const currentQty = balance?.quantity ?? 0;
  let newQty = currentQty;

  if (adjustment.type === 'add') {
    newQty = currentQty + adjustment.quantity;
  } else if (adjustment.type === 'subtract') {
    newQty = currentQty - adjustment.quantity;
    if (newQty < 0) {
      throw new Error(
        `Stok tidak cukup. Tersedia ${currentQty} pcs, penyesuaian mengurangi ${adjustment.quantity} pcs (akan menjadi minus).`
      );
    }
  } else if (adjustment.type === 'set') {
    newQty = adjustment.quantity;
  }

  // Upsert saldo stok (BR-006: constraint quantity >= 0 juga memastikan tidak minus)
  const { data: upserted, error: upsertError } = await supabase
    .from('stock_balances')
    .upsert(
      {
        branch_id: adjustment.branch_id,
        product_id: adjustment.product_id,
        quantity: newQty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'branch_id, product_id' }
    )
    .select()
    .single();

  if (upsertError) throw new Error(upsertError.message);

  // Catat mutasi adjustment
  const mutationQty =
    adjustment.type === 'subtract' ? -adjustment.quantity : adjustment.quantity;
  const { error: mutationError } = await supabase.from('stock_mutations').insert({
    branch_id: adjustment.branch_id,
    product_id: adjustment.product_id,
    mutation_type: 'adjustment',
    quantity: mutationQty,
    reference: `ADJUST-${adjustment.id}`,
  });

  if (mutationError) throw new Error(mutationError.message);

  const { data: updated, error: updateError } = await supabase
    .from('stock_adjustments')
    .update({
      status: 'approved',
      approved_by: validated.approved_by ?? null,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', validated.adjustment_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
}

export async function rejectStockAdjustment(input: StockAdjustmentRejectInput) {
  const validated = stockAdjustmentRejectSchema.parse(input);
  const supabase = await createServerClient();

  const { data: adjustment } = await supabase
    .from('stock_adjustments')
    .select('*')
    .eq('id', validated.adjustment_id)
    .in('status', ['draft', 'approval'])
    .single();

  if (!adjustment) throw new Error('Penyesuaian tidak ditemukan atau tidak dapat ditolak.');

  const { data: updated, error: updateError } = await supabase
    .from('stock_adjustments')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', validated.adjustment_id)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);

  return updated;
}
