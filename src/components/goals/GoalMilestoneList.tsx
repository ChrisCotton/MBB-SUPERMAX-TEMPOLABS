import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { GoalMilestone } from "@/lib/types";
import {
  addGoalMilestone,
  updateGoalMilestone,
  deleteGoalMilestone,
} from "@/lib/goals";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";

interface GoalMilestoneListProps {
  goalId?: string;
  milestones?: GoalMilestone[];
  onUpdate?: () => void;
}

const GoalMilestoneList = ({
  goalId = "",
  milestones = [],
  onUpdate = () => {},
}: GoalMilestoneListProps) => {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<{
    title: string;
    targetValue: number;
    targetDate: Date;
  }>({
    title: "",
    targetValue: 0,
    targetDate: new Date(),
  });

  const [editingMilestone, setEditingMilestone] = useState<{
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
  } | null>(null);

  const handleAddMilestone = async () => {
    if (!newMilestone.title || newMilestone.targetValue <= 0 || !goalId) return;

    try {
      await addGoalMilestone({
        goalId,
        ...newMilestone,
      });
      setIsAddingMilestone(false);
      setNewMilestone({
        title: "",
        targetValue: 0,
        targetDate: new Date(),
      });
      onUpdate();
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const handleUpdateMilestone = async () => {
    if (!editingMilestone) return;

    try {
      await updateGoalMilestone({
        id: editingMilestone.id,
        title: editingMilestone.title,
        targetValue: editingMilestone.targetValue,
        currentValue: editingMilestone.currentValue,
      });
      setEditingMilestone(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating milestone:", error);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    try {
      await deleteGoalMilestone(id);
      onUpdate();
    } catch (error) {
      console.error("Error deleting milestone:", error);
    }
  };

  return (
    <div className="space-y-4">
      {(!milestones || milestones.length === 0) && !isAddingMilestone && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No milestones set for this goal yet.
          </p>
          <Button variant="outline" onClick={() => setIsAddingMilestone(true)}>
            Add First Milestone
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {milestones &&
          milestones.map((milestone) => (
            <Card key={milestone.id} className="overflow-hidden">
              <CardContent className="p-4">
                {editingMilestone?.id === milestone.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editingMilestone.title}
                      onChange={(e) =>
                        setEditingMilestone({
                          ...editingMilestone,
                          title: e.target.value,
                        })
                      }
                      placeholder="Milestone title"
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Target Value ($)
                        </label>
                        <Input
                          type="number"
                          value={editingMilestone.targetValue}
                          onChange={(e) =>
                            setEditingMilestone({
                              ...editingMilestone,
                              targetValue: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Current Value ($)
                        </label>
                        <Input
                          type="number"
                          value={editingMilestone.currentValue}
                          onChange={(e) =>
                            setEditingMilestone({
                              ...editingMilestone,
                              currentValue: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMilestone(null)}
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdateMilestone}>
                        <Check className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{milestone.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          Target: ${milestone.targetValue.toLocaleString()} by{" "}
                          {format(
                            new Date(milestone.targetDate),
                            "MMM d, yyyy",
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingMilestone({
                              id: milestone.id,
                              title: milestone.title,
                              targetValue: milestone.targetValue,
                              currentValue: milestone.currentValue || 0,
                            })
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={
                        milestone.currentValue
                          ? (milestone.currentValue / milestone.targetValue) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span>
                        ${milestone.currentValue?.toLocaleString() || "0"} of $
                        {milestone.targetValue.toLocaleString()}
                      </span>
                      <Badge variant="outline">
                        {milestone.currentValue
                          ? Math.round(
                              (milestone.currentValue / milestone.targetValue) *
                                100,
                            )
                          : 0}
                        % Complete
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {isAddingMilestone ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium">Add New Milestone</h4>
            <Input
              placeholder="Milestone title"
              value={newMilestone.title}
              onChange={(e) =>
                setNewMilestone({ ...newMilestone, title: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">
                  Target Value ($)
                </label>
                <Input
                  type="number"
                  value={newMilestone.targetValue || ""}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      targetValue: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Target Date
                </label>
                <Input
                  type="date"
                  value={
                    newMilestone.targetDate
                      ? format(newMilestone.targetDate, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      targetDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingMilestone(false);
                  setNewMilestone({
                    title: "",
                    targetValue: 0,
                    targetDate: new Date(),
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMilestone}>Add Milestone</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        milestones &&
        milestones.length > 0 && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingMilestone(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Milestone
          </Button>
        )
      )}
    </div>
  );
};

export default GoalMilestoneList;
