import React, { useState, useEffect } from "react";
import { getTasks, getCategories } from "@/lib/storage";
import { Task, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../ui/badge";

interface CategoryDashboardProps {
  tasks?: Task[];
  categories?: Category[];
}

const CategoryDashboard = ({
  tasks: initialTasks,
  categories: initialCategories,
}: CategoryDashboardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState("value");
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks and categories from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedTasks = initialTasks || (await getTasks());
        const storedCategories = initialCategories || (await getCategories());
        setTasks(storedTasks);
        setCategories(storedCategories);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialTasks, initialCategories]);

  // Prepare data for charts
  const prepareChartData = () => {
    // Create a map of category IDs to names
    const categoryMap = new Map<string, string>();
    categories.forEach((category) => {
      categoryMap.set(category.id, category.name);
    });

    // Group tasks by category
    const categoryGroups = new Map<
      string,
      { count: number; value: number; completed: number; pending: number }
    >();

    tasks.forEach((task) => {
      const categoryId = task.category;
      const categoryName = categoryMap.get(categoryId) || "Uncategorized";
      const taskValue = task.hourlyRate * task.estimatedHours;

      if (!categoryGroups.has(categoryName)) {
        categoryGroups.set(categoryName, {
          count: 0,
          value: 0,
          completed: 0,
          pending: 0,
        });
      }

      const group = categoryGroups.get(categoryName)!;
      group.count += 1;
      group.value += taskValue;
      if (task.completed) {
        group.completed += 1;
      } else {
        group.pending += 1;
      }
    });

    // Convert to array format for charts
    return Array.from(categoryGroups.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      value: data.value,
      completed: data.completed,
      pending: data.pending,
      completionRate: data.count > 0 ? (data.completed / data.count) * 100 : 0,
    }));
  };

  const chartData = prepareChartData();

  // Sort data by value for bar chart
  const sortedValueData = [...chartData].sort((a, b) => b.value - a.value);
  const sortedCountData = [...chartData].sort((a, b) => b.count - a.count);

  // Colors for pie chart
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
  ];

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const renderValueDistribution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Value by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
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
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Value Distribution (Bar)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedValueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name="Total Value"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTaskDistribution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Tasks by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Completed vs Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCountData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  fill="#82ca9d"
                  name="Completed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#ffc658"
                  name="Pending"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCompletionRates = () => (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Completion Rate by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCountData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    value.length > 10 ? `${value.slice(0, 10)}...` : value
                  }
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value) => [
                    `${value.toFixed(1)}%`,
                    "Completion Rate",
                  ]}
                />
                <Bar
                  dataKey="completionRate"
                  fill="#8884d8"
                  name="Completion Rate"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategorySummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {chartData.map((category, index) => (
        <Card key={index} className="overflow-hidden">
          <div
            className="h-2"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          ></div>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-lg mb-2 truncate">
              {category.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Tasks</p>
                <p className="font-medium">{category.count}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Value</p>
                <p className="font-medium">{formatCurrency(category.value)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completion</p>
                <p className="font-medium">
                  {category.completionRate.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <div className="flex gap-1">
                  <Badge variant="success" className="text-xs">
                    {category.completed}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {category.pending}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Category Dashboard</h2>
        </div>

        {chartData.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center">
                No task data available. Create tasks with categories to see
                analytics here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderCategorySummary()}

            <Tabs
              defaultValue="value"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="value">Value Distribution</TabsTrigger>
                <TabsTrigger value="tasks">Task Distribution</TabsTrigger>
                <TabsTrigger value="completion">Completion Rates</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="value">
                  {renderValueDistribution()}
                </TabsContent>
                <TabsContent value="tasks">
                  {renderTaskDistribution()}
                </TabsContent>
                <TabsContent value="completion">
                  {renderCompletionRates()}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryDashboard;
