"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { allTransactions, allBankAccounts } from "@/lib/data";
import { AuthAPI } from "@/lib/authClient";
import { BankAccount } from "@/lib/types";
import { motion } from "framer-motion";

// Enhanced bank data with additional details (mock fallback)
const mockEnhancedBankData = allBankAccounts.map((account: BankAccount, index: number) => {
  const accountTransactions = allTransactions
    .filter(() => Math.random() > 0.5) // Random assignment for demo
    .slice(0, 3 + Math.floor(Math.random() * 3));

  const cardType = ["Debit Card", "Credit Card", "Savings Card"][index % 3];
  const cardNumber = `**** **** **** ${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  const expiryDate = `${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}/${new Date().getFullYear() + 2}`;

  return {
    ...account,
    accountTransactions,
    cardType,
    cardNumber,
    expiryDate,
    isActive: Math.random() > 0.2
  };
});

const DetailRow = ({ label, value, copyable = false }: {
  label: string;
  value: string;
  copyable?: boolean;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
      <div className="min-w-0 flex-1 mr-2">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm font-medium text-white break-all">{value}</p>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 hover:bg-white/20 flex-shrink-0"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default function BanksPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currencySymbol, setCurrencySymbol] = useState<'$' | '₹'>('$');
  const [selectedBank, setSelectedBank] = useState<any | null>(null);
  const [balancesVisible, setBalancesVisible] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dash, acc] = await Promise.all([
        AuthAPI.userDashboard(),
        AuthAPI.userAccounts(),
      ]);
      if (cancelled) return;
      if (dash.status === 'success') {
        const cur = dash.data?.user_info?.preferences?.default_currency === 'USD' ? '$' : '₹';
        setCurrencySymbol(cur);
      }
      if (acc.status === 'success') {
        setAccounts(acc.accounts || []);
      } else {
        setAccounts([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleBalanceVisibility = (id: number) => {
    setBalancesVisible(prev => ({
      ...prev,
      [id]: !prev[id]
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
          <p className="text-lg text-purple-300">Manage your financial connections</p>
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
              <p className="text-2xl font-bold text-white">{accounts.length}</p>
            </CardContent>
          </Card>

          <Card className="glass border-slate-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="text-sm text-white/60">Total Balance</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {currencySymbol}{accounts.reduce((total, a) => total + (Number(a.balance) || 0), 0).toLocaleString()}
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
                {accounts.filter(a => a.is_active).length}
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
          {(accounts.length ? accounts : []).map((acc, index) => {
            const isBalanceVisible = balancesVisible[acc.id];

            return (
              <motion.div
                key={acc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Card
                  className="glass border-slate-500/30 hover:border-slate-400/50 transition-all duration-300 h-full group-hover:shadow-xl group-hover:shadow-blue-500/10"
                  onClick={() => setSelectedBank(acc)}
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <Building2 />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-white/90">
                            {acc.account_name}
                          </CardTitle>
                          <p className="text-xs text-white/60">{acc.institution_name || acc.account_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBalanceVisibility(acc.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-white/20 transition-all duration-200"
                        >
                          {isBalanceVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {acc.is_active && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Balance */}
                    <div className="text-center">
                      <p className="text-xs text-white/60 mb-2">Current Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {isBalanceVisible ? `${currencySymbol}${Number(acc.balance).toLocaleString()}` : "••••••••"}
                      </p>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                      {acc.account_number_masked && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/60">Account</span>
                          <span className="text-sm font-mono text-white/80">
                            {acc.account_number_masked}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">Status</span>
                        <div className="flex items-center gap-2">
                          {acc.is_active ? (
                            <>
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-400 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                              <span className="text-xs text-red-400 font-medium">Inactive</span>
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
                          handleQuickAction("Transfer", acc.account_name);
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
                          handleQuickAction("Statement", acc.account_name);
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

      {/* Detailed Modal */}
      <Dialog open={!!selectedBank} onOpenChange={() => setSelectedBank(null)}>
        <DialogContent className="glass-strong border-slate-500/40 w-full max-w-6xl mx-auto my-8 max-h-[85vh] overflow-hidden p-0">
          {selectedBank && (
            <div className="overflow-y-auto max-h-[85vh] p-6">
              <DialogHeader className="pb-6 border-b border-white/10">
                <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xl sm:text-2xl text-white">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Building2 />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xl sm:text-2xl font-bold truncate">{selectedBank.account_name}</p>
                    <p className="text-sm sm:text-base text-white/60 font-normal">{selectedBank.institution_name || selectedBank.account_type}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
                {/* Left Column - Account Details */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <DetailRow
                        label="Account Number"
                        value={selectedBank.account_number_masked || '—'}
                        copyable
                      />
                      <DetailRow label="Institution" value={selectedBank.institution_name || '—'} />
                      <DetailRow label="Type" value={selectedBank.account_type} />
                      <DetailRow label="Linked At" value={selectedBank.linked_at || '—'} />
                      <DetailRow label="Last Sync" value={selectedBank.last_sync || '—'} />
                    </div>
                  </div>
                </div>

                {/* Right Column - Quick Actions & Summary */}
                <div className="space-y-6">
                  {/* Account Summary Card */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Summary</h3>
                    <Card className="glass border-slate-500/30">
                      <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-white/60 mb-2">Current Balance</p>
                          <p className="text-2xl sm:text-3xl font-bold text-green-400 break-all">
                            {currencySymbol}{Number(selectedBank.balance).toLocaleString()}
                          </p>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                            <span className="text-xs sm:text-sm text-white/60">Status</span>
                            <span className="text-xs sm:text-sm font-medium text-white truncate ml-2">{selectedBank.is_active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {/* Solid Button */}
                      <Button
                        className="w-full h-10 sm:h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                        onClick={() => handleQuickAction("Download Statement", selectedBank.name)}
                      >
                        <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                        <span className="truncate">Download Statement</span>
                      </Button>

                      {/* Matte Button */}
                      <Button
                        className="w-full h-10 sm:h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-600 shadow-md transition-all duration-300 text-sm sm:text-base"
                        onClick={() => handleQuickAction("Transfer Money", selectedBank.name)}
                      >
                        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                        <span className="truncate">Transfer Money</span>
                      </Button>

                      {/* Glassmorphism Button */}
                      <Button
                        className="w-full h-10 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white font-medium border border-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
                        onClick={() => handleQuickAction("Refresh Balance", selectedBank.name)}
                      >
                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                        <span className="truncate">Refresh Balance</span>
                      </Button>

                      {/* Gradient Glass Button */}
                      <Button
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-lg text-white font-medium border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 text-sm sm:text-base"
                        onClick={() => handleQuickAction("Card Settings", selectedBank.name)}
                      >
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                        <span className="truncate">Card Settings</span>
                      </Button>
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
