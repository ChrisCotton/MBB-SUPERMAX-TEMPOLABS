import React, { useState } from "react";
import { ArrowUp, TrendingUp, Edit, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface BalanceSummaryProps {
  currentBalance?: number;
  targetBalance?: number;
  progressPercentage?: number;
  dailyGrowth?: number;
  onTargetBalanceChange?: (newTargetBalance: number) => void;
}

const BalanceSummary = ({
  currentBalance = 5250.0,
  targetBalance = 15750.0,
  progressPercentage = 33,
  dailyGrowth = 4.2,
  onTargetBalanceChange = () => {},
}: BalanceSummaryProps) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTargetBalance, setNewTargetBalance] = useState(
    targetBalance.toString(),
  );

  const handleSaveTargetBalance = () => {
    const parsedValue = parseFloat(newTargetBalance);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      onTargetBalanceChange(parsedValue);
      setIsEditingTarget(false);
    }
  };
  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Mental Bank Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Balance */}
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Current Balance
            </span>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                $
                {currentBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {dailyGrowth > 0 && (
                <div className="ml-2 flex items-center text-green-600 text-sm">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {dailyGrowth}%
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Updated today</span>
          </div>

          {/* Target Balance (3X Goal) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Target Balance
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsEditingTarget(!isEditingTarget)}
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit target balance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {isEditingTarget ? (
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-7"
                    value={newTargetBalance}
                    onChange={(e) => setNewTargetBalance(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveTargetBalance();
                      }
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={handleSaveTargetBalance}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                $
                {targetBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {isEditingTarget
                ? "Enter your desired target balance"
                : "Set your own financial goal"}
            </span>
          </div>

          {/* Progress Toward Goal */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">
                Progress Toward Goal
              </span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span>On track to reach your goal in 67 days</span>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-4 border-t">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Tasks Completed
            </span>
            <span className="text-xl font-semibold">24</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Hours Invested
            </span>
            <span className="text-xl font-semibold">42.5</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Avg. Hourly Rate
            </span>
            <span className="text-xl font-semibold">$123.50</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              Daily Deposits
            </span>
            <span className="text-xl font-semibold">$215.75</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceSummary;
