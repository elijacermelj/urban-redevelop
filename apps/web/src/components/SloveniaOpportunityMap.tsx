import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TownStatus = "strong" | "watch" | "constrained" | "dataGap";
type TownFactTone = "positive" | "negative";

interface TownFact {
  tone: TownFactTone;
  text: string;
}

interface TownSignal {
  name: string;
  x: number;
  y: number;
  status: TownStatus;
  rank?: number;
  labelSide?: "left" | "right";
  facts?: TownFact[];
}

const statusMeta: Record<
  TownStatus,
  {
    label: string;
    dotClass: string;
    ringClass: string;
    textClass: string;
  }
> = {
  strong: {
    label: "visok potencial",
    dotClass: "bg-primary",
    ringClass: "bg-primary/25",
    textClass: "text-primary",
  },
  watch: {
    label: "potrebna preveritev",
    dotClass: "bg-warning",
    ringClass: "bg-warning/25",
    textClass: "text-warning",
  },
  constrained: {
    label: "omejitve",
    dotClass: "bg-score-low",
    ringClass: "bg-score-low/25",
    textClass: "text-score-low",
  },
  dataGap: {
    label: "podatkovna vrzel",
    dotClass: "bg-chart-2",
    ringClass: "bg-chart-2/25",
    textClass: "text-chart-2",
  },
};

const townSignals: TownSignal[] = [
  {
    name: "Ljubljana",
    x: 36,
    y: 56,
    status: "strong",
    rank: 1,
    labelSide: "right",
    facts: [
      { tone: "positive", text: "Največ kandidatnih brownfield in infill lokacij" },
      { tone: "positive", text: "Gost javni prevoz in bližina GJI" },
      { tone: "positive", text: "Visok pritisk stanovanjskih in javnih programov" },
      { tone: "negative", text: "Lastniška razdrobljenost lahko upočasni aktivacijo" },
    ],
  },
  {
    name: "Maribor",
    x: 68,
    y: 31,
    status: "watch",
    rank: 2,
    labelSide: "left",
    facts: [
      { tone: "positive", text: "Industrijska dediščina z večjimi parcelami" },
      { tone: "positive", text: "Močna železniška in regionalna lega" },
      { tone: "positive", text: "Dober potencial za poslovno-stanovanjske programe" },
      { tone: "negative", text: "Potrebna preveritev kontaminacije tal" },
    ],
  },
  {
    name: "Celje",
    x: 56,
    y: 49,
    status: "strong",
    rank: 3,
    labelSide: "left",
    facts: [
      { tone: "positive", text: "Kompaktno urbano jedro z reuse rezervami" },
      { tone: "positive", text: "Dobro razmerje med dostopnostjo in velikostjo lokacij" },
      { tone: "positive", text: "Primerno za javne storitve in mešane programe" },
      { tone: "negative", text: "Poplavni robovi zahtevajo dodatno presojo" },
    ],
  },
  {
    name: "Kranj",
    x: 31,
    y: 45,
    status: "strong",
    rank: 4,
    labelSide: "right",
    facts: [
      { tone: "positive", text: "Bližina železnice in regionalnih povezav" },
      { tone: "positive", text: "Infill potencial ob poslovnih conah" },
      { tone: "positive", text: "Dobra navezava na večja zaposlitvena središča" },
      { tone: "negative", text: "Varovanje krajine omejuje širitev navzven" },
    ],
  },
  {
    name: "Koper",
    x: 15,
    y: 86,
    status: "watch",
    rank: 5,
    labelSide: "right",
    facts: [
      { tone: "positive", text: "Pristaniški pritisk ustvarja reuse priložnosti" },
      { tone: "positive", text: "Primerno za mešane gospodarske programe" },
      { tone: "positive", text: "Omejen prostor povečuje vrednost notranjih rezerv" },
      { tone: "negative", text: "Obalna ranljivost in promet zahtevata pazljivo tehtanje" },
    ],
  },
  {
    name: "Nova Gorica",
    x: 13,
    y: 61,
    status: "dataGap",
    rank: 6,
    labelSide: "right",
    facts: [
      { tone: "positive", text: "Čezmejna lega podpira mešane urbane programe" },
      { tone: "positive", text: "Železniška povezava odpira reuse potencial" },
      { tone: "negative", text: "Podatki o manjših degradiranih območjih so nepopolni" },
      { tone: "negative", text: "Koordinacija z Gorico zahteva dodatno usklajevanje" },
    ],
  },
  { name: "Jesenice", x: 27, y: 31, status: "constrained" },
  { name: "Velenje", x: 51, y: 40, status: "watch" },
  { name: "Ptuj", x: 73, y: 39, status: "strong" },
  { name: "Murska Sobota", x: 86, y: 24, status: "dataGap" },
  {
    name: "Novo mesto",
    x: 58,
    y: 72,
    status: "watch",
    rank: 7,
    labelSide: "left",
    facts: [
      { tone: "positive", text: "Industrijski robovi imajo dober reuse potencial" },
      { tone: "positive", text: "Regionalna lega podpira javne in poslovne programe" },
      { tone: "negative", text: "Razpršena poselitev oteži primerjavo lokacij" },
      { tone: "negative", text: "Vodna in krajinska območja zahtevajo dodatno presojo" },
    ],
  },
  { name: "Trbovlje", x: 47, y: 54, status: "constrained" },
  { name: "Postojna", x: 25, y: 70, status: "dataGap" },
  { name: "Kočevje", x: 40, y: 81, status: "watch" },
  { name: "Slovenj Gradec", x: 54, y: 28, status: "dataGap" },
];

const legendItems: TownStatus[] = ["strong", "watch", "constrained", "dataGap"];

export function SloveniaOpportunityMap() {
  return (
    <section className="overflow-x-hidden bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
            Nacionalni signal
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Reuse-first potencial po slovenskih mestih.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Demo plast prikazuje, kako bi lahko ReuseFirst hitro izpostavil mestne rezerve,
            opozorila in podatkovne vrzeli še preden uporabnik odpre podrobno občinsko karto.
          </p>
        </div>

        <div className="relative mx-auto mt-2 max-w-5xl overflow-visible px-2 py-6 sm:px-8 sm:py-8">
          <div className="relative mx-auto aspect-[1000/660] w-full max-w-4xl">
            <img
              src={`${import.meta.env.BASE_URL}slovenia-border-outline-pale.svg`}
              alt="Obris Slovenije z označenimi mesti"
              className="absolute inset-0 h-full w-full object-contain"
            />

            {townSignals.map((town, index) => {
              const meta = statusMeta[town.status];
              const hasLabel = Boolean(town.rank && town.facts);

              if (!hasLabel) {
                return (
                  <span
                    key={town.name}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${town.x}%`, top: `${town.y}%` }}
                    title={`${town.name}: ${meta.label}`}
                  >
                    <TownDot status={town.status} delayIndex={index} />
                  </span>
                );
              }

              return (
                <div
                  key={town.name}
                  className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left outline-none hover:z-50 focus:z-50"
                  style={{ left: `${town.x}%`, top: `${town.y}%` }}
                  aria-label={`${town.name}: ${meta.label}`}
                  tabIndex={0}
                >
                  <TownDot status={town.status} featured delayIndex={index} />
                  <div
                    className={cn(
                      "town-label-card absolute top-1/2 block w-max max-w-[12rem] -translate-y-1/2 rounded-md border border-border bg-surface-overlay px-2 py-1 text-[9px] shadow-[var(--shadow-panel)] backdrop-blur-md group-hover:rounded-lg group-hover:border-primary/35 group-hover:px-2.5 group-hover:py-1.5 group-focus:rounded-lg group-focus:border-primary/40 group-focus:px-2.5 group-focus:py-1.5 sm:max-w-none sm:px-2.5 sm:py-1.5 sm:text-[11px] sm:group-hover:px-3 sm:group-hover:py-2 sm:group-focus:px-3 sm:group-focus:py-2",
                      town.labelSide === "left" ? "right-4 sm:right-5" : "left-4 sm:left-5",
                    )}
                  >
                    <div className="whitespace-nowrap font-semibold text-foreground">
                      {town.name}
                    </div>
                    <div className="town-facts-panel">
                      <ul className="space-y-1.5 border-t border-border pt-2 text-[11px] leading-snug text-muted-foreground">
                        {town.facts?.map((fact) => (
                          <li key={fact.text} className="town-fact-row flex gap-1.5">
                            {fact.tone === "positive" ? (
                              <Check className="mt-0.5 size-3 shrink-0 text-primary" />
                            ) : (
                              <X className="mt-0.5 size-3 shrink-0 text-score-low" />
                            )}
                            <span>{fact.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="z-30 mx-auto mt-4 w-fit rounded-lg border border-border bg-surface-overlay px-3 py-2 text-[10px] shadow-[var(--shadow-panel)] sm:absolute sm:bottom-4 sm:right-4 sm:mt-0 sm:px-4 sm:py-3">
            <div className="mb-2 font-mono uppercase tracking-widest text-muted-foreground">
              Status
            </div>
            <div className="space-y-1.5">
              {legendItems.map((status) => {
                const meta = statusMeta[status];
                return (
                  <div key={status} className="flex items-center gap-2 whitespace-nowrap">
                    <span className={cn("size-2.5 rounded-full", meta.dotClass)} />
                    <span className="text-muted-foreground">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TownDot({
  status,
  featured = false,
  delayIndex = 0,
}: {
  status: TownStatus;
  featured?: boolean;
  delayIndex?: number;
}) {
  const meta = statusMeta[status];
  const durationMs = featured ? 4300 + (delayIndex % 3) * 240 : 5000 + (delayIndex % 4) * 220;
  const delayMs = -((delayIndex * 330) % durationMs);
  const secondDelayMs = delayMs - durationMs / 2;

  return (
    <span className="relative grid place-items-center">
      <span
        className={cn(
          "town-dot-pulse town-dot-pulse-soft absolute rounded-full",
          featured ? "size-12" : "size-9",
          meta.ringClass,
        )}
        style={{
          animationDelay: `${secondDelayMs}ms`,
          animationDuration: `${durationMs * 1.18}ms`,
        }}
      />
      <span
        className={cn(
          "town-dot-pulse absolute rounded-full",
          featured ? "size-10" : "size-8",
          meta.ringClass,
        )}
        style={{ animationDelay: `${delayMs}ms`, animationDuration: `${durationMs}ms` }}
      />
      <span
        className={cn(
          "town-dot-core relative rounded-full",
          featured ? "size-3" : "size-2",
          meta.dotClass,
          meta.textClass,
        )}
      />
    </span>
  );
}
