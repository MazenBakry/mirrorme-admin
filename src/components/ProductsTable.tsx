"use client";
import React, { useEffect, useState } from "react";
import {
  getPaginatedProducts,
  deleteProductById,
  uploadProductImage,
  updateProduct,
} from "@/actions/products";
import EditProductModal from "./EditProductModal";

import { Product } from "../types/product";

interface ProductsTableProps {
  categories: string[];
  setCategories: (c: string[]) => void;
  catLoading: boolean;
}

export default function ProductsTable({
  categories,
  setCategories,
  catLoading,
}: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const pageSize = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      const { data, count, error } = await getPaginatedProducts({
        page,
        pageSize,
        search: debouncedSearch,
      });
      setTotalCount(count);
      if (error) {
        setError(error.message);
      } else {
        setProducts((data as Product[]) || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [page, debouncedSearch]);

  const handleDelete = async (id: string, ml_id: number) => {
    setDeleting(true);
    // External API deletion should be handled here if needed
    const { error } = await deleteProductById({ id, ml_id });
    setDeleting(false);
    setPendingDelete(null);
    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => prev - 1);
      setDeleteSuccess("Product deleted successfully!");
      setTimeout(() => setDeleteSuccess(null), 1200);
    } else {
      alert("Failed to delete product: " + error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowEditModal(true);
  };

  const handleEditSave = async (updated: Product, imageFile?: File) => {
    let imageUrl = updated.image_url;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `product_${Date.now()}.${fileExt}`;
      const { publicUrl, error: uploadError } = await uploadProductImage({
        file: imageFile,
        fileName,
      });
      if (uploadError) {
        alert("Image upload failed: " + uploadError);
        return;
      }
      imageUrl = publicUrl;
    }
    const { error } = await updateProduct({
      id: updated.id,
      name: updated.name,
      image_url: imageUrl,
      price: updated.price,
      category: updated.category,
      gender: updated.gender,
    });
    if (!error) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === updated.id ? { ...updated, image_url: imageUrl } : p
        )
      );
      setShowEditModal(false);
      setEditProduct(null);
    } else {
      alert("Failed to update product: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Helper to generate page numbers with ellipsis
  function getPageNumbers(current: number, total: number) {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(total - 1, current + delta);
      i++
    ) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift("...");
    if (current + delta < total - 1) range.push("...");
    range.unshift(1);
    if (total > 1) range.push(total);
    return Array.from(new Set(range));
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  if (loading) {
    return <div className="p-4 text-white">Loading products...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }
  return (
    <div>
      {/* Modern Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gradient-to-br from-[#22161b] to-[#271b20] p-6 rounded-xl shadow-2xl w-full max-w-sm flex flex-col gap-4 border border-[#39282e] animate-fadeIn">
            <h2 className="text-white text-lg font-extrabold mb-1 tracking-tight text-center pb-1 border-b border-[#39282e]">
              Delete Product
            </h2>
            <p className="text-[#ba9ca7] text-center">
              Are you sure you want to delete this product?
            </p>
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-white">
                ID: {pendingDelete.id}
              </span>
              <img
                src={pendingDelete.image_url}
                alt={pendingDelete.name}
                className="w-24 h-24 object-cover rounded border border-[#543b44]"
              />
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <button
                className="px-4 py-2 rounded-lg bg-[#39282e] text-white font-semibold hover:bg-[#543b44] transition border border-[#543b44]"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
                onClick={() =>
                  handleDelete(pendingDelete.id, pendingDelete.ml_id)
                }
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-60 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#22161b] to-[#271b20] border border-[#39282e] rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 animate-fadeInUp relative min-w-[280px]">
            <button
              className="absolute top-2 right-2 text-[#b16cea] hover:text-[#ff5e69] text-xl font-bold focus:outline-none"
              onClick={() => setDeleteSuccess(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#b16cea] to-[#ff5e69] mb-2 shadow-lg">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="12" fill="none" />
                <path
                  d="M7 13l3 3 7-7"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-lg font-bold text-center text-white">
              Product Deleted!
            </div>
            <div className="text-[#b16cea] text-sm text-center font-medium">
              The product was deleted successfully.
            </div>
          </div>
        </div>
      )}
      {/* Search bar - modern UI */}
      <div className="flex items-center justify-between px-2 py-4 mb-8">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b16cea] pointer-events-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, category, gender, or ML ID..."
            className="w-full pl-10 pr-8 py-2 rounded-full bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] shadow transition-all duration-200 placeholder:text-[#ba9ca7] text-sm outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b16cea] hover:text-[#ff5e69] transition"
              aria-label="Clear search"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <table className="flex-1 min-w-full">
        <thead>
          <tr className="bg-[#271b20]">
            <th className="w-40 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Product ID
            </th>
            <th className="w-32 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Image
            </th>
            <th className="w-64 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Name
            </th>
            <th className="w-40 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Category
            </th>
            <th className="w-32 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Price
            </th>
            <th className="w-32 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Gender
            </th>
            <th className="w-32 px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-t-[#543b44]">
              <td className="h-[56px] px-4 py-2 w-40 text-white text-sm font-normal leading-normal">
                {product.id}
              </td>
              <td className="h-[56px] px-4 py-2 w-32">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-16 h-16 rounded"
                />
              </td>
              <td className="h-[56px] px-4 py-2 w-64 text-[#ba9ca7] text-sm font-normal leading-normal">
                {product.name}
              </td>
              <td className="h-[56px] px-4 py-2 w-40 text-[#ba9ca7] text-sm font-normal leading-normal">
                {product.category}
              </td>
              <td className="h-[56px] px-4 py-2 w-32 text-white text-sm font-normal leading-normal">
                {product.price}
              </td>
              <td className="h-[56px] px-4 py-2 w-32 text-white text-sm font-normal leading-normal">
                {product.gender}
              </td>
              <td className="h-[56px] px-4 py-2 w-32">
                <div className="flex items-center justify-center h-full gap-2">
                  <button
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white font-semibold text-xs hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-xs font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
                    onClick={() => setPendingDelete(product)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center mt-6">
        <nav className="flex gap-2 bg-[#22161b] rounded-xl px-4 py-2 shadow-lg">
          <button
            className="px-3 py-1 rounded-lg text-white bg-[#39282e] hover:bg-[#543b44] transition disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
          >
            &lt;
          </button>
          {pageNumbers.map((num, idx) =>
            typeof num === "number" ? (
              <button
                key={num}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  num === page
                    ? "bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white shadow-lg scale-105"
                    : "bg-[#39282e] text-white hover:bg-[#543b44]"
                }`}
                onClick={() => setPage(num)}
                disabled={num === page}
              >
                {num}
              </button>
            ) : (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-[#ba9ca7] select-none"
              >
                ...
              </span>
            )
          )}
          <button
            className="px-3 py-1 rounded-lg text-white bg-[#39282e] hover:bg-[#543b44] transition disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            aria-label="Next page"
          >
            &gt;
          </button>
        </nav>
      </div>
      {showEditModal && editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditProduct(null);
          }}
          onSave={handleEditSave}
          categories={categories}
          setCategories={setCategories}
          catLoading={catLoading}
        />
      )}
    </div>
  );
} 