'use server';

import { createServerClient } from '@/lib/supabase/server';
import {
  visitSchema,
  visitQueueSchema,
  examinationSchema,
  prescriptionSchema,
  invoiceSchema,
  invoiceLineSchema,
} from '@/modules/clinic/schemas';
import type {
  VisitInput,
  VisitQueueInput,
  ExaminationInput,
  PrescriptionInput,
  InvoiceInput,
  InvoiceLineInput,
} from '@/modules/clinic/schemas';

export async function createVisit(input: VisitInput) {
  const validated = visitSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visits')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVisit(id: string, input: Partial<VisitInput>) {
  const validated = visitSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visits')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVisit(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('visits').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createVisitQueue(input: VisitQueueInput) {
  const validated = visitQueueSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visit_queue')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateVisitQueue(id: string, input: Partial<VisitQueueInput>) {
  const validated = visitQueueSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('visit_queue')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createExamination(input: ExaminationInput) {
  const validated = examinationSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('examinations')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateExamination(id: string, input: Partial<ExaminationInput>) {
  const validated = examinationSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('examinations')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPrescription(input: PrescriptionInput) {
  const validated = prescriptionSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePrescription(id: string, input: Partial<PrescriptionInput>) {
  const validated = prescriptionSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('prescriptions')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createInvoice(input: InvoiceInput) {
  const validated = invoiceSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoices')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInvoice(id: string, input: Partial<InvoiceInput>) {
  const validated = invoiceSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoices')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createInvoiceLine(input: InvoiceLineInput) {
  const validated = invoiceLineSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoice_lines')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInvoiceLine(id: string, input: Partial<InvoiceLineInput>) {
  const validated = invoiceLineSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('invoice_lines')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
