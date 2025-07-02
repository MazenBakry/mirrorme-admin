"use client";
import React from "react";
import SidebarLink from "../../components/SidebarLink";
import StatCard from "../../components/StatCard";
import OrdersTable from "../../components/OrdersTable";
import {
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  ListBulletsIcon,
} from "../../components/Icons";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [totalProducts, setTotalProducts] = React.useState(0);
  const [activeCustomers, setActiveCustomers] = React.useState(0);
  const router = useRouter();
  React.useEffect(() => {
    const fetchStats = async () => {
      const { count: prodCount, error: prodError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (!prodError) setTotalProducts(prodCount ?? 0);
      const { count: custCount, error: custError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!custError) setActiveCustomers(custCount ?? 0);
    };
    fetchStats();
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_logged_in") !== "true") {
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_logged_in");
      router.replace("/");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#181114] dark group/design-root overflow-hidden font-sans">
      {/* Fixed Logout Button Top Right */}
      <button
        onClick={handleLogout}
        className="fixed top-6 right-8 z-50 px-4 py-2 rounded-lg bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white font-bold text-base hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow"
      >
        Logout
      </button>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <aside className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-[#181114] p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-white text-base font-medium leading-normal">
                  Store Admin
                </h1>
                <nav className="flex flex-col gap-2">
                  <SidebarLink icon={HomeIcon} label="Dashboard" href="/dashboard" active />
                  <SidebarLink icon={PackageIcon} label="Inventory" href="/Inventory" />
                  <SidebarLink icon={ReceiptIcon} label="Orders" href="/orders" />
                  <SidebarLink icon={UsersIcon} label="Customers" href="/customers" />
                  <SidebarLink icon={ListBulletsIcon} label="Categories" href="/categories" />
                </nav>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                Dashboard
              </p>
            </div>
            <div className="flex flex-wrap gap-4 p-4">
              <StatCard label="Total Products" value={totalProducts.toString()} />
              <StatCard label="Total Orders" value="350" />
              <StatCard label="Active Customers" value={activeCustomers.toString()} />
            </div>
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Recent Orders
            </h2>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#543b44] bg-[#181114]">
                <OrdersTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 