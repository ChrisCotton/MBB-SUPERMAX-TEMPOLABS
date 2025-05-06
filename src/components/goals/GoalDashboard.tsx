import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoalList from "./GoalList";
import GoalForm from "./GoalForm";
import GoalSummary from "./GoalSummary";
import VisionBoardContainer from "./VisionBoardContainer";
import GoalTimeline from "./GoalTimeline";
import GoalMilestoneList from "./GoalMilestoneList";

// Change from named export to default export
export default function GoalDashboard() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="w-full glass-card rounded-lg p-6">
      <Tabs
        defaultValue="summary"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="vision">Vision Board</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <GoalSummary />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <GoalForm
                onSubmit={async (goalData) => {
                  try {
                    const { addGoal } = await import("@/lib/goals");
                    await addGoal(goalData);
                    // Refresh goals list
                    window.location.reload();
                  } catch (error) {
                    console.error("Error adding goal:", error);
                  }
                }}
                onCancel={() => {}}
              />
            </div>
            <div className="md:col-span-2">
              <GoalList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <GoalMilestoneList />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <GoalTimeline />
        </TabsContent>

        <TabsContent value="vision" className="space-y-4">
          <VisionBoardContainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
