"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp } from "lucide-react";
import SavingsForecast from "@/components/SavingsForecast";
import SavingsGoals from "@/components/SavingsGoals";

export default function SavingsPage() {
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

        {/* Welcome Card */}
        <div className="max-w-2xl mx-auto mb-8">
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
                first savings goal. Whether it's an emergency fund, vacation, or
                a new home, we'll help you get there.
              </p>
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 px-8 py-3 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Set Your First Goal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Savings Forecast Chart */}
        <div className="mb-8">
          <SavingsForecast />
        </div>

        {/* Savings Goals Grid */}
        <div className="mb-8">
          <SavingsGoals />
        </div>
      </div>
    </div>
  );
}
