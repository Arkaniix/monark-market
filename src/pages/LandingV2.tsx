import { MonarkLogo } from "@/components/monark-v2/atoms";

const ODD_BG = "rgba(255,255,255,0.005)";

export default function LandingV2() {
  return (
    <div className="mk-page-bg">
      <section
        id="nav"
        className="flex items-center px-6"
        style={{ height: 56, backgroundColor: ODD_BG }}
      >
        <MonarkLogo />
        <span className="mk-mono text-xs text-zinc-500 mx-auto">// nav</span>
      </section>

      <section
        id="hero"
        className="flex items-center justify-center"
        style={{ height: 600 }}
      >
        <span className="mk-mono text-xs text-zinc-500">// hero — carousel 3 scènes</span>
      </section>

      <section
        id="ticker"
        className="flex items-center justify-center bg-zinc-950"
        style={{ height: 44 }}
      >
        <span className="mk-mono text-xs text-zinc-600">// ticker live</span>
      </section>

      <section
        id="diagnostic"
        className="flex items-center justify-center"
        style={{ height: 500 }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §01 diagnostic</span>
      </section>

      <section
        id="lens-demo"
        className="flex items-center justify-center"
        style={{ height: 700, backgroundColor: ODD_BG }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §02 lens demo</span>
      </section>

      <section
        id="estimator"
        className="flex items-center justify-center"
        style={{ height: 750 }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §03 estimator</span>
      </section>

      <section
        id="stack"
        className="flex items-center justify-center"
        style={{ height: 500, backgroundColor: ODD_BG }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §04 stack produit</span>
      </section>

      <section
        id="data-universe"
        className="flex items-center justify-center"
        style={{ height: 520 }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §05 univers de données</span>
      </section>

      <section
        id="pricing"
        className="flex items-center justify-center"
        style={{ height: 500, backgroundColor: ODD_BG }}
      >
        <span className="mk-mono text-xs text-zinc-500">// §06 tarifs</span>
      </section>

      <section
        id="cta-footer"
        className="flex items-center justify-center"
        style={{ height: 300 }}
      >
        <span className="mk-mono text-xs text-zinc-500">// cta + footer</span>
      </section>
    </div>
  );
}