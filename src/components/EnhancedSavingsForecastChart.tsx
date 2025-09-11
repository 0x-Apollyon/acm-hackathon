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

interface EnhancedSavingsForecastChartProps {
  goals: SavingsGoal[];
  activeGoalId: string;
  onActiveGoalChange: (goalId: string) => void;
}

// Calculate historical savings from transaction data
const calculateHistoricalSavings = () => {
  let cumulativeSavings = 0;
  
  return monthlyTransactionsData.map((monthData, index) => {
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
const calculateSimplePrediction = (historicalData: any[], periods: number = 6) => {
  if (historicalData.length < 6) return [];
  
  // Get last 6 months for trend calculation
  const last6Months = historicalData.slice(-6);
  const monthlySavingsLast6 = last6Months.map(d => d.monthlySavings);
  
  // Calculate average monthly savings
  const avgMonthlySavings = monthlySavingsLast6.reduce((sum, val) => sum + val, 0) / monthlySavingsLast6.length;
  
  // Calculate trend (simple linear regression slope)
  let trendSum = 0;
  for (let i = 0; i < monthlySavingsLast6.length; i++) {
    trendSum += (monthlySavingsLast6[i] - avgMonthlySavings) * (i - 2.5); // centered around middle
  }
  const trend = trendSum / (monthlySavingsLast6.length * 2.5);
  
  // Generate future predictions
  const lastPoint = historicalData[historicalData.length - 1];
  const lastMonth = new Date(lastPoint.month);
  const predictions = [];
  
  for (let i = 1; i <= periods; i++) {
    const futureMonth = new Date(lastMonth);
    futureMonth.setMonth(futureMonth.getMonth() + i);
    
    // Predict monthly savings with trend
    const predictedMonthlySavings = Math.max(1000, avgMonthlySavings + (trend * i));
    const predictedCumulative = lastPoint.cumulativeSavings + (predictedMonthlySavings * i);
    
    predictions.push({
      month: futureMonth.toISOString().slice(0, 7),
      monthlySavings: Math.round(predictedMonthlySavings),
      cumulativeSavings: Math.round(predictedCumulative),
      type: "forecast",
      isHistorical: false,
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
          {isHistorical ? "Historical" : "Predicted"} Savings: ₹{data.cumulativeSavings?.toLocaleString()}
        </p>
        <p className="text-purple-400">
          Monthly: ₹{data.monthlySavings?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function EnhancedSavingsForecastChart({
  goals,
  activeGoalId,
  onActiveGoalChange,
}: EnhancedSavingsForecastChartProps) {
  const historicalData = calculateHistoricalSavings();
  const predictionData = calculateSimplePrediction(historicalData);
  const allDataPoints = [...historicalData, ...predictionData];
  
  // Get active goal details
  const activeGoal = goals.find(goal => goal.id === activeGoalId);
  
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
    const savingsValues = allDataPoints.map(d => d.cumulativeSavings);
    if (goalMarker) {
      savingsValues.push(goalMarker.cumulativeSavings);
    }
    
    const minValue = Math.min(...savingsValues);
    const maxValue = Math.max(...savingsValues);
    const padding = (maxValue - minValue) * 0.1;
    
    return [
      Math.max(0, Math.floor((minValue - padding) / 10000) * 10000),
      Math.ceil((maxValue + padding) / 10000) * 10000
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
            <LineChart data={allDataPoints} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              
              {/* Predicted savings line (slightly above historical) */}
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
              • Your average monthly savings: ₹{Math.round(historicalData.slice(-6).reduce((sum, d) => sum + d.monthlySavings, 0) / 6).toLocaleString()}
            </p>
            <p>
              • Total savings so far: ₹{historicalData[historicalData.length - 1]?.cumulativeSavings.toLocaleString()}
            </p>
            {activeGoal && (
              <p>
                • Projected savings by {formatMonth(activeGoal.targetDate)}: ₹{predictionData.find(p => p.month === activeGoal.targetDate.slice(0, 7))?.cumulativeSavings.toLocaleString() || "N/A"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
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

  // Create properly connected data - no gap, forecast starts from last historical point
  const allDataPoints = [...historicalData, ...forecastData];
  const lastHistoricalPoint = historicalData[historicalData.length - 1];

  // Add connection point for smooth transition
  const connectionPoint = {
    month: lastHistoricalPoint.month,
    savings: lastHistoricalPoint.savings,
    type: "connection",
  };

  // Combine data for chart display
  const combinedData = [...historicalData, connectionPoint, ...forecastData];

  // Find active goal for marker
  const activeGoal = goals.find((goal) => goal.id === activeGoalId);

  // Calculate Y-axis domain to include goal marker
  const allSavingsValues = allDataPoints.map((d) => d.savings);
  const minSavings = Math.min(...allSavingsValues);
  const maxSavings = Math.max(...allSavingsValues);

  let yAxisMin = Math.min(0, minSavings - 5000);
  let yAxisMax = maxSavings + 10000;

  // Adjust Y-axis to include goal marker if present
  if (activeGoal) {
    yAxisMin = Math.min(yAxisMin, activeGoal.targetAmount - 20000);
    yAxisMax = Math.max(yAxisMax, activeGoal.targetAmount + 20000);
  }

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
                tickFormatter={(value) => {
                  if (value === "connection") return "";
                  const [year, month] = value.split("-");
                  return new Date(
                    parseInt(year),
                    parseInt(month) - 1
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    year: "2-digit",
                  });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: "rgba(255, 255, 255, 0.6)",
                }}
                domain={[yAxisMin, yAxisMax]}
                tickFormatter={(value) =>
                  value > 0 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value}`
                }
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Historical portion of the line - solid */}
              <Line
                type="monotone"
                dataKey="savings"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                name="Historical Savings"
                data={combinedData.filter((d) => d.type !== "forecast")}
              />

              {/* Forecast portion of the line - dashed and duller */}
              <Line
                type="monotone"
                dataKey="savings"
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                connectNulls={false}
                name="Forecasted Savings"
                data={combinedData.filter(
                  (d) => d.type === "forecast" || d.type === "connection"
                )}
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

              {/* Goal horizontal reference line */}
              {goalMarker && (
                <ReferenceLine
                  y={goalMarker.targetAmount}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
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
            <div className="w-4 h-0.5 border-t-2 border-dashed border-emerald-500 opacity-60"></div>
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
