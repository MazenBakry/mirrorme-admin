"use server";

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

// Fetch product stats: total count, unique categories, average price, gender distribution
export async function getProductStats() {
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { data: catData } = await supabase.from("products").select("category");
  const uniqueCategories = catData
    ? Array.from(new Set(catData.map((p: any) => p.category)))
    : [];

  const { data: priceData } = await supabase.from("products").select("price");
  let averagePrice = null;
  if (priceData && priceData.length > 0) {
    const avg =
      priceData.reduce((sum: number, p: any) => sum + (p.price || 0), 0) /
      priceData.length;
    averagePrice = Number(avg.toFixed(2));
  }

  const { data: genderData } = await supabase.from("products").select("gender");
  const genderStats: { [key: string]: number } = {};
  if (genderData) {
    genderData.forEach((p: any) => {
      if (p.gender) {
        genderStats[p.gender] = (genderStats[p.gender] || 0) + 1;
      }
    });
  }

  return {
    totalProducts: count ?? 0,
    totalCategories: uniqueCategories.length,
    averagePrice,
    genderStats,
    uniqueCategories,
  };
}

// Fetch paginated products with search
export async function getPaginatedProducts({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("id", { ascending: true });
  if (search && search.trim()) {
    query = query.or(
      `name.ilike.%${search}%,category.ilike.%${search}%,gender.ilike.%${search}%`
    );
  }
  // Fetch total count for pagination
  const { count } = await query.range(0, 0);
  // Fetch products for current page
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await query.range(from, to);
  return { data, count: count ?? 0, error };
}

// Delete a product by ID
export async function deleteProductById({
  id,
  ml_id,
}: {
  id: string;
  ml_id: number;
}) {
  // External API deletion should be handled in the client or a separate server action if needed
  const { error } = await supabase.from("products").delete().eq("id", id);
  return { error };
}

// Get last ml_id
export async function getLastMlId() {
  const { data, error } = await supabase
    .from("products")
    .select("ml_id")
    .order("ml_id", { ascending: false })
    .limit(1);
  if (!error && data && data.length > 0) {
    return { mlId: (data[0].ml_id ?? 0) + 1 };
  } else {
    return { mlId: 1 };
  }
}

// Upload image to Supabase Storage and return public URL
export async function uploadProductImage({
  file,
  fileName,
}: {
  file: File;
  fileName: string;
}) {
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file);
  if (uploadError) {
    return { error: uploadError.message };
  }
  const { data: publicUrlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName);
  return { publicUrl: publicUrlData.publicUrl };
}

// Insert a new product
export async function insertProduct({
  name,
  image_url,
  price,
  category,
  gender,
  ml_id,
}: {
  name: string;
  image_url: string;
  price: number;
  category: string;
  gender: string;
  ml_id: number;
}) {
  const { error } = await supabase
    .from("products")
    .insert([{ name, image_url, price, category, gender, ml_id }]);
  return { error };
}

// Update a product
export async function updateProduct({
  id,
  name,
  image_url,
  price,
  category,
  gender,
}: {
  id: string;
  name: string;
  image_url: string;
  price: number;
  category: string;
  gender: string;
}) {
  const { error } = await supabase
    .from("products")
    .update({ name, image_url, price, category, gender })
    .eq("id", id);
  return { error };
}
