/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Copy, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { allTransactions } from "@/lib/data"; // Import from our new data file

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
const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v18l8-9-8-9z" fill="#E50914"></path>
  </svg>
);
const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#1DB954"></circle>
    <path
      d="M7.5 12.5s2-1 4.5-1.5 5 1 5 1M8 15s2.5-1 4-1.5 4.5 1 4.5 1"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
    ></path>
  </svg>
);
const AdobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.5 3L21 12h-6.5L14.5 3zM9.5 3L3 12h6.5L9.5 3zM12 21l-7-9h14l-7 9z"
      fill="#FF0000"
    ></path>
  </svg>
);

// --- UPDATED FABRICATED DATA ---
const balanceData = {
  "1m": [
    { date: "Aug 10", balance: 320000 },
    { date: "Aug 20", balance: 300000 },
    { date: "Aug 30", balance: 310000 },
    { date: "Sep 10", balance: 349904 },
  ],
  "3m": [
    { date: "Jul 10", balance: 260000 },
    { date: "Jul 30", balance: 290000 },
    { date: "Aug 15", balance: 320000 },
    { date: "Aug 30", balance: 300000 },
    { date: "Sep 10", balance: 349904 },
  ],
  "6m": [
    { date: "Apr 15", balance: 180000 },
    { date: "May 30", balance: 280000 },
    { date: "Jun 30", balance: 310000 },
    { date: "Jul 30", balance: 290000 },
    { date: "Aug 30", balance: 300000 },
    { date: "Sep 10", balance: 349904 },
  ],
};

const paidPayments = [
  { name: "Netflix", amount: "₹649", icon: <NetflixIcon /> },
  { name: "Spotify", amount: "₹119", icon: <SpotifyIcon /> },
  { name: "Adobe Creative", amount: "₹1,675", icon: <AdobeIcon /> },
];

const upcomingPayments = [
  {
    name: "2586 Rent",
    amount: "₹25,000",
    daysDue: 7,
    isMonthly: true,
    dueDate: 23,
    icon: "🏠",
  },
  {
    name: "YouTube Premium",
    amount: "₹129",
    daysDue: 17,
    isMonthly: true,
    dueDate: 19,
    icon: "📺",
  },
  {
    name: "Amazon Prime",
    amount: "₹1,499",
    daysDue: 19,
    isMonthly: false,
    dueDate: 25,
    icon: "📦",
  },
];

const bankAccounts = [
  { name: "SBI", balance: "₹27,932", icon: SbiIcon },
  { name: "HDFC", balance: "₹2,58,630", icon: HdfcIcon },
  { name: "ICICI", balance: "₹74,932", icon: IciciIcon },
  { name: "AXIS", balance: "₹65,310", icon: AxisIcon },
];

// Derive inflows and outflows from the central data source
const inflows = allTransactions
  .filter((tx) => tx.type === "inflow")
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3);

const outflows = allTransactions
  .filter((tx) => tx.type === "outflow")
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3);

// --- END OF FABRICATED DATA ---

export default function FinZDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState<"1m" | "3m" | "6m">("1m");

  // Default theme logic is handled in Header.tsx
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("finz-theme") || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("finz-chart-range", timeRange);
  }, [timeRange]);

  const [accordionValue, setAccordionValue] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("finz-accordion-state");
      return saved ? JSON.parse(saved) : ["upcoming"];
    }
    return ["upcoming"];
  });

  useEffect(() => {
    localStorage.setItem(
      "finz-accordion-state",
      JSON.stringify(accordionValue)
    );
  }, [accordionValue]);

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paidTotal = paidPayments.reduce(
    (sum, payment) =>
      sum + Number.parseInt(payment.amount.replace("₹", "").replace(",", "")),
    0
  );
  const upcomingTotal = upcomingPayments.reduce(
    (sum, payment) =>
      sum + Number.parseInt(payment.amount.replace("₹", "").replace(",", "")),
    0
  );

  const getDateIcon = (date: Date) => {
    const day = date.getDate();
    const payment = upcomingPayments.find((p) => p.dueDate === day);
    return payment ? payment.icon : null;
  };

  return (
    // The background is now set by the theme classes in globals.css
    // The custom navy blue is handled by the --background variable in the .dark class
    <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto flex pt-8">
        {/* Main Content Area */}
        <main className="flex-1 pr-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Good Morning, Nishant
            </h1>
            <p className="text-md text-primary">{dateString}</p>
          </div>

          <Card className="mb-8 bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A]">
            <CardContent className="flex flex-row items-start gap-8 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-blue-300 mb-4">
                  BANKS
                </p>
                <div className="space-y-2">
                  {bankAccounts.map((bank, index) => {
                    const Icon = bank.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-md bg-muted/50 dark:bg-blue-500/10"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          <Icon />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {bank.name}
                          </p>
                          <p className="text-md font-semibold text-foreground">
                            {bank.balance}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-blue-300 mb-2">
                      TOTAL BALANCE
                    </p>
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-foreground">
                        ₹3,49,904
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-500">
                        ↑ 20% compared to previous month
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["1m", "3m", "6m"] as const).map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                        className="rounded-full"
                      >
                        {range.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="h-48">
                  <ChartContainer
                    config={{
                      balance: {
                        label: "Balance",
                        color: "hsl(142.1 76.2% 42.2%)",
                      },
                    }}
                    className="h-full w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={balanceData[timeRange]}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="balanceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-balance)"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-balance)"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 12,
                            fill: "hsl(var(--muted-foreground))",
                          }}
                          interval={0}
                        />
                        <YAxis hide />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                          type="monotone"
                          dataKey="balance"
                          stroke="var(--color-balance)"
                          strokeWidth={2}
                          fill="url(#balanceGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Latest Inflow */}
            <Card className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-card-foreground">
                  Latest Inflow
                </CardTitle>
                <Link href="/transactions?filter=inflow" passHref>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View More
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {inflows.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 dark:bg-[#101827] p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-md font-medium text-card-foreground">
                        {item.description}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                        + ₹{item.amount.toLocaleString()}
                      </p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Latest Outflow */}
            <Card className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-card-foreground">
                  Latest Outflow
                </CardTitle>
                <Link href="/transactions?filter=outflow" passHref>
                  <Button variant="ghost" size="sm" className="text-primary">
                    View More
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {outflows.map((item, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 dark:bg-[#101827] p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-md font-medium text-card-foreground">
                        {item.description}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                        - ₹{Math.abs(item.amount).toLocaleString()}
                      </p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-96 flex-shrink-0 border-l border-border dark:border-[#2A3B5A] pl-8">
          <Card className="bg-card border-border dark:bg-[#1B253A] dark:border-[#2A3B5A]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-blue-300">
                RECURRING PAYMENTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  components={{
                    Day: (props) => {
                      const dayDate = props.day.date;
                      const icon = getDateIcon(dayDate);
                      const isSelected =
                        date && dayDate.toDateString() === date.toDateString();

                      return (
                        <div
                          {...props}
                          role="button"
                          className={`h-9 w-9 relative flex items-center justify-center p-0 font-normal rounded-full transition-colors ${
                            isSelected
                              ? "bg-foreground text-background"
                              : icon
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "hover:bg-accent"
                          }`}
                        >
                          {icon ? (
                            <>
                              <span className="absolute top-0.5 left-1.5 text-[10px] text-muted-foreground">
                                {dayDate.getDate()}
                              </span>
                              <span className="text-lg">{icon}</span>
                            </>
                          ) : (
                            dayDate.getDate()
                          )}
                        </div>
                      );
                    },
                  }}
                  classNames={{
                    head_cell:
                      "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    cell: "text-center text-sm p-0 relative w-9",
                    caption_label: "text-sm font-medium",
                    row: "flex w-full mt-2 justify-between",
                    head_row: "flex justify-between",
                  }}
                />
              </div>

              <Accordion
                type="multiple"
                value={accordionValue}
                onValueChange={setAccordionValue}
                className="w-full"
              >
                <AccordionItem value="paid">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>Paid</span>
                      <span className="text-muted-foreground">
                        ₹{paidTotal.toLocaleString()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-2">
                      {paidPayments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl h-8 w-8 flex items-center justify-center">
                              {payment.icon}
                            </span>
                            <span className="text-sm text-foreground">
                              {payment.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {payment.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="upcoming">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                    <div className="flex items-center justify-between w-full">
                      <span>Upcoming</span>
                      <span className="text-muted-foreground">
                        ₹{upcomingTotal.toLocaleString()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <div className="space-y-4">
                      {upcomingPayments.map((payment, index) => (
                        <div
                          key={index}
                          className="bg-muted/50 dark:bg-[#101827] p-4 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-2xl bg-accent p-3 rounded-md">
                              {payment.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {payment.name}
                              </p>
                              <div
                                className={`text-xs p-1 px-2 rounded-full inline-block mt-1 font-semibold ${
                                  payment.daysDue < 10
                                    ? "text-red-600 bg-red-400/30 dark:text-red-400 dark:bg-red-500/30"
                                    : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                Due in {payment.daysDue} days
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {payment.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.isMonthly ? "monthly" : "yearly"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Toaster
        theme={theme === "dark" ? "dark" : "light"}
        position="bottom-right"
      />
    </div>
  );
}
