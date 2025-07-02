"use client";
import React from "react";
import SidebarLink from "../../components/SidebarLink";
import {
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  UsersIcon,
  ListBulletsIcon,
} from "../../components/Icons";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  React.useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("admin_logged_in") !== "true") {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#181114] dark group/design-root overflow-x-hidden font-sans">
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
                  <SidebarLink icon={HomeIcon} label="Dashboard" href="/" />
                  <SidebarLink icon={PackageIcon} label="Inventory" href="/Inventory" />
                  <SidebarLink icon={ReceiptIcon} label="Orders" href="/orders" active />
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
                Orders
              </p>
            </div>
            <div className="px-4 py-3">
              <OrdersTable />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function OrdersTable() {
  const orders = [
    {
      id: "#12345",
      customer: "Ava Bennett",
      date: "2023-08-15",
      status: "Shipped",
      total: "$150.00",
    },
    {
      id: "#12346",
      customer: "Owen Carter",
      date: "2023-08-14",
      status: "Delivered",
      total: "$200.00",
    },
    {
      id: "#12347",
      customer: "Chloe Foster",
      date: "2023-08-13",
      status: "Processing",
      total: "$100.00",
    },
    {
      id: "#12348",
      customer: "Jackson Reed",
      date: "2023-08-12",
      status: "Shipped",
      total: "$180.00",
    },
    {
      id: "#12349",
      customer: "Lily Coleman",
      date: "2023-08-11",
      status: "Delivered",
      total: "$220.00",
    },
    {
      id: "#12350",
      customer: "Caleb Hughes",
      date: "2023-08-10",
      status: "Processing",
      total: "$120.00",
    },
    {
      id: "#12351",
      customer: "Grace Parker",
      date: "2023-08-09",
      status: "Shipped",
      total: "$160.00",
    },
    {
      id: "#12352",
      customer: "Elijah Clark",
      date: "2023-08-08",
      status: "Delivered",
      total: "$240.00",
    },
    {
      id: "#12353",
      customer: "Zoe Harper",
      date: "2023-08-07",
      status: "Processing",
      total: "$140.00",
    },
    {
      id: "#12354",
      customer: "Sophia Bennett",
      date: "2023-08-06",
      status: "Shipped",
      total: "$200.00",
    },
  ];

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredOrders = React.useMemo(() => {
    if (!debouncedSearch.trim()) return orders;
    const s = debouncedSearch.toLowerCase();
    return orders.filter((order) =>
      order.id.toLowerCase().includes(s) ||
      order.customer.toLowerCase().includes(s) ||
      order.status.toLowerCase().includes(s) ||
      order.total.toLowerCase().includes(s)
    );
  }, [debouncedSearch, orders]);

  return (
    <div>
      {/* Search bar - modern UI */}
      <div className="flex items-center mb-8 justify-between px-2 py-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b16cea] pointer-events-none">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, status, or total..."
            className="w-full pl-10 pr-8 py-2 rounded-full bg-[#39282e] text-white border-2 border-[#543b44] focus:border-[#b16cea] focus:ring-2 focus:ring-[#b16cea] shadow transition-all duration-200 placeholder:text-[#ba9ca7] text-sm outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b16cea] hover:text-[#ff5e69] transition"
              aria-label="Clear search"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      </div>
      <table className="flex-1 min-w-full">
        <thead>
          <tr className="bg-[#271b20]">
            <th className="px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
              Date
            </th>
            <th className="px-4 py-3 text-left text-white w-60 text-sm font-medium leading-normal">
              Status
            </th>
            <th className="px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="border-t border-t-[#543b44]">
              <td className="h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
                {order.id}
              </td>
              <td className="h-[72px] px-4 py-2 w-[400px] text-[#ba9ca7] text-sm font-normal leading-normal">
                {order.customer}
              </td>
              <td className="h-[72px] px-4 py-2 w-[400px] text-[#ba9ca7] text-sm font-normal leading-normal">
                {order.date}
              </td>
              <td className="h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#39282e] text-white text-sm font-medium leading-normal w-full">
                  <span className="truncate">{order.status}</span>
                </button>
              </td>
              <td className="h-[72px] px-4 py-2 w-[400px] text-[#ba9ca7] text-sm font-normal leading-normal">
                {order.total}
              </td>
            </tr>
          ))}
          {filteredOrders.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-[#ba9ca7] py-8">No orders found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
