/** Single source of truth for every section's copy, so the layout files stay layout. */

export const navigation = [
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Craft", href: "#craft" },
  { label: "Capabilities", href: "#capabilities" },
];

export const services = [
  {
    index: "01",
    title: "Box printing",
    eyebrow: "Structural & visual",
    copy: "Rigid boxes, folding cartons and packaging systems made to be picked up, noticed and remembered.",
    notes: ["Rigid boxes", "Product cartons", "Custom finishes"],
    tone: "clay",
  },
  {
    index: "02",
    title: "Retail bags",
    eyebrow: "Take the brand with you",
    copy: "Paper shopping bags that turn every handover, purchase and unboxing into brand media.",
    notes: ["Luxury paper", "Gift bags", "Branded handles"],
    tone: "red",
  },
  {
    index: "03",
    title: "Print essentials",
    eyebrow: "The details matter",
    copy: "Business cards, brochures, letterheads and print pieces that give your business a distinctive finish.",
    notes: ["Business cards", "Brochures", "Letterheads"],
    tone: "ink",
  },
  {
    index: "04",
    title: "Occasion & hospitality",
    eyebrow: "For moments that matter",
    copy: "Wedding invitations, restaurant menus and event collateral with a sense of occasion built in.",
    notes: ["Wedding cards", "Restaurant menus", "Event print"],
    tone: "sand",
  },
];

export const process = [
  {
    index: "01",
    title: "Discover the signal",
    copy: "We get close to what makes your product worth choosing — then uncover the clearest way to show it.",
  },
  {
    index: "02",
    title: "Shape the experience",
    copy: "Materials, form, typography and detail become one tactile brand moment rather than separate decisions.",
  },
  {
    index: "03",
    title: "Make it real",
    copy: "Our production expertise takes the concept through to beautifully consistent, practical finished packaging.",
  },
];

export const capabilities = [
  "Custom rigid boxes",
  "Luxury shopping bags",
  "Product packaging",
  "Brand-led graphics",
  "Offset printing",
  "Digital printing",
  "Business cards",
  "Brochures & booklets",
  "Wedding invitations",
  "Restaurant menus",
];

/** Tabs in the craft section — each one drives the illustration beside it. */
export const craftTabs = [
  {
    id: "foil",
    label: "Foil & emboss",
    title: "Light that moves with the box",
    copy: "Hot-foil blocking and blind embossing give a flat surface depth you can feel before you read it. We register the two so the highlight lands exactly on the raised edge.",
    stats: [
      { value: 12, suffix: "µm", label: "Foil thickness" },
      { value: 4, suffix: " passes", label: "Registration" },
    ],
  },
  {
    id: "material",
    label: "Material",
    title: "Board chosen for the hand, not the spec sheet",
    copy: "Greyboard weight, wrap stock and lining are picked together. The opening resistance of a rigid box is a design decision, and we treat it as one.",
    stats: [
      { value: 1200, suffix: "gsm", label: "Rigid board" },
      { value: 9, suffix: " stocks", label: "Wrap library" },
    ],
  },
  {
    id: "structure",
    label: "Structure",
    title: "Dielines drawn around the product",
    copy: "Every crease, lock and insert starts from the object it protects. We prototype in-house so the first sample you hold is already close to production.",
    stats: [
      { value: 48, suffix: "h", label: "Prototype turnaround" },
      { value: 24, suffix: "+", label: "Stock formats" },
    ],
  },
  {
    id: "finish",
    label: "Finishing",
    title: "Soft-touch, spot UV, and everything between",
    copy: "Lamination sets the mood of the whole piece. Soft-touch mutes and warms; spot UV puts a wet highlight exactly where the eye should land.",
    stats: [
      { value: 6, suffix: " finishes", label: "In-house" },
      { value: 100, suffix: "%", label: "Press-checked" },
    ],
  },
] as const;

/** Bento tiles — `span` maps to the grid area classes in globals.css. */
export const bentoTiles = [
  {
    id: "unboxing",
    span: "bento-lg",
    kicker: "Signature",
    title: "The unboxing is the campaign",
    copy: "A rigid box with a magnetic close, a lined interior and a foil-blocked mark turns a delivery into content your customers make for you.",
    metric: { value: 3, suffix: "x", label: "Average share rate on launch drops" },
  },
  {
    id: "speed",
    span: "bento-sm",
    kicker: "Production",
    title: "In-house press",
    copy: "Offset and digital under one roof, so proofs come back in days.",
    metric: { value: 48, suffix: "h", label: "Sample turnaround" },
  },
  {
    id: "sustain",
    span: "bento-sm",
    kicker: "Material",
    title: "Recyclable by default",
    copy: "FSC board and water-based inks unless a brief demands otherwise.",
    metric: { value: 92, suffix: "%", label: "Recyclable output" },
  },
  {
    id: "range",
    span: "bento-md",
    kicker: "Range",
    title: "One studio, every format",
    copy: "Boxes, bags, cards, menus and invitations drawn as a single visual system rather than four separate jobs.",
    metric: { value: 24, suffix: "+", label: "Packaging formats" },
  },
  {
    id: "uae",
    span: "bento-md",
    kicker: "Where",
    title: "Made across the UAE",
    copy: "Local production, local delivery and a team you can meet at the press check.",
    metric: { value: 7, suffix: " emirates", label: "Delivery coverage" },
  },
];

export const faqs = [
  {
    question: "What is your minimum order quantity?",
    answer:
      "For custom rigid boxes we start at 250 units, and printed collateral such as cards or menus starts at 100. Below that we can still produce a hand-finished sample run so you have something real to show.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Design and dieline development runs one to two weeks depending on how many structures we explore. Production is a further two to three weeks for standard finishes, longer if a project needs specialty foil or custom-dyed board.",
  },
  {
    question: "Can you work from our existing brand guidelines?",
    answer:
      "Yes — most of our work starts from an established identity. We take your palette, type and mark and translate them into the material decisions that print can actually hold, then send back a spec sheet you can reuse.",
  },
  {
    question: "Do you produce samples before the full run?",
    answer:
      "Always. Every project includes a physical prototype and a press proof before we commit the run, so the first box off the line is not the first box you see.",
  },
];
