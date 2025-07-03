"use server";

import { supabase } from "@/lib/supabaseClient";

export interface Customer {
  id: string;
  phone: string;
  height: number;
  weight: number;
  body_shape: string;
  skin_tone: string;
  gender: string;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  return error;
}

export async function getCustomers({
  searchQuery,
  page,
  pageSize,
}: {
  searchQuery: string;
  page: number;
  pageSize: number;
}) {
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("id", { ascending: true });
  if (searchQuery.trim()) {
    query = query.or(
      `phone.ilike.%${searchQuery}%,body_shape.ilike.%${searchQuery}%,skin_tone.ilike.%${searchQuery}%,gender.ilike.%${searchQuery}%`
    );
  }

  const { count } = await query.range(0, 0);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await query.range(from, to);

  return { data: data as Customer[], count, error };
}

export async function getAllCustomers() {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return { count, error };
}
