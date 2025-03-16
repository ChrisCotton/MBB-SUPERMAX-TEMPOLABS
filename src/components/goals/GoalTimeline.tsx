import React from "react";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { Card, CardContent } from "../ui/card";
import { Goal } from "@/lib/types";

interface GoalTimelineProps {
  goals: Goal[];
}

const GoalTimeline = ({ goals }: GoalTimelineProps) => {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          <p>No active goals to display on the timeline.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort goals by target date
  const sortedGoals = [...goals].sort((a, b) => {
    const dateA = new Date(a.targetDate);
    const dateB = new Date(b.targetDate);
    return dateA.getTime() - dateB.getTime();
  });

  // Find the earliest and latest dates
  const earliestDate = new Date(sortedGoals[0].startDate);
  const latestDate = new Date(sortedGoals[sortedGoals.length - 1].targetDate);
  const today = new Date();

  // Calculate the total timeline duration in days
  const timelineDuration = latestDate.getTime() - earliestDate.getTime();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-6"></div>

          {/* Today marker */}
          {isAfter(today, earliestDate) && isBefore(today, latestDate) && (
            <div
              className="absolute w-0.5 h-full bg-blue-500 z-10"
              style={{
                left: `${((today.getTime() - earliestDate.getTime()) / timelineDuration) * 100}%`,
                top: 0,
                height: "100%",
              }}
            >
              <div className="absolute top-0 -left-1.5 w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="absolute -left-8 -top-8 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                Today
              </div>
            </div>
          )}

          {/* Timeline start and end labels */}
          <div className="flex justify-between mb-2 text-xs text-gray-500">
            <span>{format(earliestDate, "MMM d, yyyy")}</span>
            <span>{format(latestDate, "MMM d, yyyy")}</span>
          </div>

          {/* Goals markers */}
          <div className="relative h-32 mt-8">
            {sortedGoals.map((goal, index) => {
              const startDate = new Date(goal.startDate);
              const targetDate = new Date(goal.targetDate);

              // Calculate position percentages
              const startPercent =
                ((startDate.getTime() - earliestDate.getTime()) /
                  timelineDuration) *
                100;
              const targetPercent =
                ((targetDate.getTime() - earliestDate.getTime()) /
                  timelineDuration) *
                100;

              // Alternate vertical positions to avoid overlap
              const topPosition = index % 2 === 0 ? 0 : 60;

              return (
                <div key={goal.id} className="absolute">
                  {/* Start date marker */}
                  <div
                    className="absolute h-3 w-3 rounded-full bg-gray-400"
                    style={{
                      left: `${startPercent}%`,
                      top: `${topPosition}px`,
                    }}
                  ></div>

                  {/* Goal line */}
                  <div
                    className={`absolute h-1 ${goal.isCompleted ? "bg-green-500" : "bg-purple-500"}`}
                    style={{
                      left: `${startPercent}%`,
                      width: `${targetPercent - startPercent}%`,
                      top: `${topPosition + 1}px`,
                    }}
                  ></div>

                  {/* Target date marker */}
                  <div
                    className={`absolute h-3 w-3 rounded-full ${goal.isCompleted ? "bg-green-500" : "bg-purple-500"}`}
                    style={{
                      left: `${targetPercent}%`,
                      top: `${topPosition}px`,
                    }}
                  ></div>

                  {/* Goal label */}
                  <div
                    className={`absolute text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${goal.isCompleted ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}
                    style={{
                      left: `${startPercent + (targetPercent - startPercent) / 2}%`,
                      top: `${topPosition + 10}px`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {goal.title}
                  </div>

                  {/* Target date label */}
                  <div
                    className="absolute text-xs text-gray-500 whitespace-nowrap"
                    style={{
                      left: `${targetPercent}%`,
                      top: `${topPosition + 30}px`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {format(targetDate, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalTimeline;
