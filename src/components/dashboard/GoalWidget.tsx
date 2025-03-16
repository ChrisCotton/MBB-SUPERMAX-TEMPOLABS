import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { ChevronRight, Target, Calendar } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Goal } from "@/lib/types";
import { getGoals } from "@/lib/goals";

interface GoalWidgetProps {
  onViewAllClick: () => void;
}

const GoalWidget = ({ onViewAllClick }: GoalWidgetProps) => {
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
      )
      .slice(0, 3); // Show only top 3
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Upcoming Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingGoals = getUpcomingGoals();

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Upcoming Goals</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAllClick}
          className="text-sm"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        {upcomingGoals.length > 0 ? (
          <div className="space-y-3">
            {upcomingGoals.map((goal) => (
              <div key={goal.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium">{goal.title}</h3>
                  <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {goal.timeFrame}
                  </span>
                </div>
                <Progress
                  value={goal.progressPercentage}
                  className="h-1.5 mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />$
                    {goal.targetValue.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due {format(new Date(goal.targetDate), "MMM d")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Target className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No upcoming goals this week</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllClick}
              className="mt-2 text-xs"
            >
              Set New Goals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalWidget;
