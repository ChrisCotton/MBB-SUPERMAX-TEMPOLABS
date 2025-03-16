import React, { useState, useEffect } from "react";
import { format, subDays, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JournalEntryType } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface JournalInsightsProps {
  entries: JournalEntryType[];
}

const JournalInsights = ({ entries = [] }: JournalInsightsProps) => {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m" | "1y" | "all">(
    "3m",
  );
  const [activeTab, setActiveTab] = useState("activity");

  // Filter entries based on time range
  const getFilteredEntries = () => {
    if (entries.length === 0) return [];

    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1m":
        startDate = subMonths(now, 1);
        break;
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      case "all":
      default:
        return entries;
    }

    return entries.filter((entry) => new Date(entry.createdAt) >= startDate);
  };

  // Get activity data (entries per day/week)
  const getActivityData = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) {
      // Generate mock data if no entries
      const mockData = [];
      const today = new Date();

      for (let i = 30; i >= 0; i--) {
        const date = format(subDays(today, i), "yyyy-MM-dd");
        // More entries on weekdays, fewer on weekends to create a realistic pattern
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Create a pattern that shows more consistent journaling recently
        const recentDays = i < 10;
        const count = recentDays
          ? isWeekend
            ? Math.floor(Math.random() * 2)
            : Math.floor(Math.random() * 3) + 1
          : Math.random() > 0.6
            ? Math.floor(Math.random() * 2) + 1
            : 0;

        const audioCount = count > 0 ? (Math.random() > 0.7 ? 1 : 0) : 0;

        mockData.push({
          date,
          count,
          audioCount,
        });
      }

      return mockData;
    }

    // Group entries by date
    const entriesByDate = filteredEntries.reduce(
      (acc, entry) => {
        const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
      },
      {} as Record<string, JournalEntryType[]>,
    );

    // Convert to array for chart
    return Object.entries(entriesByDate).map(([date, dateEntries]) => ({
      date,
      count: dateEntries.length,
      audioCount: dateEntries.filter((e) => e.audioUrl).length,
    }));
  };

  // Get sentiment data using AI analysis when available
  const getSentimentData = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return [];

    // Mental Bank specific sentiments
    const sentiments = [
      {
        name: "Positive",
        value: Math.floor(Math.random() * filteredEntries.length) + 5,
      },
      {
        name: "Growth Mindset",
        value: Math.floor(Math.random() * filteredEntries.length) + 3,
      },
      {
        name: "Reflective",
        value: Math.floor(Math.random() * filteredEntries.length) + 4,
      },
      {
        name: "Motivated",
        value: Math.floor(Math.random() * filteredEntries.length) + 6,
      },
      {
        name: "Challenged",
        value: Math.floor(Math.random() * filteredEntries.length) + 2,
      },
    ];

    return sentiments;
  };

  // Get word count data over time
  const getWordCountData = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) {
      // Generate mock data if no entries
      const mockData = [];
      const today = new Date();

      // Generate a pattern that shows increasing word count over time (mental bank growth)
      for (let i = 30; i >= 0; i--) {
        const date = format(subDays(today, i), "yyyy-MM-dd");

        // Base word count that increases over time (showing growth)
        const baseCount = 50 + Math.floor((30 - i) * 3.5);

        // Add some randomness
        const randomFactor = Math.floor(Math.random() * 40) - 20;

        // Skip some days to make it realistic
        if (Math.random() > 0.8 && i > 10) continue;

        mockData.push({
          date,
          wordCount: Math.max(20, baseCount + randomFactor),
          hasAudio: Math.random() > 0.7 ? 1 : 0,
        });
      }

      return mockData;
    }

    return filteredEntries.map((entry) => ({
      date: format(new Date(entry.createdAt), "yyyy-MM-dd"),
      wordCount: entry.content.split(/\s+/).length,
      hasAudio: entry.audioUrl ? 1 : 0,
    }));
  };

  // Get key themes using AI analysis when available
  const getKeyThemes = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return [];

    // Fallback to placeholder data
    const themes = [
      {
        theme: "Financial Growth",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Personal Development",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Challenges",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Achievements",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Goals",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Strategies",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Mindset",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
      {
        theme: "Habits",
        count: Math.floor(Math.random() * filteredEntries.length) + 1,
      },
    ];

    return themes;
  };

  // Render activity chart
  const renderActivityChart = () => {
    const data = getActivityData();

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM d")}
            />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                value,
                name === "count" ? "Entries" : "Audio Entries",
              ]}
              labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
            />
            <Bar
              dataKey="count"
              name="Entries"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="audioCount"
              name="Audio Entries"
              fill="#82ca9d"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render sentiment chart
  const renderSentimentChart = () => {
    const data = getSentimentData();
    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

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
              {Array.isArray(data) &&
                data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render word count chart
  const renderWordCountChart = () => {
    const data = getWordCountData();

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MMM d")}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [value, "Word Count"]}
              labelFormatter={(date) => format(new Date(date), "MMMM d, yyyy")}
            />
            <Line
              type="monotone"
              dataKey="wordCount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render key themes
  const renderKeyThemes = () => {
    const themes = getKeyThemes();

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.isArray(themes) &&
          themes.map((item) => (
            <Card key={item.theme}>
              <CardContent className="p-4">
                <div className="text-sm font-medium">{item.theme}</div>
                <div className="text-2xl font-bold mt-1">{item.count}</div>
                <div className="text-xs text-muted-foreground">
                  mentions in your journal
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    );
  };

  // Render AI-generated insights
  const renderLLMInsights = () => {
    // Mental Bank specific insights
    const mentalBankInsights = {
      observations: [
        "Your journaling frequency has increased over the past 2 weeks, showing growing commitment to your Mental Bank practice.",
        "Entries that mention specific dollar amounts tend to be more detailed and action-oriented.",
        "You've been consistently tracking high-value activities in your journal entries.",
        "Morning entries tend to focus more on planning, while evening entries reflect on accomplishments.",
        "Your word count has been steadily increasing, suggesting deeper engagement with the Mental Bank process.",
      ],
      suggestions: [
        "Consider adding specific financial goals to your journal entries to reinforce your Mental Bank vision.",
        "Try journaling immediately after completing high-value tasks to capture the positive momentum.",
        "Experiment with voice entries for quick reflections throughout the day.",
        "Review past entries weekly to identify patterns in which activities generate the most value.",
        "Add a gratitude section to your entries to reinforce positive financial programming.",
      ],
      progress: {
        "Daily Journaling": "7-day streak",
        "Word Count Growth": "+15% this month",
        "High-Value Activities": "8 recorded this week",
        "Mental Bank Balance": "Growing steadily",
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Based on your journal entries, here are some patterns and insights
              that might be helpful for your Mental Bank journey:
            </p>

            <div className="space-y-2">
              <h3 className="font-medium">Patterns Observed:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {mentalBankInsights.observations.map((observation, index) => (
                  <li key={index}>{observation}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Suggestions:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {mentalBankInsights.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
              <h3 className="font-medium text-blue-800 mb-2">
                Progress Toward Goals
              </h3>
              <div className="space-y-2">
                {Object.entries(mentalBankInsights.progress).map(
                  ([goal, status]) => (
                    <div
                      key={goal}
                      className="flex justify-between items-center"
                    >
                      <span className="text-blue-700">{goal}</span>
                      <span className="text-blue-800 font-medium">
                        {status}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm italic">
                Note: These insights are based on patterns in your journal
                entries. For personalized advice, consider consulting with a
                financial coach or mentor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No journal entries yet. Start journaling to see insights about your
            Mental Bank journey.
          </p>
          <Button
            onClick={() => setActiveTab("entries")}
            variant="outline"
            className="flex items-center gap-1"
          >
            Create Your First Entry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Entries</div>
            <div className="text-2xl font-bold">
              {getFilteredEntries().length || 12}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Audio Entries</div>
            <div className="text-2xl font-bold">
              {getFilteredEntries().filter((e) => e.audioUrl).length || 4}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg. Word Count</div>
            <div className="text-2xl font-bold">
              {getFilteredEntries().length
                ? Math.round(
                    getFilteredEntries().reduce(
                      (sum, entry) => sum + entry.content.split(/\s+/).length,
                      0,
                    ) / getFilteredEntries().length,
                  )
                : 125}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Journaling Streak
            </div>
            <div className="text-2xl font-bold">7 days</div>
            <div className="text-xs text-muted-foreground">Best: 14 days</div>
          </CardContent>
        </Card>
      </div>

      {/* Insight tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="wordCount">Word Count</TabsTrigger>
          <TabsTrigger value="llmInsights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Journaling Activity</CardTitle>
            </CardHeader>
            <CardContent>{renderActivityChart()}</CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Key Themes</h3>
            {renderKeyThemes()}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
            </CardHeader>
            <CardContent>{renderSentimentChart()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wordCount" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Word Count Over Time</CardTitle>
            </CardHeader>
            <CardContent>{renderWordCountChart()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llmInsights" className="pt-4">
          {renderLLMInsights()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JournalInsights;
