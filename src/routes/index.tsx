import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, MapPin, Layers, GitCompare, Sparkles, Recycle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReuseFirst Slovenija — kje najprej ponovno uporabiti urbani prostor" },
      {
        name: "description",
        content:
          "Prostorsko odločitveno orodje za slovenske občine. Odkrijte brownfield in podizkoriščene lokacije za stanovanja, javne storitve in poslovne programe.",
      },
      { property: "og:title", content: "ReuseFirst Slovenija" },
      {
        property: "og:description",
        content:
          "Brownfield-first orodje za prostorsko odločanje. Pilotno območje: Ljubljana.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="absolute inset-0 bg-grid" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Pilotno območje · Ljubljana
          </div>

          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            Najprej{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ponovno uporabi
            </span>{" "}
            že urbaniziran prostor.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            ReuseFirst Slovenija je prostorsko odločitveno orodje, ki občinam, načrtovalcem in
            investitorjem pokaže, katere brownfield in podizkoriščene lokacije naj se aktivirajo —
            preden posegamo na greenfield zemljišča.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/app"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-6 py-3 font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
            >
              Odpri demo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface-overlay"
            >
              Kako deluje
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { k: "24", v: "kandidatnih lokacij" },
              { k: "6", v: "kriterijev ocenjevanja" },
              { k: "4", v: "tipi programov" },
              { k: "100%", v: "razložljiva ocena" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-xl border border-border bg-surface/60 p-4 backdrop-blur"
              >
                <dt className="font-display text-3xl font-bold tabular-nums text-foreground">
                  {s.k}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Kaj naredi orodje
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Od podatka do priporočila — v sekundah.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: MapPin,
              t: "Interaktivni zemljevid",
              d: "Brownfield, podizkoriščene parcele in urbane praznine v izbrani občini.",
            },
            {
              icon: Layers,
              t: "Tehtano ocenjevanje",
              d: "6 prostorskih kriterijev z utežmi, prilagojenimi tipu programa.",
            },
            {
              icon: Sparkles,
              t: "Razložljiva ocena",
              d: "Vsako priporočilo razloženo s pozitivnimi razlogi in opozorili.",
            },
            {
              icon: GitCompare,
              t: "Primerjava lokacij",
              d: "Side-by-side analiza dveh lokacij po vseh kriterijih.",
            },
            {
              icon: ShieldCheck,
              t: "Confidence Score",
              d: "Transparentna zanesljivost ocene glede na razpoložljive podatke.",
            },
            {
              icon: Recycle,
              t: "Reuse-first logika",
              d: "Sistematično prednost ponovni rabi pred greenfield posegom.",
            },
          ].map((f) => (
            <div
              key={f.t}
              className="group rounded-xl border border-border bg-surface-elevated p-6 transition-colors hover:border-primary/40"
            >
              <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Pripravljeni preveriti svojo občino?
            </h2>
            <p className="mt-1 text-muted-foreground">
              Demo deluje za pilotno območje Ljubljane.
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-6 py-3 font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
          >
            Zaženi aplikacijo <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        ReuseFirst Slovenija · Eksperimentalni prototip · Ne predstavlja uradne prostorske presoje.
      </footer>
    </div>
  );
}
