import { BankAccount, Transaction } from "@/lib/types";
import {
  Utensils,
  Car,
  Briefcase,
  Film,
  HeartHandshake,
  ShoppingBag,
} from "lucide-react";
import {
  SbiIcon,
  HdfcIcon,
  IciciIcon,
  AxisIcon,
  NetflixIcon,
  SpotifyIcon,
  AdobeIcon,
} from "@/lib/icons";

// --- DASHBOARD DATA ---
export const balanceData = {
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

export const paidPayments = [
  { name: "Netflix", amount: "₹649", icon: NetflixIcon },
  { name: "Spotify", amount: "₹119", icon: SpotifyIcon },
  { name: "Adobe Creative", amount: "₹1,675", icon: AdobeIcon },
];

export const upcomingPayments = [
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

export const allBankAccounts: BankAccount[] = [
  {
    name: "STATE BANK OF INDIA",
    balance: "₹27,932",
    accountNumber: "34536896452",
    ifscCode: "SBIN0006586",
    swiftBic: "SBININBBXXX",
    holderName: "NISHANT VERMA",
    icon: SbiIcon,
  },
  {
    name: "HDFC BANK",
    balance: "₹2,58,630",
    accountNumber: "92536896452",
    ifscCode: "HDFCINBBXXX",
    swiftBic: "HDFCINBB",
    holderName: "NISHANT VERMA",
    icon: HdfcIcon,
  },
  {
    name: "ICICI BANK",
    balance: "₹74,932",
    accountNumber: "12345678901",
    ifscCode: "ICICINBBXXX",
    swiftBic: "ICICINBB",
    holderName: "NISHANT VERMA",
    icon: IciciIcon,
  },
  {
    name: "AXIS BANK",
    balance: "₹65,310",
    accountNumber: "98765432109",
    ifscCode: "UTIBINBBXXX",
    swiftBic: "AXISINBB",
    holderName: "NISHANT VERMA",
    icon: AxisIcon,
  },
];

// --- TRANSACTIONS DATA ---

export const allTransactions = [
  {
    id: 1,
    date: "2025-09-10",
    description: "Zomato Order",
    category: "Food",
    amount: -450,
    type: "outflow",
    icon: Utensils,
  },
  {
    id: 2,
    date: "2025-09-10",
    description: "Uber Ride",
    category: "Travel",
    amount: -280,
    type: "outflow",
    icon: Car,
  },
  {
    id: 3,
    date: "2025-09-09",
    description: "Freelance Payment",
    category: "Income",
    amount: 15000,
    type: "inflow",
    icon: Briefcase,
  },
  {
    id: 4,
    date: "2025-09-08",
    description: "Netflix Subscription",
    category: "Entertainment",
    amount: -649,
    type: "outflow",
    icon: Film,
  },
  {
    id: 5,
    date: "2025-09-07",
    description: "Salary Credit",
    category: "Income",
    amount: 50000,
    type: "inflow",
    icon: Briefcase,
  },
  {
    id: 6,
    date: "2025-09-06",
    description: "Amazon Purchase",
    category: "Shopping",
    amount: -2500,
    type: "outflow",
    icon: ShoppingBag,
  },
  {
    id: 7,
    date: "2025-09-05",
    description: "Mom",
    category: "Family",
    amount: 1000,
    type: "inflow",
    icon: HeartHandshake,
  },
  {
    id: 8,
    date: "2025-09-04",
    description: "Spotify",
    category: "Entertainment",
    amount: -119,
    type: "outflow",
    icon: Film,
  },
];

export const categories = [
  "All",
  "Food",
  "Travel",
  "Income",
  "Entertainment",
  "Shopping",
  "Family",
];

// --- SAVINGS DATA ---
export const savingsData = {
  historical: [
    { month: "Oct 2024", savings: 12000, type: "historical" },
    { month: "Nov 2024", savings: 15000, type: "historical" },
    { month: "Dec 2024", savings: 18000, type: "historical" },
    { month: "Jan 2025", savings: 14000, type: "historical" },
    { month: "Feb 2025", savings: 16000, type: "historical" },
    { month: "Mar 2025", savings: 20000, type: "historical" },
    { month: "Apr 2025", savings: 22000, type: "historical" },
    { month: "May 2025", savings: 19000, type: "historical" },
    { month: "Jun 2025", savings: 25000, type: "historical" },
    { month: "Jul 2025", savings: 28000, type: "historical" },
    { month: "Aug 2025", savings: 26000, type: "historical" },
    { month: "Sep 2025", savings: 30000, type: "historical" },
  ],
  forecast: [
    { month: "Oct 2025", savings: 32000, type: "forecast" },
    { month: "Nov 2025", savings: 34000, type: "forecast" },
    { month: "Dec 2025", savings: 36000, type: "forecast" },
    { month: "Jan 2026", savings: 33000, type: "forecast" },
    { month: "Feb 2026", savings: 35000, type: "forecast" },
    { month: "Mar 2026", savings: 38000, type: "forecast" },
    { month: "Apr 2026", savings: 40000, type: "forecast" },
    { month: "May 2026", savings: 37000, type: "forecast" },
    { month: "Jun 2026", savings: 42000, type: "forecast" },
    { month: "Jul 2026", savings: 45000, type: "forecast" },
    { month: "Aug 2026", savings: 43000, type: "forecast" },
    { month: "Sep 2026", savings: 48000, type: "forecast" },
  ],
};

// --- COMPREHENSIVE MONTHLY TRANSACTIONS FOR SAVINGS CALCULATION ---
export const monthlyTransactionsData = [
  // September 2024
  {
    month: "2024-09",
    inflows: [
      { amount: 75000, description: "Salary", date: "2024-09-01" },
      { amount: 5000, description: "Freelance Project", date: "2024-09-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2024-09-01" },
      { amount: 12000, description: "Groceries & Food", date: "2024-09-02" },
      { amount: 8000, description: "Utilities", date: "2024-09-03" },
      { amount: 6000, description: "Transportation", date: "2024-09-05" },
      { amount: 4000, description: "Entertainment", date: "2024-09-10" },
      { amount: 3000, description: "Shopping", date: "2024-09-12" },
      { amount: 2000, description: "Miscellaneous", date: "2024-09-20" },
    ],
  },
  // October 2024
  {
    month: "2024-10",
    inflows: [
      { amount: 75000, description: "Salary", date: "2024-10-01" },
      { amount: 3000, description: "Investment Returns", date: "2024-10-20" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2024-10-01" },
      { amount: 15000, description: "Groceries & Food", date: "2024-10-02" },
      { amount: 8000, description: "Utilities", date: "2024-10-03" },
      { amount: 7000, description: "Transportation", date: "2024-10-05" },
      { amount: 5000, description: "Entertainment", date: "2024-10-10" },
      { amount: 4000, description: "Shopping", date: "2024-10-12" },
      { amount: 2000, description: "Miscellaneous", date: "2024-10-20" },
    ],
  },
  // November 2024
  {
    month: "2024-11",
    inflows: [
      { amount: 75000, description: "Salary", date: "2024-11-01" },
      { amount: 8000, description: "Bonus", date: "2024-11-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2024-11-01" },
      { amount: 13000, description: "Groceries & Food", date: "2024-11-02" },
      { amount: 9000, description: "Utilities", date: "2024-11-03" },
      { amount: 6000, description: "Transportation", date: "2024-11-05" },
      { amount: 7000, description: "Entertainment", date: "2024-11-10" },
      { amount: 3000, description: "Shopping", date: "2024-11-12" },
      { amount: 2500, description: "Miscellaneous", date: "2024-11-20" },
    ],
  },
  // December 2024
  {
    month: "2024-12",
    inflows: [
      { amount: 75000, description: "Salary", date: "2024-12-01" },
      { amount: 15000, description: "Year-end Bonus", date: "2024-12-20" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2024-12-01" },
      { amount: 18000, description: "Groceries & Food", date: "2024-12-02" },
      { amount: 8000, description: "Utilities", date: "2024-12-03" },
      { amount: 8000, description: "Transportation", date: "2024-12-05" },
      { amount: 12000, description: "Entertainment", date: "2024-12-10" },
      { amount: 8000, description: "Shopping", date: "2024-12-12" },
      { amount: 3000, description: "Miscellaneous", date: "2024-12-20" },
    ],
  },
  // January 2025
  {
    month: "2025-01",
    inflows: [
      { amount: 78000, description: "Salary", date: "2025-01-01" },
      { amount: 4000, description: "Freelance", date: "2025-01-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-01-01" },
      { amount: 14000, description: "Groceries & Food", date: "2025-01-02" },
      { amount: 10000, description: "Utilities", date: "2025-01-03" },
      { amount: 6000, description: "Transportation", date: "2025-01-05" },
      { amount: 5000, description: "Entertainment", date: "2025-01-10" },
      { amount: 4000, description: "Shopping", date: "2025-01-12" },
      { amount: 2000, description: "Miscellaneous", date: "2025-01-20" },
    ],
  },
  // February 2025
  {
    month: "2025-02",
    inflows: [
      { amount: 78000, description: "Salary", date: "2025-02-01" },
      { amount: 6000, description: "Investment Returns", date: "2025-02-20" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-02-01" },
      { amount: 12000, description: "Groceries & Food", date: "2025-02-02" },
      { amount: 8000, description: "Utilities", date: "2025-02-03" },
      { amount: 7000, description: "Transportation", date: "2025-02-05" },
      { amount: 4000, description: "Entertainment", date: "2025-02-10" },
      { amount: 6000, description: "Shopping", date: "2025-02-12" },
      { amount: 2500, description: "Miscellaneous", date: "2025-02-20" },
    ],
  },
  // March 2025
  {
    month: "2025-03",
    inflows: [
      { amount: 78000, description: "Salary", date: "2025-03-01" },
      { amount: 7000, description: "Tax Refund", date: "2025-03-25" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-03-01" },
      { amount: 13500, description: "Groceries & Food", date: "2025-03-02" },
      { amount: 8500, description: "Utilities", date: "2025-03-03" },
      { amount: 6500, description: "Transportation", date: "2025-03-05" },
      { amount: 5500, description: "Entertainment", date: "2025-03-10" },
      { amount: 4000, description: "Shopping", date: "2025-03-12" },
      { amount: 2000, description: "Miscellaneous", date: "2025-03-20" },
    ],
  },
  // April 2025
  {
    month: "2025-04",
    inflows: [
      { amount: 80000, description: "Salary", date: "2025-04-01" },
      { amount: 5000, description: "Freelance", date: "2025-04-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-04-01" },
      { amount: 14000, description: "Groceries & Food", date: "2025-04-02" },
      { amount: 9000, description: "Utilities", date: "2025-04-03" },
      { amount: 7000, description: "Transportation", date: "2025-04-05" },
      { amount: 6000, description: "Entertainment", date: "2025-04-10" },
      { amount: 5000, description: "Shopping", date: "2025-04-12" },
      { amount: 2500, description: "Miscellaneous", date: "2025-04-20" },
    ],
  },
  // May 2025
  {
    month: "2025-05",
    inflows: [
      { amount: 80000, description: "Salary", date: "2025-05-01" },
      { amount: 3000, description: "Investment Returns", date: "2025-05-20" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-05-01" },
      { amount: 15000, description: "Groceries & Food", date: "2025-05-02" },
      { amount: 10000, description: "Utilities", date: "2025-05-03" },
      { amount: 8000, description: "Transportation", date: "2025-05-05" },
      { amount: 4000, description: "Entertainment", date: "2025-05-10" },
      { amount: 3000, description: "Shopping", date: "2025-05-12" },
      { amount: 2000, description: "Miscellaneous", date: "2025-05-20" },
    ],
  },
  // June 2025
  {
    month: "2025-06",
    inflows: [
      { amount: 80000, description: "Salary", date: "2025-06-01" },
      { amount: 8000, description: "Freelance Project", date: "2025-06-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-06-01" },
      { amount: 16000, description: "Groceries & Food", date: "2025-06-02" },
      { amount: 9000, description: "Utilities", date: "2025-06-03" },
      { amount: 7500, description: "Transportation", date: "2025-06-05" },
      { amount: 6000, description: "Entertainment", date: "2025-06-10" },
      { amount: 4500, description: "Shopping", date: "2025-06-12" },
      { amount: 2500, description: "Miscellaneous", date: "2025-06-20" },
    ],
  },
  // July 2025
  {
    month: "2025-07",
    inflows: [
      { amount: 82000, description: "Salary", date: "2025-07-01" },
      { amount: 6000, description: "Side Business", date: "2025-07-15" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-07-01" },
      { amount: 14000, description: "Groceries & Food", date: "2025-07-02" },
      { amount: 11000, description: "Utilities", date: "2025-07-03" },
      { amount: 8000, description: "Transportation", date: "2025-07-05" },
      { amount: 7000, description: "Entertainment", date: "2025-07-10" },
      { amount: 5000, description: "Shopping", date: "2025-07-12" },
      { amount: 3000, description: "Miscellaneous", date: "2025-07-20" },
    ],
  },
  // August 2025
  {
    month: "2025-08",
    inflows: [
      { amount: 82000, description: "Salary", date: "2025-08-01" },
      { amount: 4000, description: "Investment Returns", date: "2025-08-20" },
    ],
    outflows: [
      { amount: 25000, description: "Rent", date: "2025-08-01" },
      { amount: 15000, description: "Groceries & Food", date: "2025-08-02" },
      { amount: 9500, description: "Utilities", date: "2025-08-03" },
      { amount: 7000, description: "Transportation", date: "2025-08-05" },
      { amount: 5500, description: "Entertainment", date: "2025-08-10" },
      { amount: 4000, description: "Shopping", date: "2025-08-12" },
      { amount: 2500, description: "Miscellaneous", date: "2025-08-20" },
    ],
  },
];

// --- SAVINGS GOALS DATA ---
export const savingsGoals = [
  {
    id: 1,
    name: "Vacation Fund",
    targetAmount: 50000,
    currentAmount: 35000,
    deadline: "Dec 2025",
    status: "on-track",
    insight:
      "You're ahead of schedule! Consider investing the extra funds in a high-yield savings account.",
  },
  {
    id: 2,
    name: "Emergency Fund",
    targetAmount: 150000,
    currentAmount: 85000,
    deadline: "Jun 2026",
    status: "on-track",
    insight:
      "Great progress! Maintain your current savings rate to reach your 6-month expense goal.",
  },
  {
    id: 3,
    name: "New Car",
    targetAmount: 800000,
    currentAmount: 180000,
    deadline: "Mar 2026",
    status: "at-risk",
    insight:
      "Consider increasing monthly contributions by ₹15,000 or extending deadline by 6 months.",
  },
  {
    id: 4,
    name: "Home Down Payment",
    targetAmount: 1500000,
    currentAmount: 320000,
    deadline: "Dec 2026",
    status: "on-track",
    insight:
      "On track for your home purchase. Consider exploring pre-approved loan options now.",
  },
];
