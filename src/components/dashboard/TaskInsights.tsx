import React, { useState, useEffect } from "react";
import { getTasks, getCategories } from "@/lib/storage";
import { Task, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface TaskInsightsProps {
  tasks?: Task[];
  categories?: Category[];
  dateRange?: { start: Date; end: Date };
}

const TaskInsights = ({
  tasks: initialTasks,
  categories: initialCategories,
  dateRange,
}: TaskInsightsProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("productivity");
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );
  const [isLoading, setIsLoading] = useState(true);

  // Calculate date range based on selected timeframe
  const getDateRange = () => {
    const today = new Date();

    if (dateRange) {
      return dateRange;
    }

    switch (timeFrame) {
      case "daily":
        return { start: subDays(today, 7), end: today };
      case "weekly":
        return { start: subDays(today, 28), end: today };
      case "monthly":
        return { start: subDays(today, 90), end: today };
      default:
        return { start: subDays(today, 28), end: today };
    }
  };

  // Load tasks and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedTasks = initialTasks || (await getTasks());
        const storedCategories = initialCategories || (await getCategories());
        setTasks(storedTasks);
        setCategories(storedCategories);
      } catch (error) {
        console.error("Error loading data for insights:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialTasks, initialCategories]);

  // Filter tasks by date range
  const getFilteredTasks = () => {
    const { start, end } = getDateRange();

    return tasks.filter((task) => {
      const taskDate = new Date(task.completedAt || task.createdAt);
      return isWithinInterval(taskDate, { start, end });
    });
  };

  // Prepare data for productivity chart (tasks completed over time)
  const getProductivityData = () => {
    const { start, end } = getDateRange();
    const filteredTasks = getFilteredTasks();
    const completedTasks = filteredTasks.filter((task) => task.completed);

    // Group by time period
    const data = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      let periodStart, periodEnd, label;

      if (timeFrame === "daily") {
        periodStart = new Date(currentDate);
        periodEnd = new Date(currentDate);
        periodEnd.setHours(23, 59, 59, 999);
        label = format(currentDate, "MMM d");
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (timeFrame === "weekly") {
        periodStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        periodEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        label = `${format(periodStart, "MMM d")} - ${format(periodEnd, "MMM d")}`;
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        // monthly
        periodStart = startOfMonth(currentDate);
        periodEnd = endOfMonth(currentDate);
        label = format(currentDate, "MMM yyyy");
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Count tasks completed in this period
      const tasksInPeriod = completedTasks.filter((task) => {
        const completedDate = new Date(task.completedAt || task.createdAt);
        return isWithinInterval(completedDate, {
          start: periodStart,
          end: periodEnd,
        });
      });

      // Calculate total value generated in this period
      const valueGenerated = tasksInPeriod.reduce((sum, task) => {
        return sum + task.hourlyRate * task.estimatedHours;
      }, 0);

      data.push({
        period: label,
        tasks: tasksInPeriod.length,
        value: valueGenerated,
        hours: tasksInPeriod.reduce(
          (sum, task) => sum + task.estimatedHours,
          0,
        ),
      });

      // Break if we've gone past the end date
      if (periodEnd >= end) break;
    }

    return data;
  };

  // Prepare data for category distribution
  const getCategoryDistributionData = () => {
    const filteredTasks = getFilteredTasks();
    const categoryMap = new Map();

    // Create a map of category names
    categories.forEach((category) => {
      categoryMap.set(category.id, category.name);
    });

    // Group tasks by category
    const categoryGroups = {};

    filteredTasks.forEach((task) => {
      const categoryName = categoryMap.get(task.category) || "Uncategorized";
      if (!categoryGroups[categoryName]) {
        categoryGroups[categoryName] = {
          name: categoryName,
          tasks: 0,
          value: 0,
          hours: 0,
          completed: 0,
        };
      }

      categoryGroups[categoryName].tasks += 1;
      categoryGroups[categoryName].value +=
        task.hourlyRate * task.estimatedHours;
      categoryGroups[categoryName].hours += task.estimatedHours;
      if (task.completed) {
        categoryGroups[categoryName].completed += 1;
      }
    });

    return Object.values(categoryGroups);
  };

  // Prepare data for time of day productivity
  const getTimeOfDayData = () => {
    const filteredTasks = getFilteredTasks().filter(
      (task) => task.completed && task.completedAt,
    );
    const timeSlots = [
      { name: "Morning (6am-12pm)", start: 6, end: 11, count: 0, value: 0 },
      { name: "Afternoon (12pm-6pm)", start: 12, end: 17, count: 0, value: 0 },
      { name: "Evening (6pm-12am)", start: 18, end: 23, count: 0, value: 0 },
      { name: "Night (12am-6am)", start: 0, end: 5, count: 0, value: 0 },
    ];

    filteredTasks.forEach((task) => {
      if (task.completedAt) {
        const completedTime = new Date(task.completedAt);
        const hour = completedTime.getHours();

        for (const slot of timeSlots) {
          if (hour >= slot.start && hour <= slot.end) {
            slot.count += 1;
            slot.value += task.hourlyRate * task.estimatedHours;
            break;
          }
        }
      }
    });

    return timeSlots;
  };

  // Prepare data for value generation over time
  const getValueGenerationData = () => {
    const productivityData = getProductivityData();

    // Calculate cumulative value
    let cumulativeValue = 0;
    return productivityData.map((item) => {
      cumulativeValue += item.value;
      return {
        ...item,
        cumulativeValue,
      };
    });
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const filteredTasks = getFilteredTasks();
    const completedTasks = filteredTasks.filter((task) => task.completed);

    const totalTasks = filteredTasks.length;
    const completedTasksCount = completedTasks.length;
    const completionRate =
      totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

    const totalValue = completedTasks.reduce((sum, task) => {
      return sum + task.hourlyRate * task.estimatedHours;
    }, 0);

    const totalHours = completedTasks.reduce((sum, task) => {
      return sum + task.estimatedHours;
    }, 0);

    const avgValuePerTask =
      completedTasksCount > 0 ? totalValue / completedTasksCount : 0;

    return {
      totalTasks,
      completedTasksCount,
      completionRate,
      totalValue,
      totalHours,
      avgValuePerTask,
    };
  };

  // Render productivity patterns chart
  const renderProductivityChart = () => {
    const data = getProductivityData();

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "value")
                  return [`$${value.toFixed(2)}`, "Value Generated"];
                return [
                  value,
                  name === "tasks" ? "Tasks Completed" : "Hours Spent",
                ];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="tasks"
              name="Tasks Completed"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="hours"
              name="Hours Spent"
              fill="#82ca9d"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render value generation chart
  const renderValueGenerationChart = () => {
    const data = getValueGenerationData();

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip
              formatter={(value) => [`$${value.toFixed(2)}`, "Value Generated"]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              name="Period Value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="cumulativeValue"
              name="Cumulative Value"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render category distribution chart
  const renderCategoryDistributionChart = () => {
    const data = getCategoryDistributionData();
    const COLORS = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff8042",
      "#0088FE",
      "#00C49F",
      "#FFBB28",
      "#FF8042",
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
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
              formatter={(value) => [`$${value.toFixed(2)}`, "Value Generated"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render time of day productivity chart
  const renderTimeOfDayChart = () => {
    const data = getTimeOfDayData();

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip
              formatter={(value, name) => {
                if (name === "value")
                  return [`$${value.toFixed(2)}`, "Value Generated"];
                return [value, "Tasks Completed"];
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="count"
              name="Tasks Completed"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="value"
              name="Value Generated"
              fill="#82ca9d"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render summary statistics
  const renderSummaryStats = () => {
    const stats = getSummaryStats();

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
            <div className="text-2xl font-bold">
              {stats.completedTasksCount}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.completionRate.toFixed(0)}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Total Value Generated
            </div>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across {stats.totalHours.toFixed(1)} hours
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Avg. Value Per Task
            </div>
            <div className="text-2xl font-bold">
              ${stats.avgValuePerTask.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {stats.completedTasksCount} completed tasks
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Task Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Task Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          {/* Time frame selector */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Badge
                variant={timeFrame === "daily" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeFrame("daily")}
              >
                Daily
              </Badge>
              <Badge
                variant={timeFrame === "weekly" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeFrame("weekly")}
              >
                Weekly
              </Badge>
              <Badge
                variant={timeFrame === "monthly" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeFrame("monthly")}
              >
                Monthly
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(getDateRange().start, "MMM d, yyyy")} -{" "}
              {format(getDateRange().end, "MMM d, yyyy")}
            </div>
          </div>

          {/* Summary statistics */}
          {renderSummaryStats()}

          {/* Chart tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="productivity">Productivity</TabsTrigger>
              <TabsTrigger value="value">Value Generation</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="timeOfDay">Time of Day</TabsTrigger>
            </TabsList>

            <TabsContent value="productivity" className="mt-4">
              <h3 className="text-lg font-medium mb-4">
                Productivity Patterns
              </h3>
              {renderProductivityChart()}
            </TabsContent>

            <TabsContent value="value" className="mt-4">
              <h3 className="text-lg font-medium mb-4">
                Value Generation Over Time
              </h3>
              {renderValueGenerationChart()}
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <h3 className="text-lg font-medium mb-4">
                Value Distribution by Category
              </h3>
              {renderCategoryDistributionChart()}
            </TabsContent>

            <TabsContent value="timeOfDay" className="mt-4">
              <h3 className="text-lg font-medium mb-4">
                Productivity by Time of Day
              </h3>
              {renderTimeOfDayChart()}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskInsights;
