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
import { getCategories } from "@/actions/products";

export default function CategoriesPage() {
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
        <div className="flex justify-center flex-1 gap-1 px-6 py-5">
          {/* Sidebar */}
          <aside className="flex flex-col layout-content-container w-80">
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
                  />
                  <SidebarLink
                    icon={ListBulletsIcon}
                    label="Categories"
                    href="/categories"
                    active
                  />
                </nav>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-white tracking-light text-[32px] font-bold leading-tight min-w-72">
                Categories
              </p>
              <button className="flex min-w-[84px] max-w-[480px] items-center justify-center rounded-xl h-8 px-4 bg-[#39282e] text-white text-sm font-medium leading-normal">
                <span className="truncate">Add Category</span>
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-xl border border-[#543b44] bg-[#181114]">
                <CategoriesTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function CategoriesTable() {
  const [categories, setCategories] = React.useState<
    { name: string; count: number }[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = getCategories();
      if (error) {
        setError(error.message);
      } else {
        // Count products per category
        const counts: { [key: string]: number } = {};
        (data || []).forEach((p: { category: string }) => {
          if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
          }
        });
        setCategories(
          Object.entries(counts).map(([name, count]) => ({ name, count }))
        );
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="p-4 text-white">Loading categories...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <table className="flex-1 min-w-full">
      <thead>
        <tr className="bg-[#271b20]">
          <th className="px-4 py-3 text-left text-white w-[400px] text-sm font-medium leading-normal">
            Name
          </th>
          <th className="px-4 py-3 text-left text-white w-[200px] text-sm font-medium leading-normal">
            Product Count
          </th>
          <th className="px-4 py-3 text-sm font-medium leading-normal text-center text-white w-60">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.map((cat) => (
          <tr key={cat.name} className="border-t border-t-[#543b44]">
            <td className="h-[72px] px-4 py-2 w-[400px] text-white text-sm font-normal leading-normal">
              {cat.name}
            </td>
            <td className="h-[72px] px-4 py-2 w-[200px] text-[#ba9ca7] text-sm font-normal leading-normal">
              {cat.count}
            </td>
            <td className="h-[72px] px-4 py-2 w-60 flex items-center justify-center">
              <div className="flex items-center justify-center gap-2">
                <button
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#b16cea] to-[#ff5e69] text-white font-semibold text-xs hover:from-[#a259c6] hover:to-[#ff7e8a] transition shadow"
                  // onClick={() => handleEdit(cat)}
                  disabled
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 text-xs font-semibold text-white transition rounded-lg shadow bg-gradient-to-r from-red-700 to-red-500 hover:from-red-800 hover:to-red-600"
                  // onClick={() => handleDelete(cat.name)}
                  disabled
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
