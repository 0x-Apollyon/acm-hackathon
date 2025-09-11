/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
  Landmark,
  PiggyBank,
  TrendingUp,
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

export default function Header() {
  const [open, setOpen] = React.useState(false);

  // This state will now correctly sync with the DOM and localStorage
  const [theme, setTheme] = React.useState("light");

  // This useEffect is the critical fix. It runs once on mount to set the initial theme.
  useEffect(() => {
    const savedTheme = localStorage.getItem("finz-theme") || "light"; // Default to light
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

  // Placeholder for user session data
  const session = { user: { name: "Nishant", image: "/placeholder.svg" } };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm dark:bg-[#1B253A]/95 dark:border-[#2A3B5A]">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Left Section (Logo) */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="text-2xl font-bold text-foreground">
            FinZ
          </Link>
        </div>

        {/* Center Section (Navigation) */}
        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/transactions"
            className="text-foreground transition-colors hover:text-primary"
          >
            Transactions
          </Link>

          {/* Learn Hover Card */}
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <span className="cursor-not-allowed text-muted-foreground">
                Learn
              </span>
            </HoverCardTrigger>
          </HoverCard>

          <Link
            href="/banks"
            className="text-foreground transition-colors hover:text-primary"
          >
            Banks
          </Link>
          <Link href="#" className="text-muted-foreground cursor-not-allowed">
            Savings
          </Link>
        </nav>

        {/* Right Section (Search, Theme, Profile) */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            variant="outline"
            className="hidden h-9 w-48 justify-between border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
            onClick={() => setOpen(true)}
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search...
            </div>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:flex"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-accent"
              >
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://avatar.vercel.sh/${session.user.name}.png`}
                  alt="User avatar"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-card border-border text-card-foreground"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    nishant@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem>
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
              <Search className="mr-2 h-4 w-4" />
              <span>Search Transactions</span>
            </CommandItem>
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Open Simulator</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
