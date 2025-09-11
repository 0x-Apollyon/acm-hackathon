import { LucideIcon } from "lucide-react";

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "inflow" | "outflow";
  icon: LucideIcon;
}

export interface BankAccount {
  name: string;
  balance: string;
  accountNumber: string;
  ifscCode: string;
  swiftBic: string;
  holderName: string;
  icon: LucideIcon;
}
