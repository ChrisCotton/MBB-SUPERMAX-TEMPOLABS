import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Calendar } from "../ui/calendar";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

interface ProgressChartsProps {
  dailyData?: Array<{
    date: string;
    balance: number;
    tasks: number;
  }>;
  weeklyData?: Array<{
    week: string;
    balance: number;
    tasks: number;
  }>;
  monthlyData?: Array<{
    month: string;
    balance: number;
    tasks: number;
  }>;
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
}

const ProgressCharts = ({
  dailyData = [
    { date: "2023-06-01", balance: 1200, tasks: 3 },
    { date: "2023-06-02", balance: 1350, tasks: 2 },
    { date: "2023-06-03", balance: 1500, tasks: 4 },
    { date: "2023-06-04", balance: 1650, tasks: 3 },
    { date: "2023-06-05", balance: 1800, tasks: 5 },
    { date: "2023-06-06", balance: 2000, tasks: 4 },
    { date: "2023-06-07", balance: 2200, tasks: 6 },
  ],
  weeklyData = [
    { week: "Week 1", balance: 2200, tasks: 15 },
    { week: "Week 2", balance: 3500, tasks: 18 },
    { week: "Week 3", balance: 4800, tasks: 22 },
    { week: "Week 4", balance: 6200, tasks: 25 },
  ],
  monthlyData = [
    { month: "Jan", balance: 6200, tasks: 65 },
    { month: "Feb", balance: 12500, tasks: 72 },
    { month: "Mar", balance: 18800, tasks: 80 },
    { month: "Apr", balance: 24500, tasks: 85 },
    { month: "May", balance: 32000, tasks: 90 },
    { month: "Jun", balance: 38000, tasks: 95 },
  ],
  onDateRangeChange = () => {},
}: ProgressChartsProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");

  // Calculate date range for the current month
  const firstDayOfMonth = startOfMonth(date);
  const lastDayOfMonth = endOfMonth(date);

  const handlePreviousPeriod = () => {
    let newDate;
    switch (activeTab) {
      case "daily":
        newDate = subDays(date, 7);
        break;
      case "weekly":
        newDate = subDays(date, 28);
        break;
      case "monthly":
        // Go back one month
        newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        break;
      default:
        newDate = date;
    }
    setDate(newDate);
    onDateRangeChange(startOfMonth(newDate), endOfMonth(newDate));
  };

  const handleNextPeriod = () => {
    let newDate;
    switch (activeTab) {
      case "daily":
        newDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        newDate = new Date(date.getTime() + 28 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        // Go forward one month
        newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        break;
      default:
        newDate = date;
    }
    setDate(newDate);
    onDateRangeChange(startOfMonth(newDate), endOfMonth(newDate));
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const renderDateRangeSelector = () => {
    let dateRangeText = "";

    switch (activeTab) {
      case "daily":
        dateRangeText = `${format(subDays(date, 6), "MMM d")} - ${format(date, "MMM d, yyyy")}`;
        break;
      case "weekly":
        dateRangeText = `${format(subDays(date, 28), "MMM yyyy")} - ${format(date, "MMM yyyy")}`;
        break;
      case "monthly":
        dateRangeText = format(date, "yyyy");
        break;
    }

    return (
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="font-medium">{dateRangeText}</span>
        </div>
        <Button variant="outline" size="icon" onClick={handleNextPeriod}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Progress Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="daily"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
          </div>

          {renderDateRangeSelector()}

          <TabsContent value="daily" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#8884d8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) =>
                      format(new Date(date), "MMMM d, yyyy")
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    name="Mental Bank Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) =>
                      format(new Date(date), "MMMM d, yyyy")
                    }
                  />
                  <Legend />
                  <Bar dataKey="tasks" fill="#82ca9d" name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorWeeklyBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#8884d8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorWeeklyBalance)"
                    name="Mental Bank Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#82ca9d" name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorMonthlyBalance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#8884d8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorMonthlyBalance)"
                    name="Mental Bank Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#82ca9d" name="Completed Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                    onDateRangeChange(
                      startOfMonth(newDate),
                      endOfMonth(newDate),
                    );
                  }
                }}
                className="rounded-md border shadow p-3 bg-white"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProgressCharts;
