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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { SavingsGoal } from "@/lib/types";
import { monthlyTransactionsData } from "@/lib/data";
import { TrendingUp, Target } from "lucide-react";

interface SavingsChartProps {
  goals: SavingsGoal[];
  activeGoalId: string;
  onActiveGoalChange: (goalId: string) => void;
}

// Calculate historical savings from transaction data
const calculateHistoricalSavings = () => {
  let cumulativeSavings = 0;

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
    cumulativeSavings += monthlySavings;

    return {
      month: monthData.month,
      monthlySavings: monthlySavings,
      cumulativeSavings: cumulativeSavings,
      type: "historical",
      isHistorical: true,
    };
  });
};

// Simple prediction based on linear trend of the last 6 months
const calculateSimplePrediction = (
  historicalData: any[],
  periods: number = 6
) => {
  if (historicalData.length < 6) return [];

  // Get last 6 months for trend calculation
  const last6Months = historicalData.slice(-6);
  const monthlySavingsLast6 = last6Months.map((d) => d.monthlySavings);

  // Calculate average monthly savings
  const avgMonthlySavings =
    monthlySavingsLast6.reduce((sum, val) => sum + val, 0) /
    monthlySavingsLast6.length;

  // Calculate trend (simple linear regression slope)
  let trendSum = 0;
  for (let i = 0; i < monthlySavingsLast6.length; i++) {
    trendSum += (monthlySavingsLast6[i] - avgMonthlySavings) * (i - 2.5); // centered around middle
  }
  const trend = trendSum / (monthlySavingsLast6.length * 2.5);

  // Generate future predictions starting from the last historical point
  const lastPoint = historicalData[historicalData.length - 1];
  const lastMonth = new Date(lastPoint.month);
  const predictions = [];

  // Add the connection point (last historical point as first prediction)
  predictions.push({
    month: lastPoint.month,
    monthlySavings: lastPoint.monthlySavings,
    cumulativeSavings: lastPoint.cumulativeSavings,
    type: "forecast",
    isHistorical: false,
    isConnection: true,
  });

  for (let i = 1; i <= periods; i++) {
    const futureMonth = new Date(lastMonth);
    futureMonth.setMonth(futureMonth.getMonth() + i);

    // Predict monthly savings with trend
    const predictedMonthlySavings = Math.max(
      1000,
      avgMonthlySavings + trend * i
    );
    const predictedCumulative =
      lastPoint.cumulativeSavings + predictedMonthlySavings * i;

    predictions.push({
      month: futureMonth.toISOString().slice(0, 7),
      monthlySavings: Math.round(predictedMonthlySavings),
      cumulativeSavings: Math.round(predictedCumulative),
      type: "forecast",
      isHistorical: false,
      isConnection: false,
    });
  }

  return predictions;
};

// Format month for display
const formatMonth = (monthStr: string) => {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isHistorical = data.isHistorical;

    return (
      <div className="bg-gray-800/95 backdrop-blur-sm p-3 rounded-lg border border-gray-600">
        <p className="text-white font-medium">{formatMonth(label)}</p>
        <p className="text-blue-400">
          {isHistorical ? "Historical" : "Predicted"} Savings: ₹
          {data.cumulativeSavings?.toLocaleString()}
        </p>
        <p className="text-purple-400">
          Monthly: ₹{data.monthlySavings?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function SavingsChart({
  goals,
  activeGoalId,
  onActiveGoalChange,
}: SavingsChartProps) {
  const historicalData = calculateHistoricalSavings();
  const predictionData = calculateSimplePrediction(historicalData);
  const allDataPoints = [...historicalData, ...predictionData];

  // Get active goal details
  const activeGoal = goals.find((goal) => goal.id === activeGoalId);

  // Calculate goal marker position
  const getGoalMarkerData = () => {
    if (!activeGoal) return null;

    const goalDate = new Date(activeGoal.targetDate);
    const goalMonth = goalDate.toISOString().slice(0, 7);

    return {
      month: goalMonth,
      cumulativeSavings: activeGoal.targetAmount,
      monthlySavings: 0,
      type: "goal",
      isGoal: true,
    };
  };

  const goalMarker = getGoalMarkerData();

  // Calculate chart Y-axis domain
  const getYAxisDomain = () => {
    const savingsValues = allDataPoints.map((d) => d.cumulativeSavings);
    if (goalMarker) {
      savingsValues.push(goalMarker.cumulativeSavings);
    }

    const minValue = Math.min(...savingsValues);
    const maxValue = Math.max(...savingsValues);
    const padding = (maxValue - minValue) * 0.1;

    return [
      Math.max(0, Math.floor((minValue - padding) / 10000) * 10000),
      Math.ceil((maxValue + padding) / 10000) * 10000,
    ];
  };

  const [yMin, yMax] = getYAxisDomain();

  return (
    <Card className="border-blue-400/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            Savings Forecast
          </CardTitle>

          {goals.length > 0 && (
            <Select value={activeGoalId} onValueChange={onActiveGoalChange}>
              <SelectTrigger className="w-full sm:w-64 bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Select a goal to track" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {goals.map((goal) => (
                  <SelectItem
                    key={goal.id}
                    value={goal.id}
                    className="text-white hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-400" />
                      <span>{goal.name}</span>
                      <span className="text-sm text-gray-400">
                        (₹{goal.targetAmount.toLocaleString()})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={allDataPoints}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={formatMonth}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                domain={[yMin, yMax]}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical savings line */}
              <Line
                type="monotone"
                dataKey="cumulativeSavings"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                data={historicalData}
              />

              {/* Predicted savings line (connects seamlessly) */}
              <Line
                type="monotone"
                dataKey="cumulativeSavings"
                stroke="#8B5CF6"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
                data={predictionData}
              />

              {/* Goal marker */}
              {goalMarker && (
                <ReferenceDot
                  x={goalMarker.month}
                  y={goalMarker.cumulativeSavings}
                  r={8}
                  fill="#F59E0B"
                  stroke="#FBBF24"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-400"></div>
            <span className="text-gray-300">Historical Savings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-400 border-dashed border-t-2 border-purple-400"></div>
            <span className="text-gray-300">Predicted Savings</span>
          </div>
          {activeGoal && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">{activeGoal.name} Target</span>
            </div>
          )}
        </div>

        {/* Chart insights */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Savings Insights
          </h4>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              • Your average monthly savings: ₹
              {Math.round(
                historicalData
                  .slice(-6)
                  .reduce((sum, d) => sum + d.monthlySavings, 0) / 6
              ).toLocaleString()}
            </p>
            <p>
              • Total savings so far: ₹
              {historicalData[
                historicalData.length - 1
              ]?.cumulativeSavings.toLocaleString()}
            </p>
            {activeGoal && (
              <p>
                • Projected savings by {formatMonth(activeGoal.targetDate)}: ₹
                {predictionData
                  .find((p) => p.month === activeGoal.targetDate.slice(0, 7))
                  ?.cumulativeSavings.toLocaleString() || "N/A"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
