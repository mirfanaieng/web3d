"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { EASE_OUT_EXPO } from "./reveal";

export type AccordionItem = {
  question: string;
  answer: string;
};

/**
 * Single-open accordion. Height animates to `auto` (Framer measures it, so no
 * hardcoded max-height hack), the icon rotates into a minus, and the open row
 * takes a gradient edge so the active state is visible without colour alone.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <motion.div
            key={item.question}
            className={`accordion-row ${isOpen ? "is-open" : ""}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: index * 0.06 }}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                className="accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <motion.span
                  className="accordion-icon"
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  aria-hidden="true"
                >
                  <Plus size={18} strokeWidth={1.7} />
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="accordion-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.42, ease: EASE_OUT_EXPO },
                    opacity: { duration: 0.28, ease: "easeOut" },
                  }}
                >
                  <p>{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
