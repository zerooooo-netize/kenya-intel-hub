import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function CountyNewsLayout({ children, county }: { children: ReactNode; county: string }) {
  const { user } = useAuth();
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <Link to={`/news?county=${encodeURIComponent(county)}`} className="flex items-center gap-3"><Newspaper className="h-6 w-6 text-primary" /><span className="font-display text-xl font-bold">ZERO <span className="font-editorial italic text-muted-foreground">County News</span></span></Link>
        <Button asChild variant="ghost" size="sm"><Link to={user ? `/county?county=${encodeURIComponent(county)}` : "/auth"}><ArrowLeft className="h-4 w-4" />{user ? "County Dashboard" : "Sign in"}</Link></Button>
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">{children}</main>
    <footer className="border-t border-border max-w-6xl mx-auto px-4 sm:px-8 py-6 text-xs text-muted-foreground">ZERO County News · Kenya</footer>
  </div>;
}