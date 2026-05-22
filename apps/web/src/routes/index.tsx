import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/SiteHeader";
import { SloveniaOpportunityMap } from "@/components/SloveniaOpportunityMap";
import {
  DEFAULT_DISTRICT,
  DEFAULT_LAYER_STATE,
  LAYER_KEYS,
  type LayerKey,
} from "@/lib/filterConfig";
import { CITY_DISTRICTS, CITY_OPTIONS, type CityId } from "@/lib/mockData";
import { PROGRAM_LIST } from "@/lib/programs";
import type { ProgramType } from "@/lib/types";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Landmark,
  Map,
  MapPin,
  Layers,
  SlidersHorizontal,
  GitCompare,
  Sparkles,
  Recycle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const workflowSteps = [
  {
    t: "Izberi občino in program",
    d: "Stanovanja, javne storitve, poslovni program ali lokalna infrastruktura.",
  },
  {
    t: "Preveri Reuse Score",
    d: "Lokacije se razvrstijo po dostopnosti, rabi prostora, infrastrukturi in tveganjih.",
  },
  {
    t: "Primerjaj najboljše možnosti",
    d: "Vsako priporočilo je razloženo z razlogi, zato je odločitev hitrejša in jasnejša.",
  },
];

const LAYER_LABELS: Record<LayerKey, string> = {
  settlements: "Naselja",
  transport: "Javni prevoz",
  flood: "Poplavna območja",
  brownfield: "Brownfield / razvrednoteno",
  gji: "GJI",
  opportunity_heat: "Opportunity heatmap",
};

const LAYER_DOT_COLORS: Record<LayerKey, string> = {
  settlements: "oklch(0.78 0.06 220)",
  opportunity_heat: "oklch(0.7 0.16 155)",
  transport: "oklch(0.85 0.14 80)",
  flood: "oklch(0.65 0.22 25)",
  brownfield: "oklch(0.78 0.16 165)",
  gji: "oklch(0.7 0.05 240)",
};
const HARD_FILTER_DOT_COLOR = "oklch(0.65 0.22 25)";
const PROGRAM_ICONS = {
  housing: Building2,
  public_services: Landmark,
  small_business: Briefcase,
  infrastructure: Wrench,
} as const satisfies Record<ProgramType, ComponentType<{ className?: string }>>;

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
        content: "Brownfield-first orodje za prostorsko odločanje. Pilotno območje: Ljubljana.",
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
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
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
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
            >
              Odpri demo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-6 py-3 font-medium text-foreground transition-colors hover:bg-surface-overlay"
            >
              Kako deluje?
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
                className="rounded-xl bg-background/60 p-4 backdrop-blur shadow-[var(--shadow-panel)]"
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

      <SloveniaOpportunityMap />

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
              className="group rounded-xl bg-surface-elevated p-6 transition-colors hover:border-primary/40 shadow-[var(--shadow-panel)]"
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

      {/* Workflow in action */}
      <section className="bg-background/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.95fr_1.15fr] lg:items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              V praksi
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
              Od zemljevida do odločitve.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              ReuseFirst ne pokaže samo točk na karti. Lokacije razvrsti po potencialu ponovne rabe,
              razloži ključne razloge za priporočilo in opozori na omejitve, ki zahtevajo dodatno
              preverbo.
            </p>

            <ol className="mt-8 space-y-4">
              {workflowSteps.map((step, index) => (
                <li key={step.t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-primary/12 font-mono text-[11px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground md:text-base">{step.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Link
              to="/app"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
            >
              Odpri aplikacijo
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative lg:-mr-8 mt-20">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-primary/12 blur-3xl" />
            <div className="overflow-hidden rounded-[18px] border border-border/70 bg-surface-elevated/75 p-4 shadow-[var(--shadow-panel)] sm:p-6 lg:p-8">
              <img
                src={`${import.meta.env.BASE_URL}reusefirst-macbook-mock.png`}
                alt="ReuseFirst aplikacija prikazana na prenosniku"
                className="mx-auto w-full max-w-4xl object-contain drop-shadow-[0_20px_40px_oklch(0.2_0.04_160_/_0.28)] lg:w-[120%] lg:max-w-none lg:-mb-[5%] lg:translate-x-3"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <QuickStartSection />

      {/* CTA */}
      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Pripravljeni preveriti svojo občino?
            </h2>
            <p className="mt-1 text-muted-foreground">Demo deluje za pilotno območje Ljubljane.</p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
          >
            Zaženi aplikacijo <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        ReuseFirst Slovenija · Eksperimentalni prototip
      </footer>
    </div>
  );
}

function QuickStartSection() {
  const navigate = useNavigate({ from: "/" });
  const [city, setCity] = useState<CityId>("ljubljana");
  const [program, setProgram] = useState<ProgramType>("housing");
  const [district, setDistrict] = useState<string>(DEFAULT_DISTRICT);
  const [excludeFlood, setExcludeFlood] = useState(true);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>(() => ({
    ...DEFAULT_LAYER_STATE,
  }));

  const districtOptions = CITY_DISTRICTS[city];
  const SelectedProgramIcon = PROGRAM_ICONS[program];
  const selectedProgramLabel = useMemo(
    () => PROGRAM_LIST.find((entry) => entry.id === program)?.label ?? "",
    [program],
  );
  const enabledLayers = useMemo(() => LAYER_KEYS.filter((key) => layers[key]), [layers]);
  const activeFilterCount = useMemo(() => {
    let count = excludeFlood ? 1 : 0;
    for (const key of LAYER_KEYS) {
      if (layers[key]) {
        count += 1;
      }
    }
    return count;
  }, [excludeFlood, layers]);
  const selectedFilters = useMemo(() => {
    const labels: { id: string; label: string; dotColor: string }[] = [];
    if (excludeFlood) {
      labels.push({
        id: "excludeFlood",
        label: "Izključi visoko poplavno tveganje",
        dotColor: HARD_FILTER_DOT_COLOR,
      });
    }
    for (const key of LAYER_KEYS) {
      if (layers[key]) {
        labels.push({
          id: key,
          label: LAYER_LABELS[key],
          dotColor: LAYER_DOT_COLORS[key],
        });
      }
    }
    return labels;
  }, [excludeFlood, layers]);
  const selectedFiltersTopRow = selectedFilters.slice(0, 4);
  const selectedFiltersBottomRow = selectedFilters.slice(4);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/app",
      search: {
        city,
        program,
        district,
        excludeFlood,
        layers: enabledLayers,
      },
    });
  };

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-18 mb-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Hiter začetek
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
            Poiščite prve primerne lokacije v nekaj klikih.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Izberite občino, tip programa in območje. ReuseFirst vas odpelje neposredno v
            pripravljen pogled zemljevida z nastavljenimi kriteriji.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-5xl rounded-xl border border-border/80 bg-surface-elevated p-3 shadow-[var(--shadow-panel)]"
        >
          <div className="grid gap-2 md:grid-cols-[1.1fr_1fr_1fr_auto_auto] md:items-center">
            <div className="relative">
              <MapPin className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Select
                value={city}
                onValueChange={(value) => {
                  const nextCity = value as CityId;
                  setCity(nextCity);
                  setDistrict(DEFAULT_DISTRICT);
                }}
              >
                <SelectTrigger className="relative h-10 rounded-lg border-border bg-surface pl-9 pr-9 font-medium text-foreground shadow-none [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {CITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <SelectedProgramIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={program} onValueChange={(value) => setProgram(value as ProgramType)}>
                <SelectTrigger className="relative h-10 rounded-lg border-border bg-surface pl-9 pr-9 font-medium text-foreground shadow-none [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70">
                  <SelectValue>{selectedProgramLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {PROGRAM_LIST.map((option) => {
                    const Icon = PROGRAM_ICONS[option.id];
                    return (
                      <SelectItem key={option.id} value={option.id}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Map className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="relative h-10 rounded-lg border-border bg-surface pl-9 pr-9 font-medium text-foreground shadow-none [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {districtOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-sm font-medium text-foreground transition-colors hover:border-border/80"
                >
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  <span>Filtri</span>
                  {activeFilterCount > 0 && (
                    <span className="rounded border border-primary/35 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[42rem] max-w-[calc(100vw-2rem)] border-border bg-surface-elevated p-4"
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Trdi filtri
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-border/80">
                        <Checkbox
                          checked={excludeFlood}
                          onCheckedChange={(checked) => setExcludeFlood(checked === true)}
                        />
                        <span>Izključi visoko poplavno tveganje</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Sloji na zemljevidu
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {LAYER_KEYS.map((key) => (
                        <label
                          key={key}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-border/80"
                        >
                          <Checkbox
                            checked={layers[key]}
                            onCheckedChange={(checked) =>
                              setLayers((prev) => ({ ...prev, [key]: checked === true }))
                            }
                          />
                          <span>{LAYER_LABELS[key]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              type="submit"
              size="icon"
              className="h-10 w-full rounded-lg bg-primary text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110 md:w-10"
              aria-label="Prikaži lokacije"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-1 px-1 text-[11px] text-muted-foreground">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {selectedFiltersTopRow.map((filter) => (
                <span key={filter.id} className="inline-flex items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: filter.dotColor }}
                  />
                  <span>{filter.label}</span>
                </span>
              ))}
            </div>
            {selectedFiltersBottomRow.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {selectedFiltersBottomRow.map((filter) => (
                  <span key={filter.id} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: filter.dotColor }}
                    />
                    <span>{filter.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
