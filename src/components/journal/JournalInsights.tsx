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
    if (filteredEntries.length === 0) return [];

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
  const getSentimentData = async () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return [];

    try {
      // Try to use AI analysis
      const aiInsights = await import("@/lib/ai")
        .then(({ generateJournalInsights }) =>
          generateJournalInsights(filteredEntries),
        )
        .catch(() => null);

      if (aiInsights?.emotions) {
        // Use AI-generated emotions data
        return aiInsights.emotions.map((emotion: any) => ({
          name: emotion.name,
          value: emotion.intensity || emotion.count || 1,
        }));
      }
    } catch (error) {
      console.error("Error getting AI sentiment data:", error);
    }

    // Fallback to placeholder data
    const sentiments = [
      "Positive",
      "Neutral",
      "Negative",
      "Reflective",
      "Motivated",
    ];

    // Generate random distribution for demo purposes
    return sentiments.map((name) => ({
      name,
      value: Math.floor(Math.random() * filteredEntries.length),
    }));
  };

  // Get word count data over time
  const getWordCountData = () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return [];

    return filteredEntries.map((entry) => ({
      date: format(new Date(entry.createdAt), "yyyy-MM-dd"),
      wordCount: entry.content.split(/\s+/).length,
      hasAudio: entry.audioUrl ? 1 : 0,
    }));
  };

  // Get key themes using AI analysis when available
  const getKeyThemes = async () => {
    const filteredEntries = getFilteredEntries();
    if (filteredEntries.length === 0) return [];

    try {
      // Try to use AI analysis
      const aiInsights = await import("@/lib/ai")
        .then(({ generateJournalInsights }) =>
          generateJournalInsights(filteredEntries),
        )
        .catch(() => null);

      if (aiInsights?.themes) {
        // Use AI-generated themes data
        return aiInsights.themes.map((theme: any) => ({
          theme: theme.name,
          count: theme.count || 1,
        }));
      }
    } catch (error) {
      console.error("Error getting AI theme data:", error);
    }

    // Fallback to placeholder data
    const themes = [
      "Financial Growth",
      "Personal Development",
      "Challenges",
      "Achievements",
      "Goals",
      "Strategies",
      "Mindset",
      "Habits",
    ];

    // Generate random counts for demo purposes
    return themes.map((theme) => ({
      theme,
      count: Math.floor(Math.random() * filteredEntries.length) + 1,
    }));
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
              {data.map((entry, index) => (
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
        {themes.map((item) => (
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
    const [insights, setInsights] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
      const loadInsights = async () => {
        const filteredEntries = getFilteredEntries();
        if (filteredEntries.length === 0) return;

        try {
          setIsLoading(true);
          setAiError(null);

          // Try to use AI analysis
          const aiInsights = await import("@/lib/ai")
            .then(({ generateJournalInsights }) =>
              generateJournalInsights(filteredEntries),
            )
            .catch((err) => {
              console.error("Error importing AI module:", err);
              setAiError("AI analysis service not available");
              return null;
            });

          setInsights(aiInsights);
        } catch (error) {
          console.error("Error getting AI insights:", error);
          setAiError("Failed to generate AI insights");
        } finally {
          setIsLoading(false);
        }
      };

      loadInsights();
    }, [timeRange]);

    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-t-primary rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (aiError) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
              <p className="text-amber-800">{aiError}</p>
              <p className="text-sm text-amber-700 mt-2">
                To enable AI insights, please configure your AI API key in
                settings.
              </p>
            </div>

            <div className="space-y-4">
              <p>
                Based on your journal entries, here are some patterns and
                insights that might be helpful for your Mental Bank journey:
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">Patterns Observed:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    You tend to be most reflective and productive in the
                    mornings.
                  </li>
                  <li>
                    Your entries show increased positivity when discussing
                    long-term financial goals.
                  </li>
                  <li>
                    You've mentioned challenges with consistency in your daily
                    practice.
                  </li>
                  <li>
                    There's a correlation between completing high-value tasks
                    and positive journal entries.
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Suggestions:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Consider scheduling your most important tasks in the morning
                    when your energy is highest.
                  </li>
                  <li>
                    Continue focusing on your long-term vision, as it seems to
                    motivate you.
                  </li>
                  <li>
                    Try setting smaller, daily goals to build consistency in
                    your practice.
                  </li>
                  <li>
                    Celebrate your wins more explicitly in your journal entries
                    to reinforce positive associations.
                  </li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm italic">
                  Note: These are simulated insights. Enable AI integration for
                  personalized analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!insights) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No insights available for the selected time period.</p>
              <p className="text-sm mt-2">
                Try selecting a different time range or add more journal
                entries.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

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

            {insights.observations && insights.observations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Patterns Observed:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {insights.observations.map(
                    (observation: string, index: number) => (
                      <li key={index}>{observation}</li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {insights.suggestions && insights.suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Suggestions:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {insights.suggestions.map(
                    (suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {insights.progress && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">
                  Progress Toward Goals
                </h3>
                <div className="space-y-2">
                  {Object.entries(insights.progress).map(
                    ([goal, status]: [string, any]) => (
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
            )}

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm italic">
                Note: These insights are generated by AI based on the patterns
                in your journal entries. For personalized advice, consider
                consulting with a financial coach or mentor.
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
              {getFilteredEntries().length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Audio Entries</div>
            <div className="text-2xl font-bold">
              {getFilteredEntries().filter((e) => e.audioUrl).length}
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
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              Journaling Streak
            </div>
            <div className="text-2xl font-bold">3 days</div>
            <div className="text-xs text-muted-foreground">Best: 7 days</div>
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
