"use client";

import { Transaction } from "@/lib/types";

interface TransactionCardProps {
  transaction: Transaction;
  showType?: boolean;
  currencySymbol?: string; // defaults to $
}

export default function TransactionCard({ transaction, showType = true, currencySymbol = "$" }: TransactionCardProps) {
  const Icon = transaction.icon;
  const isInflow = transaction.type === "inflow";

  return (
    <div className="bg-slate-700/40 backdrop-blur-sm border border-slate-500/30 p-4 rounded-lg hover:bg-slate-600/40 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center">
              <Icon className="h-4 w-4 text-white/70" />
            </div>
          )}
          <span className="text-sm font-medium text-white">
            {transaction.description}
          </span>
        </div>
        <span className="text-xs text-white/70">
          {new Date(transaction.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <div className="flex justify-between items-end">
        <p className={`text-2xl font-bold ${
          isInflow ? "text-emerald-400" : "text-red-400"
        }`}>
          {isInflow ? "+" : "-"} {currencySymbol}{Math.abs(transaction.amount).toLocaleString()}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full border ${
          isInflow
            ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
            : "bg-red-500/20 text-red-300 border-red-400/30"
        }`}>
          {transaction.category}
        </span>
      </div>
    </div>
  );
}
