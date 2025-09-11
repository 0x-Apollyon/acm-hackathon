/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Copy, RefreshCw, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import { allTransactions, allBankAccounts } from "@/lib/data";
import { BankAccount, Transaction } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

// --- CUSTOM BRAND ICON COMPONENTS ---
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

// --- FABRICATED DATA WITH DETAILS ---
const bankDataWithDetails = allBankAccounts.map((account: BankAccount) => {
  const recentTransactions = allTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3);

  const balanceHistory = [
    {
      name: "Jul",
      balance:
        parseFloat(account.balance.replace("₹", "").replace(/,/g, "")) *
        (0.8 + Math.random() * 0.1),
    },
    {
      name: "Aug",
      balance:
        parseFloat(account.balance.replace("₹", "").replace(/,/g, "")) *
        (0.9 + Math.random() * 0.1),
    },
    {
      name: "Sep",
      balance: parseFloat(account.balance.replace("₹", "").replace(/,/g, "")),
    },
  ];

  return { ...account, recentTransactions, balanceHistory };
});

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!", { description: `Copied: ${text}` });
  };

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-foreground">{value}</span>
        <Copy
          className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={() => handleCopy(value)}
        />
      </div>
    </div>
  );
};

export default function BanksPage() {
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

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

      <AnimatePresence>
        {selectedBank ? (
          <motion.div
            key="detail-view"
            layoutId={`bank-card-${selectedBank.accountNumber}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="col-span-full"
          >
            <Card className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6 bg-muted/30 dark:bg-[#101827]/50 border-b border-border dark:border-[#2A3B5A]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-background dark:bg-[#1B253A] border-border dark:border-[#2A3B5A]">
                    <selectedBank.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {selectedBank.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Account Number: {selectedBank.accountNumber}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedBank(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Account Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label="IFSC Code"
                      value={selectedBank.ifscCode}
                    />
                    <DetailRow
                      label="SWIFT BIC"
                      value={selectedBank.swiftBic}
                    />
                    <DetailRow
                      label="Holder's Name"
                      value={selectedBank.holderName}
                    />
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
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Balance History
                    </h3>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={
                            bankDataWithDetails.find(
                              (b) =>
                                b.accountNumber === selectedBank.accountNumber
                            )?.balanceHistory
                          }
                          margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                        >
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
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
                      {bankDataWithDetails
                        .find(
                          (b) => b.accountNumber === selectedBank.accountNumber
                        )
                        ?.recentTransactions.map((tx: Transaction) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <p className="text-foreground truncate pr-4">
                              {tx.description}
                            </p>
                            <p
                              className={`font-mono ${
                                tx.type === "inflow"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
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
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bankDataWithDetails.map((bank) => {
              const Icon = bank.icon;
              return (
                <motion.div
                  key={bank.accountNumber}
                  layoutId={`bank-card-${bank.accountNumber}`}
                >
                  <Card className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A] overflow-hidden flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-background dark:bg-[#101827] border-border dark:border-[#2A3B5A]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-foreground">
                            {bank.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {bank.balance}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-start space-y-3 pt-0">
                      <DetailRow
                        label="Account No."
                        value={bank.accountNumber}
                      />
                      <DetailRow label="IFSC Code" value={bank.ifscCode} />
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedBank(bank)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
            {/* Add New Card */}
            <motion.div layoutId="add-new-card">
              <Card
                className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A] h-full flex items-center justify-center border-dashed hover:border-primary hover:text-primary transition-colors cursor-pointer"
                onClick={() => handleActionClick("Add New Account")}
              >
                <div className="text-center text-muted-foreground">
                  <PlusCircle className="h-10 w-10 mx-auto mb-2" />
                  <p className="font-semibold">Add New Account</p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
