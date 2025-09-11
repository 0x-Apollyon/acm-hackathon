"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SavingsGoal } from "@/lib/types";
import { monthlyTransactionsData } from "@/lib/data";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Calendar,
  DollarSign,
} from "lucide-react";

interface ActiveGoalStatusProps {
  goal: SavingsGoal;
}

export default function ActiveGoalStatus({ goal }: ActiveGoalStatusProps) {
  // Calculate average monthly savings from historical data
  const calculateAverageMonthySavings = () => {
    const monthlySavings = monthlyTransactionsData.map((monthData) => {
      const totalInflows = monthData.inflows.reduce(
        (sum, inflow) => sum + inflow.amount,
        0
      );
      const totalOutflows = monthData.outflows.reduce(
        (sum, outflow) => sum + outflow.amount,
        0
      );
      return totalInflows - totalOutflows;
    });

    const validSavings = monthlySavings.filter((savings) => savings > 0);
    const average =
      validSavings.length > 0
        ? validSavings.reduce((sum, savings) => sum + savings, 0) /
          validSavings.length
        : 0;

    return Math.round(average);
  };

  const averageMonthlySavings = calculateAverageMonthySavings();

  // Calculate progress percentage
  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;

  // Calculate months until target date
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const monthsUntilTarget = Math.max(
    0,
    (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth())
  );

  // Calculate required monthly savings
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const monthlyNeeded =
    monthsUntilTarget > 0
      ? remainingAmount / monthsUntilTarget
      : remainingAmount;

  // Determine if goal is achievable based on historical savings pattern
  const achievabilityRatio =
    averageMonthlySavings > 0 ? monthlyNeeded / averageMonthlySavings : 0;

  const getGoalStatus = () => {
    if (monthsUntilTarget <= 0) {
      return {
        status: "overdue",
        color: "red",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-400/30",
        textColor: "text-red-300",
        label: "Overdue",
      };
    }

    if (achievabilityRatio <= 0.8) {
      return {
        status: "excellent",
        color: "emerald",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-400/30",
        textColor: "text-emerald-300",
        label: "Excellent",
      };
    } else if (achievabilityRatio <= 1.2) {
      return {
        status: "on-track",
        color: "green",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-400/30",
        textColor: "text-green-300",
        label: "On Track",
      };
    } else if (achievabilityRatio <= 1.8) {
      return {
        status: "challenging",
        color: "yellow",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-400/30",
        textColor: "text-yellow-300",
        label: "Challenging",
      };
    } else {
      return {
        status: "at-risk",
        color: "red",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-400/30",
        textColor: "text-red-300",
        label: "At Risk",
      };
    }
  };

  const goalStatus = getGoalStatus();

  // Generate AI insight based on goal status and data
  const getActionableInsight = () => {
    const statusInsights = {
      overdue:
        "Your target date has passed. Consider extending the timeline or increasing your savings rate significantly to get back on track.",
      excellent: `Great work! You're ahead of schedule. Your current savings rate of ₹${averageMonthlySavings.toLocaleString()}/month puts you in an excellent position.`,
      "on-track": `You're on track! Continue saving ₹${monthlyNeeded.toLocaleString()}/month to reach your goal. Your historical average of ₹${averageMonthlySavings.toLocaleString()}/month shows this is achievable.`,
      challenging: `This goal is challenging but achievable. You'll need to save ₹${monthlyNeeded.toLocaleString()}/month, which is ${(
        (achievabilityRatio - 1) *
        100
      ).toFixed(0)}% more than your current average.`,
      "at-risk": `This goal needs immediate attention. Required savings of ₹${monthlyNeeded.toLocaleString()}/month is ${(
        (achievabilityRatio - 1) *
        100
      ).toFixed(
        0
      )}% higher than your average. Consider extending the deadline or reducing the target amount.`,
    };

    return statusInsights[goalStatus.status as keyof typeof statusInsights];
  };

  return (
    <Card
      className={`border-blue-400/20 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${goalStatus.bgColor} ${goalStatus.textColor}`}
            >
              <Target className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">{goal.name}</CardTitle>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-white/50" />
                  <span className="text-sm text-white/60">
                    {new Date(goal.targetDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-white/50" />
                  <span className="text-sm text-white/60">
                    {monthsUntilTarget} months left
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`flex items-center gap-1 ${goalStatus.bgColor} ${goalStatus.textColor} ${goalStatus.borderColor}`}
          >
            {goalStatus.status === "excellent" ||
            goalStatus.status === "on-track" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {goalStatus.label}
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
            className={`h-3 bg-slate-700/50 [&>div]:${
              goalStatus.status === "excellent" ||
              goalStatus.status === "on-track"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                : goalStatus.status === "challenging"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                : "bg-gradient-to-r from-red-500 to-red-400"
            }`}
          />

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white/50">
              {progressPercentage.toFixed(1)}% Complete
            </span>
            <span className="text-xs text-white/50">
              ₹{remainingAmount.toLocaleString()} remaining
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`rounded-lg p-3 border ${goalStatus.bgColor} ${goalStatus.borderColor}`}
          >
            <p className="text-xs font-medium text-white/60 mb-1">
              Monthly Required
            </p>
            <p
              className={`text-lg font-bold ${
                monthlyNeeded <= averageMonthlySavings
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              ₹{monthlyNeeded.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
            <p className="text-xs font-medium text-white/60 mb-1">
              Your Average
            </p>
            <p className="text-lg font-bold text-blue-400">
              ₹{averageMonthlySavings.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Achievement Probability */}
        <div
          className={`rounded-lg p-4 border ${goalStatus.bgColor} ${goalStatus.borderColor}`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full ${goalStatus.bgColor} ${goalStatus.textColor} mt-0.5`}
            >
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className={`text-sm font-medium ${goalStatus.textColor}`}>
                  Insight
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs ${goalStatus.bgColor} ${goalStatus.textColor} ${goalStatus.borderColor}`}
                >
                  {achievabilityRatio <= 1
                    ? "High Confidence"
                    : achievabilityRatio <= 1.5
                    ? "Medium Confidence"
                    : "Low Confidence"}
                </Badge>
              </div>
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
