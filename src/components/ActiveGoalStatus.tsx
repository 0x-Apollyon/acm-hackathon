"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SavingsGoal } from "@/lib/types";
import { Target, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface ActiveGoalStatusProps {
  goal: SavingsGoal;
}

export default function ActiveGoalStatus({ goal }: ActiveGoalStatusProps) {
  // Calculate progress percentage
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

  // Calculate days until target date
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysUntilTarget = Math.ceil(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Simple logic to determine if on track (can be made more sophisticated)
  const monthlyNeeded =
    daysUntilTarget > 0
      ? (goal.targetAmount - goal.currentAmount) / (daysUntilTarget / 30)
      : 0;
  const isOnTrack = monthlyNeeded <= 25000; // Assuming reasonable monthly savings capacity

  // Generate AI insight based on goal status
  const getActionableInsight = () => {
    if (isOnTrack) {
      return "Great progress! You're on track to reach your goal. Consider setting up an automated transfer to ensure consistent savings.";
    } else {
      return `You need to save approximately ₹${monthlyNeeded.toLocaleString()} per month to reach your goal. Consider reducing discretionary spending or finding additional income sources.`;
    }
  };

  return (
    <Card className="border-blue-400/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">{goal.name}</CardTitle>
              <p className="text-sm text-white/60 mt-1">
                Target:{" "}
                {new Date(goal.targetDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Badge
            variant={isOnTrack ? "default" : "destructive"}
            className={`flex items-center gap-1 ${
              isOnTrack
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                : "bg-red-500/20 text-red-300 border-red-400/30"
            }`}
          >
            {isOnTrack ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {isOnTrack ? "On Track" : "At Risk"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-white/80">Progress</span>
            <span className="text-sm font-bold text-white">
              ₹{goal.currentAmount.toLocaleString()} / ₹
              {goal.targetAmount.toLocaleString()}
            </span>
          </div>

          <Progress
            value={progressPercentage}
            className="h-3 bg-slate-700/50"
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white/50">
              {progressPercentage.toFixed(1)}% Complete
            </span>
            <span className="text-xs text-white/50">
              ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}{" "}
              remaining
            </span>
          </div>
        </div>

        {/* Time and Amount Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
            <p className="text-xs font-medium text-white/60 mb-1">
              Days Remaining
            </p>
            <p className="text-lg font-bold text-white">
              {daysUntilTarget > 0 ? daysUntilTarget : "Past Due"}
            </p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
            <p className="text-xs font-medium text-white/60 mb-1">
              Monthly Need
            </p>
            <p className="text-lg font-bold text-white">
              ₹{monthlyNeeded > 0 ? monthlyNeeded.toLocaleString() : "0"}
            </p>
          </div>
        </div>

        {/* AI Actionable Insight */}
        <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-300 mt-0.5">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-300 mb-2">
                AI Actionable Insight
              </p>
              <p className="text-sm text-white/80 leading-relaxed">
                {getActionableInsight()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
