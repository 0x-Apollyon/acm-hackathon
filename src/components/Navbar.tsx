"use client";

import Link from "next/link";
import {
  Search,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Settings,
  BookOpen,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const [theme, setTheme] = React.useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("finz-theme") || "light";
    setTheme(savedTheme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    localStorage.setItem("finz-theme", newTheme);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const session = { user: { name: "Nishant", image: "/placeholder.svg" } };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-500/30">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left Section (Logo) */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-300 transition-colors">
            FinZ
          </Link>
        </div>

        {/* Center Section (Navigation) */}
        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-white/90 transition-all hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-white/90 transition-all hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className="text-white/90 transition-all hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            Transactions
          </Link>
          <Link
            href="/banks"
            className="text-white/90 transition-all hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm"
          >
            Banks
          </Link>

          {/* Learn Hover Card */}
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <span className="cursor-pointer text-white/90 transition-all hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                Learn
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="w-48 glass-strong border-slate-500/40 text-white/90 p-2">
              <Link
                href="#"
                className="flex items-center p-2 rounded-md hover:bg-white/10 transition-all"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>Simulator</span>
              </Link>
              <div className="flex items-center p-2 rounded-md text-white/50 cursor-not-allowed">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Lessons</span>
              </div>
            </HoverCardContent>
          </HoverCard>

          <Link href="#" className="text-white/50 cursor-not-allowed px-3 py-2 rounded-lg">
            Savings
          </Link>
        </nav>

        {/* Right Section (Search, Theme, Profile) */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="outline"
            className="hidden h-9 w-48 justify-between glass border-slate-500/40 text-white/80 hover:bg-white/10 hover:text-white sm:flex"
            onClick={() => setOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search...
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/60 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="glass border-slate-500/40 text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full glass border-slate-500/40 hover:bg-white/10"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={session.user?.image || "/placeholder.svg"}
                  alt={session.user?.name || ""}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-strong border-slate-500/40" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {session.user?.name}
                  </p>
                  <p className="text-xs leading-none text-white/70">
                    nishant@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-500/40" />
              <DropdownMenuItem className="text-white/90 hover:bg-white/10">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-white/50">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-500/40" />
              <DropdownMenuItem className="text-white/90 hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <span>Transactions</span>
            </CommandItem>
            <CommandItem>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Banks</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
