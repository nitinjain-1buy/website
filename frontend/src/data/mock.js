// Mock data for 1Buy.AI Website

export const heroData = {
  headline: "Decision-grade intelligence for electronics procurement",
  subHeadline: "From pricing and risk to execution and liquidation — the operating system for electronics procurement.",
  ctaPrimary: "Request a Demo",
  ctaSecondary: "Talk to Our Team"
};

export const problemsData = [
  {
    id: 1,
    title: "No Price Confidence",
    description: "Prices decided via RFQs and distributor quotes with no independent benchmark. Relationship-driven pricing leaves you uncertain if you're overpaying.",
    icon: "TrendingDown"
  },
  {
    id: 2,
    title: "BOM Complexity",
    description: "Heavy use of Excel and email. Unable to consistently optimize pricing and risk for large, complex BOMs across vendors and regions.",
    icon: "Layers"
  },
  {
    id: 3,
    title: "Alternate & Lifecycle Risk",
    description: "Hard to find qualified alternates quickly. Lifecycle, EOL, and supplier risk discovered too late, causing disruptions.",
    icon: "AlertTriangle"
  },
  {
    id: 4,
    title: "Excess Inventory Lock-up",
    description: "Components become excess or obsolete with no structured way to liquidate at the right price. Pure working-capital loss.",
    icon: "Package"
  }
];

export const productsData = [
  {
    id: "1data",
    name: "1Data",
    tagline: "Pricing & Risk Intelligence",
    description: "Bloomberg for Components. Independent global price benchmarks, alternate discovery, and risk intelligence for defensible procurement decisions.",
    features: [
      "Independent global price benchmarks",
      "Alternate part discovery (form/fit/function)",
      "Lifecycle, EOL, and supplier risk alerts",
      "BOM-level cost and sourcing simulations",
      "AI-driven price predictions",
      "Actionable savings opportunities"
    ],
    benefits: [
      "Benchmark every quote against market data",
      "Identify 10-20% savings opportunities",
      "De-risk your supply chain proactively",
      "Make defensible, auditable decisions"
    ],
    icon: "Database"
  },
  {
    id: "1source",
    name: "1Source",
    tagline: "High-Impact Sourcing Execution",
    description: "Amazon for Procurement. Execute sourcing where it matters most with vetted global suppliers and transparent landed-cost comparison.",
    features: [
      "Vetted global suppliers (CN/IN/TW/KR/EU/US)",
      "Transparent landed-cost comparison",
      "Faster RFQ workflows",
      "Aggregated demand intelligence",
      "Seamless ERP integration",
      "You stay in control"
    ],
    benefits: [
      "Execute only on high-impact components",
      "Reduce sourcing cycle time by 40%",
      "Access global supplier network",
      "Cleaner decisions, better outcomes"
    ],
    icon: "ShoppingCart"
  },
  {
    id: "1xcess",
    name: "1Xcess",
    tagline: "Excess Inventory Monetization",
    description: "eBay for Components. Structured liquidation of excess and EOL inventory through competitive bidding with approved buyers.",
    features: [
      "Approved buyers with global reach",
      "Competitive bidding & transparency",
      "Reverse auctions for best pricing",
      "Multi-attribute bidding",
      "Escrow + QA for trust",
      "Faster recovery, fewer write-offs"
    ],
    benefits: [
      "Turn excess into cash",
      "Reduce working capital lock-up",
      "Transparent liquidation process",
      "Recover value from EOL stock"
    ],
    icon: "RefreshCw"
  }
];

export const workflowSteps = [
  {
    step: 1,
    title: "Upload BOM",
    description: "Connect your ERP or simply upload your Bill of Materials. Our platform ingests and normalizes your component data instantly.",
    icon: "Upload"
  },
  {
    step: 2,
    title: "Identify",
    description: "AI analyzes pricing gaps, qualified alternates, and risks across your entire BOM. Savings opportunities are highlighted automatically.",
    icon: "Search"
  },
  {
    step: 3,
    title: "Decide",
    description: "Armed with decision-grade intelligence, choose to renegotiate with current suppliers, re-source, or hold positions.",
    icon: "CheckCircle"
  },
  {
    step: 4,
    title: "Execute",
    description: "For high-impact components, execute sourcing through 1Source with vetted global suppliers and transparent pricing.",
    icon: "Zap"
  },
  {
    step: 5,
    title: "Liquidate",
    description: "Turn excess and EOL inventory into cash through 1Xcess with approved buyers and competitive bidding.",
    icon: "DollarSign"
  }
];

export const proofPointsData = {
  stats: [
    { value: "15-20%", label: "Cost Savings Identified", description: "Average savings identified across customer BOMs" },
    { value: "25M+", label: "MPN Coverage", description: "Comprehensive part number database" },
    { value: "400+", label: "Data Sources", description: "Proprietary data pipes for intelligence" },
    { value: "10+", label: "Enterprise Customers", description: "Active OEM & EMS engagements" }
  ],
  customers: [
    "Google",
    "Uno Minda",
    "Dixon",
    "Napino",
    "SGS Syrma",
    "NCR Atleos",
    "Lucas TVS",
    "Lumax",
    "Bajaj"
  ]
};

export const whyData = {
  differentiators: [
    {
      title: "Why Not Distributors?",
      points: [
        "Distributors have inherent conflict of interest",
        "Limited visibility into global market pricing",
        "Relationship-driven, not data-driven",
        "No incentive to find you the best price"
      ]
    },
    {
      title: "Why Not SaaS-Only Tools?",
      points: [
        "Insights without execution are incomplete",
        "Data without context lacks value",
        "No path from decision to action",
        "Siloed tools create workflow friction"
      ]
    },
    {
      title: "Why 1Buy.AI?",
      points: [
        "Intelligence + Execution + Liquidity in one platform",
        "Proprietary data keeps procurement auditable",
        "Decision-grade tools for defensible outcomes",
        "Built by supply chain operators for operators"
      ]
    }
  ],
  comparison: [
    { feature: "Pricing Intelligence", onebuy: true, lytica: true, distributors: false, marketplaces: false },
    { feature: "Sourcing Optimization", onebuy: true, lytica: false, distributors: false, marketplaces: false },
    { feature: "Obsolescence/Lifecycle Risk", onebuy: true, lytica: true, distributors: false, marketplaces: false },
    { feature: "Procurement Execution", onebuy: true, lytica: false, distributors: true, marketplaces: true },
    { feature: "Excess Inventory Marketplace", onebuy: true, lytica: false, distributors: false, marketplaces: true },
    { feature: "Unified Platform", onebuy: true, lytica: false, distributors: false, marketplaces: false }
  ]
};

export const useCasesData = [
  {
    industry: "Electric Vehicles",
    description: "EV programs have 6x component load. 1Buy.AI helps manage pricing volatility and supply risk across complex, high-volume BOMs.",
    icon: "Zap"
  },
  {
    industry: "Smart Meters",
    description: "High BOM sensitivity with strict compliance requirements. Our platform ensures cost optimization without compromising quality.",
    icon: "Activity"
  },
  {
    industry: "Industrial Electronics",
    description: "Long product lifecycles demand proactive obsolescence management. Stay ahead of EOL risks with predictive intelligence.",
    icon: "Settings"
  },
  {
    industry: "Consumer Electronics",
    description: "Fast-moving markets require agile sourcing. Reduce cycle times and capture savings in competitive categories.",
    icon: "Smartphone"
  }
];

export const aboutData = {
  mission: "To make global electronics procurement intelligent, cheaper, transparent, and optimized — enabling every buyer to make faster, smarter, and more resilient sourcing and excess selling decisions.",
  vision: "Building the global operating system for electronics procurement. Starting in India, building for the world.",
  founders: [
    {
      role: "Founders",
      background: "IITD and HBS alumni with deep experience in enterprise SaaS, data platforms, and large-scale supply chains. Previously co-founded and built unicorns."
    }
  ],
  values: [
    { title: "Data-First", description: "Every decision backed by defensible, auditable data" },
    { title: "Customer-Centric", description: "Built for procurement teams, not around them" },
    { title: "Execution-Focused", description: "Intelligence without execution is just noise" },
    { title: "Trust & Transparency", description: "Your data is your moat. We protect it." }
  ]
};

export const navigationData = [
  { name: "Products", href: "/products" },
  { name: "Why 1Buy", href: "/why-1buy" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Use Cases", href: "/use-cases" },
  { name: "About", href: "/about" }
];

export const footerData = {
  company: "1Buy.AI",
  tagline: "The operating system for electronics procurement",
  links: {
    products: [
      { name: "1Data", href: "/products#1data" },
      { name: "1Source", href: "/products#1source" },
      { name: "1Xcess", href: "/products#1xcess" }
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" }
    ],
    resources: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Use Cases", href: "/use-cases" }
    ]
  }
};
