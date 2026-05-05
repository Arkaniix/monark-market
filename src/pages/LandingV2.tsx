import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Diamond,
  Cpu,
  MemoryStick,
  HardDrive,
  Box,
  Zap,
  Layers,
  CircuitBoard,
  Heart,
  Maximize,
  Eye,
  Info,
  Lock,
  Flame,
  Shield,
  Download,
  ArrowRight,
} from "lucide-react";
import { MonarkLogo, MonarkButton } from "@/components/monark-v2/atoms";

const ODD_BG = "rgba(255,255,255,0.005)";
const SCENE_DURATION = 7000;

/* ---------- Animated counter ---------- */
function Counter({ to, format }: { to: number; format?: (n: number) => string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => (format ? format(v) : Math.round(v).toString()));
  const [text, setText] = useState(format ? format(0) : "0");
  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.4, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setText(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [to]);
  return <span>{text}</span>;
}

/* ---------- Lens overlay ---------- */
type Verdict = {
  label: string;
  color: string; // tailwind text class
  crystalFrom: string;
  crystalTo: string;
  conf: number;
  fair: string;
  marge: string;
  margePos: boolean;
  liq: string;
  trend: number;
  liqMod: number;
  value: number;
  comparables: string;
};

function LensOverlay({ v }: { v: Verdict }) {
  return (
    <div className="absolute top-4 right-4 z-10 w-[280px] mk-card-flat-soft p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3">
        <Diamond size={14} className="text-zinc-300" />
        <span className="font-monarkMono text-[10px] tracking-wider text-zinc-400">
          MONARK · LENS
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-monark-bull animate-pulse-soft" />
          <span className="font-monarkMono text-[10px] text-monark-bull">LIVE</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rotate-45 rounded-sm"
          style={{
            background: `linear-gradient(135deg, ${v.crystalFrom}, ${v.crystalTo})`,
          }}
        />
        <div className="flex flex-col">
          <span className="font-monarkMono text-[10px] uppercase text-zinc-500">VERDICT</span>
          <span className={`font-monarkSans font-medium text-lg ${v.color}`}>{v.label}</span>
          <span className="font-monarkMono text-[10px] text-zinc-500">conf. {v.conf} %</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { l: "FAIR", val: v.fair, cls: "text-zinc-100" },
          { l: "MARGE", val: v.marge, cls: v.margePos ? "text-monark-bull" : "text-monark-bear" },
          { l: "LIQ.", val: v.liq, cls: "text-zinc-100" },
        ].map((k) => (
          <div key={k.l} className="mk-subcard-soft p-2">
            <div className="font-monarkMono text-[10px] uppercase text-zinc-500">{k.l}</div>
            <div className={`font-monarkMono text-sm ${k.cls}`}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="font-monarkMono text-[10px] text-zinc-500">prix médian · 30j</span>
        <svg width="60" height="14" viewBox="0 0 60 14" fill="none">
          <polyline
            points="0,4 10,6 20,5 30,8 40,7 50,10 60,9"
            stroke="#EF4444"
            strokeOpacity="0.6"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2">
        {[
          { k: "trend", n: v.trend },
          { k: "liq", n: v.liqMod },
          { k: "value", n: v.value },
        ].map((m) => (
          <span
            key={m.k}
            className={`bg-white/[0.03] rounded font-monarkMono text-[10px] px-1.5 py-0.5 ${
              m.n >= 0 ? "text-monark-bull" : "text-monark-bear"
            }`}
          >
            {m.k} {m.n >= 0 ? "+" : ""}
            {m.n}
          </span>
        ))}
      </div>

      <div className="font-monarkMono text-[10px] text-zinc-600 mt-2">{v.comparables}</div>
    </div>
  );
}

/* ---------- Scenes ---------- */
function SceneLBC() {
  return (
    <div className="h-full p-5">
      <div className="font-monarkMono text-[10px] text-zinc-600 mb-3 truncate">
        Accueil › Ordinateurs › Auvergne-Rhône-Alpes › Rhône › Villeurbanne › Carte graphique RTX
        4070 Ti SUPER…
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg h-[200px] flex items-center justify-center">
            <Cpu size={64} className="text-zinc-700 opacity-25" />
          </div>
          <div className="flex gap-2 mt-2">
            {[HardDrive, Box, Zap, Layers].map((Icon, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded bg-zinc-900 flex items-center justify-center"
              >
                <Icon size={20} className="text-zinc-600 opacity-30" />
              </div>
            ))}
          </div>
          <h3 className="font-monarkSans text-2xl text-zinc-100 font-medium mt-4">
            Carte graphique RTX 4070 Ti SUPER 16Go - Comme neuve
          </h3>
          <div className="font-monarkMono text-3xl text-zinc-100 mt-2">720 €</div>
          <div className="text-monark-bull text-xs mt-1">− 15 % vs fair</div>
          <div className="font-monarkMono text-xs text-zinc-500 mt-1">
            Villeurbanne (69100) · Aujourd'hui, 11h08
          </div>
          <div className="flex gap-2 mt-3">
            {["16 Go GDDR6X", "PCIe 4.0", "285 W", "3× DisplayPort"].map((p) => (
              <span
                key={p}
                className="px-2 py-1 rounded font-monarkMono text-[10px] bg-white/[0.03] text-zinc-300"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mt-3 line-clamp-3">
            Vends ma carte achetée en mars 2024. Boîte, facture et accessoires d'origine. Aucun coil
            whine, jamais overclockée. Visite possible sur Lyon ou Villeurbanne…
          </p>
        </div>
        <div className="col-span-4">
          <div className="bg-white/[0.015] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full"
                style={{
                  background: "radial-gradient(circle, #3B82F6, #8B5CF6)",
                }}
              />
              <div>
                <div className="font-monarkSans text-sm text-zinc-100">Mike_T.</div>
                <div className="font-monarkMono text-[10px] text-zinc-500">
                  Particulier · 47 annonces
                </div>
                <div className="font-monarkMono text-[10px] text-zinc-500">Membre depuis 2021</div>
              </div>
            </div>
            <span className="inline-block bg-monark-bull/15 text-monark-bull text-[10px] px-2 py-0.5 rounded mt-2">
              Réactif
            </span>
            <div className="text-[10px] text-zinc-500 mt-1">Dernière activité il y a 2 heures</div>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-orange-700/80 hover:bg-orange-700 text-white font-monarkSans text-sm py-2 rounded transition-colors">
                Réserver
              </button>
              <button className="border border-zinc-700 text-zinc-200 hover:bg-white/[0.04] py-2 rounded transition-colors text-sm">
                Faire une offre
              </button>
              <button className="bg-blue-700/60 hover:bg-blue-700 text-white py-2 rounded transition-colors text-sm">
                Contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneVinted() {
  return (
    <div className="h-full p-5">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 relative">
          <div className="grid grid-cols-3 grid-rows-2 gap-2 h-[420px]">
            <div className="col-span-2 row-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg flex items-center justify-center">
              <Cpu size={64} className="text-zinc-700 opacity-30" />
            </div>
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg flex items-center justify-center">
              <MemoryStick size={36} className="text-zinc-700 opacity-30" />
            </div>
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg flex items-center justify-center">
              <Box size={36} className="text-zinc-700 opacity-30" />
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-black/50 rounded-full px-2 py-1 flex items-center gap-1">
            <Heart size={12} className="text-zinc-300" />
            <span className="font-monarkMono text-[10px] text-zinc-300">20</span>
          </div>
        </div>
        <div className="col-span-5">
          <div className="bg-white/[0.015] rounded-lg p-4">
            <h3 className="font-monarkSans text-lg text-zinc-100 font-medium">
              AMD Ryzen 7 7800X3D - Excellent état
            </h3>
            <div className="text-xs text-zinc-500 mt-1">Bon état · NVIDIA</div>
            <div className="text-zinc-500 line-through text-sm mt-2">359 €</div>
            <div className="font-monarkMono text-2xl text-zinc-100">339 €</div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
              <Shield size={10} /> Inclut Protection acheteurs
            </div>
            <div className="bg-red-900/30 border-l-2 border-monark-bear pl-3 py-2 rounded-r flex items-center gap-2 mt-3">
              <Flame size={14} className="text-monark-bear" />
              <span className="text-monark-bear text-xs">
                4 acheteurs ont envoyé une offre récemment
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-3 text-xs">
              {[
                ["Marque", "NVIDIA"],
                ["État", "Bon état"],
                ["Ajouté", "Il y a 3 jours"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-zinc-500">{k}</span>
                  <span className="text-zinc-200">{v}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-zinc-500 mt-2">Envoi à partir de 3,28 €</div>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-teal-700/80 hover:bg-teal-700 text-white py-2 rounded font-monarkSans text-sm transition-colors">
                Acheter
              </button>
              <button className="border border-zinc-700 text-zinc-200 hover:bg-white/[0.04] py-2 rounded text-sm transition-colors">
                Faire une offre
              </button>
              <button className="border border-zinc-700 text-zinc-200 hover:bg-white/[0.04] py-2 rounded text-sm transition-colors">
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneEbay() {
  return (
    <div className="h-full p-5">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-1 flex flex-col gap-2 pt-2">
          {[Cpu, HardDrive, Box, Zap, Layers, MemoryStick].map((Icon, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded bg-zinc-900 flex items-center justify-center ${
                i === 0 ? "ring-2 ring-blue-500/40" : ""
              }`}
            >
              <Icon size={16} className="text-zinc-600 opacity-40" />
            </div>
          ))}
        </div>
        <div className="col-span-6 relative">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-lg h-[420px] flex items-center justify-center">
            <CircuitBoard size={64} className="text-zinc-700 opacity-25" />
          </div>
          <div className="absolute top-3 left-3 bg-red-900/40 text-monark-bear text-[10px] px-2 py-1 rounded font-monarkMono">
            DANS 2 PANIERS
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2 text-zinc-400">
            <Maximize size={14} />
            <Heart size={14} />
            <span className="font-monarkMono text-[10px]">5</span>
          </div>
        </div>
        <div className="col-span-5">
          <div className="bg-white/[0.015] rounded-lg p-4">
            <h3 className="font-monarkSans text-lg text-zinc-100">
              AMD Ryzen 7 7800X3D Boxed - Garantie restante
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-8 h-8 rounded-full"
                style={{ background: "radial-gradient(circle, #3B82F6, #8B5CF6)" }}
              />
              <span className="text-xs text-zinc-200">tech_seller_de</span>
              <span className="text-xs text-zinc-500">(1248) · Particulier</span>
            </div>
            <div className="text-[10px] text-monark-accent mt-1">
              100% d'évaluations positives · Autres objets du vendeur
            </div>
            <div className="text-[10px] text-monark-accent">Envoyer un message au vendeur</div>
            <div className="font-monarkMono text-2xl text-zinc-100 mt-3">352 EUR</div>
            <div className="text-xs text-zinc-500">+ 12,90 € livraison</div>
            <div className="text-[10px] text-zinc-500">
              3 paiements sans intérêts de 117,33 EUR avec Klarna
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-300 mt-2">
              État : Reconditionné par le vendeur <Info size={12} />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-monark-accent hover:bg-blue-600 text-white py-2 rounded font-monarkSans text-sm transition-colors">
                Achat immédiat
              </button>
              <button className="border border-zinc-700 text-zinc-200 hover:bg-white/[0.04] py-2 rounded text-sm transition-colors">
                Ajouter au panier
              </button>
              <button className="border border-zinc-700 text-zinc-200 hover:bg-white/[0.04] py-2 rounded text-sm transition-colors flex items-center justify-center gap-2">
                <Heart size={14} /> Suivre cet objet
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-zinc-500">
              <Eye size={12} />
              Plusieurs personnes ont consulté cet objet · 5 personnes l'ont suivi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene config ---------- */
const SCENES: {
  id: string;
  url: string;
  wordmark: string;
  wordmarkClass: string;
  Component: () => JSX.Element;
  verdict: Verdict;
}[] = [
  {
    id: "lbc",
    url: "lboncoin.fr/ad/informatique/_id_29844",
    wordmark: "lboncoin",
    wordmarkClass: "text-orange-700/80",
    Component: SceneLBC,
    verdict: {
      label: "NÉGOCIER",
      color: "text-monark-warn",
      crystalFrom: "#F59E0B",
      crystalTo: "#92400E",
      conf: 87,
      fair: "382 €",
      marge: "+18 €",
      margePos: true,
      liq: "0.62",
      trend: 6,
      liqMod: 1,
      value: 2,
      comparables: "412 comparables · LBC + eBay · 180j",
    },
  },
  {
    id: "vinted",
    url: "vintd.fr/items/29401773-ryzen-7-7800x3d",
    wordmark: "vintd",
    wordmarkClass: "text-teal-700/80",
    Component: SceneVinted,
    verdict: {
      label: "FONCER",
      color: "text-monark-bull",
      crystalFrom: "#10B981",
      crystalTo: "#065F46",
      conf: 92,
      fair: "365 €",
      marge: "+26 €",
      margePos: true,
      liq: "0.81",
      trend: 4,
      liqMod: 5,
      value: -1,
      comparables: "289 comparables · Vinted + eBay · 180j",
    },
  },
  {
    id: "ebay",
    url: "*bay.fr/itm/2204881-ryzen-7-7800x3d",
    wordmark: "*bay",
    wordmarkClass: "text-zinc-400",
    Component: SceneEbay,
    verdict: {
      label: "TENTER AU CULOT",
      color: "text-monark-bold",
      crystalFrom: "#8B5CF6",
      crystalTo: "#5B21B6",
      conf: 71,
      fair: "312 €",
      marge: "+9 €",
      margePos: true,
      liq: "0.74",
      trend: -3,
      liqMod: 1,
      value: -2,
      comparables: "412 comparables · eBay + LBC · 180j",
    },
  },
];

/* ---------- Hero ---------- */
function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = window.setInterval(() => {
      setIdx((i) => (i + 1) % SCENES.length);
    }, SCENE_DURATION);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [paused]);

  const scene = SCENES[idx];
  const SceneComp = scene.Component;

  return (
    <section id="hero" className="px-6 lg:px-12 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-7xl mx-auto">
        {/* LEFT */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-monark-bull animate-pulse-soft" />
            <span className="font-monarkMono text-xs text-zinc-500 tracking-wider uppercase">
              MARKET DATA · MISE À JOUR EN CONTINU
            </span>
          </div>

          <h1 className="font-monarkSans text-5xl lg:text-6xl font-medium leading-[1.05] tracking-tight">
            <span className="text-zinc-100">Ne flairez plus<br />les bons coups.</span>
            <br />
            <span className="text-zinc-500">Mesurez-les.</span>
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            Extension navigateur et moteur d'estimation pour le hardware PC d'occasion. Lit
            Leboncoin, Vinted, eBay et Facebook Marketplace en temps réel — vous donne un verdict
            reseller, un fair price, une marge nette.
          </p>

          <div className="flex flex-wrap gap-3">
            <MonarkButton variant="primary">
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Installer Monark Lens
                <ArrowRight className="w-4 h-4" />
              </span>
            </MonarkButton>
            <MonarkButton
              variant="ghost"
              onClick={() =>
                document.getElementById("estimator")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Voir l'estimator en live
            </MonarkButton>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 max-w-md">
            <div>
              <div className="font-monarkMono text-[10px] uppercase tracking-wider text-zinc-500">
                MODÈLES TRACKÉS
              </div>
              <div className="font-monarkMono text-3xl text-zinc-100 font-medium mt-1">
                <Counter to={660} />+
              </div>
            </div>
            <div>
              <div className="font-monarkMono text-[10px] uppercase tracking-wider text-zinc-500">
                OBSERVATIONS PRIX
              </div>
              <div className="font-monarkMono text-3xl text-zinc-100 font-medium mt-1">
                <Counter
                  to={46211}
                  format={(n) =>
                    Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                  }
                />
              </div>
            </div>
            <div>
              <div className="font-monarkMono text-[10px] uppercase tracking-wider text-zinc-500">
                PLATEFORMES
              </div>
              <div className="font-monarkMono text-3xl text-zinc-100 font-medium mt-1">4</div>
            </div>
            <div>
              <div className="font-monarkMono text-[10px] uppercase tracking-wider text-zinc-500">
                LATENCE DATA
              </div>
              <div className="font-monarkMono text-3xl text-monark-bull font-medium mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-monark-bull animate-pulse-soft" />
                <span className="text-xl">temps réel</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="lg:col-span-7 relative rounded-xl overflow-hidden bg-zinc-950/60"
          style={{ height: 580 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Browser bar */}
          <div className="h-9 bg-zinc-950 px-4 flex items-center gap-3 border-b border-white/[0.03]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-white/[0.02] rounded h-7 px-3 flex items-center gap-2">
              <Lock size={12} className="text-monark-bull/60" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={scene.url}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="font-monarkMono text-xs text-zinc-400 truncate"
                >
                  {scene.url}
                </motion.span>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={scene.wordmark}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className={`font-monarkMono text-xs ${scene.wordmarkClass}`}
              >
                {scene.wordmark}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Scene content */}
          <div className="relative" style={{ height: "calc(100% - 36px)" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 overflow-hidden"
              >
                <SceneComp />
                <LensOverlay v={scene.verdict} />
              </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {SCENES.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-0.5 w-8 rounded-full overflow-hidden ${
                    i === idx ? "bg-zinc-700" : "bg-zinc-800"
                  }`}
                >
                  {i === idx && (
                    <motion.div
                      key={`${s.id}-${idx}-${paused}`}
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? "0%" : "100%" }}
                      transition={{
                        duration: paused ? 0 : SCENE_DURATION / 1000,
                        ease: "linear",
                      }}
                      className="h-full bg-zinc-200"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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

      <Hero />

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
