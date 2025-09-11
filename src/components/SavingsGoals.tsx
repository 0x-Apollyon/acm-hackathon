"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { savingsGoals } from "@/lib/data";
import { Target, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

interface SavingsGoalsProps {
  className?: string;
}

export default function SavingsGoals({ className = "" }: SavingsGoalsProps) {
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getStatusIcon = (status: string) => {
    return status === "on-track" ? TrendingUp : AlertTriangle;
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Savings Goals</h2>
        <p className="text-white/60">
          Track your progress towards financial milestones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savingsGoals.map((goal) => {
          const progressPercentage = getProgressPercentage(
            goal.currentAmount,
            goal.targetAmount
          );
          const StatusIcon = getStatusIcon(goal.status);

          return (
            <Card
              key={goal.id}
              className="border-blue-400/20 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">
                        {goal.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-white/50" />
                        <span className="text-sm text-white/60">
                          Due: {goal.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      goal.status === "on-track" ? "default" : "destructive"
                    }
                    className={`flex items-center gap-1 ${
                      goal.status === "on-track"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : "bg-red-500/20 text-red-300 border-red-400/30"
                    }`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {goal.status === "on-track" ? "On Track" : "At Risk"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Amount Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/70">Progress</span>
                    <span className="text-sm font-medium text-white">
                      ₹{goal.currentAmount.toLocaleString()} / ₹
                      {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        goal.status === "on-track"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-red-500 to-red-400"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-white/50">0%</span>
                    <span className="text-xs font-medium text-white">
                      {progressPercentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-white/50">100%</span>
                  </div>
                </div>

                {/* AI Insight */}
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded bg-blue-500/20 text-blue-300 mt-0.5">
                      <Target className="h-3 w-3" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-300 mb-1">
                        AI Insight
                      </p>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {goal.insight}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
