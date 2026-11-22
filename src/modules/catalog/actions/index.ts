'use server';

import { createServerClient } from '@/lib/supabase/server';
import { categorySchema, productSchema, serviceSchema } from '@/modules/catalog/schemas';
import type {
  CategoryInput,
  ProductInput,
  ServiceInput,
} from '@/modules/catalog/schemas';

export async function createCategory(input: CategoryInput) {
  const validated = categorySchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const validated = categorySchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createProduct(input: ProductInput) {
  const validated = productSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const validated = productSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('products')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createService(input: ServiceInput) {
  const validated = serviceSchema.parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('services')
    .insert(validated)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateService(id: string, input: Partial<ServiceInput>) {
  const validated = serviceSchema.partial().parse(input);
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('services')
    .update(validated)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteService(id: string) {
  const supabase = await createServerClient();
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
