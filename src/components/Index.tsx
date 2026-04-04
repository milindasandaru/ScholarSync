"use client";

import { useState } from "react";
import DashboardView from "@/components/DashboardView";
import ModulesView from "@/components/ModulesView";
import AnalyticsView from "@/components/AnalyticsView";
import { Menu } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "modules":
        return <ModulesView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">

      {/* Top bar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-bold">
            <span className="text-blue-600">Scholar</span>
            <span className="text-orange-500">Sync</span>
          </h1>
        </div>
      </div>

      {/* Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg z-50">
          <div className="p-4">
            <h2 className="font-bold mb-4">Menu</h2>

            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSidebarOpen(false);
              }}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              Dashboard
            </button>

            <button
              onClick={() => {
                setActiveTab("modules");
                setSidebarOpen(false);
              }}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              Manage Modules
            </button>

            <button
              onClick={() => {
                setActiveTab("analytics");
                setSidebarOpen(false);
              }}
              className="block w-full text-left p-2 hover:bg-gray-100 rounded"
            >
              Analytics
            </button>
          </div>
        </div>
      )}

      {/* Body - Centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-6">
          {renderContent()}
        </div>
      </div>

    </div>
  );
};

export default Index;