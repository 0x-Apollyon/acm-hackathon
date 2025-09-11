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
