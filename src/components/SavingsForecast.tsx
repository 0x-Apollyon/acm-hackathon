"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Dot,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { savingsData } from "@/lib/data";
import { TrendingUp, Target } from "lucide-react";

interface SavingsForecastProps {
  className?: string;
}

export default function SavingsForecast({
  className = "",
}: SavingsForecastProps) {
  // Combine historical and forecast data
  const combinedData = [...savingsData.historical, ...savingsData.forecast];

  // Calculate total savings and growth
  const currentSavings =
    savingsData.historical[savingsData.historical.length - 1]?.savings || 0;
  const projectedSavings =
    savingsData.forecast[savingsData.forecast.length - 1]?.savings || 0;
  const growthPercentage = (
    ((projectedSavings - currentSavings) / currentSavings) *
    100
  ).toFixed(1);

  // Custom dot component to show the transition point
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.month === "Sep 2025") {
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

  return (
    <div className={className}>
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
                <p className="text-white/60 text-sm mt-1">
                  AI-powered savings prediction using Holt-Winters method
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
                PROJECTED GROWTH
              </p>
              <p className="text-2xl font-bold text-white">
                +{growthPercentage}%
              </p>
              <p className="text-sm text-emerald-400 font-medium">
                Next 12 months
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-emerald-500"></div>
                <span className="text-sm text-white/70">
                  Historical Savings
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400"></div>
                <span className="text-sm text-white/70">Forecast</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  CURRENT MONTHLY SAVINGS
                </p>
                <p className="text-3xl font-bold text-white">
                  ₹{currentSavings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                  PROJECTED MONTHLY SAVINGS
                </p>
                <p className="text-3xl font-bold text-emerald-400">
                  ₹{projectedSavings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="h-80">
            <ChartContainer
              config={{
                savings: {
                  label: "Monthly Savings",
                  color: "#10b981",
                },
              }}
              className="h-full w-full"
            >
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
                    interval={2}
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
                  <ChartTooltip
                    cursor={{
                      stroke: "rgba(255, 255, 255, 0.1)",
                      strokeWidth: 1,
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card/90 backdrop-blur-sm border border-blue-400/20 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-medium">{label}</p>
                            <p className="text-emerald-400">
                              ₹{payload[0].value?.toLocaleString()}
                              <span className="text-white/60 ml-1">
                                ({data.type})
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Historical line */}
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    connectNulls={false}
                    data={savingsData.historical}
                  />

                  {/* Forecast line */}
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="8 6"
                    dot={false}
                    connectNulls={false}
                    data={[
                      ...savingsData.historical.slice(-1),
                      ...savingsData.forecast,
                    ]}
                  />

                  <CustomDot />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
