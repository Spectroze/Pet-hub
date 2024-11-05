"use client";

import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register all necessary components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  const userEngagementData = {
    labels: ["Last Month", "This Month"],
    datasets: [
      {
        label: "User Engagement (%)",
        data: [75.5, 78],
        backgroundColor: ["#36A2EB", "#4BC0C0"],
      },
    ],
  };

  const appointmentTrendsData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Appointments",
        data: [120, 130, 110, 152, 140, 160],
        borderColor: "#FF6384",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4, // Smooth curve for the line chart
        fill: true,
      },
    ],
  };

  const popularServicesData = {
    labels: ["Grooming", "Training", "Check-up"],
    datasets: [
      {
        data: [32, 25, 43],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold">Reporting and Analytics</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Engagement Bar Chart */}
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <h3 className="text-xl font-semibold mb-4">User Engagement</h3>
          <Bar data={userEngagementData} options={{ responsive: true }} />
        </div>

        {/* Appointment Trends Line Chart */}
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <h3 className="text-xl font-semibold mb-4">Appointment Trends</h3>
          <Line data={appointmentTrendsData} options={{ responsive: true }} />
        </div>

        {/* Popular Services Pie Chart */}
        <div className="p-6 border rounded-lg shadow-md bg-white">
          <h3 className="text-xl font-semibold mb-4">Popular Services</h3>
          <Pie data={popularServicesData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
