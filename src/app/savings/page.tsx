"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import { SavingsGoal } from "@/lib/types";
import SavingsChart from "@/components/SavingsChart";
import GoalStatus from "@/components/GoalStatus";
import CreateGoalModal from "@/components/CreateGoalModal";

export default function SavingsPage() {
  // Initial savings goals data - start empty for new users
  // For testing, uncomment the goals below:
  const [goals, setGoals] = useState<SavingsGoal[]>([
    // Test goals - comment these out for production
    {
      id: "macbook-pro",
      name: "MacBook Pro M3",
      targetAmount: 200000,
      targetDate: "2025-12-01",
      currentAmount: 50000,
    },
    {
      id: "vacation-fund",
      name: "Europe Vacation",
      targetAmount: 300000,
      targetDate: "2026-06-01",
      currentAmount: 75000,
    },
  ]);

  // Active goal selection state - set first goal as default
  const [activeGoalId, setActiveGoalId] = useState<string>("macbook-pro");

  // Modal state - only open if no goals exist
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Function to generate unique ID
  const generateGoalId = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  };

  // Function to create a new goal
  const handleCreateGoal = (
    goalData: Omit<SavingsGoal, "id" | "currentAmount">
  ) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: generateGoalId(goalData.name),
      currentAmount: 0, // Start with 0 savings
    };

    setGoals([...goals, newGoal]);

    // Set as active goal
    setActiveGoalId(newGoal.id);
  };

  // Function to open create modal
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

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
                  first savings goal. Whether it&apos;s an emergency fund,
                  vacation, or a new home, we&apos;ll help you get there.
                </p>
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 px-8 py-3 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/25"
                  onClick={handleOpenCreateModal}
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
            {/* Savings Chart */}
            <SavingsChart
              goals={goals}
              activeGoalId={activeGoalId}
              onActiveGoalChange={setActiveGoalId}
            />

            {/* Goal Status Card */}
            {activeGoalId && (
              <div className="pb-12">
                <GoalStatus
                  goal={goals.find((goal) => goal.id === activeGoalId)!}
                />
              </div>
            )}

            {/* Add Goal Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleOpenCreateModal}
                className="bg-purple-500 hover:bg-purple-600 text-white border-purple-400 px-6 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                <Target className="h-4 w-4 mr-2" />
                Add Another Goal
              </Button>
            </div>
          </div>
        )}

        {/* Create Goal Modal */}
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateGoal={handleCreateGoal}
        />
      </div>
    </div>
  );
}
