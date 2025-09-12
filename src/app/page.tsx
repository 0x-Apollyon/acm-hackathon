/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  TrendingUp,
  Building2,
  Target,
  GraduationCap,
  CreditCard,
  BarChart3,
  PiggyBank,
  Sparkles,
  Shield,
  Brain,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  {
    icon: BarChart3,
    title: "Interactive Dashboard",
    description:
      "Get a complete overview of your finances with real-time balance charts, account summaries, and transaction insights.",
    href: "/dashboard",
    color: "bg-blue-500/20 border-blue-400/30",
    iconColor: "text-blue-300",
  },
  {
    icon: CreditCard,
    title: "Transaction Management",
    description:
      "Track every transaction with smart categorization, filtering, and detailed analytics to understand your spending patterns.",
    href: "/transactions",
    color: "bg-purple-500/20 border-purple-400/30",
    iconColor: "text-purple-300",
  },
  {
    icon: Building2,
    title: "Bank Integration",
    description:
      "Connect and manage multiple bank accounts with secure integration, account details, and transaction history.",
    href: "/banks",
    color: "bg-green-500/20 border-green-400/30",
    iconColor: "text-green-300",
  },
  {
    icon: Target,
    title: "Smart Savings Goals",
    description:
      "Set financial goals and track progress with AI-powered forecasting that predicts when you'll reach your targets.",
    href: "/savings",
    color: "bg-yellow-500/20 border-yellow-400/30",
    iconColor: "text-yellow-300",
  },
  {
    icon: GraduationCap,
    title: "Investment Learning",
    description:
      "Master investing fundamentals through interactive modules, earn badges, and build confidence before you invest.",
    href: "/stonks",
    color: "bg-pink-500/20 border-pink-400/30",
    iconColor: "text-pink-300",
  },
];

const stats = [
  { label: "Active Features", value: "5+", icon: Sparkles },
  { label: "Bank Accounts", value: "Multi", icon: Building2 },
  { label: "Security Level", value: "Bank-Grade", icon: Shield },
  { label: "Insights", value: "Smart", icon: Brain },
];

export default function LandingPage() {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full text-white/95">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge
              variant="outline"
              className="glass border-blue-400/50 text-blue-300 mb-6 px-4 py-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Complete Financial Management Platform
            </Badge>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Your Money,
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Simplified
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              From tracking transactions to setting savings goals and learning
              investments - manage your entire financial journey in one
              intelligent platform.
            </p>

            {/* Animated Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStatIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-2 glass px-4 py-3 rounded-full border-slate-500/30"
                >
                  {(() => {
                    const IconComponent = stats[currentStatIndex].icon;
                    return <IconComponent className="w-5 h-5 text-blue-300" />;
                  })()}
                  <span className="text-white font-semibold">
                    {stats[currentStatIndex].value}
                  </span>
                  <span className="text-white/70">
                    {stats[currentStatIndex].label}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transform"
                >
                  <DollarSign className="mr-2 h-5 w-5" />
                  Start Managing Money
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/transactions">
                <Button
                  variant="outline"
                  size="lg"
                  className="glass border-slate-500/50 text-white/90 hover:bg-white/10 hover:text-white px-8 py-4 text-lg rounded-full transition-all hover:border-white/30"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Live Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge
              variant="outline"
              className="glass border-purple-400/50 text-purple-300 mb-4 px-4 py-2"
            >
              <Target className="w-4 h-4 mr-2" />
              All-in-One Platform
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-green-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Financial Success
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From basic transaction tracking to advanced investment learning -
              our platform grows with your financial journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group"
                >
                  <Link href={feature.href}>
                    <Card
                      className={`glass border-slate-500/30 hover:bg-slate-700/30 transition-all duration-300 h-full cursor-pointer ${feature.color} hover:border-white/30`}
                    >
                      <CardContent className="p-8">
                        <div
                          className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <Icon className={`h-8 w-8 ${feature.iconColor}`} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed mb-6 group-hover:text-white/90 transition-colors">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-blue-300 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          Explore Feature
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="glass border-slate-500/30 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-gradient">
              <CardContent className="p-12">
                <PiggyBank className="w-16 h-16 text-blue-300 mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  Ready to Transform Your Financial Life?
                </h3>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands who have taken control of their finances with
                  our comprehensive platform. Start your journey today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transform"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/stonks">
                    <Button
                      variant="outline"
                      size="lg"
                      className="glass border-slate-500/50 text-white/90 hover:bg-white/10 hover:text-white px-8 py-4 text-lg rounded-full transition-all hover:border-white/30"
                    >
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
