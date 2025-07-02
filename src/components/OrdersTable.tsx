import React from "react";

const orders = [
  {
    id: "#1001",
    customer: "Sophia Clark",
    date: "2024-07-26",
    status: "Shipped",
    total: "$75.00",
  },
  {
    id: "#1002",
    customer: "Ethan Carter",
    date: "2024-07-25",
    status: "Processing",
    total: "$120.00",
  },
  {
    id: "#1003",
    customer: "Olivia Bennett",
    date: "2024-07-24",
    status: "Delivered",
    total: "$50.00",
  },
  {
    id: "#1004",
    customer: "Liam Harper",
    date: "2024-07-23",
    status: "Shipped",
    total: "$90.00",
  },
  {
    id: "#1005",
    customer: "Ava Foster",
    date: "2024-07-22",
    status: "Delivered",
    total: "$60.00",
  },
];

const OrdersTable: React.FC = () => (
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
      {orders.map((order) => (
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
    </tbody>
  </table>
);

export default OrdersTable;
