"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SavingsGoal } from "@/lib/types";
import { Target, AlertCircle, CheckCircle } from "lucide-react";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goal: Omit<SavingsGoal, "id" | "currentAmount">) => void;
}

export default function CreateGoalModal({
  isOpen,
  onClose,
  onCreateGoal,
}: CreateGoalModalProps) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetMonth, setTargetMonth] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Generate months and years
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  const validateGoal = () => {
    const newErrors: string[] = [];

    // Name validation
    if (!goalName.trim()) {
      newErrors.push("Goal name is required");
    }

    // Amount validation
    const amount = parseFloat(targetAmount);
    if (!targetAmount || isNaN(amount) || amount <= 0) {
      newErrors.push("Please enter a valid target amount");
    } else if (amount < 1000) {
      newErrors.push("Target amount should be at least ₹1,000");
    } else if (amount > 10000000) {
      newErrors.push("Target amount seems unrealistic (max ₹1 crore)");
    }

    // Date validation
    if (!targetMonth || !targetYear) {
      newErrors.push("Please select target month and year");
    } else {
      const targetDate = new Date(
        parseInt(targetYear),
        parseInt(targetMonth) - 1
      );
      const today = new Date();
      const monthsDiff =
        (targetDate.getFullYear() - today.getFullYear()) * 12 +
        (targetDate.getMonth() - today.getMonth());

      if (targetDate <= today) {
        newErrors.push("Target date must be in the future");
      } else if (monthsDiff < 1) {
        newErrors.push("Target date should be at least 1 month away");
      } else if (monthsDiff > 60) {
        newErrors.push(
          "Target date should be within 5 years for realistic planning"
        );
      }

      // Realistic timeline validation
      if (amount > 0 && monthsDiff > 0) {
        const monthlyRequired = amount / monthsDiff;
        if (monthlyRequired > 100000) {
          newErrors.push(
            `This goal requires saving ₹${monthlyRequired.toLocaleString()}/month - consider extending the timeline`
          );
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getTimelineStatus = () => {
    if (!targetAmount || !targetMonth || !targetYear) return null;

    const amount = parseFloat(targetAmount);
    const targetDate = new Date(
      parseInt(targetYear),
      parseInt(targetMonth) - 1
    );
    const today = new Date();
    const monthsDiff =
      (targetDate.getFullYear() - today.getFullYear()) * 12 +
      (targetDate.getMonth() - today.getMonth());

    if (monthsDiff <= 0 || amount <= 0) return null;

    const monthlyRequired = amount / monthsDiff;

    if (monthlyRequired <= 15000) {
      return {
        status: "excellent",
        color: "green",
        message: "Excellent timeline! Very achievable.",
      };
    } else if (monthlyRequired <= 30000) {
      return {
        status: "good",
        color: "blue",
        message: "Good timeline - realistic with discipline.",
      };
    } else if (monthlyRequired <= 50000) {
      return {
        status: "challenging",
        color: "yellow",
        message: "Challenging but possible with strict budgeting.",
      };
    } else {
      return {
        status: "unrealistic",
        color: "red",
        message: "Consider extending timeline for better success.",
      };
    }
  };

  const handleSubmit = () => {
    if (validateGoal()) {
      const targetDate = `${targetYear}-${targetMonth}-01`;
      onCreateGoal({
        name: goalName.trim(),
        targetAmount: parseFloat(targetAmount),
        targetDate,
      });
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setGoalName("");
    setTargetAmount("");
    setTargetMonth("");
    setTargetYear("");
    setErrors([]);
  };

  const timelineStatus = getTimelineStatus();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-sm border-blue-400/20 text-white max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-300">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Create Your First Goal
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Set a realistic savings target to achieve your dreams
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Goal Name */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">
              Goal Name
            </label>
            <Input
              placeholder="e.g., MacBook Pro, Dream Vacation, Emergency Fund"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-white/40"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">
              Target Amount (₹)
            </label>
            <Input
              type="number"
              placeholder="e.g., 150000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-white/40"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">
              Target Date
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={targetMonth} onValueChange={setTargetMonth}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600/50">
                  {months.map((month) => (
                    <SelectItem
                      key={month.value}
                      value={month.value}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={targetYear} onValueChange={setTargetYear}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600/50">
                  {years.map((year) => (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline Status */}
          {timelineStatus && (
            <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-600/30">
              <div className="flex items-start gap-2">
                {timelineStatus.status === "excellent" ||
                timelineStatus.status === "good" ? (
                  <CheckCircle
                    className={`h-4 w-4 mt-0.5 ${
                      timelineStatus.color === "green"
                        ? "text-emerald-400"
                        : "text-blue-400"
                    }`}
                  />
                ) : (
                  <AlertCircle
                    className={`h-4 w-4 mt-0.5 ${
                      timelineStatus.color === "yellow"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  />
                )}
                <div>
                  <Badge
                    variant="outline"
                    className={`mb-1 ${
                      timelineStatus.color === "green"
                        ? "border-emerald-400/50 text-emerald-300"
                        : timelineStatus.color === "blue"
                        ? "border-blue-400/50 text-blue-300"
                        : timelineStatus.color === "yellow"
                        ? "border-yellow-400/50 text-yellow-300"
                        : "border-red-400/50 text-red-300"
                    }`}
                  >
                    Timeline Assessment
                  </Badge>
                  <p className="text-sm text-white/80">
                    {timelineStatus.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Realistic Timeline Message */}
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
            <p className="text-xs text-blue-300 font-medium mb-1">💡 Pro Tip</p>
            <p className="text-sm text-white/80">
              The more realistic your goal timeline, the better your outcome.
              Consider your current income and expenses when setting targets.
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-400/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300 mb-1">
                    Please fix these issues:
                  </p>
                  <ul className="text-sm text-white/80 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-slate-600/50 text-white hover:bg-slate-700/50"
            >
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
