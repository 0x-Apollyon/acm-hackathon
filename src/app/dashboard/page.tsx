"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { allTransactions, upcomingPayments } from "@/lib/data";
import BankAccountsList from "@/components/BankAccountsList";
import BalanceChart from "@/components/BalanceChart";
import CalendarWrapper from "@/components/CalendarWrapper";
import RecurringPayments from "@/components/RecurringPayments";
import TransactionCard from "@/components/TransactionCard";
import { Toaster } from "@/components/ui/sonner";

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Derive inflows and outflows from the central data source
  const inflows = allTransactions
    .filter((tx) => tx.type === "inflow")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const outflows = allTransactions
    .filter((tx) => tx.type === "outflow")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getDateIcon = (date: Date) => {
    const day = date.getDate();
    const payment = upcomingPayments.find((p) => p.dueDate === day);
    return payment ? payment.icon : null;
  };

  return (
    <div className="min-h-screen w-full text-white/95 transition-colors duration-300 flex-1">
      <div className="container mx-auto flex pt-8 px-6">
        {/* Main Content Area */}
        <main className="flex-1 pr-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">
              Good Morning, Nishant
            </h1>
            <p className="text-lg text-blue-300 mt-2">{dateString}</p>
          </div>

          <Card className="mb-8 glass border-slate-500/30">
            <CardContent className="flex flex-row items-start gap-8 p-6">
              <div className="flex-1">
                <BalanceChart />
              </div>
              <BankAccountsList />
            </CardContent>
          </Card>

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
                {inflows.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
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
                {outflows.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-96 flex-shrink-0 border-l border-slate-500/30 pl-8">
          <Card className="glass border-slate-500/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                RECURRING PAYMENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CalendarWrapper
                selectedDate={date}
                onDateChange={setDate}
                getDateIcon={getDateIcon}
              />
              <RecurringPayments />
            </CardContent>
          </Card>
        </aside>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
