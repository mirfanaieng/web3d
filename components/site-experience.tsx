"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { FinishTheme } from "./finish-theme";
import { Cursor, ScrollProgress } from "./motion/cursor";
import { VelocityMarquee } from "./motion/velocity-marquee";
import { Bento } from "./sections/bento";
import { Capabilities } from "./sections/capabilities";
import { FinalCta } from "./sections/contact";
import { CraftTabs } from "./sections/craft-tabs";
import { Faq } from "./sections/faq";
import { Footer } from "./sections/footer";
import { Header } from "./sections/header";
import { Hero } from "./sections/hero";
import { Introduction } from "./sections/intro";
import { Process } from "./sections/process";
import { Services } from "./sections/services";
import { WorldSceneLoader } from "./world-scene-loader";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_WORDS = [
  "Luxury Packaging",
  "Bespoke Print",
  "Brand Moments",
  "Made in UAE",
  "Foil & Emboss",
  "Rigid Boxes",
];

/**
 * The scroll layer.
 *
 * Division of labour across the page: Framer Motion owns everything driven by
 * *state* (hover, tap, tabs, accordions, viewport entry); GSAP owns everything
 * driven by *scroll position* (pinning, scrubbed timelines, character splits,
 * parallax). Mixing the two on one property is the only thing that causes
 * trouble, so no element is ever animated by both.
 */
function SiteAnimations({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    // Touch devices keep native scrolling. iOS/Android momentum is smoother
    // than anything JS can drive, and running Lenis on top of it adds a frame
    // of latency plus a permanent rAF loop competing with the WebGL render.
    if (window.matchMedia("(pointer: coarse)").matches) {
      gsap.ticker.lagSmoothing(0);
      return;
    }

    const lenis = new Lenis({
      duration: 1.18,
      smoothWheel: true,
      wheelMultiplier: 0.92,
    });
    const update = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useLayoutEffect(() => {
    const root = scope.current;
    if (!root || reducedMotion) return;

    const context = gsap.context(() => {
      /* ── Generic reveals (sections still driven by GSAP rather than Framer) ── */
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
        gsap.fromTo(
          item,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          },
        );
      });

      /* ── Character-level heading reveals ── */
      const splitInstances: SplitType[] = [];
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((element) => {
        const split = new SplitType(element, { types: "words,chars", tagName: "span" });
        splitInstances.push(split);
        gsap.from(split.chars, {
          yPercent: 105,
          rotate: 3,
          opacity: 0,
          duration: 0.88,
          stagger: 0.012,
          ease: "power4.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      /* ── Hero: staggered parallax exit ── */
      const heroSection = root.querySelector<HTMLElement>(".hero");
      if (heroSection) {
        gsap.utils.toArray<HTMLElement>("[data-hero-float]").forEach((el) => {
          const order = parseInt(el.getAttribute("data-hero-float") || "0", 10);
          const yDistance = order === 0 ? -60 : -(60 + order * 18);
          const exitSpeed = order === 0 ? 0.35 : 0.5 + order * 0.08;

          gsap.fromTo(
            el,
            { y: 0, opacity: 1 },
            {
              y: yDistance,
              opacity: 0,
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: `${Math.round(exitSpeed * 100)}% top`,
                scrub: 0.4,
              },
            },
          );
        });

        // Layout-scale + defocus on the copy column as the hero leaves.
        const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
        if (heroCopy) {
          gsap.fromTo(
            heroCopy,
            { scale: 1, filter: "blur(0px)" },
            {
              scale: 0.96,
              filter: "blur(3px)",
              ease: "none",
              scrollTrigger: {
                trigger: heroSection,
                start: "top top",
                end: "70% top",
                scrub: 0.4,
              },
            },
          );
        }

        heroSection.querySelectorAll<HTMLElement>(".hero-gradient").forEach((orb, i) => {
          gsap.to(orb, {
            y: i === 0 ? -120 : -80,
            scale: 1.15,
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      }

      const desktop = window.matchMedia("(min-width: 900px)").matches;

      /* ── Services: pinned horizontal scrub ── */
      const shell = root.querySelector<HTMLElement>("[data-horizontal-shell]");
      const track = root.querySelector<HTMLElement>("[data-horizontal-track]");
      if (shell && track && desktop) {
        const getDistance = () => Math.max(0, track.scrollWidth - track.clientWidth);
        const horizontalTween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: shell,
            start: "top top",
            end: () => `+=${getDistance() + 480}`,
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        track.querySelectorAll(".service-card").forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            containerAnimation: horizontalTween,
            start: "left center",
            end: "right center",
            onToggle: (self) => {
              if (self.isActive) {
                shell.dispatchEvent(new CustomEvent("service-active", { detail: index, bubbles: true }));
              }
            },
          });
        });
      }

      /* ── Process: scrubbed timeline rail ── */
      const progressLine = root.querySelector<HTMLElement>(".process-line-progress");
      if (progressLine) {
        gsap.fromTo(
          progressLine,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: ".process-list",
              start: "top 60%",
              end: "bottom 60%",
              scrub: true,
            },
          },
        );
      }

      /* ── Depth: opposing parallax on anything tagged with a speed ── */
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        const speed = parseFloat(element.getAttribute("data-parallax") || "0.1");
        gsap.to(element, {
          y: () => -100 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      return () => splitInstances.forEach((split) => split.revert());
    }, root);

    return () => context.revert();
  }, [reducedMotion]);

  return <div ref={scope}>{children}</div>;
}

export function SiteExperience() {
  return (
    <SiteAnimations>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <FinishTheme />
      <WorldSceneLoader />
      <Cursor />
      <ScrollProgress />
      <Header />

      <main id="main-content">
        <Hero />
        <VelocityMarquee items={MARQUEE_WORDS} />
        <Introduction />
        <Services />
        <Bento />
        <Process />
        <CraftTabs />
        <Capabilities />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
    </SiteAnimations>
  );
}
