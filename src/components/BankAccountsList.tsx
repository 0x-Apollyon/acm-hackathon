"use client";

// Removed mock fallback; render empty state when no accounts

interface BackendAccount {
  id: number;
  account_name: string;
  account_type: string;
  institution_name?: string;
  balance: number;
  currency: string;
}

interface BankAccountsListProps {
  className?: string;
  accounts?: BackendAccount[];
  layout?: "list" | "grid";
  currencySymbol?: string; // defaults to $
}

export default function BankAccountsList({ className = "", accounts, layout = "list", currencySymbol = "$" }: BankAccountsListProps) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">
        BANKS
      </p>
      <div className={layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-2"}>
        {(accounts && accounts.length > 0
          ? accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-slate-700/40 backdrop-blur-sm border border-slate-500/30 hover:bg-slate-600/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-white/70">
                      {acc.institution_name || acc.account_type}
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {acc.account_name}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold text-white">
                    {currencySymbol}{acc.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))
          : (
            <div className="p-4 rounded-2xl bg-slate-700/30 border border-slate-500/30 text-white/70">
              No linked accounts yet.
            </div>
          )
        )}
      </div>
    </div>
  );
}
