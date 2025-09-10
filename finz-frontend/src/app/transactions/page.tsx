/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Bot,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

// --- EXPANDED FABRICATED DATA FOR DEMO ---
const allTransactions = [
  {
    id: 1,
    date: "2025-09-10",
    description: "Zomato Order",
    category: "Food",
    amount: -450,
    type: "outflow",
  },
  {
    id: 2,
    date: "2025-09-10",
    description: "Uber Ride",
    category: "Travel",
    amount: -280,
    type: "outflow",
  },
  {
    id: 3,
    date: "2025-09-09",
    description: "Freelance Payment",
    category: "Income",
    amount: 15000,
    type: "inflow",
  },
  {
    id: 4,
    date: "2025-09-08",
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -649,
    type: "outflow",
  },
  {
    id: 5,
    date: "2025-09-07",
    description: "Salary Credit",
    category: "Income",
    amount: 50000,
    type: "inflow",
  },
  {
    id: 6,
    date: "2025-09-06",
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -2500,
    type: "outflow",
  },
  {
    id: 7,
    date: "2025-09-05",
    description: "Mom",
    category: "Family",
    amount: 1000,
    type: "inflow",
  },
  {
    id: 8,
    date: "2025-09-04",
    description: "Spotify",
    category: "Entertainment",
    amount: -119,
    type: "outflow",
  },
];

// Group transactions by date for the chart
const dailyFlows = allTransactions.reduce((acc, tx) => {
  const date = tx.date;
  if (!acc[date]) {
    acc[date] = { date, flow: 0 };
  }
  acc[date].flow += tx.amount;
  return acc;
}, {} as Record<string, { date: string; flow: number }>);

const chartData = Object.values(dailyFlows).sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

const categories = [
  "All",
  "Food",
  "Travel",
  "Income",
  "Entertainment",
  "Shopping",
  "Family",
];

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<"all" | "inflow" | "outflow">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredTransactions = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        const typeMatch = filterType === "all" || tx.type === filterType;
        const categoryMatch =
          filterCategory === "All" || tx.category === filterCategory;
        return typeMatch && categoryMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filterType, filterCategory]);

  const totalInflow = useMemo(
    () =>
      filteredTransactions
        .filter((tx) => tx.type === "inflow")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]
  );
  const totalOutflow = useMemo(
    () =>
      filteredTransactions
        .filter((tx) => tx.type === "outflow")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]
  );
  const netFlow = totalInflow + totalOutflow;

  const handleAiAnalysis = () => {
    toast.message("🤖 AI Analysis", {
      description:
        "Your spending this period was primarily on Shopping. Consider reducing discretionary purchases to boost your savings rate. Your net cash flow remains positive due to strong income this month.",
      duration: 8000,
    });
  };

  return (
    <div className="container mx-auto py-8 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Transactions</h1>
          <p className="text-lg text-muted-foreground">
            Your complete financial history at a glance.
          </p>
        </div>

        {/* Summary & Controls Header */}
        <Card className="bg-card border-border mb-8 overflow-hidden">
          <CardContent className="p-6 flex flex-col md:flex-row gap-8 items-center">
            {/* Metrics */}
            <div className="w-full md:w-1/3 space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Total Inflow</span>
                </div>
                <p className="text-3xl font-bold text-green-500">
                  ₹{totalInflow.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Total Outflow</span>
                </div>
                <p className="text-3xl font-bold text-red-500">
                  ₹{Math.abs(totalOutflow).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p
                  className={`text-3xl font-bold ${
                    netFlow >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {netFlow >= 0
                    ? `+ ₹${netFlow.toLocaleString()}`
                    : `- ₹${Math.abs(netFlow).toLocaleString()}`}
                </p>
              </div>
            </div>
            {/* Chart */}
            <div className="w-full md:w-2/3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <Bar dataKey="flow">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.flow >= 0
                            ? "hsl(142.1 76.2% 38.2%)"
                            : "hsl(0 82.2% 50.6%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2 p-1 bg-muted rounded-full">
            <Button
              size="sm"
              variant={filterType === "all" ? "default" : "ghost"}
              onClick={() => setFilterType("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === "inflow" ? "default" : "ghost"}
              onClick={() => setFilterType("inflow")}
              className="rounded-full"
            >
              Inflow
            </Button>
            <Button
              size="sm"
              variant={filterType === "outflow" ? "default" : "ghost"}
              onClick={() => setFilterType("outflow")}
              className="rounded-full"
            >
              Outflow
            </Button>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="ml-auto bg-card border-border"
            onClick={handleAiAnalysis}
          >
            <Bot className="mr-2 h-4 w-4" />
            Analyze with AI
          </Button>
        </div>

        {/* Interactive Transaction List */}
        <Card className="bg-card border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          tx.type === "inflow"
                            ? "bg-green-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {tx.type === "inflow" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {tx.description}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {tx.category}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        tx.type === "inflow" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {tx.amount > 0
                        ? `+ ₹${tx.amount.toLocaleString()}`
                        : `- ₹${Math.abs(tx.amount).toLocaleString()}`}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  );
}
