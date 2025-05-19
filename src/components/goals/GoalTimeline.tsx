import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
}

interface GoalTimelineProps {
  goals?: Goal[];
}

function GoalTimeline({ goals = [] }: GoalTimelineProps) {
  return (
    <Card className="w-full glass-card shadow-md border border-white/10">
      <CardHeader>
        <CardTitle>Goal Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {new Date(goal.targetDate).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                <div className="w-24 text-sm font-medium">{goal.title}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No goals to display</p>
        )}
      </CardContent>
    </Card>
  );
}

export default GoalTimeline;
