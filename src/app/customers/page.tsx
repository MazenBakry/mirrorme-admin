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
import { deleteCustomer, getCustomers } from "@/actions/customers";

export default function CustomersPage() {
  const router = useRouter();
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("admin_logged_in") !== "true"
    ) {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#181114] dark group/design-root overflow-x-hidden font-sans">
      <div className="flex flex-col h-full layout-container grow">
        <div className="flex flex-1 gap-1 justify-center px-6 py-5">
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
                    active
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
            <div className="flex flex-wrap gap-3 justify-between p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                Customers
              </p>
            </div>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#543b44] bg-[#181114]">
                <CustomersTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function CustomersTable() {
  const [customers, setCustomers] = React.useState<
    {
      id: string;
      phone: string;
      height: number;
      weight: number;
      body_shape: string;
      skin_tone: string;
      gender: string;
    }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteSuccess, setDeleteSuccess] = React.useState<string | null>(null);
  const pageSize = 10;

  // Debounce search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    setError(null);
    setDeleteSuccess(null);
    setPendingDelete(id);
    const error = await deleteCustomer(id);
    setDeleting(false);
    setPendingDelete(null);
    if (!error) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setTotalCount((prev) => prev - 1);
      setDeleteSuccess("Customer deleted successfully!");
      setTimeout(() => setDeleteSuccess(null), 1200);
    } else {
      alert("Failed to delete customer: " + error.message);
    }
  };

  React.useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      const { data, count, error } = await getCustomers({
        searchQuery: debouncedSearch.trim(),
        page,
        pageSize,
      });

      setTotalCount(count ?? 0);

      if (error) {
        setError(error.message);
      } else {
        setCustomers(data || []);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, [page, debouncedSearch]);

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
    return <div className="p-4 text-white">Loading customers...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div>
      {/* Modern Delete Confirmation Modal */}
      {pendingDelete && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-60">
          <div className="bg-gradient-to-br from-[#22161b] to-[#271b20] p-6 rounded-xl shadow-2xl w-full max-w-sm flex flex-col gap-4 border border-[#39282e] animate-fadeIn">
            <h2 className="text-white text-lg font-extrabold mb-1 tracking-tight text-center pb-1 border-b border-[#39282e]">
              Delete Customer
            </h2>
            <p className="text-[#ba9ca7] text-center">
              Are you sure you want to delete this customer?
            </p>
            <div className="flex flex-col gap-1 items-center">
              <span className="font-semibold text-white">{pendingDelete}</span>
            </div>
            <div className="flex gap-4 justify-center mt-2">
              <button
                className="px-4 py-2 rounded-lg bg-[#39282e] text-white font-semibold hover:bg-[#543b44] transition border border-[#543b44]"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 rounded-lg shadow transition hover:from-red-800 hover:to-red-600"
                onClick={() => handleDelete(pendingDelete)}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteSuccess && (
        <div className="flex fixed inset-0 justify-center items-center bg-black bg-opacity-40 z-60 animate-fadeIn">
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
              Customer Deleted!
            </div>
            <div className="text-[#b16cea] text-sm text-center font-medium">
              The customer was deleted successfully.
            </div>
          </div>
        </div>
      )}
      {/* Search bar - modern UI */}
      <div className="flex justify-between items-center px-2 py-4 mb-8">
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
            placeholder="Search by phone, body shape, skin tone, or gender..."
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
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              ID
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Phone
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Height
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Weight
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Body Shape
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Skin Tone
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-left text-white">
              Gender
            </th>
            <th className="px-4 py-3 text-sm font-medium leading-normal text-center text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-t-[#543b44]">
              <td className="h-[56px] px-4 py-2 text-white text-sm font-normal leading-normal">
                {customer.id}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.phone}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.height}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.weight}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.body_shape}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.skin_tone}
              </td>
              <td className="h-[56px] px-4 py-2 text-[#ba9ca7] text-sm font-normal leading-normal">
                {customer.gender}
              </td>
              <td className="h-[56px] px-4 py-2 flex items-center justify-center">
                <button
                  className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-red-700 to-red-500 rounded-lg shadow transition hover:from-red-800 hover:to-red-600"
                  onClick={() => setPendingDelete(customer.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center items-center mt-6">
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
    </div>
  );
}
