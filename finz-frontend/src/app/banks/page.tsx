"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Copy, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { allTransactions, bankAccounts as allBankAccounts } from "@/lib/data";

// --- CUSTOM BRAND ICON COMPONENTS (re-used from dashboard) ---
const SbiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#007BFF"></circle>
    <circle cx="12" cy="12" r="4" fill="white"></circle>
  </svg>
);
const HdfcIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4h16v16H4z" fill="#E4001B"></path>
    <path d="M4 12h16v8H4z" fill="#004C97"></path>
    <path d="M8 8h8v8H8z" fill="white"></path>
  </svg>
);
const IciciIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="#FF5F00"
    ></path>
    <path
      d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"
      fill="#FF5F00"
    ></path>
  </svg>
);
const AxisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="#8A2BE2"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);

const bankDataWithDetails = allBankAccounts.map((account) => {
  // Fabricate some recent transactions and a balance history for each account
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const balanceHistory = [
    { name: "Jul", balance: Math.random() * 50000 },
    { name: "Aug", balance: Math.random() * 50000 + 20000 },
    {
      name: "Sep",
      balance: parseFloat(account.balance.replace("₹", "").replace(/,/g, "")),
    },
  ];

  return {
    ...account,
    recentTransactions,
    balanceHistory,
  };
});

export default function BanksPage() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!", {
      description: `Copied: ${text}`,
    });
  };

  const handleActionClick = (action: string) => {
    toast(`${action} clicked!`, {
      description: "This feature is coming soon.",
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Linked Bank Accounts
        </h1>
        <p className="text-lg text-muted-foreground">
          A detailed overview of your connected accounts.
        </p>
      </div>

      <div className="space-y-8">
        {bankDataWithDetails.map((bank) => {
          const Icon = bank.icon;
          return (
            <Card
              key={bank.name}
              className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A] overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30 dark:bg-[#101827]/50 border-b border-border dark:border-[#2A3B5A]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-background dark:bg-[#1B253A] border-border dark:border-[#2A3B5A]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {bank.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Account Number: {bank.accountNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    CURRENT BALANCE
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {bank.balance}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Account Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Account Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">IFSC Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">
                          {bank.ifscCode}
                        </span>
                        <Copy
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleCopy(bank.ifscCode)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">SWIFT BIC</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">
                          {bank.swiftBic}
                        </span>
                        <Copy
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleCopy(bank.swiftBic)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Holder's Name
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">
                          {bank.holderName}
                        </span>
                        <Copy
                          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
                          onClick={() => handleCopy(bank.holderName)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleActionClick("Download Statement")}
                    >
                      Download Statement
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleActionClick("Refresh")}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Right: Balance History & Recent Transactions */}
                <div className="md:col-span-2 grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Balance History
                    </h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={bank.balanceHistory}
                          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            hide={true}
                            domain={["dataMin - 10000", "dataMax + 10000"]}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Recent Transactions
                    </h3>
                    <div className="space-y-3">
                      {bank.recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <p className="text-foreground">{tx.description}</p>
                          <p
                            className={
                              tx.type === "inflow"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {tx.amount > 0
                              ? `+₹${tx.amount.toLocaleString()}`
                              : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
