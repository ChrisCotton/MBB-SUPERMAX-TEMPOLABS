import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, CheckCircle, Award, X } from "lucide-react";
import { GoalMilestone } from "@/lib/types";
import { addGoalMilestone, updateGoalMilestone } from "@/lib/goals";

interface GoalMilestoneListProps {
  goalId: string;
  milestones: GoalMilestone[];
  onUpdate: () => void;
}

const GoalMilestoneList = ({
  goalId,
  milestones,
  onUpdate,
}: GoalMilestoneListProps) => {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    targetValue: 0,
    reward: "",
  });

  const handleAddMilestone = async () => {
    if (!newMilestone.title || newMilestone.targetValue <= 0) return;

    try {
      await addGoalMilestone({
        goalId,
        ...newMilestone,
      });
      setNewMilestone({
        title: "",
        description: "",
        targetValue: 0,
        reward: "",
      });
      setIsAddingMilestone(false);
      onUpdate();
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      await updateGoalMilestone(milestoneId, {
        isCompleted: true,
        completionDate: new Date().toISOString(),
      });
      onUpdate();
    } catch (error) {
      console.error("Error completing milestone:", error);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Milestones</h4>
        {!isAddingMilestone && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingMilestone(true)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" /> Add Milestone
          </Button>
        )}
      </div>

      {milestones.length === 0 && !isAddingMilestone && (
        <p className="text-sm text-gray-500 italic">
          No milestones set for this goal yet.
        </p>
      )}

      {isAddingMilestone && (
        <div className="border rounded-md p-3 mb-3 bg-gray-50">
          <div className="flex justify-between items-start mb-2">
            <h5 className="text-sm font-medium">New Milestone</h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingMilestone(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <Input
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div>
              <Textarea
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    description: e.target.value,
                  })
                }
                className="text-sm resize-none h-16"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Target value ($)"
                  value={newMilestone.targetValue || ""}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      targetValue: parseFloat(e.target.value),
                    })
                  }
                  className="text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Input
                  placeholder="Reward (optional)"
                  value={newMilestone.reward}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, reward: e.target.value })
                  }
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleAddMilestone}
                disabled={!newMilestone.title || newMilestone.targetValue <= 0}
              >
                Add Milestone
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`border rounded-md p-3 ${milestone.isCompleted ? "bg-green-50" : ""}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-sm font-medium flex items-center">
                  {milestone.isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {milestone.title}
                </h5>
                {milestone.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {milestone.description}
                  </p>
                )}
              </div>
              {!milestone.isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCompleteMilestone(milestone.id)}
                  className="h-7 text-xs"
                >
                  Complete
                </Button>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Target: ${milestone.targetValue.toLocaleString()}</span>
              {milestone.reward && (
                <span className="flex items-center">
                  <Award className="h-3 w-3 mr-1" /> {milestone.reward}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalMilestoneList;
