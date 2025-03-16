import React, { useState, useEffect } from "react";
import {
  fetchMentalBankBalance,
  updateMentalBankBalance,
  fetchCategories,
  fetchTasks,
} from "@/lib/api";
import { Link } from "react-router-dom";
import Header from "./dashboard/Header";
import BalanceSummary from "./dashboard/BalanceSummary";
import ProgressCharts from "./dashboard/ProgressCharts";
import TaskManagement from "./dashboard/TaskManagement";
import CategoryManagement from "./dashboard/CategoryManagement";
import CategoryDashboard from "./dashboard/CategoryDashboard";
import DataExportImport from "./dashboard/DataExportImport";
import TaskInsights from "./dashboard/TaskInsights";
import MentalBankGrowth from "./dashboard/MentalBankGrowth";
import JournalManagement from "./journal/JournalManagement";
import AISettings from "./settings/AISettings";

const Home = () => {
  const [activeSection, setActiveSection] = useState<
    | "tasks"
    | "categories"
    | "dashboard"
    | "data"
    | "insights"
    | "growth"
    | "journal"
    | "ai-settings"
  >("tasks");
  const [balance, setBalance] = useState({
    currentBalance: 5250.0,
    targetBalance: 15750.0,
    progressPercentage: 33,
    dailyGrowth: 4.2,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Try to get data from API first
        const balanceData = await fetchMentalBankBalance();
        setBalance(balanceData);

        // Also load from local storage as fallback
        import("@/lib/storage").then(async ({ getMentalBankBalance }) => {
          try {
            const localBalance = await getMentalBankBalance();
            // Only use local data if API failed
            if (!balanceData && localBalance) {
              setBalance(localBalance);
            }
          } catch (localErr) {
            console.error("Error loading local data:", localErr);
          }
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load your data. Please try again later.");

        // Try to get data from local storage as fallback
        import("@/lib/storage").then(async ({ getMentalBankBalance }) => {
          try {
            const localBalance = await getMentalBankBalance();
            if (localBalance) {
              setBalance(localBalance);
              setError(null);
            }
          } catch (localErr) {
            console.error("Error loading local data:", localErr);
          } finally {
            setIsLoading(false);
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
        onLogout={() => console.log("Logout clicked")}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Balance Summary */}
          {isLoading ? (
            <div className="h-[180px] bg-white rounded-lg animate-pulse" />
          ) : (
            <BalanceSummary
              currentBalance={balance.currentBalance}
              targetBalance={balance.targetBalance}
              progressPercentage={balance.progressPercentage}
              dailyGrowth={balance.dailyGrowth}
              onTargetBalanceChange={async (newTarget) => {
                try {
                  const updatedBalance = await updateMentalBankBalance({
                    targetBalance: newTarget,
                    // Recalculate progress percentage
                    progressPercentage: Math.round(
                      (balance.currentBalance / newTarget) * 100,
                    ),
                  });
                  setBalance(updatedBalance);
                } catch (err) {
                  console.error("Failed to update target balance:", err);
                }
              }}
            />
          )}

          {/* Progress Charts */}
          <ProgressCharts
            onDateRangeChange={(startDate, endDate) => {
              console.log("Date range changed:", startDate, endDate);
            }}
          />

          {/* Section Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto pb-1">
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "tasks" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("tasks")}
            >
              Task Management
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "categories" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("categories")}
            >
              Category Management
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "dashboard" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("dashboard")}
            >
              Category Dashboard
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "insights" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("insights")}
            >
              Task Insights
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "growth" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("growth")}
            >
              Mental Bank Growth
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "journal" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("journal")}
            >
              Journal
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "data" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("data")}
            >
              Export/Import Data
            </button>
            <button
              className={`pb-2 px-1 whitespace-nowrap ${activeSection === "ai-settings" ? "border-b-2 border-primary font-medium text-primary" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveSection("ai-settings")}
            >
              AI Settings
            </button>
          </div>

          {/* Task, Category, Dashboard, Insights, Growth, Journal or Data Management */}
          <div className="mt-6">
            {activeSection === "tasks" ? (
              <TaskManagement />
            ) : activeSection === "categories" ? (
              <CategoryManagement />
            ) : activeSection === "dashboard" ? (
              <CategoryDashboard />
            ) : activeSection === "insights" ? (
              <TaskInsights />
            ) : activeSection === "growth" ? (
              <MentalBankGrowth />
            ) : activeSection === "journal" ? (
              <JournalManagement />
            ) : activeSection === "ai-settings" ? (
              <AISettings />
            ) : (
              <DataExportImport />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-white"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-sm font-medium">
                Mental Bank Task Manager
              </span>
            </div>

            <div className="mt-4 md:mt-0">
              <nav className="flex space-x-4">
                <Link
                  to="/about"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  About
                </Link>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Terms
                </Link>
                <Link
                  to="/contact"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Mental Bank Task Manager. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
