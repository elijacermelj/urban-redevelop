import { Link } from "@tanstack/react-router";
import { Layers } from "lucide-react";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="relative z-30 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-5 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="grid size-8 place-items-center rounded-md bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-glow)]">
          <Layers className="size-4 text-background" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-display text-[15px] font-semibold tracking-tight">
            ReuseFirst <span className="text-primary">Slovenija</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            spatial decision-support
          </div>
        </div>
      </Link>
      {!minimal && (
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground data-[status=active]:bg-surface-elevated data-[status=active]:text-foreground"
          >
            Domov
          </Link>
          <Link
            to="/app"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground data-[status=active]:bg-surface-elevated data-[status=active]:text-foreground"
          >
            Aplikacija
          </Link>
          <Link
            to="/about"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground data-[status=active]:bg-surface-elevated data-[status=active]:text-foreground"
          >
            O projektu
          </Link>
        </nav>
      )}
    </header>
  );
}
