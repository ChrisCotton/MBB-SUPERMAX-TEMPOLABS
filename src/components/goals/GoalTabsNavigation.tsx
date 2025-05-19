import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoalTabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const GoalTabsNavigation = ({
  activeTab,
  onTabChange,
}: GoalTabsNavigationProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-transparent border border-white/10">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="goals">Goals</TabsTrigger>
        <TabsTrigger value="milestones">Milestones</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="vision">Vision Board</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default GoalTabsNavigation;
