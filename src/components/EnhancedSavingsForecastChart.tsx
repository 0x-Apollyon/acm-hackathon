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
  Tooltip,
  Dot,
} from "recharts";
import { SavingsGoal } from "@/lib/types";
import { monthlyTransactionsData } from "@/lib/data";
import { TrendingUp, Info } from "lucide-react";

interface EnhancedSavingsForecastChartProps {
  goals: SavingsGoal[];
  activeGoalId: string;
  onActiveGoalChange: (goalId: string) => void;
}

// Calculate historical savings from transaction data
const calculateHistoricalSavings = () => {
  return monthlyTransactionsData.map((monthData) => {
    const totalInflows = monthData.inflows.reduce(
      (sum, inflow) => sum + inflow.amount,
      0
    );
    const totalOutflows = monthData.outflows.reduce(
      (sum, outflow) => sum + outflow.amount,
      0
    );
    const monthlySavings = totalInflows - totalOutflows;

    return {
      month: monthData.month,
      savings: monthlySavings,
      type: "historical",
    };
  });
};

// Simplified Holt-Winters forecasting
const calculateHoltWintersForecast = (
  historicalData: any[],
  periods: number = 6
) => {
  if (historicalData.length < 3) return [];

  const values = historicalData.map((d) => d.savings);
  const n = values.length;

  // Initialize parameters
  let alpha = 0.3; // Smoothing parameter for level
  let beta = 0.1; // Smoothing parameter for trend
  let gamma = 0.2; // Smoothing parameter for seasonality

  // Calculate initial level and trend
  let level = values[0];
  let trend = values[1] - values[0];

  // Simple seasonal component (quarterly pattern)
  const seasonLength = 4;
  let seasonal = new Array(seasonLength).fill(0);

  // Calculate seasonal factors
  for (let i = 0; i < seasonLength && i < n; i++) {
    seasonal[i] = values[i] / level;
  }

  // Holt-Winters calculation
  let forecasts = [];

  // Update level, trend, and seasonal components
  for (let i = 1; i < n; i++) {
    const newLevel =
      alpha * (values[i] / seasonal[i % seasonLength]) +
      (1 - alpha) * (level + trend);
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    const newSeasonal =
      gamma * (values[i] / newLevel) + (1 - gamma) * seasonal[i % seasonLength];

    level = newLevel;
    trend = newTrend;
    seasonal[i % seasonLength] = newSeasonal;
  }

  // Generate forecasts
  const lastMonth = new Date(historicalData[n - 1].month);

  for (let i = 1; i <= periods; i++) {
    const forecastMonth = new Date(lastMonth);
    forecastMonth.setMonth(forecastMonth.getMonth() + i);

    const seasonalIndex = (n + i - 1) % seasonLength;
    const forecast = (level + i * trend) * seasonal[seasonalIndex];

    forecasts.push({
      month: forecastMonth.toISOString().slice(0, 7),
      savings: Math.max(0, Math.round(forecast)), // Ensure non-negative
      type: "forecast",
    });
  }

  return forecasts;
};

export default function EnhancedSavingsForecastChart({
  goals,
  activeGoalId,
  onActiveGoalChange,
}: EnhancedSavingsForecastChartProps) {
  const historicalData = calculateHistoricalSavings();
  const forecastData = calculateHoltWintersForecast(historicalData, 6);

  // Combine data with gap
  const combinedData = [
    ...historicalData,
    // Gap for visual separation
    { month: "gap", savings: null, type: "gap" },
    ...forecastData,
  ];

  // Find active goal for marker
  const activeGoal = goals.find((goal) => goal.id === activeGoalId);

  // Convert target date to chart format and find goal marker position
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

  // Custom dot to mark transition
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (
      payload &&
      payload.type === "historical" &&
      payload.month === historicalData[historicalData.length - 1]?.month
    ) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={4}
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && label !== "gap") {
      const data = payload[0].payload;
      return (
        <div className="bg-card/90 backdrop-blur-sm border border-blue-400/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p style={{ color: payload[0].color }}>
            {data.type === "historical" ? "Historical" : "Forecast"} Savings:
            <span
              className={data.savings > 0 ? "text-emerald-400" : "text-red-400"}
            >
              {" ₹"}
              {payload[0].value?.toLocaleString()}
            </span>
          </p>
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
            <div>
              <CardTitle className="text-2xl text-white">
                Savings Forecast
              </CardTitle>
              <p className="text-sm text-white/60 mt-1">
                Savings prediction using Holt-Winters method
              </p>
            </div>
          </div>
        </div>

        {/* Goal Selector */}
        {goals.length > 0 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white/80 min-w-fit">
                Focus Goal:
              </label>
              <Select value={activeGoalId} onValueChange={onActiveGoalChange}>
                <SelectTrigger className="w-[280px] bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Select a goal to focus on" />
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

            {/* Educational Text */}
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-300">
                  <strong>One Goal at a Time:</strong> Based on your current
                  savings pattern, you can realistically achieve one major goal
                  at a time. Focusing on a single goal increases your chances of
                  success and prevents financial overextension.
                </p>
              </div>
            </div>
          </div>
        )}
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
                  fontSize: 10,
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
                tickFormatter={(value) =>
                  value > 0 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`
                }
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical Savings Line - Solid */}
              <Line
                type="linear"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                connectNulls={false}
                name="Historical Savings"
                data={historicalData}
              />

              {/* Forecasted Savings Line - Dotted */}
              <Line
                type="linear"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                connectNulls={false}
                name="Forecasted Savings"
                data={forecastData}
              />

              {/* Goal Marker */}
              {goalMarker && (
                <ReferenceDot
                  x={goalMarker.month}
                  y={goalMarker.targetAmount}
                  r={8}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={3}
                  label={{
                    value: goalMarker.goalName,
                    position: "top",
                    fill: "#f59e0b",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
              )}

              <CustomDot />
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
