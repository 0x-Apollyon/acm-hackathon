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
  CheckCircle,
  Calendar,
  DollarSign,
  Lightbulb,
} from "lucide-react";

interface GoalStatusProps {
  goal: SavingsGoal;
}

export default function GoalStatus({ goal }: GoalStatusProps) {
  // Calculate historical savings data
  const calculateSavingsData = () => {
    let cumulativeSavings = 0;
    const savingsHistory = monthlyTransactionsData.map((monthData) => {
      const totalInflows = monthData.inflows.reduce(
        (sum, inflow) => sum + inflow.amount,
        0
      );
      const totalOutflows = monthData.outflows.reduce(
        (sum, outflow) => sum + outflow.amount,
        0
      );
      const monthlySavings = totalInflows - totalOutflows;
      cumulativeSavings += monthlySavings;
      return { monthlySavings, cumulativeSavings };
    });

    return savingsHistory;
  };

  const savingsHistory = calculateSavingsData();
  const currentSavings =
    savingsHistory[savingsHistory.length - 1]?.cumulativeSavings || 0;

  // Calculate average monthly savings from last 6 months
  const last6MonthsAvg =
    savingsHistory
      .slice(-6)
      .reduce((sum, data) => sum + data.monthlySavings, 0) / 6;

  // Calculate goal timeline
  const goalDate = new Date(goal.targetDate);
  const currentDate = new Date();
  const monthsRemaining = Math.max(
    0,
    (goalDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (goalDate.getMonth() - currentDate.getMonth())
  );

  // Calculate required monthly savings to reach goal
  const remainingAmount = Math.max(0, goal.targetAmount - currentSavings);
  const requiredMonthlySavings =
    monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount;

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    (currentSavings / goal.targetAmount) * 100
  );

  // Determine goal status and likelihood
  const getGoalAnalysis = () => {
    if (currentSavings >= goal.targetAmount) {
      return {
        status: "achieved",
        likelihood: 100,
        statusText: "Goal Achieved!",
        statusColor: "bg-green-500",
        icon: CheckCircle,
        iconColor: "text-green-400",
        message:
          "Congratulations! You've successfully reached your savings goal.",
        recommendation:
          "Consider setting a new goal or investing your savings for growth.",
      };
    }

    if (monthsRemaining <= 0) {
      return {
        status: "overdue",
        likelihood: 0,
        statusText: "Overdue",
        statusColor: "bg-red-500",
        icon: AlertTriangle,
        iconColor: "text-red-400",
        message:
          "The target date has passed and the goal hasn't been achieved.",
        recommendation:
          "Consider extending the deadline or adjusting the target amount.",
      };
    }

    const savingsRatio = last6MonthsAvg / requiredMonthlySavings;
    let likelihood = Math.min(100, Math.max(0, savingsRatio * 100));

    if (likelihood >= 80) {
      return {
        status: "on-track",
        likelihood: Math.round(likelihood),
        statusText: "On Track",
        statusColor: "bg-green-500",
        icon: TrendingUp,
        iconColor: "text-green-400",
        message: `You're saving well! At your current rate, you're likely to reach this goal.`,
        recommendation:
          "Keep up the great work! Consider automating your savings to maintain consistency.",
      };
    } else if (likelihood >= 50) {
      return {
        status: "moderate-risk",
        likelihood: Math.round(likelihood),
        statusText: "Moderate Risk",
        statusColor: "bg-yellow-500",
        icon: AlertTriangle,
        iconColor: "text-yellow-400",
        message: `You might reach this goal, but it requires some adjustments.`,
        recommendation: `Try to increase your monthly savings by ₹${Math.round(
          requiredMonthlySavings - last6MonthsAvg
        ).toLocaleString()} to stay on track.`,
      };
    } else {
      return {
        status: "at-risk",
        likelihood: Math.round(likelihood),
        statusText: "At Risk",
        statusColor: "bg-red-500",
        icon: AlertTriangle,
        iconColor: "text-red-400",
        message: `This goal is challenging to achieve with your current savings rate.`,
        recommendation: `Consider increasing monthly savings by ₹${Math.round(
          requiredMonthlySavings - last6MonthsAvg
        ).toLocaleString()} or extending the deadline by ${Math.ceil(
          remainingAmount / last6MonthsAvg - monthsRemaining
        )} months.`,
      };
    }
  };

  const analysis = getGoalAnalysis();

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card className="border-purple-400/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-400" />
            {goal.name}
          </CardTitle>
          <Badge className={`${analysis.statusColor} text-white px-3 py-1`}>
            {analysis.statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-medium">
              {formatCurrency(currentSavings)} /{" "}
              {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            <span>{formatCurrency(remainingAmount)} remaining</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-400/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Target Date</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatDate(goal.targetDate)}
            </p>
            <p className="text-sm text-gray-400">
              {monthsRemaining} months left
            </p>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-400/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Monthly Avg</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(Math.round(last6MonthsAvg))}
            </p>
            <p className="text-sm text-gray-400">Last 6 months</p>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Required Monthly</span>
            </div>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(Math.round(requiredMonthlySavings))}
            </p>
            <p className="text-sm text-gray-400">To reach goal</p>
          </div>
        </div>

        {/* Likelihood Analysis */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
          <div className="flex items-center gap-2 mb-3">
            <analysis.icon className={`h-5 w-5 ${analysis.iconColor}`} />
            <h4 className="text-lg font-semibold text-white">
              Goal Likelihood
            </h4>
            <Badge variant="outline" className="text-white border-gray-500">
              {analysis.likelihood}% chance
            </Badge>
          </div>

          <p className="text-gray-300 mb-3">{analysis.message}</p>

          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
            <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Recommendation
              </p>
              <p className="text-sm text-gray-300">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
