"use client";

import { allBankAccounts } from "@/lib/data";

interface BankAccountsListProps {
  className?: string;
}

export default function BankAccountsList({ className = "" }: BankAccountsListProps) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">
        BANKS
      </p>
      <div className="space-y-2">
        {allBankAccounts.map((bank, index) => {
          const Icon = bank.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/40 backdrop-blur-sm border border-slate-500/30 hover:bg-slate-600/40 transition-colors"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center">
                <Icon />
              </div>
              <div>
                <p className="text-xs font-medium text-white/70">
                  {bank.name}
                </p>
                <p className="text-sm font-semibold text-white">
                  {bank.balance}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
