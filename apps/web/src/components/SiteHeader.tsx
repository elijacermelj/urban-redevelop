import { Link } from "@tanstack/react-router";
import { CircleHelp, Home, Map, Menu, X } from "lucide-react";
import { useState } from "react";

const mobileNavItems = [
  { to: "/", label: "Domov", icon: Home, exact: true },
  { to: "/about", label: "O projektu", icon: CircleHelp },
] as const;

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 min-w-0 items-center justify-between gap-3 border-b border-border bg-surface/80 px-3 backdrop-blur-md sm:px-5">
      <Link to="/" className="group flex min-w-0 items-center gap-2.5">
        <img
          src="/reusefirst-logo.svg"
          alt=""
          className="h-11 w-auto shrink-0 drop-shadow-[0_3px_10px_rgba(6,84,74,0.25)] sm:h-12"
        />
        <div className="font-display text-[15px] font-semibold leading-[1.05] tracking-tight">
          <span className="block">ReuseFirst</span>
          <span className="block text-primary">Slovenija</span>
        </div>
      </Link>
      {!minimal && (
        <>
          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <Link
              to="/app"
              className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-background transition-all hover:brightness-110"
              aria-label="Odpri aplikacijo"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Map className="size-4" />
            </Link>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface-elevated text-foreground transition-colors hover:bg-surface-overlay"
              aria-controls="mobile-site-nav"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Zapri navigacijo" : "Odpri navigacijo"}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground"
            >
              Domov
            </Link>
            <Link
              to="/about"
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground"
            >
              O projektu
            </Link>
            <Link
              to="/app"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-background transition-all hover:brightness-110"
            >
              Aplikacija
            </Link>
          </nav>
          {mobileMenuOpen && (
            <nav
              id="mobile-site-nav"
              className="absolute inset-x-0 top-14 border-b border-border bg-surface-elevated px-3 py-2 shadow-[var(--shadow-panel)] sm:hidden"
            >
              <div className="grid gap-1">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={item.exact ? { exact: true } : undefined}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-overlay hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </>
      )}
    </header>
  );
}
