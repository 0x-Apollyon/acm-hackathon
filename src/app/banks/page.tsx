"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  CreditCard,
  Building2,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { allTransactions, allBankAccounts } from "@/lib/data";
import { BankAccount } from "@/lib/types";
import { motion } from "framer-motion";

// Enhanced bank data with additional details
const enhancedBankData = allBankAccounts.map(
  (account: BankAccount, index: number) => {
    const accountTransactions = allTransactions
      .filter(() => Math.random() > 0.5) // Random assignment for demo
      .slice(0, 3 + Math.floor(Math.random() * 3));

    const cardType = ["Debit Card", "Credit Card", "Savings Card"][index % 3];
    const cardNumber = `**** **** **** ${String(
      Math.floor(Math.random() * 9999)
    ).padStart(4, "0")}`;
    const expiryDate = `${String(Math.floor(Math.random() * 12) + 1).padStart(
      2,
      "0"
    )}/${new Date().getFullYear() + 2}`;

    return {
      ...account,
      accountTransactions,
      cardType,
      cardNumber,
      expiryDate,
      isActive: Math.random() > 0.2,
    };
  }
);

const DetailRow = ({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group">
      <div className="min-w-0 flex-1 mr-3">
        <p className="text-sm text-white/60 mb-1">{label}</p>
        <p className="text-base font-medium text-white break-all">{value}</p>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-10 w-10 p-0 hover:bg-white/20 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-all duration-300"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default function BanksPage() {
  const [selectedBank, setSelectedBank] = useState<
    (typeof enhancedBankData)[0] | null
  >(null);
  const [balancesVisible, setBalancesVisible] = useState<
    Record<string, boolean>
  >({});

  const toggleBalanceVisibility = (accountNumber: string) => {
    setBalancesVisible((prev) => ({
      ...prev,
      [accountNumber]: !prev[accountNumber],
    }));
  };

  const handleQuickAction = (action: string, bankName: string) => {
    toast.success(`${action} initiated for ${bankName}`);
  };

  return (
    <div className="min-h-screen w-full text-white/95 transition-colors duration-300">
      <div className="container mx-auto px-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Bank Accounts</h1>
          <p className="text-lg text-purple-300">
            Manage your financial connections
          </p>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="glass border-slate-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-blue-300" />
                <span className="text-sm text-white/60">Total Accounts</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {enhancedBankData.length}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-slate-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="text-sm text-white/60">Total Balance</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                ₹
                {enhancedBankData
                  .reduce(
                    (total, bank) =>
                      total + parseFloat(bank.balance.replace(/₹|,/g, "")),
                    0
                  )
                  .toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-slate-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-purple-300" />
                <span className="text-sm text-white/60">Active Cards</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {enhancedBankData.filter((bank) => bank.isActive).length}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {enhancedBankData.map((bank, index) => {
            const Icon = bank.icon;
            const isBalanceVisible = balancesVisible[bank.accountNumber];

            return (
              <motion.div
                key={bank.accountNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Card
                  className="glass border-slate-500/30 hover:border-slate-400/50 transition-all duration-300 h-full group-hover:shadow-xl group-hover:shadow-blue-500/10"
                  onClick={() => setSelectedBank(bank)}
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <Icon />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-white/90">
                            {bank.name}
                          </CardTitle>
                          <p className="text-xs text-white/60">
                            {bank.cardType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBalanceVisibility(bank.accountNumber);
                          }}
                          className="h-8 w-8 p-0 hover:bg-white/20 transition-all duration-200"
                        >
                          {isBalanceVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {bank.isActive && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Balance */}
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2">
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {isBalanceVisible ? bank.balance : "••••••••"}
                      </p>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Account</span>
                        <span className="text-sm font-mono text-white/80">
                          ••••••••{bank.accountNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Card</span>
                        <span className="text-sm font-mono text-white/80">
                          {bank.cardNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Status</span>
                        <div className="flex items-center gap-2">
                          {bank.isActive ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-400 font-medium">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                              <span className="text-xs text-red-400 font-medium">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAction("Transfer", bank.name);
                        }}
                        className="flex-1 h-8 text-xs bg-white/5 hover:bg-white/10 border border-white/10"
                      >
                        Transfer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAction("Statement", bank.name);
                        }}
                        className="flex-1 h-8 text-xs bg-white/5 hover:bg-white/10 border border-white/10"
                      >
                        Statement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Enhanced Detailed Modal */}
      <Dialog open={!!selectedBank} onOpenChange={() => setSelectedBank(null)}>
        <DialogContent className="glass border-slate-500/30 text-white max-w-5xl w-[90vw] max-h-[85vh] overflow-hidden p-0">
          {selectedBank && (
            <div className="flex flex-col h-full max-h-[85vh]">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-white/10 flex-shrink-0">
                <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/20 flex-shrink-0">
                      <selectedBank.icon />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold truncate">
                        {selectedBank.name}
                      </h2>
                      <p className="text-sm sm:text-base text-white/70 font-normal">
                        {selectedBank.cardType}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xs sm:text-sm text-white/60">
                      Current Balance
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">
                      {selectedBank.balance}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
                  {/* Left Section - Account Details & Transactions */}
                  <div className="xl:col-span-2 space-y-8">
                    {/* Account Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DetailRow
                          label="Account Number"
                          value={selectedBank.accountNumber}
                          copyable
                        />
                        <DetailRow
                          label="IFSC Code"
                          value={selectedBank.ifscCode}
                          copyable
                        />
                        <DetailRow
                          label="SWIFT BIC"
                          value={selectedBank.swiftBic}
                          copyable
                        />
                        <DetailRow
                          label="Account Holder"
                          value={selectedBank.holderName}
                        />
                        <DetailRow
                          label="Card Number"
                          value={selectedBank.cardNumber}
                          copyable
                        />
                        <DetailRow
                          label="Expiry Date"
                          value={selectedBank.expiryDate}
                        />
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Recent Transactions
                      </h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {selectedBank.accountTransactions
                          .slice(0, 4)
                          .map((transaction, index) => (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                                  {transaction.icon && (
                                    <transaction.icon className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-white text-sm truncate">
                                    {transaction.description}
                                  </p>
                                  <p className="text-xs text-white/60 truncate">
                                    {transaction.date} • {transaction.category}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <p
                                  className={`font-bold text-lg ${
                                    transaction.type === "inflow"
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {transaction.type === "inflow" ? "+" : "-"}₹
                                  {transaction.amount.toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Summary & Actions */}
                  <div className="space-y-8">
                    {/* Account Summary Card */}
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-purple-400" />
                        Account Summary
                      </h3>
                      <Card className="glass border-slate-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        <CardContent className="p-6 space-y-6">
                          <div className="text-center">
                            <p className="text-white/60 mb-2">
                              Current Balance
                            </p>
                            <p className="text-4xl font-bold text-green-400">
                              {selectedBank.balance}
                            </p>
                          </div>

                          <div className="space-y-4 pt-4 border-t border-white/20">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                              <span className="text-white/70">
                                Account Type
                              </span>
                              <span className="font-medium text-white">
                                {selectedBank.cardType}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                              <span className="text-white/70">Status</span>
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="font-medium text-green-400">
                                  Active
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                              <span className="text-white/70">Expires</span>
                              <span className="font-medium text-white">
                                {selectedBank.expiryDate}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-2xl font-semibold text-white mb-6">
                        Quick Actions
                      </h3>
                      <div className="space-y-4">
                        <Button
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base rounded-xl"
                          onClick={() =>
                            handleQuickAction(
                              "Download Statement",
                              selectedBank.name
                            )
                          }
                        >
                          <Download className="h-5 w-5 mr-3" />
                          Download Statement
                        </Button>

                        <Button
                          className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base rounded-xl"
                          onClick={() =>
                            handleQuickAction(
                              "Transfer Money",
                              selectedBank.name
                            )
                          }
                        >
                          <ArrowUpRight className="h-5 w-5 mr-3" />
                          Transfer Money
                        </Button>

                        <Button
                          className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base rounded-xl"
                          onClick={() =>
                            handleQuickAction(
                              "Refresh Balance",
                              selectedBank.name
                            )
                          }
                        >
                          <RefreshCw className="h-5 w-5 mr-3" />
                          Refresh Balance
                        </Button>

                        <Button
                          className="w-full h-14 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-base rounded-xl"
                          onClick={() =>
                            handleQuickAction(
                              "Card Settings",
                              selectedBank.name
                            )
                          }
                        >
                          <CreditCard className="h-5 w-5 mr-3" />
                          Card Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
