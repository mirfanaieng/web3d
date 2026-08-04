"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "../brand-logo";
import { Magnetic } from "../motion/magnetic";
import { EASE_OUT_EXPO } from "../motion/reveal";
import { navigation } from "../site-data";

export function Header() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const { scrollY } = useScroll();

  // Threshold rather than a continuous binding: the header only has two states,
  // so there is no reason to re-render it on every scroll frame.
  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed((current) => (current ? latest > 40 : latest > 80));
  });

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        className={`site-header ${condensed ? "is-condensed" : ""}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.15 }}
      >
        <a className="brand" href="#top" aria-label="The Pack Style home">
          <BrandLogo size={30} />
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <Magnetic strength={0.3} className="header-cta-wrap">
          <motion.a
            className="shine-btn shine-btn-primary header-cta"
            href="#contact"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <span className="shine-btn-label">
              Start a project
              <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="shine-btn-sweep" aria-hidden="true" />
            <span className="shine-btn-ring" aria-hidden="true" />
          </motion.a>
        </Magnetic>

        <button
          type="button"
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {open ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
          </motion.span>
        </button>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          >
            <motion.nav
              aria-label="Mobile navigation"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
            >
              {[...navigation, { label: "Contact", href: "#contact" }].map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                  <ArrowUpRight size={19} aria-hidden="true" />
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
