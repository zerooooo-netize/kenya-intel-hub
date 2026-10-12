import { Bell, ChevronDown, LayoutGrid, LogOut, Menu, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SiteNavigation } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TopBar = () => {
  const { user, roles, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (user?.email ?? "ZR").slice(0, 2).toUpperCase();
  const role = roles[0] ?? "viewer";

  return (
    <header className="h-16 shrink-0 flex items-center gap-2 px-3 sm:gap-4 sm:px-6 border-b border-border/60 glass-strong sticky top-0 z-30">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden shrink-0" aria-label="Open site menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[min(320px,90vw)] p-0 flex flex-col bg-sidebar" aria-describedby={undefined}>
          <div className="h-16 shrink-0 border-b border-sidebar-border flex items-center px-6">
            <SheetTitle className="font-display">ZERO · Menu</SheetTitle>
          </div>
          <SiteNavigation onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex-1 min-w-0 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search intelligence, narratives, entities…"
          className="w-full h-10 bg-secondary/60 border border-border/60 rounded-xl pl-11 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
        />
        <kbd className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 h-6 px-2 items-center text-[10px] font-mono text-muted-foreground bg-background/60 border border-border rounded">⌘K</kbd>
      </div>

      <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 border border-border/60 hover:border-primary/50 transition-smooth group">
        <Sparkles className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
      </button>
      <button className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/60 border border-border/60 hover:border-primary/50 transition-smooth">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
      </button>
      <button className="relative shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-secondary/60 border border-border/60 hover:border-primary/50 transition-smooth">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-primary-foreground bg-gradient-primary rounded-full shadow-glow">12</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 pl-3 border-l border-border/60 cursor-pointer group">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow">{initials}</div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold leading-tight truncate max-w-[140px]">{user?.email ?? "Guest"}</div>
              <div className="text-[11px] text-muted-foreground capitalize">{role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-smooth" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default TopBar;
