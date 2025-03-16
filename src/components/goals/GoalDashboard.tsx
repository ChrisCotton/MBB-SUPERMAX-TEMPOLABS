import React, { useState, useEffect } from "react";
import { format, addWeeks, addMonths, addYears } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Plus, Trophy, Target, Calendar, ChevronRight } from "lucide-react";
import GoalList from "./GoalList";
import GoalForm from "./GoalForm";
import GoalTimeline from "./GoalTimeline";
import { Goal, TimeFrame } from "@/lib/types";
import { getGoals, addGoal, updateGoal } from "@/lib/goals";

interface GoalDashboardProps {
  onGoalUpdate?: () => void;
}

const GoalDashboard = ({ onGoalUpdate }: GoalDashboardProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [activeTab, setActiveTab] = useState<TimeFrame>("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const fetchedGoals = await getGoals();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async (
    goal: Omit<
      Goal,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "progressPercentage"
      | "isCompleted"
      | "milestones"
    >,
  ) => {
    try {
      await addGoal(goal);
      setIsAddingGoal(false);
      loadGoals();
      if (onGoalUpdate) onGoalUpdate();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleUpdateGoal = async (id: string, goalData: Partial<Goal>) => {
    try {
      await updateGoal(id, goalData);
      loadGoals();
      if (onGoalUpdate) onGoalUpdate();
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const getFilteredGoals = () => {
    return goals.filter(
      (goal) => goal.timeFrame === activeTab && goal.isActive,
    );
  };

  const getDefaultTargetDate = (timeFrame: TimeFrame): Date => {
    const today = new Date();
    switch (timeFrame) {
      case "weekly":
        return addWeeks(today, 1);
      case "monthly":
        return addMonths(today, 1);
      case "biannual":
        return addMonths(today, 6);
      case "annual":
        return addYears(today, 1);
      default:
        return addWeeks(today, 1);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Goal Dashboard
          </CardTitle>
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
    <Card className="w-full bg-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Goal Dashboard</CardTitle>
        {!isAddingGoal && (
          <Button onClick={() => setIsAddingGoal(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Goal
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAddingGoal ? (
          <GoalForm
            onSubmit={handleAddGoal}
            onCancel={() => setIsAddingGoal(false)}
            defaultTimeFrame={activeTab}
            defaultTargetDate={getDefaultTargetDate(activeTab)}
          />
        ) : (
          <div className="space-y-6">
            <Tabs
              defaultValue="weekly"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TimeFrame)}
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="weekly" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> Monthly
                </TabsTrigger>
                <TabsTrigger value="biannual" className="flex items-center">
                  <Target className="h-4 w-4 mr-2" /> 6 Months
                </TabsTrigger>
                <TabsTrigger value="annual" className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" /> Annual
                </TabsTrigger>
              </TabsList>

              {["weekly", "monthly", "biannual", "annual"].map((timeFrame) => (
                <TabsContent key={timeFrame} value={timeFrame} className="pt-4">
                  <GoalList
                    goals={goals.filter(
                      (goal) => goal.timeFrame === timeFrame && goal.isActive,
                    )}
                    onUpdateGoal={handleUpdateGoal}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Goal Timeline</h3>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <GoalTimeline goals={goals.filter((goal) => goal.isActive)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalDashboard;
