"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SavingsGoal } from "@/lib/types";
import SavingsForecast from "@/components/SavingsForecast";
import SavingsGoals from "@/components/SavingsGoals";

export default function SavingsPage() {
  // Initial savings goals data
  const [goals, setGoals] = useState<SavingsGoal[]>([
    //     // Comment out the goals to test empty state
    //     {
    //       id: "macbook-pro",
    //       name: "MacBook Pro",
    //       targetAmount: 200000,
    //       targetDate: "2025-12-01",
    //       currentAmount: 75000,
    //     },
    //     {
    //       id: "emergency-fund",
    //       name: "Emergency Fund",
    //       targetAmount: 300000,
    //       targetDate: "2026-06-01",
    //       currentAmount: 120000,
    //     },
    //     {
    //       id: "vacation-fund",
    //       name: "Dream Vacation",
    //       targetAmount: 150000,
    //       targetDate: "2025-10-15",
    //       currentAmount: 85000,
    //     },
  ]);

  // Active goal selection state
  const [activeGoalId, setActiveGoalId] = useState<string>(
    goals.length > 0 ? goals[0].id : ""
  );

  return (
    <div className="min-h-screen w-full text-white/95 transition-colors duration-300 flex-1">
      <div className="container mx-auto pt-8 px-6">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Savings Goals
          </h1>
          <p className="text-xl text-purple-300 max-w-2xl mx-auto">
            Your personalized path to financial freedom.
          </p>
        </div>

        {/* Conditional Rendering Based on Goals Array */}
        {goals.length === 0 ? (
          // Empty State - Show Welcome Card
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-400/20 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-500/20 text-blue-300">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white mb-2">
                  Ready to achieve your financial dreams?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-white/70 mb-6 text-lg">
                  Start your journey toward financial freedom by setting your
                  first savings goal. Whether it's an emergency fund, vacation,
                  or a new home, we'll help you get there.
                </p>
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 px-8 py-3 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  onClick={() => {
                    // TODO: Implement goal creation functionality
                    console.log("Set Your First Goal clicked");
                  }}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Set Your First Goal
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Main Dashboard View - Show when goals exist
          <div className="space-y-8">
            {/* Placeholder for main dashboard */}
            <div className="text-center text-white/60 py-12 border-2 border-dashed border-blue-400/30 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                Main Dashboard View
              </h3>
              <p className="text-sm">
                Dashboard components will be implemented here when goals exist.
              </p>
              <p className="text-xs mt-2 text-white/40">
                Current goals: {goals.length} | Active goal: {activeGoalId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
