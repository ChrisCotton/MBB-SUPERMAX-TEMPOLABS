import React, { useState, useEffect } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  ChevronRight,
  Target,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";
import { Goal, TimeFrame } from "@/lib/types";
import { getGoals } from "@/lib/goals";

interface GoalSummaryProps {
  onViewAllClick?: () => void;
}

const GoalSummary = ({ onViewAllClick }: GoalSummaryProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const fetchedGoals = await getGoals();
      setGoals(fetchedGoals.filter((goal) => goal.isActive));
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUpcomingGoals = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return goals
      .filter((goal) => {
        const targetDate = new Date(goal.targetDate);
        return (
          !goal.isCompleted &&
          isAfter(targetDate, today) &&
          isBefore(targetDate, nextWeek)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
      );
  };

  const getGoalsByTimeFrame = (timeFrame: TimeFrame) => {
    return goals.filter(
      (goal) => goal.timeFrame === timeFrame && goal.isActive,
    );
  };

  const calculateCompletionRate = (timeFrame: TimeFrame) => {
    const timeFrameGoals = getGoalsByTimeFrame(timeFrame);
    if (timeFrameGoals.length === 0) return 0;

    const completedGoals = timeFrameGoals.filter(
      (goal) => goal.isCompleted,
    ).length;
    return Math.round((completedGoals / timeFrameGoals.length) * 100);
  };

  const getAverageProgress = (timeFrame: TimeFrame) => {
    const timeFrameGoals = getGoalsByTimeFrame(timeFrame).filter(
      (goal) => !goal.isCompleted,
    );
    if (timeFrameGoals.length === 0) return 0;

    const totalProgress = timeFrameGoals.reduce(
      (sum, goal) => sum + goal.progressPercentage,
      0,
    );
    return Math.round(totalProgress / timeFrameGoals.length);
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Goal Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingGoals = getUpcomingGoals();

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Goal Summary</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAllClick}>
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Time frame progress overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(["weekly", "monthly", "biannual", "annual"] as TimeFrame[]).map(
              (timeFrame) => {
                const completionRate = calculateCompletionRate(timeFrame);
                const averageProgress = getAverageProgress(timeFrame);
                const timeFrameGoals = getGoalsByTimeFrame(timeFrame);

                return (
                  <Card key={timeFrame} className="overflow-hidden">
                    <div
                      className={`h-1 ${
                        timeFrame === "weekly"
                          ? "bg-blue-500"
                          : timeFrame === "monthly"
                            ? "bg-purple-500"
                            : timeFrame === "biannual"
                              ? "bg-orange-500"
                              : "bg-green-500"
                      }`}
                    />
                    <CardContent className="p-4">
                      <h3 className="text-sm font-medium capitalize mb-2">
                        {timeFrame} Goals
                      </h3>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">
                          Completion Rate
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {completionRate}%
                        </Badge>
                      </div>
                      <Progress value={completionRate} className="h-1 mb-3" />

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">
                          Avg. Progress
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {averageProgress}%
                        </Badge>
                      </div>
                      <Progress value={averageProgress} className="h-1 mb-2" />

                      <div className="text-xs text-gray-500 mt-2">
                        {timeFrameGoals.length} goal
                        {timeFrameGoals.length !== 1 ? "s" : ""} total
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>

          {/* Upcoming goals this week */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming Goals This Week
            </h3>

            {upcomingGoals.length > 0 ? (
              <div className="space-y-2">
                {upcomingGoals.map((goal) => (
                  <Card key={goal.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium">{goal.title}</h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Target className="h-3 w-3 mr-1" />
                            <span>${goal.targetValue.toLocaleString()}</span>
                            <span className="mx-2">•</span>
                            <span>
                              Due {format(new Date(goal.targetDate), "MMM d")}
                            </span>
                          </div>
                        </div>
                        <Badge className="ml-2">
                          {goal.progressPercentage}%
                        </Badge>
                      </div>
                      <Progress
                        value={goal.progressPercentage}
                        className="h-1 mt-2"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-gray-500">
                  <p className="text-sm">No goals due this week.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Total Active Goals</span>
              <span className="text-xl font-semibold">
                {goals.filter((g) => g.isActive).length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Completed Goals</span>
              <span className="text-xl font-semibold">
                {goals.filter((g) => g.isCompleted).length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Highest Value Goal</span>
              <span className="text-xl font-semibold">
                $
                {Math.max(
                  ...goals.map((g) => g.targetValue),
                  0,
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">
                Avg. Completion Rate
              </span>
              <div className="flex items-center">
                <span className="text-xl font-semibold">
                  {goals.length > 0
                    ? Math.round(
                        (goals.filter((g) => g.isCompleted).length /
                          goals.length) *
                          100,
                      )
                    : 0}
                  %
                </span>
                <TrendingUp className="h-4 w-4 ml-2 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalSummary;
