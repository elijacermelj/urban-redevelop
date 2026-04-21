import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "O projektu · ReuseFirst Slovenija" },
      {
        name: "description",
        content:
          "Kako deluje ReuseFirst Slovenija — viri podatkov, scoring model, omejitve in disclaimer.",
      },
      { property: "og:title", content: "O projektu — ReuseFirst Slovenija" },
      {
        property: "og:description",
        content: "Razložljiv prostorski model za ponovno rabo urbaniziranega prostora.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
          O projektu
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight md:text-5xl">
          Reuse-first prostorsko odločanje, razložljivo in transparentno.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          ReuseFirst Slovenija združuje odprte prostorske podatke v jasno priporočilo: katere
          že urbanizirane lokacije so najbolj smiselne za nov razvoj — preden posegamo na
          greenfield zemljišča.
        </p>

        <Section title="Kako računamo Reuse Score">
          <p>
            Vsako lokacijo ocenjujemo s tehtano vsoto šestih prostorskih kriterijev:
            umestitev v naselje, bližina infrastrukture, dostopnost javnega prevoza, skladnost
            z namensko rabo, potencial ponovne rabe in penalizacija tveganj. Uteži se prilagodijo
            izbranemu programu (stanovanja, javne storitve, poslovni program, infrastruktura).
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-surface-elevated p-4 font-mono text-xs leading-relaxed">
{`Reuse Score =
  0.25 × settlement
+ 0.20 × infrastructure
+ 0.18 × public_transport
+ 0.20 × land_use
+ 0.19 × reuse_potential
− 0.20 × risk_penalty`}
          </pre>
        </Section>

        <Section title="Confidence Score">
          <p>
            Vsaki oceni dodamo zanesljivost glede na razpoložljive podatke. Visok Confidence
            pomeni, da so vključeni vsi ključni sloji; nižji opozarja na nepopolne vire.
          </p>
        </Section>

        <Section title="Razložljivost">
          <p>
            Ocena ni black-box. Vsako priporočilo razlagamo s konkretnimi pozitivnimi razlogi
            in opozorili. Uporabnik vidi razčlenitev po kriterijih in razume, zakaj je bila
            lokacija predlagana.
          </p>
        </Section>

        <Section title="Pilotno območje">
          <p>
            Demo je izdelan za <strong>Ljubljano</strong> z 24 ročno pripravljenimi
            kandidatnimi lokacijami, navdihnjenimi po realnih brownfield in urban-infill
            območjih (Rog, Cukrarna, Tobačna, Litostroj, Kolinska, BTC sever idr.).
          </p>
        </Section>

        <Section title="Omejitve">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Prototip uporablja stilizirane geometrije, ne uradnega katastra.</li>
            <li>Sloji poplav, naselij in javnega prevoza so demonstracijski.</li>
            <li>Ne nadomešča pravne, prostorske ali investicijske presoje.</li>
          </ul>
        </Section>

        <div className="mt-10 rounded-xl border border-warning/30 bg-warning/5 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-warning">
            Disclaimer
          </div>
          <p className="mt-2 text-sm leading-relaxed">
            ReuseFirst Slovenija je eksperimentalni prototip za podporo prostorskemu odločanju.
            Rezultati so informativni in ne predstavljajo uradne prostorske, pravne ali
            investicijske presoje. Končna presoja mora vključevati podrobnejšo strokovno,
            pravno in prostorsko preverbo.
          </p>
        </div>

        <div className="mt-10">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-6 py-3 font-semibold text-background shadow-[var(--shadow-glow)] transition-all hover:brightness-110"
          >
            Odpri aplikacijo <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
