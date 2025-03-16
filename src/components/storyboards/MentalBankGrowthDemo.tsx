import React from "react";
import MentalBankGrowth from "@/components/dashboard/MentalBankGrowth";
import { format, subDays, subMonths } from "date-fns";

const MentalBankGrowthDemo = () => {
  // Generate realistic growth data
  const generateGrowthData = () => {
    const data = [];
    const today = new Date();
    let currentValue = 1000; // Starting value

    // Generate data for the past year with more realistic growth patterns
    for (let i = 365; i >= 0; i--) {
      const date = subDays(today, i);
      const dayOfWeek = date.getDay();

      // More growth on weekdays, less on weekends
      let dailyGrowth = 0;

      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Weekdays
        dailyGrowth = Math.random() * 150 - 10; // Between -10 and 140
      } else {
        // Weekends
        dailyGrowth = Math.random() * 50 - 20; // Between -20 and 30
      }

      // Add occasional big jumps (completed high-value tasks)
      if (Math.random() < 0.05) {
        // 5% chance of a big jump
        dailyGrowth += Math.random() * 500 + 200; // Add between 200 and 700
      }

      // Add monthly pattern (e.g., monthly review sessions)
      if (date.getDate() === 1) {
        dailyGrowth += 300; // Monthly boost
      }

      // Ensure value doesn't go below 0
      currentValue = Math.max(currentValue + dailyGrowth, 0);

      data.push({
        date: format(date, "yyyy-MM-dd"),
        value: Math.round(currentValue),
      });
    }

    return data;
  };

  // Generate milestone markers
  const generateMilestones = () => {
    return [
      {
        date: format(subMonths(new Date(), 11), "yyyy-MM-dd"),
        value: 2500,
        label: "First $2,500",
        type: "milestone",
        icon: "target",
        description: "Reached your first $2,500 in Mental Bank Balance!",
      },
      {
        date: format(subMonths(new Date(), 9), "yyyy-MM-dd"),
        value: 5000,
        label: "$5K Milestone",
        type: "milestone",
        icon: "trophy",
        description: "Congratulations on reaching $5,000 in your Mental Bank!",
      },
      {
        date: format(subMonths(new Date(), 8), "yyyy-MM-dd"),
        value: 6000,
        label: "7-Day Streak",
        type: "achievement",
        icon: "star",
        description: "Completed tasks for 7 consecutive days!",
      },
      {
        date: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
        value: 8000,
        label: "$8K Milestone",
        type: "milestone",
        icon: "trending-up",
        description: "Your Mental Bank Balance has reached $8,000!",
      },
      {
        date: format(subMonths(new Date(), 4), "yyyy-MM-dd"),
        value: 10000,
        label: "$10K Club",
        type: "achievement",
        icon: "award",
        description: "You've joined the $10K Mental Bank Club!",
      },
      {
        date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
        value: 12000,
        label: "30-Day Streak",
        type: "achievement",
        icon: "star",
        description: "Completed tasks for 30 consecutive days!",
      },
      {
        date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
        value: 15000,
        label: "$15K Milestone",
        type: "milestone",
        icon: "trophy",
        description: "Halfway to your $30K goal!",
      },
      {
        date: format(subDays(new Date(), 20), "yyyy-MM-dd"),
        value: 18000,
        label: "Meditation Master",
        type: "achievement",
        icon: "award",
        description: "Completed 50 meditation tasks!",
      },
      {
        date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
        value: 20000,
        label: "$20K Milestone",
        type: "milestone",
        icon: "trending-up",
        description: "Your Mental Bank Balance has reached $20,000!",
      },
    ];
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          Mental Bank Growth Visualization
        </h1>
        <MentalBankGrowth
          initialData={generateGrowthData()}
          milestones={generateMilestones()}
        />
      </div>
    </div>
  );
};

export default MentalBankGrowthDemo;
