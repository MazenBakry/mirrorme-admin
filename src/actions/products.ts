"use action";

import { supabase } from "@/lib/supabaseClient";

export async function getCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("category", { count: "exact" });

  return { data, error };
}

export async function getAllProducts() {
  const { count, error } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return { count, error };
}

export async function getProductsByCategory(id: string) {}
