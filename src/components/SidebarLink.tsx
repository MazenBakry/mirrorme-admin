import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  icon: React.FC<unknown>;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  href,
  active = false,
}) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
      active ? "bg-[#39282e]" : "hover:bg-[#271b20]"
    }`}
  >
    <span className="text-white">
      <Icon />
    </span>
    <p className="text-white text-sm font-medium leading-normal">{label}</p>
  </Link>
);

export default SidebarLink;
