"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Shield, Brain, Target } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Analytics",
    description: "Track your spending patterns and get personalized insights to optimize your financial decisions.",
  },
  {
    icon: Shield,
    title: "Secure Banking",
    description: "Bank-level security with end-to-end encryption to keep your financial data safe and secure.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description: "Leverage artificial intelligence to predict trends and make informed financial choices.",
  },
  {
    icon: Target,
    title: "Goal Setting",
    description: "Set and track financial goals with personalized recommendations to achieve them faster.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full text-white/95">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Financial
            <br />
            <span className="text-blue-300">Decisions</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Take control of your finances with intelligent insights, secure banking integration,
            and personalized recommendations that help you build wealth and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white border-blue-400 px-8 py-3 text-lg rounded-full transition-all hover:shadow-lg hover:shadow-blue-500/25">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/transactions">
              <Button
                variant="outline"
                size="lg"
                className="glass border-slate-500/50 text-white/90 hover:bg-white/10 hover:text-white px-8 py-3 text-lg rounded-full transition-all"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose FinZ?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with intuitive design
              to make financial management effortless and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="glass border-slate-500/30 hover:bg-slate-700/30 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
                      <Icon className="h-6 w-6 text-blue-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
