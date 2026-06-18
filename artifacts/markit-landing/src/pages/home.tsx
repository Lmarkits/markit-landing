import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  motion, useScroll, useTransform, useInView,
  useMotionValue, useSpring, AnimatePresence
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Sofa, Monitor, Bike, Refrigerator, Smartphone, Camera, Zap, ArrowRight,
  Bot, ListPlus, CalendarCheck, CheckCircle2, Menu, X,
  Lamp, Armchair, Tv, Watch, Package, Shirt, Coffee, Headphones,
  BookOpen, Gamepad2, Wrench, ShoppingBag, Frame
} from "lucide-react";

// ─── ANIMATION VARIANT LIBRARY ─────────────────────────────────────────────────

const fromLeft   = { hidden: { x: -70, opacity: 0, skewX: -4 },  visible: { x: 0, opacity: 1, skewX: 0,  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fromRight  = { hidden: { x:  70, opacity: 0, skewX:  4 },  visible: { x: 0, opacity: 1, skewX: 0,  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fromBelow  = { hidden: { y:  60, opacity: 0 },              visible: { y: 0, opacity: 1,             transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const fromAbove  = { hidden: { y: -50, opacity: 0 },              visible: { y: 0, opacity: 1,             transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const scaleIn    = { hidden: { scale: 0.78, opacity: 0 },         visible: { scale: 1, opacity: 1,         transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } } };
const blurIn     = { hidden: { filter: "blur(16px)", opacity: 0, y: 20 }, visible: { filter: "blur(0px)", opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const rotateIn   = { hidden: { rotate: -7, y: 50, opacity: 0 },  visible: { rotate: 0, y: 0, opacity: 1,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const rotateInR  = { hidden: { rotate:  7, y: 50, opacity: 0 },  visible: { rotate: 0, y: 0, opacity: 1,  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const flipIn     = { hidden: { rotateX: 80, opacity: 0, y: 20 }, visible: { rotateX: 0, opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };
const spinIn     = { hidden: { rotate: -180, scale: 0.5, opacity: 0 }, visible: { rotate: 0, scale: 1, opacity: 1, transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } } };

const stagger = (delay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: delay } }
});

// ─── SECTION BACKGROUND ICONS ────────────────────────────────────────────────────
// Scroll-triggered: icons appear as each section enters the viewport

const ALL_ICONS = [
  Sofa, Monitor, Bike, Refrigerator, Smartphone, Camera,
  Lamp, Armchair, Tv, Watch, Package, Shirt, Coffee,
  Headphones, BookOpen, Gamepad2, Wrench, ShoppingBag, Frame
];

// Seeded pseudo-random so each section gets a unique but stable set of icons
const seededRandom = (seed: number) => {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
};

const SectionIcons = ({ count = 10, seed = 0 }: { count?: number; seed?: number }) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-5%" });

  const icons = useRef(
    (() => {
      const rng = seededRandom(seed * 999 + 42);
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        Icon: ALL_ICONS[Math.floor(rng() * ALL_ICONS.length)],
        x: rng() * 92 + 4,
        y: rng() * 88 + 6,
        size: rng() * 26 + 14,
        maxOpacity: rng() * 0.055 + 0.025,
        duration: rng() * 18 + 14,
        driftX: (rng() - 0.5) * 80,
        driftY: (rng() - 0.5) * 80,
        rotate: rng() * 360,
        rotateAmt: (rng() - 0.5) * 140,
        staggerDelay: i * 0.18,
      }));
    })()
  ).current;

  return (
    <div ref={sectionRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map(({ id, Icon, x, y, size, maxOpacity, duration, driftX, driftY, rotate, rotateAmt, staggerDelay }) => (
        <motion.div
          key={id}
          className="absolute text-primary"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, scale: 0.4, rotate }}
          animate={isInView ? {
            opacity: [0, maxOpacity, maxOpacity * 0.55, maxOpacity, 0],
            scale:   [0.4, 1, 0.85, 1, 0.4],
            x:       [0, driftX, 0],
            y:       [0, driftY, 0],
            rotate:  [rotate, rotate + rotateAmt, rotate],
          } : { opacity: 0, scale: 0.4, x: 0, y: 0 }}
          transition={isInView ? {
            duration,
            delay: staggerDelay,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
          } : { duration: 0.4, ease: "easeOut" }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}
    </div>
  );
};

// ─── SCROLL PROGRESS BAR ───────────────────────────────────────────────────────

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[100] origin-left"
      style={{ scaleX }}
    />
  );
};

// ─── FILM GRAIN OVERLAY ────────────────────────────────────────────────────────

const GrainOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden opacity-[0.04]">
    <div
      className="animate-grain"
      style={{
        position: "absolute", inset: "-200%",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
        width: "400%", height: "400%",
      }}
    />
  </div>
);

// ─── AMBIENT ORBS ──────────────────────────────────────────────────────────────

const AmbientOrbs = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <motion.div className="absolute rounded-full"
      style={{ width: 700, height: 700, background: "radial-gradient(circle, rgba(0,229,160,0.055) 0%, transparent 70%)", left: "55%", top: "5%" }}
      animate={{ x: [0, -100, 50, 0], y: [0, 80, -50, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div className="absolute rounded-full"
      style={{ width: 550, height: 550, background: "radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)", left: "-12%", top: "45%" }}
      animate={{ x: [0, 80, -40, 0], y: [0, -70, 40, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
    />
    <motion.div className="absolute rounded-full"
      style={{ width: 450, height: 450, background: "radial-gradient(circle, rgba(0,80,229,0.025) 0%, transparent 70%)", left: "35%", top: "75%" }}
      animate={{ x: [0, 60, -70, 0], y: [0, -50, 70, 0] }}
      transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 12 }}
    />
  </div>
);

// ─── CURSOR GLOW ───────────────────────────────────────────────────────────────

const CursorGlow = () => {
  const rawX = useMotionValue(-400);
  const rawY = useMotionValue(-400);
  const springX = useSpring(rawX, { stiffness: 80, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 80, damping: 20 });
  const glowX = useTransform(springX, v => v - 350);
  const glowY = useTransform(springY, v => v - 350);

  useEffect(() => {
    const move = (e: MouseEvent) => { rawX.set(e.clientX); rawY.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [rawX, rawY]);

  return (
    <motion.div
      className="pointer-events-none fixed z-[1] rounded-full"
      style={{ width: 700, height: 700, x: glowX, y: glowY, background: "radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)" }}
    />
  );
};

// ─── MAGNETIC BUTTON ───────────────────────────────────────────────────────────

const MagneticButton = ({
  children, className, size, "data-testid": testId, onClick
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  "data-testid"?: string;
  onClick?: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="inline-block">
      <Button size={size} className={className} data-testid={testId} onClick={onClick}>{children}</Button>
    </motion.div>
  );
};

// ─── SCRAMBLE TEXT ─────────────────────────────────────────────────────────────

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&";

const ScrambleText = ({ text, className }: { text: string; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  useEffect(() => {
    if (!isInView) return;
    const node = ref.current;
    if (!node) return;
    let iteration = 0;
    const id = setInterval(() => {
      node.textContent = text.split("").map((char, i) => {
        if (char === " ") return " ";
        if (i < iteration) return text[i];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join("");
      iteration += 0.6;
      if (iteration > text.length) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [isInView, text]);

  return <span ref={ref} className={className}>{text}</span>;
};

// ─── STAT COUNTER ──────────────────────────────────────────────────────────────

const StatCounter = ({ to, decimals = 0 }: { to: number; decimals?: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    if (!node) return;
    const duration = 2200;
    const start = performance.now();
    const update = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const val = to * ease;
      node.textContent = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [isInView, to, decimals]);
  return <span ref={nodeRef}>0</span>;
};

// ─── COUNTER (hero) ────────────────────────────────────────────────────────────

const Counter = ({ from, to }: { from: number; to: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    if (!node) return;
    const duration = 2000;
    const start = performance.now();
    const update = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      node.textContent = Math.floor(from + (to - from) * ease).toLocaleString() + "+";
      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [isInView, from, to]);
  return <span ref={nodeRef}>{from}+</span>;
};

// ─── REVEAL WRAPPER ────────────────────────────────────────────────────────────

const Reveal = ({ children, variants, delay = 0, className = "" }: {
  children: React.ReactNode;
  variants: typeof fromLeft;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-8%" });
  return (
    <motion.div
      ref={ref} className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{ ...variants, visible: { ...variants.visible, transition: { ...(variants.visible as { transition?: object }).transition, delay } } }}
    >
      {children}
    </motion.div>
  );
};

// ─── NAVBAR ────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-[2px] left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tight flex items-center gap-2" data-testid="link-home">
          <Zap className="text-primary w-6 h-6 fill-primary" />
          MARKIT
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Pricing"].map((label, i) => (
            <motion.a
              key={label}
              href={`#${label.toLowerCase().replace(/ /g, "-")}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
              data-testid={`link-${label.toLowerCase().replace(/ /g, "-")}`}
            >{label}</motion.a>
          ))}
          <motion.div className="flex items-center gap-4 ml-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-signin">Sign In</Link>
            <MagneticButton className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold relative overflow-hidden group" data-testid="btn-get-started">
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 animate-shimmer" />
            </MagneticButton>
          </motion.div>
        </div>
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="btn-mobile-menu">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border p-6 flex flex-col gap-4 shadow-2xl">
          <a href="#features" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
          <a href="#pricing" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <div className="h-px bg-border my-2" />
          <Link href="/login" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
          <Button className="bg-primary text-primary-foreground w-full mt-2" data-testid="btn-mobile-get-started">Get Started</Button>
        </div>
      )}
    </motion.nav>
  );
};

// ─── HERO ──────────────────────────────────────────────────────────────────────
// Each word enters from a distinct direction; badge spins in; subtext blurs in; CTA scales up

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 60, damping: 18 });
  const springRY = useSpring(rotateY, { stiffness: 60, damping: 18 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    rotateY.set(((e.clientX - left - width / 2) / (width / 2)) * 4);
    rotateX.set(-((e.clientY - top - height / 2) / (height / 2)) * 4);
  }, [rotateX, rotateY]);

  const handleMouseLeave = useCallback(() => { rotateX.set(0); rotateY.set(0); }, [rotateX, rotateY]);

  const wordDirections = [fromLeft, fromRight];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden [&>*]:relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hero-specific brighter icon layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_20%,hsl(240,7%,5%)_80%)] z-10" />
      </div>

      {/* Floating hero particles */}
      {useRef(Array.from({ length: 30 }, (_, i) => ({
        id: i, x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 3 + 1, duration: Math.random() * 10 + 7, delay: Math.random() * 6,
        driftX: (Math.random() - 0.5) * 50, driftY: (Math.random() - 0.5) * 50,
      }))).current.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none z-[2]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: "rgba(0,229,160,0.5)", boxShadow: `0 0 ${p.size * 4}px rgba(0,229,160,0.7)` }}
          animate={{ x: [0, p.driftX, 0], y: [0, p.driftY, 0], opacity: [0, 0.8, 0.3, 0.8, 0], scale: [0.5, 1.3, 0.7, 1.3, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full"
        style={{ rotateX: springRX, rotateY: springRY, transformPerspective: 1200 }}
      >
        <div className="max-w-3xl">

          {/* Badge — spins in from nothing */}
          <motion.div
            initial="hidden" animate="visible" variants={spinIn}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4 fill-primary" />
            <span>Mission control for your hustle</span>
          </motion.div>

          {/* Headline — each word from a different direction */}
          <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight mb-6">
            {["Automate", "Your"].map((word, i) => (
              <motion.span
                key={word}
                initial="hidden" animate="visible"
                variants={wordDirections[i]}
                style={{ display: "inline-block", marginRight: "1.25rem", ...(wordDirections[i].visible as { transition?: object }) }}
                custom={i}
              >
                <motion.span
                  initial="hidden" animate="visible"
                  variants={{ hidden: {}, visible: { transition: { delay: 0.45 + i * 0.12 } } }}
                >
                  {word}
                </motion.span>
              </motion.span>
            ))}
            <br />
            {/* "Reselling Business" scales up from center with overshoot */}
            <motion.span
              initial={{ scale: 0.6, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-primary inline-block"
            >
              Reselling Business
            </motion.span>
          </h1>

          {/* Subtext — blurs in */}
          <motion.p
            initial={{ filter: "blur(14px)", opacity: 0, y: 16 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.75, ease: "easeOut" }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
          >
            Scan marketplaces for deals, list across platforms, and let AI handle buyers — so you can focus on flipping.
          </motion.p>

          {/* CTA — scales up with spring */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <MagneticButton size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 h-14 relative group overflow-hidden" data-testid="btn-hero-cta">
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 animate-shimmer" />
            </MagneticButton>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">4 weeks free</span>
              <span className="text-xs text-muted-foreground">Cancel anytime. No CC required.</span>
            </div>
          </motion.div>

          {/* Social proof — slides up from below */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex items-center gap-4 border-t border-border/50 pt-8"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=162,100%,45%`} alt="User avatar" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by <strong className="text-white"><Counter from={0} to={2000} /></strong> furniture flippers across the US.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// ─── MARQUEE ──────────────────────────────────────────────────────────────────
// Wipes in via clip-path expand

const Marquee = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });
  const items = [
    "FB Marketplace", "Craigslist", "OfferUp", "eBay", "Letgo",
    "AI Auto-Listing", "24/7 Scanning", "SMS Alerts", "Auto-Negotiate", "Calendar Sync",
    "FB Marketplace", "Craigslist", "OfferUp", "eBay", "Letgo",
    "AI Auto-Listing", "24/7 Scanning", "SMS Alerts", "Auto-Negotiate", "Calendar Sync",
  ];
  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.3 }}
      animate={isInView ? { clipPath: "inset(0 0% 0 0)", opacity: 1 } : {}}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-y border-border/40 py-5 bg-card/20"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-8 px-8 shrink-0">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">{item}</span>
            <Zap className="w-3 h-3 text-primary fill-primary shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── STATS ────────────────────────────────────────────────────────────────────
// Each stat comes from a different cardinal direction

const Stats = () => {
  const directions = [fromLeft, fromBelow, fromRight, fromAbove];
  const stats = [
    { prefix: "", value: 2000, suffix: "+", label: "Active Resellers", decimals: 0 },
    { prefix: "$", value: 50, suffix: "M+", label: "Revenue Tracked", decimals: 0 },
    { prefix: "", value: 12, suffix: "M+", label: "Listings Posted", decimals: 0 },
    { prefix: "", value: 4.8, suffix: "/5", label: "Avg. Rating", decimals: 1 },
  ];

  return (
    <section className="relative border-y border-border/40 py-24 overflow-hidden">
      <SectionIcons seed={1} count={12} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,160,0.04)_0%,transparent_70%)]" />
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {stats.map((stat, i) => (
            <Reveal key={i} variants={directions[i]} delay={i * 0.1} className="text-center" >
              <div className="text-5xl md:text-7xl font-black tracking-tighter text-primary mb-3 tabular-nums" data-testid={`stat-${i}`}>
                {stat.prefix}<StatCounter to={stat.value} decimals={stat.decimals} />{stat.suffix}
              </div>
              <div className="w-8 h-0.5 bg-primary/40 mx-auto mb-3" />
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FEATURES ─────────────────────────────────────────────────────────────────
// Cards rotate in: first tilts from left, second scales from center, third tilts from right

const Features = () => {
  const cardVariants = [rotateIn, scaleIn, rotateInR];
  const features = [
    { icon: <Bot className="w-8 h-8 text-primary" />, title: "Marketplace Scanner", desc: "AI agents scan FB Marketplace, Craigslist, and OfferUp 24/7. Get instant SMS alerts when listings match your exact criteria and margins." },
    { icon: <ListPlus className="w-8 h-8 text-primary" />, title: "Auto-Listing Engine", desc: "One-click cross-platform listing. We generate SEO-optimized descriptions, enhance your photos, and auto-relist to keep inventory fresh." },
    { icon: <CalendarCheck className="w-8 h-8 text-primary" />, title: "AI Auto-Responder", desc: "Stop replying to 'Is this available?'. Our AI handles inquiries, negotiates prices within your limits, and books meetups directly to your calendar." }
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="features" className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <SectionIcons seed={2} count={10} />
      <div className="relative bg-secondary/20 rounded-3xl border border-border/50 p-8 md:p-16">
        <Reveal variants={blurIn} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <ScrambleText text="You flip. We handle the rest." />
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to scale your reselling business without hiring a VA.</p>
        </Reveal>

        <div ref={ref} className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{ ...cardVariants[i], visible: { ...cardVariants[i].visible, transition: { ...(cardVariants[i].visible as { transition?: object }).transition, delay: i * 0.15 } } }}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors duration-300 overflow-hidden cursor-default"
              whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}
              data-testid={`card-feature-${i}`}
            >
              <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-500 -mr-16 -mt-16 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
// Steps flip in on X axis, one by one

const HowItWorks = () => {
  const steps = [
    { title: "Scan", desc: "Set your filters. We hunt deals." },
    { title: "List", desc: "Clean photos, write copy, post everywhere." },
    { title: "Respond", desc: "AI chats with buyers and negotiates." },
    { title: "Profit", desc: "Show up, hand it over, get paid." }
  ];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="how-it-works" className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <SectionIcons seed={3} count={9} />
      <Reveal variants={fromLeft} className="mb-16 md:w-1/2">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <ScrambleText text="The MARKIT Flow" />
        </h2>
        <p className="text-xl text-muted-foreground">A proven system that turns manual labor into automated revenue.</p>
      </Reveal>

      <div className="relative" ref={ref}>
        <div className="hidden md:block absolute top-[40px] left-[40px] right-[40px] h-0.5 bg-border z-0">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={{ ...flipIn, visible: { ...flipIn.visible, transition: { ...(flipIn.visible as { transition?: object }).transition, delay: i * 0.18 } } }}
              style={{ transformPerspective: 800 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <motion.div
                className="w-20 h-20 rounded-full bg-card border-2 border-primary flex items-center justify-center text-2xl font-black mb-6"
                style={{ boxShadow: "0 0 20px rgba(0,229,160,0.2)" }}
                whileHover={{ boxShadow: "0 0 40px rgba(0,229,160,0.5)", scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {i + 1}
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
// Cards fan out from center (different initial rotations)

const Testimonials = () => {
  const quotes = [
    { text: "I was spending 4 hours a day just dealing with Facebook Marketplace messages. MARKIT gave me my life back and my sourcing volume doubled.", author: "Sarah J.", role: "Mid-Century Modern Flipper", rev: "$12k/mo" },
    { text: "The auto-listing feature alone is worth the price. Taking one picture and having it pushed to FB, Craigslist, and OfferUp with AI copy is magic.", author: "Marcus T.", role: "Electronics Reseller", rev: "$8k/mo" },
    { text: "MARKIT's scanner caught a Herman Miller sofa listed for $50 before anyone else saw it. It paid for a year of the software in one flip.", author: "David L.", role: "Vintage Furniture", rev: "$20k/mo" }
  ];

  const fanVariants = [
    { hidden: { rotate: -12, x: -60, opacity: 0, scale: 0.9 }, visible: { rotate: 0, x: 0, opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } },
    { hidden: { y: 60, opacity: 0, scale: 0.85 },               visible: { y: 0,   opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 } } },
    { hidden: { rotate:  12, x:  60, opacity: 0, scale: 0.9 }, visible: { rotate: 0, x: 0, opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 } } },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto w-full border-y border-border">
      <SectionIcons seed={4} count={11} />
      <Reveal variants={blurIn} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <ScrambleText text="Built for the hustle." />
        </h2>
      </Reveal>
      <div ref={ref} className="grid md:grid-cols-3 gap-8">
        {quotes.map((q, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fanVariants[i]}
            className="p-8 rounded-2xl bg-background border border-border flex flex-col"
            whileHover={{ y: -6, borderColor: "rgba(0,229,160,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex text-primary mb-6">
              {[1, 2, 3, 4, 5].map(star => <Zap key={star} className="w-5 h-5 fill-primary" />)}
            </div>
            <p className="text-lg leading-relaxed mb-8 flex-grow">"{q.text}"</p>
            <div className="flex items-center justify-between border-t border-border pt-6">
              <div>
                <p className="font-semibold">{q.author}</p>
                <p className="text-sm text-muted-foreground">{q.role}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="font-bold text-primary">{q.rev}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── PRICING ──────────────────────────────────────────────────────────────────
// Outer cards slide from sides; center card scales up from nothing

const Pricing = () => {
  const tiers = [
    { name: "Starter", price: "29", desc: "Perfect for part-time flippers starting out.", features: ["Scan 3 marketplaces", "10 active cross-listings", "Basic AI responses", "Email support"], highlight: false },
    { name: "Pro",     price: "79", desc: "For serious resellers scaling their volume.",   features: ["Scan ALL marketplaces", "Unlimited active listings", "Full AI negotiation", "Calendar sync", "SMS alerts"], highlight: true },
    { name: "Business",price: "149",desc: "For teams and high-volume operations.",          features: ["Everything in Pro", "Team access (up to 3)", "Custom API integrations", "Priority 24/7 support", "Custom filters"], highlight: false }
  ];

  const cardAnims = [
    { hidden: { x: -80, opacity: 0, rotate: -3 }, visible: { x: 0, opacity: 1, rotate: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } },
    { hidden: { scale: 0.7, opacity: 0 },          visible: { scale: 1, opacity: 1,          transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.12 } } },
    { hidden: { x:  80, opacity: 0, rotate:  3 }, visible: { x: 0, opacity: 1, rotate: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.06 } } },
  ];

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="pricing" className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <SectionIcons seed={5} count={10} />
      <Reveal variants={fromBelow} className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple pricing. Massive ROI.</h2>
        <p className="text-xl text-muted-foreground">Billed every 4 weeks. Cancel anytime.</p>
      </Reveal>

      <div ref={ref} className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div
            key={i}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={cardAnims[i]}
            className={`relative p-8 rounded-3xl flex flex-col h-full ${
              tier.highlight
                ? "bg-card border-2 border-primary animate-pulse-border md:-translate-y-4 shadow-2xl"
                : "bg-card/50 border border-border"
            }`}
            data-testid={`card-pricing-${tier.name.toLowerCase()}`}
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold py-1 px-4 rounded-full">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <p className="text-sm text-muted-foreground mb-6 h-10">{tier.desc}</p>
            <div className="mb-8">
              <span className="text-5xl font-black">${tier.price}</span>
              <span className="text-muted-foreground"> / 4wks</span>
            </div>
            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((f, j) => (
                <li key={j} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <MagneticButton
              className={`w-full h-12 text-base font-semibold ${tier.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-white hover:bg-secondary/80"}`}
              data-testid={`btn-select-${tier.name.toLowerCase()}`}
            >
              {tier.name === "Starter" ? "Start Free Trial" : "Get Started"}
            </MagneticButton>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// ─── CTA ─────────────────────────────────────────────────────────────────────
// Whole block scales up with blur-to-focus

const CTA = () => (
  <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto w-full my-8">
    <SectionIcons seed={6} count={8} />
    <Reveal variants={{ hidden: { scale: 0.88, opacity: 0, filter: "blur(12px)" }, visible: { scale: 1, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}>
      <div className="relative rounded-[3rem] overflow-hidden bg-card border border-border p-12 md:p-24 text-center">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Reveal variants={fromAbove}>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Ready to flip smarter?</h2>
          </Reveal>
          <Reveal variants={blurIn} delay={0.15}>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of resellers who have automated their workflow and multiplied their revenue.
            </p>
          </Reveal>
          <Reveal variants={scaleIn} delay={0.25}>
            <MagneticButton size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-12 h-16 rounded-full font-bold relative group overflow-hidden" data-testid="btn-final-cta">
              <span className="relative z-10 flex items-center gap-2">
                Start Your Free Trial <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 animate-shimmer" />
            </MagneticButton>
            <p className="mt-4 text-sm text-muted-foreground">4 weeks completely free. Setup takes 2 minutes.</p>
          </Reveal>
        </div>
      </div>
    </Reveal>
  </section>
);

// ─── FOOTER ──────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 text-xl font-black tracking-tight">
        <Zap className="text-primary w-5 h-5 fill-primary" />
        MARKIT
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <a href="#" className="hover:text-white transition-colors">Terms</a>
        <a href="#" className="hover:text-white transition-colors">Support</a>
      </div>
      <div className="text-sm text-muted-foreground">&copy; 2025 MARKIT. All rights reserved.</div>
    </div>
  </footer>
);

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <ScrollProgress />
      <GrainOverlay />
      <AmbientOrbs />
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
