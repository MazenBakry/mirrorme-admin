"use client";
import React, { useEffect, useState } from "react";
import SidebarLink from "../../components/SidebarLink";
import StatCard from "../../components/StatCard";
import {
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  ListBulletsIcon,
} from "../../components/Icons";
import { useRouter } from "next/navigation";
import {
  getProductStats,
  getPaginatedProducts,
  deleteProductById,
  getLastMlId,
  uploadProductImage,
  insertProduct,
  updateProduct,
  addProductToModels,
} from "@/actions/products";

// Define a Product type based on expected fields from your products table
interface Product {
  id: string;
  name: string;
  image_url: string | undefined;
  price: number;
  category: string;
  gender: string;
  object_url: string;
  ml_id: number;
}

export default function InventoryPage() {
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [totalCategories, setTotalCategories] = useState<number | null>(null);
  const [averagePrice, setAveragePrice] = useState<number | null>(null);
  const [genderStats, setGenderStats] = useState<{ [key: string]: number }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  // Categories state for both Add and Edit modals
  const [categories, setCategories] = useState<string[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("admin_logged_in") !== "true"
    ) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      setCatLoading(true);
      const stats = await getProductStats();
      setTotalProducts(stats.totalProducts);
      setTotalCategories(stats.totalCategories);
      setAveragePrice(stats.averagePrice);
      setGenderStats(stats.genderStats);
      setCategories(stats.uniqueCategories);
      setCatLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#181114] dark group/design-root overflow-x-hidden font-sans">
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex justify-center flex-1 gap-1 px-6 py-5">
          {/* Sidebar */}
          <aside className="flex flex-col w-80 layout-content-container">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-[#181114] p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-base font-medium leading-normal text-white">
                  Store Admin
                </h1>
                <nav className="flex flex-col gap-2">
                  <SidebarLink icon={HomeIcon} label="Dashboard" href="/" />
                  <SidebarLink
                    icon={PackageIcon}
                    label="Inventory"
                    href="/Inventory"
                    active
                  />
                  <SidebarLink
                    icon={ReceiptIcon}
                    label="Orders"
                    href="/orders"
                  />
                  <SidebarLink
                    icon={UsersIcon}
                    label="Customers"
                    href="/customers"
                  />
                  <SidebarLink
                    icon={ListBulletsIcon}
                    label="Categories"
                    href="/categories"
                  />
                </nav>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                Inventory
              </p>
              <button
                className="bg-[#39282e] text-white px-6 py-2 rounded-xl font-medium text-base hover:bg-[#543b44] transition"
                onClick={() => setShowAddModal(true)}
              >
                Add Product
              </button>
            </div>
            {showAddModal && (
              <AddProductModal
                onClose={() => setShowAddModal(false)}
                categories={categories}
                setCategories={setCategories}
                catLoading={catLoading}
              />
            )}
            <div className="flex flex-wrap gap-4 p-4">
              <StatCard
                label="Total Products"
                value={
                  totalProducts !== null ? totalProducts.toString() : "..."
                }
              />
              <StatCard
                label="Total Categories"
                value={
                  totalCategories !== null ? totalCategories.toString() : "..."
                }
              />
              <StatCard
                label="Average Price"
                value={averagePrice !== null ? `$${averagePrice}` : "..."}
              />
              {Object.keys(genderStats).map((gender) => (
                <StatCard
                  key={gender}
                  label={`${
                    gender.charAt(0).toUpperCase() + gender.slice(1)
                  } Products`}
                  value={genderStats[gender].toString()}
                />
              ))}
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Product List
            </h2>
            <div className="px-4 py-3">
              <div className="flex overflow-x-auto rounded-xl border border-[#543b44] bg-[#181114]">
                <ProductsTable
                  categories={categories}
                  setCategories={setCategories}
                  catLoading={catLoading}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ProductsTable({
  categories,
  setCategories,
  catLoading,
}: {
  categories: string[];
  setCategories: (c: string[]) => void;
  catLoading: boolean;
}) {
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

function AddProductModal({
  onClose,
  categories,
  setCategories,
  catLoading,
}: {
  onClose: () => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  catLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: "",
    image_url: "",
    price: "",
    category: "",
    gender: "",
  });
  const [mlId, setMlId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Fetch the last ml_id when modal opens
  useEffect(() => {
    const fetchLastMlId = async () => {
      const { mlId } = await getLastMlId();
      setMlId(mlId);
    };
    fetchLastMlId();
  }, []);

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
    setLoading(true);
    setError(null);
    setSuccess(null);
    let imageUrl = form.image_url;
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `product_${Date.now()}.${fileExt}`;
      const { publicUrl, error: uploadError } = await uploadProductImage({
        file: imageFile,
        fileName,
      });
      if (uploadError) {
        setError("Image upload failed: " + uploadError);
        setLoading(false);
        return;
      }
      imageUrl = publicUrl as string;
    }

    // Use newCategory if provided
    const categoryToUse =
      showNewCategoryInput && newCategory.trim()
        ? newCategory.trim()
        : form.category;
    if (!imageFile || !mlId || !categoryToUse) {
      setError("Missing image, ml_id, or category.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const { error } = await insertProduct({
        name: form.name,
        image_url: imageUrl,
        price: parseFloat(form.price),
        category: categoryToUse,
        gender: form.gender,
        ml_id: mlId,
      });
      const data = new FormData();
      data.append("id", String(mlId));
      data.append("category", categoryToUse);
      data.append("image", imageFile);
      await addProductToModels(data);
      setLoading(false);
      if (error) {
        setError(error.message || "Failed to add product.");
      } else {
        if (
          showNewCategoryInput &&
          newCategory.trim() &&
          !categories.includes(newCategory.trim())
        ) {
          setCategories([newCategory.trim(), ...categories]);
        }
        setSuccess("Product added successfully!");
        setForm({
          name: "",
          image_url: "",
          price: "",
          category: "",
          gender: "",
        });
        setImageFile(null);
        setImagePreview(null);
        setNewCategory("");
        setShowNewCategoryInput(false);
        setTimeout(() => {
          setSuccess(null);
        }, 1200);
      }
    } catch (apiErr) {
      setError(
        (apiErr instanceof Error ? apiErr.message : String(apiErr)) ||
          "Failed to add product."
      );
      setLoading(false);
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-br from-[#22161b] to-[#271b20] p-4 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-4 border border-[#39282e] relative animate-fadeIn"
        style={{ minWidth: 260 }}
      >
        <h2 className="text-white text-lg font-extrabold mb-1 tracking-tight text-center pb-1 border-b border-[#39282e]">
          Add Product
        </h2>
        {/* Name */}
        <div className="relative">
          <input
            name="name"
            id="add-name"
            value={form.name}
            onChange={handleChange}
            className="block w-full px-3 pt-5 pb-1 text-base bg-[#39282e] text-white rounded-lg border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all peer placeholder-transparent"
            placeholder="Name"
            required
          />
          <label
            htmlFor="add-name"
            className="absolute left-3 top-1 text-[#b16cea] text-xs font-semibold pointer-events-none transition-all peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-[#b16cea] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#ba9ca7]"
          >
            Name
          </label>
        </div>
        {/* Image File */}
        <div className="relative flex flex-col gap-2">
          <label
            htmlFor="add-image-file"
            className="text-[#b16cea] text-xs font-semibold"
          >
            Product Image
          </label>
          <input
            name="image_file"
            id="add-image-file"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#b16cea] file:to-[#ff5e69] file:text-white hover:file:from-[#a259c6] hover:file:to-[#ff7e8a]"
            required
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
            id="add-price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className="block w-full px-3 pt-5 pb-1 text-base bg-[#39282e] text-white rounded-lg border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] transition-all peer placeholder-transparent"
            placeholder="Price"
            required
          />
          <label
            htmlFor="add-price"
            className="absolute left-3 top-1 text-[#b16cea] text-xs font-semibold pointer-events-none transition-all peer-focus:top-0.5 peer-focus:text-xs peer-focus:text-[#b16cea] peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-[#ba9ca7]"
          >
            Price
          </label>
        </div>
        {/* Category select box - modern UI */}
        <div className="relative">
          <select
            name="category"
            id="add-category"
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
            htmlFor="add-category"
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
                Product Added!
              </div>
              <div className="text-[#b16cea] text-sm text-center font-medium">
                Your product was added successfully.
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-base font-bold text-white transition border-none rounded-lg shadow bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white py-2 rounded-lg font-bold text-base hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow border-none"
            disabled={loading || mlId === null}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditProductModal({
  product,
  onClose,
  onSave,
  categories,
  setCategories,
  catLoading,
}: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product, imageFile?: File) => void;
  categories: string[];
  setCategories: (c: string[]) => void;
  catLoading: boolean;
}) {
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
