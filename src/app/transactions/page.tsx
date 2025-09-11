/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { Suspense, useRef } from "react"; // Import useRef
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import { allTransactions, categories } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import TransactionCard from "@/components/TransactionCard";

// --- RE-PROCESSED DATA FOR TWO-BAR CHART (SALARY FILTERED OUT) ---
const dailyFlows = allTransactions
  .filter((tx) => tx.description !== "Salary Credit") // Exclude the salary outlier
  .reduce((acc, tx) => {
    const date = new Date(tx.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = { date, inflow: 0, outflow: 0 };
    }
    if (tx.type === "inflow") {
      acc[date].inflow += tx.amount;
    } else {
      acc[date].outflow += Math.abs(tx.amount);
    }
    return acc;
  }, {} as Record<string, { date: string; inflow: number; outflow: number }>);

const chartData = Object.values(dailyFlows).sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

type SortOption = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

// --- CUSTOM TOOLTIP FOR CHART ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const inflowData = payload.find((p: any) => p.dataKey === "inflow");
    const outflowData = payload.find((p: any) => p.dataKey === "outflow");
    return (
      <div className="rounded-lg glass-strong border-white/30 backdrop-blur-sm p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-white text-center mb-1">
            {label}
          </span>
          {inflowData && inflowData.value > 0 && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-[0.70rem] uppercase text-green-400">
                Inflow
              </span>
              <span className="font-bold text-green-400">
                ₹{inflowData.value.toLocaleString()}
              </span>
            </div>
          )}
          {outflowData && outflowData.value > 0 && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-[0.70rem] uppercase text-red-400">
                Outflow
              </span>
              <span className="font-bold text-red-400">
                ₹{outflowData.value.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// --- HELPER TO GET RELATIVE DATE ---
const getRelativeDate = (dateString: string) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const transactionDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  transactionDate.setHours(0, 0, 0, 0);

  if (transactionDate.getTime() === today.getTime()) return "Today";
  if (transactionDate.getTime() === yesterday.getTime()) return "Yesterday";

  return transactionDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

// The actual component that contains all the logic and uses the client-side hook
function TransactionsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter");
  const transactionsSectionRef = useRef<HTMLDivElement>(null);

  const [filterType, setFilterType] = useState<"all" | "inflow" | "outflow">(
    () => {
      if (initialFilter === "inflow" || initialFilter === "outflow") {
        return initialFilter;
      }
      return "all";
    }
  );

  useEffect(() => {
    // This effect runs when the component mounts or the filter from the URL changes.
    if (initialFilter) {
      // We use a short timeout to ensure the page has rendered before we scroll.
      setTimeout(() => {
        transactionsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [initialFilter]);

  const [filterCategory, setFilterCategory] = useState("All");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");

  const filteredAndSortedTransactions = useMemo(() => {
    const filtered = allTransactions.filter((tx) => {
      const typeMatch = filterType === "all" || tx.type === filterType;
      const categoryMatch =
        filterCategory === "All" || tx.category === filterCategory;
      return typeMatch && categoryMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount);
        case "date-desc":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [filterType, filterCategory, sortOption]);

  const { totalInflow, totalOutflow } = useMemo(() => {
    return filteredAndSortedTransactions.reduce(
      (acc, tx) => {
        if (tx.type === "inflow") acc.totalInflow += tx.amount;
        else acc.totalOutflow += tx.amount;
        return acc;
      },
      { totalInflow: 0, totalOutflow: 0 }
    );
  }, [filteredAndSortedTransactions]);

  const groupedTransactions = useMemo(() => {
    return filteredAndSortedTransactions.reduce((acc, tx) => {
      const dateKey = tx.date;
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, typeof filteredAndSortedTransactions>);
  }, [filteredAndSortedTransactions]);

  const dateKeys = Object.keys(groupedTransactions);

  return (
    <div className="min-h-screen w-full text-white/95 transition-colors duration-300">
      <div className="container mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              Transactions
            </h1>
            <p className="text-lg text-purple-300">
              The story of your financial life
            </p>
          </div>

          <Card className="glass border-white/20 mb-8 overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/3 space-y-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span>Total Inflow</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    ₹{totalInflow.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <span>Total Outflow</span>
                  </div>
                  <p className="text-3xl font-bold text-red-400">
                    ₹{Math.abs(totalOutflow).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-2/3 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ className: "text-xs fill-white/60" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                      domain={[0, 16000]}
                      tick={{ className: "text-xs fill-white/60" }}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "rgba(255, 255, 255, 0.1)", opacity: 0.3 }}
                    />
                    <Bar
                      dataKey="inflow"
                      fill="#4ade80"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="outflow"
                      fill="#f87171"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div
            ref={transactionsSectionRef}
            className="glass border-white/20 rounded-xl"
          >
            <div className="p-4 border-b border-white/20">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full">
                  <Button
                    size="sm"
                    variant={filterType === "all" ? "default" : "ghost"}
                    onClick={() => setFilterType("all")}
                    className={`rounded-full transition-all ${
                      filterType === "all"
                        ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={filterType === "inflow" ? "default" : "ghost"}
                    onClick={() => setFilterType("inflow")}
                    className={`rounded-full transition-all ${
                      filterType === "inflow"
                        ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Inflow
                  </Button>
                  <Button
                    size="sm"
                    variant={filterType === "outflow" ? "default" : "ghost"}
                    onClick={() => setFilterType("outflow")}
                    className={`rounded-full transition-all ${
                      filterType === "outflow"
                        ? "bg-white/20 text-white border-white/30 hover:bg-white/30"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    Outflow
                  </Button>
                </div>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[180px] glass border-white/30 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/30 text-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-white/10 focus:bg-white/10">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="glass border-white/30 text-white hover:bg-white/10 ml-auto"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort By
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-strong border-white/30 text-white">
                    <DropdownMenuItem
                      onSelect={() => setSortOption("date-desc")}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Date: Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSortOption("date-asc")}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Date: Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSortOption("amount-desc")}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Amount: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setSortOption("amount-asc")}
                      className="hover:bg-white/10 focus:bg-white/10"
                    >
                      Amount: Low to High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="h-[520px] overflow-y-auto p-4">
              <div className="space-y-8">
                <AnimatePresence>
                  {dateKeys.length > 0 ? (
                    dateKeys.map((dateKey) => (
                      <motion.div
                        key={dateKey}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 z-10 glass backdrop-blur-lg py-2 px-2 rounded-md">
                          {getRelativeDate(dateKey)}
                        </h2>
                        <div className="space-y-3">
                          {groupedTransactions[dateKey].map((tx) => (
                            <motion.div
                              key={tx.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <TransactionCard
                                transaction={tx}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-40 flex items-center justify-center text-muted-foreground bg-white dark:bg-[#1B253A] rounded-xl shadow-sm"
                    >
                      No transactions found for the selected filters.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// The main page component that is the default export
export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
