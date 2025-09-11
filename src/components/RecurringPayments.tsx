"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { paidPayments, upcomingPayments } from "@/lib/data";
import { useState, useEffect } from "react";

interface RecurringPaymentsProps {
  className?: string;
}

export default function RecurringPayments({ className = "" }: RecurringPaymentsProps) {
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

  return (
    <div className={className}>
      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={setAccordionValue}
        className="w-full"
      >
        <AccordionItem value="paid" className="border-slate-500/30">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 text-white">
            <div className="flex items-center justify-between w-full">
              <span>Paid</span>
              <span className="text-white/70">
                ₹{paidTotal.toLocaleString()}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-2">
              {paidPayments.map((payment, index) => {
                const Icon = payment.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-600/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl h-8 w-8 flex items-center justify-center">
                        <Icon />
                      </span>
                      <span className="text-sm text-white">
                        {payment.name}
                      </span>
                    </div>
                    <span className="text-sm text-white/70">
                      {payment.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="upcoming" className="border-slate-500/30">
          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 text-white">
            <div className="flex items-center justify-between w-full">
              <span>Upcoming</span>
              <span className="text-white/70">
                ₹{upcomingTotal.toLocaleString()}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-4">
              {upcomingPayments.map((payment, index) => (
                <div
                  key={index}
                  className="bg-slate-700/40 backdrop-blur-sm border border-slate-500/30 p-4 rounded-lg flex items-center justify-between hover:bg-slate-600/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl bg-slate-600/50 p-3 rounded-md border border-slate-500/40">
                      {payment.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {payment.name}
                      </p>
                      <div
                        className={`text-xs p-1 px-2 rounded-full inline-block mt-1 font-semibold border ${
                          payment.daysDue < 10
                            ? "text-red-400 bg-red-500/20 border-red-400/30"
                            : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                        }`}
                      >
                        Due in {payment.daysDue} days
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {payment.amount}
                    </p>
                    <p className="text-xs text-white/70">
                      {payment.isMonthly ? "monthly" : "yearly"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
