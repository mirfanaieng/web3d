"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "../brand-logo";
import { Reveal } from "../motion/reveal";

export function Footer() {
  return (
    <footer className="site-footer">
      <Reveal className="footer-top section-pad">
        <a className="footer-logo" href="#top" aria-label="Back to the top">
          <BrandLogo size={44} withTagline />
        </a>
        <p>Packaging with a point of view.</p>
      </Reveal>

      <div className="footer-bottom section-pad">
        <span>© {new Date().getFullYear()} The Pack Style · UAE</span>
        <motion.a href="#top" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          Back to top <ArrowUpRight size={13} aria-hidden="true" />
        </motion.a>
      </div>
    </footer>
  );
}
