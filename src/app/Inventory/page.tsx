"use client";
import React, { useEffect, useState } from "react";
import SidebarLink from "../../components/SidebarLink";
import StatCard from "../../components/StatCard";
import ProductsTable from "../../components/ProductsTable";
import AddProductModal from "../../components/AddProductModal";
import {
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  ListBulletsIcon,
} from "../../components/Icons";
import { useRouter } from "next/navigation";
import { getProductStats } from "@/actions/products";

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
