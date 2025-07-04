"use client";
import React, { useState } from "react";

import { Product } from "../types/product";

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (p: Product, imageFile?: File) => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  catLoading: boolean;
}

export default function EditProductModal({
  product,
  onClose,
  onSave,
  categories,
  setCategories,
  catLoading,
}: EditProductModalProps) {
  const normalizeGender = (gender: string) => {
    if (!gender) return "";
    const g = gender.trim().toLowerCase();
    if (g === "male") return "Male";
    if (g === "female") return "Female";
    return "";
  };
  const [form, setForm] = useState({
    ...product,
    gender: normalizeGender(product.gender),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.image_url || null
  );
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (
      e.target.name === "image_file" &&
      e.target instanceof HTMLInputElement &&
      e.target.files
    ) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else if (e.target.name === "category") {
      if (e.target.value === "__add_new__") {
        setShowNewCategoryInput(true);
        setForm({ ...form, category: "" });
      } else {
        setShowNewCategoryInput(false);
        setForm({ ...form, category: e.target.value });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          ...form,
          price: parseFloat(String(form.price)),
        },
        imageFile || undefined
      );
      if (
        showNewCategoryInput &&
        newCategory.trim() &&
        !categories.includes(newCategory.trim())
      ) {
        setCategories([newCategory.trim(), ...categories]);
      }
      setSuccess("Product edited successfully!");
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[#22161b] to-[#271b20] p-4 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#39282e] relative animate-fadeIn"
        style={{ minWidth: 260 }}
      >
        <h2 className="text-white text-lg font-extrabold mb-1 tracking-tight text-center pb-1 border-b border-[#39282e]">
          Edit Product
        </h2>
        {/* Name */}
        <div className="relative">
          <input
            name="name"
            id="edit-name"
            value={form.name}
            onChange={handleChange}
            className="block w-full px-3 pt-5 pb-1 text-base bg-[#39282e] text-white rounded-lg border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all peer placeholder-transparent"
            placeholder="Name"
            required
          />
          <label
            htmlFor="edit-name"
            className="absolute left-3 top-1 text-[#b16cea] text-xs font-semibold pointer-events-none transition-all peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-[#b16cea] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#ba9ca7]"
          >
            Name
          </label>
        </div>
        {/* Image File */}
        <div className="relative flex flex-col gap-2">
          <label
            htmlFor="edit-image-file"
            className="text-[#b16cea] text-xs font-semibold"
          >
            Product Image
          </label>
          <input
            name="image_file"
            id="edit-image-file"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#b16cea] file:to-[#ff5e69] file:text-white hover:file:from-[#a259c6] hover:file:to-[#ff7e8a]"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded border border-[#543b44] mt-2 mx-auto"
            />
          )}
        </div>
        {/* Price */}
        <div className="relative">
          <input
            name="price"
            id="edit-price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="block w-full px-3 pt-5 pb-1 text-base bg-[#39282e] text-white rounded-lg border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all peer placeholder-transparent"
            placeholder="Price"
            required
          />
          <label
            htmlFor="edit-price"
            className="absolute left-3 top-1 text-[#b16cea] text-xs font-semibold pointer-events-none transition-all peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-[#b16cea] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#ba9ca7]"
          >
            Price
          </label>
        </div>
        {/* Category select box - modern UI */}
        <div className="relative">
          <select
            name="category"
            id="edit-category"
            value={showNewCategoryInput ? "__add_new__" : form.category}
            onChange={handleChange}
            className="appearance-none w-full px-3 pt-5 pb-1 text-base rounded-lg bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] shadow transition-all duration-200 pr-8 hover:border-[#b16cea] peer"
            required={!showNewCategoryInput}
            disabled={catLoading}
          >
            <option value="" disabled>
              {catLoading ? "Loading categories..." : "Select a category"}
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__add_new__">+ Add new category</option>
          </select>
          <label
            htmlFor="edit-category"
            className="absolute left-3 top-1 text-[#b16cea] text-xs font-semibold pointer-events-none transition-all peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-[#b16cea] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#ba9ca7]"
          >
            Category
          </label>
          {/* Custom arrow */}
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#b16cea]">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {showNewCategoryInput && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] text-base outline-none"
                placeholder="Enter new category"
                required
              />
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white font-semibold text-xs hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow"
                onClick={() => {
                  if (
                    newCategory.trim() &&
                    !categories.includes(newCategory.trim())
                  ) {
                    setCategories([newCategory.trim(), ...categories]);
                    setForm({ ...form, category: newCategory.trim() });
                    setShowNewCategoryInput(false);
                  }
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>
        {/* Gender radio buttons - modern UI */}
        <div className="flex flex-col gap-1">
          <label className="mb-1 text-sm font-medium text-white">Gender</label>
          <div className="flex gap-2">
            {["Male", "Female"].map((option) => (
              <label
                key={option}
                className={`relative cursor-pointer select-none`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={form.gender === option}
                  onChange={handleChange}
                  className="sr-only peer"
                  required
                />
                <div
                  className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 border-2
                    ${
                      form.gender === option
                        ? option === "Male"
                          ? "bg-gradient-to-r from-[#b16cea] to-[#6ee2f5] border-[#b16cea] text-white shadow scale-105"
                          : "bg-gradient-to-r from-[#ff5e69] to-[#ffb86c] border-[#ff5e69] text-white shadow scale-105"
                        : "bg-[#39282e] border-[#543b44] text-[#ba9ca7] hover:bg-[#543b44]"
                    }
                  `}
                >
                  {option}
                </div>
              </label>
            ))}
          </div>
        </div>
        {error && (
          <div className="text-red-400 text-center bg-[#39282e] rounded-lg py-1 px-2 font-semibold shadow mt-1 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-60 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#22161b] to-[#271b20] border border-[#39282e] rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-3 animate-fadeInUp relative min-w-[280px]">
              <button
                className="absolute top-2 right-2 text-[#b16cea] hover:text-[#ff5e69] text-xl font-bold focus:outline-none"
                onClick={() => {
                  setSuccess(null);
                  onClose();
                }}
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
                Product Edited!
              </div>
              <div className="text-[#b16cea] text-sm text-center font-medium">
                Your changes were saved successfully.
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-base font-bold text-white transition border-none rounded-lg shadow bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white py-2 rounded-lg font-bold text-base hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow border-none"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
} 