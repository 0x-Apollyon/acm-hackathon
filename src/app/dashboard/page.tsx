"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BankAccountsList from "@/components/BankAccountsList";
import BalanceChart from "@/components/BalanceChart";
import CalendarWrapper from "@/components/CalendarWrapper";
import TransactionCard from "@/components/TransactionCard";
import { Toaster } from "@/components/ui/sonner";
import { AuthAPI } from "@/lib/authClient";

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [historicalSeries, setHistoricalSeries] = useState<Array<{ date: string; balance: number }>>([]);
  const currencySymbol = (data?.user_info?.preferences?.default_currency || 'USD') === 'USD' ? '$' : '₹';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res, tx] = await Promise.all([
        AuthAPI.userDashboard(),
        AuthAPI.userTransactions({ limit: 1000 }),
      ]);
      if (cancelled) return;
      if (res.status === "success") {
        setData(res.data);
        setError(null);
      } else {
        setError(res.error || "Failed to load dashboard");
      }
      // Build historical balance series (up to 180 days)
      try {
        const currentBalance = Number(
          (res as any)?.data?.accounts?.total_balance ?? (res as any)?.data?.balance?.total_balance ?? 0
        ) || 0;
        const days = 180;
        // Map daily net flows
        const netByDate: Record<string, number> = {};
        if (tx && (tx as any).status === 'success') {
          const groups = (tx as any).transactions || {};
          Object.values(groups).forEach((arr: any) => {
            (arr as any[]).forEach((t) => {
              const d = new Date(t.transaction_date);
              // normalize to yyyy-mm-dd
              const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
                .toISOString()
                .slice(0, 10);
              const amount = Number(t.amount) || 0;
              const net = t.transaction_type === 'income' ? amount : -Math.abs(amount);
              netByDate[key] = (netByDate[key] || 0) + net;
            });
          });
        }
        // Build date range (oldest -> newest)
        const today = new Date();
        const datesAsc: string[] = [];
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
            .toISOString()
            .slice(0, 10);
          datesAsc.push(key);
        }
        // Compute starting balance at oldest day
        const totalNet = datesAsc.reduce((sum, key) => sum + (netByDate[key] || 0), 0);
        let running = currentBalance - totalNet;
        const series = datesAsc.map((key) => {
          running += (netByDate[key] || 0);
          const label = new Date(key + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return { date: label, balance: Math.max(0, Math.round(running)) };
        });
        setHistoricalSeries(series);
      } catch (_) {
        setHistoricalSeries([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inflows = useMemo(() => {
    const grouped = data?.transactions?.recent_transactions || {};
    const flat: Array<{ id: number; description: string; date: string; amount: number; type: "inflow" | "outflow"; category: string; icon?: any; }> = [];
    Object.values(grouped).forEach((arr: any) => {
      (arr as any[]).forEach((t) => {
        if (t.transaction_type === "income") {
          flat.push({
            id: Number(t.id ?? t.transaction_id ?? (new Date(t.transaction_date).getTime() + flat.length)),
            description: t.description,
            date: t.transaction_date,
            amount: t.amount,
            type: "inflow",
            category: t.category || "Income",
          });
        }
      });
    });
    return flat
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [data]);

  const outflows = useMemo(() => {
    const grouped = data?.transactions?.recent_transactions || {};
    const flat: Array<{ id: number; description: string; date: string; amount: number; type: "inflow" | "outflow"; category: string; icon?: any; }> = [];
    Object.values(grouped).forEach((arr: any) => {
      (arr as any[]).forEach((t) => {
        if (t.transaction_type === "expense") {
          flat.push({
            id: Number(t.id ?? t.transaction_id ?? (new Date(t.transaction_date).getTime() + flat.length)),
            description: t.description,
            date: t.transaction_date,
            amount: t.amount,
            type: "outflow",
            category: t.category || "Expense",
          });
        }
      });
    });
    return flat
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [data]);

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getDateIcon = (_date: Date) => null;

  return (
    <div className="min-h-screen w-full text-white/95 transition-colors duration-300 flex-1">
      <div className="container mx-auto flex pt-8 px-6">
        {/* Main Content Area */}
        <main className="flex-1 pr-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              {data?.user_info ? `Welcome, ${data.user_info.id}` : "Dashboard"}
            </h1>
            <p className="text-lg text-blue-300 mt-2">{dateString}</p>
          </div>

          <Card className="mb-6 glass border-slate-500/30">
            <CardContent className="flex flex-row items-start gap-8 p-6">
              <div className="flex-1">
                {/* You can wire chart data using /api/open_prices later */}
                <BalanceChart
                  totalBalanceLabel={`${currencySymbol}${Number(
                    (data?.accounts?.total_balance ?? data?.balance?.total_balance ?? 0)
                  ).toLocaleString()}`}
                  subtitle={`Available: ${currencySymbol}${Number(data?.balance?.available_balance || 0).toLocaleString()}`}
                  historicalSeries={historicalSeries}
                />
              </div>
              {/* banks moved below in curved boxes */}
            </CardContent>
          </Card>

          {/* Banks grid below balance */}
          <BankAccountsList
            accounts={data?.accounts?.linked_accounts || []}
            layout="grid"
            className="mb-8"
            currencySymbol={currencySymbol}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Latest Inflow */}
            <Card className="glass border-slate-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Latest Inflow
                </CardTitle>
                <Link href="/transactions?filter=inflow" passHref>
                  <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-slate-600/30">
                    View More
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {inflows.map((transaction, idx) => (
                  <TransactionCard
                    key={idx}
                    transaction={transaction}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Latest Outflow */}
            <Card className="glass border-slate-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-white">
                  Latest Outflow
                </CardTitle>
                <Link href="/transactions?filter=outflow" passHref>
                  <Button variant="ghost" size="sm" className="text-blue-300 hover:text-white hover:bg-slate-600/30">
                    View More
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {outflows.map((transaction, idx) => (
                  <TransactionCard
                    key={idx}
                    transaction={transaction}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Sidebar removed */}
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
