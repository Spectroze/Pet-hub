"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Dog, Users, Calendar, DollarSign } from "lucide-react";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
];

const chartStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "16px",
};

function PieChartComponent({ data, title }) {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#1f2937",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

const BarChartComponent = ({ data, title, dataKey = "value" }) => {
  return (
    <Card style={chartStyle}>
      <CardHeader>
        <CardTitle className="text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                color: "#1f2937",
              }}
              formatter={(value) => [
                `₱${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#3b82f6" name="Revenue">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

function StatCard({ title, value, icon: Icon }) {
  const generateSparklineData = () => {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100));
  };

  const colorMap = {
    "Total Pets": {
      text: "#22c55e",
      line: "rgba(34, 197, 94, 0.2)",
      gradient: "from-green-50 to-green-100",
    },
    "Total Owners": {
      text: "#3b82f6",
      line: "rgba(59, 130, 246, 0.2)",
      gradient: "from-blue-50 to-blue-100",
    },
    "Total Revenue": {
      text: "#a855f7",
      line: "rgba(168, 85, 247, 0.2)",
      gradient: "from-purple-50 to-purple-100",
    },
    "Total Appointments": {
      text: "#f59e0b",
      line: "rgba(245, 158, 11, 0.2)",
      gradient: "from-yellow-50 to-yellow-100",
    },
  };

  const colors = colorMap[title] || {
    text: "#64748b",
    line: "rgba(100, 116, 139, 0.2)",
    gradient: "from-gray-50 to-gray-100",
  };

  const formattedValue = title.toLowerCase().includes("revenue")
    ? `₱${value.toLocaleString()}`
    : value.toLocaleString();

  return (
    <Card className={`bg-gradient-to-br ${colors.gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className="text-sm font-medium"
          style={{ color: colors.text }}
        >
          {title}
        </CardTitle>
        {title.toLowerCase().includes("revenue") ? (
          <DollarSign className="h-4 w-4" style={{ color: colors.text }} />
        ) : (
          <Icon className="h-4 w-4" style={{ color: colors.text }} />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold" style={{ color: colors.text }}>
            {formattedValue}
          </div>
          <div className="h-[40px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={generateSparklineData().map((value, index) => ({
                  value,
                  index,
                }))}
              >
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.text}
                  fill={colors.line}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard({ data }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
        Dashboard Overview
      </h2>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Pets" value={data?.totalPets} icon={Dog} />
        <StatCard title="Total Owners" value={data?.totalOwners} icon={Users} />
        <StatCard
          title="Total Revenue"
          value={data?.totalRevenue}
          icon={DollarSign}
        />
        <StatCard
          title="Total Appointments"
          value={data.totalAppointments}
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <BarChartComponent
          data={data?.monthlyRevenueData || []}
          title="Monthly Revenue"
          dataKey="value"
        />
        <BarChartComponent
          data={data?.petServicesData || []}
          title="Pet Services Distribution"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <PieChartComponent
          data={data?.petTypeData || []}
          title="Pet Type Distribution"
        />
        <PieChartComponent
          data={data?.roomNumericData || []}
          title="Room Occupancy"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <BarChartComponent
          data={data?.catBreedData || []}
          title="Cat Breeds Distribution"
        />
        <BarChartComponent
          data={data?.dogBreedData || []}
          title="Dog Breeds Distribution"
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <BarChartComponent
          data={data.servicesFeeChartData || []}
          title="Services Fees by Clinic"
          dataKey="value"
        />
      </div>
    </div>
  );
}
