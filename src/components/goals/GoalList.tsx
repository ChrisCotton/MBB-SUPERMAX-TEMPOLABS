import React, { useState } from "react";
import { format, differenceInDays, isPast } from "date-fns";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Award,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import { Goal } from "@/lib/types";
import GoalMilestoneList from "./GoalMilestoneList";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import GoalForm from "./GoalForm";

interface GoalListProps {
  goals: Goal[];
  onUpdateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
}

const GoalList = ({ goals, onUpdateGoal }: GoalListProps) => {
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  const toggleGoal = (goalId: string) => {
    setOpenGoalId(openGoalId === goalId ? null : goalId);
  };

  const handleEditGoal = (goalId: string) => {
    setEditingGoalId(goalId);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await onUpdateGoal(goalId, { isActive: false });
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await onUpdateGoal(goalId, {
        isCompleted: true,
        progressPercentage: 100,
        currentValue: goals.find((g) => g.id === goalId)?.targetValue || 0,
      });
    } catch (error) {
      console.error("Error completing goal:", error);
    }
  };

  const handleUpdateGoalSubmit = async (goal: Partial<Goal>) => {
    if (editingGoalId) {
      try {
        await onUpdateGoal(editingGoalId, goal);
        setEditingGoalId(null);
      } catch (error) {
        console.error("Error updating goal:", error);
      }
    }
  };

  const getTimeRemainingText = (targetDate: string) => {
    const daysRemaining = differenceInDays(new Date(targetDate), new Date());
    if (daysRemaining < 0) return "Overdue";
    if (daysRemaining === 0) return "Due today";
    if (daysRemaining === 1) return "1 day remaining";
    return `${daysRemaining} days remaining`;
  };

  const getStatusBadge = (goal: Goal) => {
    if (goal.isCompleted) {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (isPast(new Date(goal.targetDate)) && !goal.isCompleted) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    const daysRemaining = differenceInDays(
      new Date(goal.targetDate),
      new Date(),
    );
    if (daysRemaining <= 3) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
          Due Soon
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-blue-500 text-blue-600">
        In Progress
      </Badge>
    );
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No goals set for this time period.</p>
        <p className="text-sm">Click "Add Goal" to create your first goal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editingGoalId && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h3 className="text-lg font-medium mb-4">Edit Goal</h3>
            <GoalForm
              onSubmit={handleUpdateGoalSubmit}
              onCancel={() => setEditingGoalId(null)}
              initialData={goals.find((g) => g.id === editingGoalId)}
              isEditing
            />
          </CardContent>
        </Card>
      )}

      {goals.map((goal) => (
        <Collapsible
          key={goal.id}
          open={openGoalId === goal.id}
          onOpenChange={() => toggleGoal(goal.id)}
          className="border rounded-lg overflow-hidden"
        >
          <Card className={`${goal.isCompleted ? "bg-green-50" : ""}`}>
            <CardContent className="p-0">
              <CollapsibleTrigger asChild>
                <div className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium mr-3">
                          {goal.title}
                        </h3>
                        {getStatusBadge(goal)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!goal.isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGoal(goal.id);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this goal? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGoal(goal.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <div className="mb-2">
                      <Progress
                        value={goal.progressPercentage}
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1 text-sm text-gray-500">
                        <span>{goal.progressPercentage}% complete</span>
                        <span>
                          ${goal.currentValue.toLocaleString()} / $
                          {goal.targetValue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{getTimeRemainingText(goal.targetDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          Target:{" "}
                          {format(new Date(goal.targetDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      {goal.reward && (
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Reward: {goal.reward}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {openGoalId === goal.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-4 pb-4 pt-2 border-t">
                  {goal.description && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-gray-700">{goal.description}</p>
                    </div>
                  )}

                  <GoalMilestoneList
                    goalId={goal.id}
                    milestones={goal.milestones || []}
                    onUpdate={() => onUpdateGoal(goal.id, {})}
                  />

                  {!goal.isCompleted && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => handleCompleteGoal(goal.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Mark as
                        Complete
                      </Button>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default GoalList;
