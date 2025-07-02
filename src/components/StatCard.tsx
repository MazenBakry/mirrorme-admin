import React from "react";

interface StatCardProps {
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[#39282e]">
    <p className="text-white text-base font-medium leading-normal">{label}</p>
    <p className="text-white tracking-light text-2xl font-bold leading-tight">
      {value}
    </p>
  </div>
);

export default StatCard;
