import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date: string;
  status: string | null;
  progress: number;
  created_at: string;
}

export default function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGoals(data || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching goals:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, []);

  const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <Clock className="h-5 w-5 text-gray-500" />;

    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "at risk":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 hover:bg-gray-200";

    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "at risk":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading goals...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-700">No goals yet</h3>
        <p className="mt-2 text-gray-500">
          Create your first goal to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Your Goals</h2>
      {goals.map((goal) => (
        <Card key={goal.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{goal.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{goal.description}</p>
              </div>
              <Badge className={getStatusColor(goal.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(goal.status)}
                  {goal.status || "In Progress"}
                </span>
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Target: {new Date(goal.target_date).toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
