import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Milestone {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "completed" | "overdue";
  created_at: string;
}

export default function GoalMilestoneList() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
          setLoading(false);
          return;
        }

        const { data: goalMilestones, error } = await supabase
          .from("goal_milestones")
          .select("*")
          .eq("user_id", user.user.id)
          .order("due_date", { ascending: true });

        if (error) throw error;

        // Process milestones to determine status based on due date
        const processedMilestones = Array.isArray(goalMilestones)
          ? goalMilestones.map((milestone: any) => {
              const dueDate = new Date(milestone.due_date);
              const today = new Date();

              let status = milestone.status;
              if (status !== "completed" && dueDate < today) {
                status = "overdue";
              }

              return {
                ...milestone,
                status,
              };
            })
          : [];

        setMilestones(processedMilestones);
      } catch (error: any) {
        console.error("Error fetching milestones:", error);
        // Don't show error UI for 502 errors (temporary server issues)
        if (!(error.message && error.message.includes("502"))) {
          setError(error.message || "Failed to load milestones");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMilestones();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading milestones...</div>;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Error loading milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>Track progress toward your goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No milestones found. Create milestones for your goals to track
            progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Goal Milestones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{milestone.title}</CardTitle>
                {getStatusBadge(milestone.status)}
              </div>
              <CardDescription className="text-sm mt-1">
                Due: {new Date(milestone.due_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{milestone.description}</p>
              <div className="flex items-center gap-2">
                <Progress
                  value={milestone.status === "completed" ? 100 : 0}
                  className="h-2"
                />
                <span className="text-xs">
                  {milestone.status === "completed" ? "100%" : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
