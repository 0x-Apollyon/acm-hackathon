import { LucideIcon } from "lucide-react";
import { ReactElement } from "react";

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "inflow" | "outflow";
  icon?: LucideIcon;
}

export interface BankAccount {
  name: string;
  balance: string;
  accountNumber: string;
  ifscCode: string;
  swiftBic: string;
  holderName: string;
  icon: () => ReactElement;
}

export interface PaymentData {
  name: string;
  amount: string;
  icon: () => ReactElement;
}

export interface UpcomingPayment {
  name: string;
  amount: string;
  daysDue: number;
  isMonthly: boolean;
  dueDate: number;
  icon: string;
}

export interface BalanceDataPoint {
  date: string;
  balance: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
}
