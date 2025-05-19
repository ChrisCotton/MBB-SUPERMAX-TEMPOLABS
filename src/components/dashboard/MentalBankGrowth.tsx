import React, { useState, useEffect } from "react";
import { format, subDays, subMonths, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Trophy, Star, TrendingUp, Target, Award } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { getMentalBankBalance } from "@/lib/storage";

interface MilestoneMarker {
  date: string;
  value: number;
  label: string;
  type: "achievement" | "milestone";
  icon: "trophy" | "star" | "target" | "trending-up" | "award";
  description: string;
}

interface MentalBankGrowthProps {
  initialData?: Array<{ date: string; value: number }>;
  milestones?: MilestoneMarker[];
}

const MentalBankGrowth = ({
  initialData,
  milestones: initialMilestones,
}: MentalBankGrowthProps) => {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">(
    "3m",
  );
  const [growthData, setGrowthData] = useState<
    Array<{ date: string; value: number }>
  >([]);
  const [milestones, setMilestones] = useState<MilestoneMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetBalance, setTargetBalance] = useState(0);

  // Generate sample data if none provided
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // If initial data is provided, use it
        if (initialData && initialData.length > 0) {
          setGrowthData(initialData);
        } else {
          // Otherwise generate sample data
          const generatedData = generateSampleData();
          setGrowthData(generatedData);
        }

        // Set milestones
        if (initialMilestones && initialMilestones.length > 0) {
          setMilestones(initialMilestones);
        } else {
          // Generate sample milestones
          const generatedMilestones = generateSampleMilestones();
          setMilestones(generatedMilestones);
        }

        // Get target balance
        const balance = await getMentalBankBalance();
        setTargetBalance(balance.targetBalance);
      } catch (error) {
        console.error("Error loading mental bank growth data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [initialData, initialMilestones]);

  // Generate sample data for demonstration
  const generateSampleData = () => {
    const data: Array<{ date: string; value: number }> = [];
    const today = new Date();
    let currentValue = 1000; // Starting value

    // Generate data for the past year
    for (let i = 365; i >= 0; i--) {
      const date = subDays(today, i);
      // Add some randomness to the growth
      const randomGrowth = Math.random() * 100 - 20; // Between -20 and 80
      currentValue = Math.max(currentValue + randomGrowth, 0); // Ensure value doesn't go below 0

      // Add occasional jumps for milestones
      if (i % 30 === 0) {
        currentValue += 500; // Bigger jump every 30 days
      }

      data.push({
        date: format(date, "yyyy-MM-dd"),
        value: Math.round(currentValue),
      });
    }

    return data;
  };

  // Generate sample milestones
  const generateSampleMilestones = () => {
    const milestones: MilestoneMarker[] = [
      {
        date: format(subDays(new Date(), 300), "yyyy-MM-dd"),
        value: 2500,
        label: "First $2,500",
        type: "milestone",
        icon: "target",
        description: "Reached your first $2,500 in Mental Bank Balance!",
      },
      {
        date: format(subDays(new Date(), 200), "yyyy-MM-dd"),
        value: 5000,
        label: "$5K Milestone",
        type: "milestone",
        icon: "trophy",
        description: "Congratulations on reaching $5,000 in your Mental Bank!",
      },
      {
        date: format(subDays(new Date(), 150), "yyyy-MM-dd"),
        value: 6500,
        label: "7-Day Streak",
        type: "achievement",
        icon: "star",
        description: "Completed tasks for 7 consecutive days!",
      },
      {
        date: format(subDays(new Date(), 100), "yyyy-MM-dd"),
        value: 8000,
        label: "$8K Milestone",
        type: "milestone",
        icon: "trending-up",
        description: "Your Mental Bank Balance has reached $8,000!",
      },
      {
        date: format(subDays(new Date(), 50), "yyyy-MM-dd"),
        value: 10000,
        label: "$10K Club",
        type: "achievement",
        icon: "award",
        description: "You've joined the $10K Mental Bank Club!",
      },
      {
        date: format(subDays(new Date(), 20), "yyyy-MM-dd"),
        value: 12000,
        label: "30-Day Streak",
        type: "achievement",
        icon: "star",
        description: "Completed tasks for 30 consecutive days!",
      },
    ];

    return milestones;
  };

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!growthData.length) return [];

    const today = new Date();
    let startDate;

    switch (timeRange) {
      case "1m":
        startDate = subMonths(today, 1);
        break;
      case "3m":
        startDate = subMonths(today, 3);
        break;
      case "6m":
        startDate = subMonths(today, 6);
        break;
      case "1y":
        startDate = subMonths(today, 12);
        break;
      case "all":
      default:
        return growthData;
    }

    return growthData.filter((item) => {
      const itemDate = parseISO(item.date);
      return itemDate >= startDate;
    });
  };

  // Filter milestones based on selected time range
  const getFilteredMilestones = () => {
    if (!milestones.length) return [];

    const filteredData = getFilteredData();
    if (!filteredData.length) return [];

    const startDate = parseISO(filteredData[0].date);
    const endDate = parseISO(filteredData[filteredData.length - 1].date);

    return milestones.filter((milestone) => {
      const milestoneDate = parseISO(milestone.date);
      return milestoneDate >= startDate && milestoneDate <= endDate;
    });
  };

  // Render milestone icon
  const renderMilestoneIcon = (icon: string) => {
    switch (icon) {
      case "trophy":
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case "star":
        return <Star className="h-5 w-5 text-blue-500" />;
      case "target":
        return <Target className="h-5 w-5 text-green-500" />;
      case "trending-up":
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case "award":
        return <Award className="h-5 w-5 text-red-500" />;
      default:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Check if this point is a milestone
      const milestone = milestones.find((m) => m.date === label);

      return (
        <div className="glass-card-inner p-3 border border-white/10 rounded shadow-md">
          <p className="text-sm font-medium">
            {format(parseISO(label), "MMM d, yyyy")}
          </p>
          <p className="text-sm text-foreground/80">
            Balance:{" "}
            <span className="font-semibold">
              ${payload[0].value.toLocaleString()}
            </span>
          </p>
          {milestone && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1 text-sm font-medium">
                {renderMilestoneIcon(milestone.icon)}
                {milestone.label}
              </div>
              <p className="text-xs text-foreground/80 mt-1">
                {milestone.description}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Render milestone markers on the timeline
  const renderMilestoneMarkers = () => {
    const filteredMilestones = getFilteredMilestones();

    return filteredMilestones.map((milestone, index) => (
      <ReferenceLine
        key={index}
        x={milestone.date}
        stroke={milestone.type === "achievement" ? "#3b82f6" : "#10b981"}
        strokeDasharray="3 3"
        label={{
          value: milestone.label,
          position: "insideTopRight",
          style: {
            fill: milestone.type === "achievement" ? "#3b82f6" : "#10b981",
            fontSize: 12,
          },
        }}
      />
    ));
  };

  // Render milestone cards
  const renderMilestoneCards = () => {
    const filteredMilestones = getFilteredMilestones();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filteredMilestones.map((milestone, index) => (
          <Card
            key={index}
            className="overflow-hidden glass-card-inner border border-white/10"
          >
            <div
              className={`h-1 ${milestone.type === "achievement" ? "bg-blue-500" : "bg-green-500"}`}
            />
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {renderMilestoneIcon(milestone.icon)}
                  <span className="font-medium">{milestone.label}</span>
                </div>
                <Badge
                  variant={
                    milestone.type === "achievement" ? "default" : "outline"
                  }
                >
                  {milestone.type === "achievement"
                    ? "Achievement"
                    : "Milestone"}
                </Badge>
              </div>
              <p className="text-sm text-foreground/80 mb-2">
                {milestone.description}
              </p>
              <div className="flex justify-between text-xs text-foreground/60">
                <span>{format(parseISO(milestone.date), "MMM d, yyyy")}</span>
                <span>${milestone.value.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full glass-card shadow-sm border border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Mental Bank Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700/30 rounded w-1/4"></div>
            <div className="h-64 bg-gray-700/30 rounded"></div>
            <div className="h-40 bg-gray-700/30 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = getFilteredData();

  return (
    <Card className="w-full glass-card shadow-sm border border-white/10">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Mental Bank Growth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          {/* Time range selector */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Badge
                variant={timeRange === "1m" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange("1m")}
              >
                1 Month
              </Badge>
              <Badge
                variant={timeRange === "3m" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange("3m")}
              >
                3 Months
              </Badge>
              <Badge
                variant={timeRange === "6m" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange("6m")}
              >
                6 Months
              </Badge>
              <Badge
                variant={timeRange === "1y" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange("1y")}
              >
                1 Year
              </Badge>
              <Badge
                variant={timeRange === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTimeRange("all")}
              >
                All Time
              </Badge>
            </div>
          </div>

          {/* Growth chart */}
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), "MMM d")}
                  interval={Math.floor(filteredData.length / 10)} // Show approximately 10 ticks
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />

                {/* Target balance reference line */}
                {targetBalance > 0 && (
                  <ReferenceLine
                    y={targetBalance}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{
                      value: `Target: $${targetBalance.toLocaleString()}`,
                      position: "right",
                      style: { fill: "#ef4444" },
                    }}
                  />
                )}

                {/* Milestone markers */}
                {renderMilestoneMarkers()}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="milestones">
            <TabsList className="grid w-full grid-cols-2 bg-transparent border border-white/10">
              <TabsTrigger value="milestones">
                Milestones & Achievements
              </TabsTrigger>
              <TabsTrigger value="stats">Growth Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="milestones" className="pt-4 bg-transparent">
              {getFilteredMilestones().length > 0 ? (
                renderMilestoneCards()
              ) : (
                <div className="text-center py-8 text-foreground/60 glass-card-inner rounded-lg border border-white/10">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-foreground/30" />
                  <p>No milestones or achievements in this time period.</p>
                  <p className="text-sm">
                    Try selecting a different time range or complete more tasks
                    to earn achievements.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="pt-4 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card-inner border border-white/10">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Starting Balance
                    </div>
                    <div className="text-2xl font-bold">
                      ${filteredData[0]?.value.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {filteredData[0]
                        ? format(parseISO(filteredData[0].date), "MMM d, yyyy")
                        : ""}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-inner border border-white/10">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Current Balance
                    </div>
                    <div className="text-2xl font-bold">
                      $
                      {filteredData[
                        filteredData.length - 1
                      ]?.value.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {filteredData[filteredData.length - 1]
                        ? format(
                            parseISO(
                              filteredData[filteredData.length - 1].date,
                            ),
                            "MMM d, yyyy",
                          )
                        : ""}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card-inner border border-white/10">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Growth</div>
                    <div className="text-2xl font-bold text-green-600">
                      {filteredData.length > 1
                        ? `+$${(filteredData[filteredData.length - 1].value - filteredData[0].value).toLocaleString()}`
                        : "$0"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {filteredData.length > 1
                        ? `${((filteredData[filteredData.length - 1].value / filteredData[0].value - 1) * 100).toFixed(1)}% increase`
                        : "0% increase"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">Growth Milestones</h3>
                <div className="overflow-x-auto glass-card-inner rounded-lg border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-transparent">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Milestone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-white/10">
                      {getFilteredMilestones().map((milestone, index) => (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">
                            {format(parseISO(milestone.date), "MMM d, yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ${milestone.value.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/60">
                            <div className="flex items-center gap-2">
                              {renderMilestoneIcon(milestone.icon)}
                              {milestone.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                milestone.type === "achievement"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {milestone.type === "achievement"
                                ? "Achievement"
                                : "Milestone"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default MentalBankGrowth;
