"use client";

import { Button } from "@/components/ui/button";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { balanceData } from "@/lib/data";
import { useState, useEffect } from "react";

interface BalanceChartProps {
  className?: string;
}

export default function BalanceChart({ className = "" }: BalanceChartProps) {
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m">("1m");

  useEffect(() => {
    localStorage.setItem("finz-chart-range", timeRange);
  }, [timeRange]);

  return (
    <div className={className}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
            TOTAL BALANCE
          </p>
          <div className="mb-4">
            <p className="text-5xl font-bold text-white">
              ₹3,49,904
            </p>
            <p className="text-sm text-emerald-400 font-medium">
              ↑ 20% compared to previous month
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(["1m", "3m", "6m"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "secondary"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={`rounded-full transition-all border ${
                timeRange === range
                  ? "bg-blue-500 text-white border-blue-400 hover:bg-blue-600"
                  : "bg-slate-700/50 text-white/80 border-slate-500/50 hover:bg-slate-600/50 hover:text-white"
              }`}
            >
              {range.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-48">
        <ChartContainer
          config={{
            balance: {
              label: "Balance",
              color: "#3b82f6",
            },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={balanceData[timeRange]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="balanceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#3b82f6"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3b82f6"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 12,
                  fill: "rgba(255, 255, 255, 0.6)",
                }}
                interval={0}
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
