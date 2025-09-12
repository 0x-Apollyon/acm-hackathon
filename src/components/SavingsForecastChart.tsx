/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ReferenceDot,
  Legend,
  Tooltip,
} from "recharts";
import { SavingsGoal } from "@/lib/types";
import { TrendingUp } from "lucide-react";

interface SavingsForecastChartProps {
  goals: SavingsGoal[];
  activeGoalId: string;
  onActiveGoalChange: (goalId: string) => void;
}

// Generate historical and forecast data
const generateChartData = () => {
  const months = [
    "2024-10",
    "2024-11",
    "2024-12",
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
  ];

  const forecastMonths = [
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
  ];

  const historicalData = months.map((month, index) => ({
    month,
    historicalSavings: 15000 + index * 2000 + Math.random() * 3000,
    type: "historical",
  }));

  const forecastData = forecastMonths.map((month, index) => ({
    month,
    forecastedSavings: 27000 + index * 2500 + Math.random() * 2000,
    type: "forecast",
  }));

  return { historicalData, forecastData };
};

export default function SavingsForecastChart({
  goals,
  activeGoalId,
  onActiveGoalChange,
}: SavingsForecastChartProps) {
  const { historicalData, forecastData } = generateChartData();

  // Combine data with a gap
  const combinedData = [
    ...historicalData,
    // Gap month - no data point
    {
      month: "2025-09-gap",
      historicalSavings: null,
      forecastedSavings: null,
      type: "gap",
    },
    ...forecastData,
  ];

  // Find active goal for marker
  const activeGoal = goals.find((goal) => goal.id === activeGoalId);

  // Convert target date to chart format
  const getGoalMarkerData = () => {
    if (!activeGoal) return null;

    const targetDate = new Date(activeGoal.targetDate);
    const monthKey = `${targetDate.getFullYear()}-${String(
      targetDate.getMonth() + 1
    ).padStart(2, "0")}`;

    return {
      month: monthKey,
      targetAmount: activeGoal.targetAmount,
      goalName: activeGoal.name,
    };
  };

  const goalMarker = getGoalMarkerData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-blue-400/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === "historicalSavings"
                ? "Historical"
                : "Forecast"}
              : ₹{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-blue-400/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-300">
              <TrendingUp className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl text-white">
              Savings Forecast
            </CardTitle>
          </div>
        </div>

        {/* Goal Selector */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-white/80 min-w-fit">
              Focus Goal:
            </label>
            <Select value={activeGoalId} onValueChange={onActiveGoalChange}>
              <SelectTrigger className="w-[250px] bg-slate-800/50 border-slate-600/50 text-white">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600/50">
                {goals.map((goal) => (
                  <SelectItem
                    key={goal.id}
                    value={goal.id}
                    className="text-white hover:bg-slate-700 focus:bg-slate-700"
                  >
                    {goal.name} - ₹{goal.targetAmount.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Explanatory Text */}
          <p className="text-sm text-white/60 italic">
            Focus on one goal at a time to see a clear path to success. The
            chart shows your projection towards your selected goal.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "rgba(255, 255, 255, 0.6)",
                }}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "rgba(255, 255, 255, 0.6)",
                }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Historical Savings Line - Solid */}
              <Line
                type="linear"
                dataKey="historicalSavings"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                connectNulls={false}
                name="Historical Savings"
              />

              {/* Forecasted Savings Line - Dotted */}
              <Line
                type="linear"
                dataKey="forecastedSavings"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                connectNulls={false}
                name="Forecasted Savings"
              />

              {/* Goal Marker */}
              {goalMarker && (
                <ReferenceDot
                  x={goalMarker.month}
                  y={goalMarker.targetAmount}
                  r={6}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={2}
                  label={{
                    value: goalMarker.goalName,
                    position: "top",
                    fill: "#f59e0b",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-emerald-500"></div>
            <span className="text-white/70">Historical Savings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500"></div>
            <span className="text-white/70">Forecasted Savings</span>
          </div>
          {activeGoal && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white"></div>
              <span className="text-white/70">Goal Target</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
