"""
Risk Engine Module for Article Risk Analysis

This module implements a rule-based risk scoring system for electronics
supply chain news articles. It can be swapped with an ML-based engine later.

Interface:
    RiskEngine.analyze(article) -> RiskAnalysis
"""

import re
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict


# ============== CONSTANTS ==============

RISK_BANDS = {
    "LOW": (0, 29),
    "WATCH": (30, 54),
    "HIGH": (55, 74),
    "CRITICAL": (75, 100)
}

TIME_HORIZONS = [
    "IMMEDIATE_0_2W",
    "NEAR_2_8W",
    "MEDIUM_2_6M",
    "LONG_6M_PLUS"
]

RISK_CATEGORIES = [
    "SUPPLY_SHORTAGE",
    "LEAD_TIME_VOLATILITY",
    "PRICE_VOLATILITY",
    "EOL_LIFECYCLE",
    "BOM_CHANGE_COMPATIBILITY",
    "TARIFF_TRADE_POLICY",
    "EXPORT_CONTROLS_SANCTIONS",
    "GEOPOLITICAL_CONFLICT",
    "LOGISTICS_SHIPPING_DISRUPTION",
    "FACTORY_FAB_OUTAGE",
    "QUALITY_COUNTERFEIT",
    "SUPPLIER_FINANCIAL_RISK",
    "REGULATORY_COMPLIANCE",
    "CYBER_SECURITY_OPERATIONAL",
    "DEMAND_SHOCK"
]

# Electronics context gating words
ELECTRONICS_CONTEXT_WORDS = [
    "semiconductor", "chip", "chips", "ic", "ics", "component", "components",
    "electronics", "electronic", "pcb", "assembly", "ems", "oem",
    "distributor", "inventory", "allocation", "lead time", "lead-time",
    "wafer", "fab", "fabs", "packaging", "module", "modules",
    "microchip", "microprocessor", "transistor", "capacitor", "resistor",
    "diode", "mosfet", "igbt", "mcu", "fpga", "memory", "dram", "nand",
    "mlcc", "sic", "gan", "connector", "passive", "passives"
]

# Component family terms for procurement relevance
COMPONENT_FAMILIES = [
    "mcu", "fpga", "memory", "mlcc", "mosfet", "igbt", "sic", "gan",
    "connector", "connectors", "passive", "passives", "pcb", "packaging",
    "dram", "nand", "flash", "sram", "cpu", "gpu", "asic", "soc",
    "power management", "pmic", "analog", "mixed-signal", "rf",
    "sensor", "sensors", "display", "led", "oled"
]

# ============== TRIGGER DEFINITIONS ==============

CATEGORY_TRIGGERS = {
    "SUPPLY_SHORTAGE": {
        "strong": [
            "shortage", "allocation", "backorder", "out of stock",
            "constrained supply", "rationing", "supply crunch",
            "supply deficit", "undersupply", "supply gap"
        ],
        "medium": [
            "tight supply", "limited availability", "scarcity",
            "supply pressure", "supply constraints", "low inventory"
        ]
    },
    "LEAD_TIME_VOLATILITY": {
        "strong": [
            "lead time", "lead-time", "extended lead times",
            "eta slipped", "shipments delayed", "delivery delay",
            "delivery delays", "lead times extended"
        ],
        "medium": [
            "backlog", "pushed out", "delayed fulfillment",
            "shipping delays", "fulfillment delays"
        ]
    },
    "PRICE_VOLATILITY": {
        "strong": [
            "spot price", "price spike", "price surge", "price increase",
            "asp up", "cost inflation", "price hike", "price jump",
            "prices soar", "prices surge"
        ],
        "medium": [
            "pricing pressure", "volatility", "price fluctuation",
            "cost increase", "margin pressure"
        ]
    },
    "EOL_LIFECYCLE": {
        "strong": [
            "end of life", "eol", "nrnd", "pcn", "last time buy",
            "discontinued", "end-of-life", "product discontinuation"
        ],
        "medium": [
            "obsolete", "lifecycle notice", "phase out", "phasing out",
            "legacy part", "mature product"
        ]
    },
    "BOM_CHANGE_COMPATIBILITY": {
        "strong": [
            "redesign", "requalification", "qualify alternate",
            "form fit function", "pin-to-pin", "design change"
        ],
        "medium": [
            "alternate parts", "second source", "drop-in replacement",
            "bom change", "alternative supplier", "cross-reference"
        ]
    },
    "TARIFF_TRADE_POLICY": {
        "strong": [
            "tariff", "tariffs", "duty", "duties", "anti-dumping",
            "countervailing", "import tax", "trade remedy",
            "import duties", "export duties"
        ],
        "medium": [
            "customs levy", "trade policy", "trade war", "trade dispute",
            "trade restrictions", "import restrictions"
        ]
    },
    "EXPORT_CONTROLS_SANCTIONS": {
        "strong": [
            "export control", "export controls", "entity list",
            "sanctions", "export ban", "license requirement",
            "export restriction", "trade ban", "blacklisted"
        ],
        "medium": [
            "restricted exports", "blacklist", "controls tightened",
            "export license", "technology transfer"
        ]
    },
    "GEOPOLITICAL_CONFLICT": {
        "strong": [
            "war", "conflict", "missile", "invasion", "taiwan strait",
            "escalation", "military action", "armed conflict"
        ],
        "medium": [
            "geopolitical tension", "geopolitical risk", "standoff",
            "diplomatic crisis", "territorial dispute"
        ]
    },
    "LOGISTICS_SHIPPING_DISRUPTION": {
        "strong": [
            "port congestion", "shipping disruption", "red sea",
            "suez", "freight rates", "container shortage",
            "port closure", "shipping crisis"
        ],
        "medium": [
            "logistics delays", "rerouting", "air freight",
            "sea freight", "supply chain disruption", "transit delays"
        ]
    },
    "FACTORY_FAB_OUTAGE": {
        "strong": [
            "fab outage", "plant fire", "explosion", "earthquake",
            "power outage", "factory shutdown", "fab shutdown",
            "plant closure", "facility damage"
        ],
        "medium": [
            "production halted", "capacity loss", "line stoppage",
            "manufacturing disruption", "facility closure"
        ]
    },
    "QUALITY_COUNTERFEIT": {
        "strong": [
            "counterfeit", "fake chips", "recall", "defect",
            "authenticity", "non-genuine", "fraudulent parts"
        ],
        "medium": [
            "field failure", "reliability issue", "quality issue",
            "quality concern", "testing failure"
        ]
    },
    "SUPPLIER_FINANCIAL_RISK": {
        "strong": [
            "bankruptcy", "insolvency", "default", "debt restructuring",
            "liquidity crisis", "chapter 11", "liquidation"
        ],
        "medium": [
            "distress", "going concern", "credit downgrade",
            "financial difficulty", "cash flow"
        ]
    },
    "REGULATORY_COMPLIANCE": {
        "strong": [
            "rohs", "reach", "compliance violation", "regulatory ban",
            "restricted substance", "non-compliant"
        ],
        "medium": [
            "compliance update", "audit", "regulation", "regulatory",
            "certification", "standard"
        ]
    },
    "CYBER_SECURITY_OPERATIONAL": {
        "strong": [
            "ransomware", "cyberattack", "cyber attack", "systems down",
            "erp outage", "data breach", "hacked"
        ],
        "medium": [
            "security incident", "it disruption", "system outage",
            "network breach", "cyber incident"
        ]
    },
    "DEMAND_SHOCK": {
        "strong": [
            "demand surge", "orders spike", "demand collapse",
            "order cancellations", "demand crash", "booking surge"
        ],
        "medium": [
            "inventory correction", "soft demand", "ai server demand",
            "ev demand spike", "demand volatility", "order decline"
        ]
    }
}

# Time horizon triggers
TIME_HORIZON_TRIGGERS = {
    "IMMEDIATE_0_2W": [
        "effective immediately", "now", "this week", "already",
        "immediate", "today", "tomorrow", "within days", "urgent"
    ],
    "NEAR_2_8W": [
        "within weeks", "next month", "30-60 days", "near term",
        "coming weeks", "shortly", "soon", "next few weeks"
    ],
    "MEDIUM_2_6M": [
        "this quarter", "next quarter", "over the coming months",
        "q1", "q2", "q3", "q4", "in the months ahead", "mid-year"
    ],
    "LONG_6M_PLUS": [
        "next year", "2026", "2027", "2028", "long term", "multi-year",
        "years ahead", "long-term", "over years"
    ]
}

# Specificity/quality indicators
OFFICIAL_INDICATORS = [
    "announced", "statement", "official", "confirmed", "reported",
    "according to", "said", "disclosed", "filed", "regulatory filing",
    "press release", "earnings call", "quarterly report"
]

CREDIBLE_SOURCES = [
    "reuters", "bloomberg", "wsj", "financial times", "nikkei",
    "digitimes", "evertiq", "eenews", "semiconductor digest",
    "trendforce", "counterpoint", "idc", "gartner"
]

VAGUE_INDICATORS = [
    "may", "might", "could", "possibly", "potentially", "rumor",
    "speculation", "unconfirmed", "allegedly", "sources say"
]


# ============== DATA CLASSES ==============

@dataclass
class RiskAnalysis:
    """Result of risk analysis for an article"""
    risk_score: int
    risk_band: str
    risk_categories: List[str]
    confidence: int
    time_horizon: str
    category_strength: Dict[str, int]
    
    def to_dict(self) -> dict:
        return asdict(self)


# ============== RISK ENGINE ==============

class RuleBasedRiskEngine:
    """
    Rule-based risk engine for electronics supply chain articles.
    
    Can be swapped with MLRiskEngine later via configuration.
    """
    
    def __init__(self):
        self.category_triggers = CATEGORY_TRIGGERS
        self.context_words = ELECTRONICS_CONTEXT_WORDS
        self.component_families = COMPONENT_FAMILIES
    
    def analyze(self, article: dict) -> RiskAnalysis:
        """
        Analyze an article and return risk assessment.
        
        Args:
            article: Dict with keys: title, fullContent/summary, source, iso_date/date
            
        Returns:
            RiskAnalysis object with all risk fields
        """
        # Build text from available fields
        title = article.get("title", "") or ""
        content = article.get("fullContent") or article.get("summary") or ""
        text = f"{title} {content}".lower()
        
        # Get source name
        source = article.get("source", {})
        if isinstance(source, dict):
            source_name = source.get("name", "").lower()
        else:
            source_name = str(source).lower() if source else ""
        
        # Get published date
        published_at = article.get("iso_date") or article.get("date")
        
        # Check electronics context gating
        has_electronics_context = self._check_electronics_context(text)
        
        # Detect categories
        categories, category_strength = self._detect_categories(text, has_electronics_context)
        
        # Determine time horizon
        time_horizon = self._extract_time_horizon(text)
        
        # Calculate confidence
        confidence = self._calculate_confidence(text, categories, source_name)
        
        # Calculate risk score components
        severity = self._calculate_severity(categories)
        immediacy = self._calculate_immediacy(time_horizon, published_at)
        procurement_relevance = self._calculate_procurement_relevance(text)
        specificity = self._calculate_specificity(text, source_name)
        
        # Total risk score (clamped 0-100)
        risk_score = min(100, max(0, severity + immediacy + procurement_relevance + specificity))
        
        # Determine risk band
        risk_band = self._get_risk_band(risk_score)
        
        # If no electronics context and low relevance, reduce score
        if not has_electronics_context and procurement_relevance < 10:
            risk_score = min(risk_score, 25)
            risk_band = "LOW"
            categories = []
            category_strength = {}
        
        return RiskAnalysis(
            risk_score=risk_score,
            risk_band=risk_band,
            risk_categories=categories,
            confidence=confidence,
            time_horizon=time_horizon,
            category_strength=category_strength
        )
    
    def _check_electronics_context(self, text: str) -> bool:
        """Check if text contains electronics/procurement context words"""
        for word in self.context_words:
            if word in text:
                return True
        return False
    
    def _detect_categories(self, text: str, has_context: bool) -> Tuple[List[str], Dict[str, int]]:
        """
        Detect risk categories based on trigger words.
        
        Returns:
            Tuple of (list of category names, dict of category -> strength 0-100)
        """
        categories = []
        category_strength = {}
        
        for category, triggers in self.category_triggers.items():
            strong_triggers = triggers.get("strong", [])
            medium_triggers = triggers.get("medium", [])
            
            strong_match = any(trigger in text for trigger in strong_triggers)
            medium_count = sum(1 for trigger in medium_triggers if trigger in text)
            
            # Apply category if:
            # - Strong trigger AND context gating passes, OR
            # - 2+ medium triggers AND context gating passes
            if has_context:
                if strong_match:
                    categories.append(category)
                    category_strength[category] = 100
                elif medium_count >= 2:
                    categories.append(category)
                    category_strength[category] = 60
        
        return categories, category_strength
    
    def _extract_time_horizon(self, text: str) -> str:
        """Extract time horizon from text"""
        for horizon, triggers in TIME_HORIZON_TRIGGERS.items():
            for trigger in triggers:
                if trigger in text:
                    return horizon
        return "NEAR_2_8W"  # Default
    
    def _calculate_confidence(self, text: str, categories: List[str], source_name: str) -> int:
        """Calculate confidence score (0-100)"""
        confidence = 50  # Base confidence
        
        # Strong triggers present (+15)
        if categories:
            for cat in categories:
                if any(t in text for t in self.category_triggers.get(cat, {}).get("strong", [])):
                    confidence += 15
                    break
        
        # Named entities/dates/numbers (+10)
        if re.search(r'\b\d{4}\b', text):  # Year
            confidence += 5
        if re.search(r'\b\d+%', text):  # Percentage
            confidence += 5
        if re.search(r'\$[\d,]+', text):  # Dollar amount
            confidence += 5
        
        # Official language (+10)
        if any(ind in text for ind in OFFICIAL_INDICATORS):
            confidence += 10
        
        # Credible source (+10)
        if any(src in source_name for src in CREDIBLE_SOURCES):
            confidence += 10
        
        # Vague language (-15)
        vague_count = sum(1 for ind in VAGUE_INDICATORS if ind in text)
        confidence -= min(15, vague_count * 5)
        
        return min(100, max(0, confidence))
    
    def _calculate_severity(self, categories: List[str]) -> int:
        """Calculate severity component (0-35)"""
        high_severity_cats = ["FACTORY_FAB_OUTAGE", "EXPORT_CONTROLS_SANCTIONS", "GEOPOLITICAL_CONFLICT"]
        medium_severity_cats = ["SUPPLY_SHORTAGE", "TARIFF_TRADE_POLICY", "EOL_LIFECYCLE"]
        
        if any(cat in high_severity_cats for cat in categories):
            return 35
        elif any(cat in medium_severity_cats for cat in categories):
            return 25
        elif categories:
            return 15
        else:
            return 5
    
    def _calculate_immediacy(self, time_horizon: str, published_at: Optional[str]) -> int:
        """Calculate immediacy component (0-20)"""
        horizon_scores = {
            "IMMEDIATE_0_2W": 20,
            "NEAR_2_8W": 12,
            "MEDIUM_2_6M": 6,
            "LONG_6M_PLUS": 2
        }
        
        score = horizon_scores.get(time_horizon, 12)
        
        # Recency bonus (within 48 hours)
        if published_at:
            try:
                if isinstance(published_at, str):
                    # Try to parse ISO format
                    pub_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                else:
                    pub_date = published_at
                
                now = datetime.now(timezone.utc)
                if (now - pub_date) < timedelta(hours=48):
                    score = min(20, score + 3)
            except (ValueError, TypeError):
                pass
        
        return score
    
    def _calculate_procurement_relevance(self, text: str) -> int:
        """Calculate procurement relevance component (0-25)"""
        score = 0
        
        # Component families (+10)
        if any(comp in text for comp in self.component_families):
            score += 10
        
        # Allocation/lead time/pricing language (+8)
        procurement_terms = ["allocation", "lead time", "lead-time", "pricing", "inventory", "supply"]
        if any(term in text for term in procurement_terms):
            score += 8
        
        # Manufacturing capacity/logistics (+7)
        capacity_terms = ["capacity", "fab", "factory", "manufacturing", "logistics", "shipping"]
        if any(term in text for term in capacity_terms):
            score += 7
        
        return min(25, score)
    
    def _calculate_specificity(self, text: str, source_name: str) -> int:
        """Calculate specificity/quality component (0-20)"""
        # Official statement/numbers/dates
        has_official = any(ind in text for ind in OFFICIAL_INDICATORS)
        has_numbers = bool(re.search(r'\b\d+', text))
        has_company = bool(re.search(r'\b[A-Z][a-z]+\s+(Inc|Corp|Ltd|Co|LLC)\b', text, re.IGNORECASE))
        
        if has_official and (has_numbers or has_company):
            return 20
        
        # Credible trade press
        if any(src in source_name for src in CREDIBLE_SOURCES):
            return 14
        
        # Has some specificity
        if has_numbers or has_company:
            return 8
        
        # Generic/opinion
        return 4
    
    def _get_risk_band(self, score: int) -> str:
        """Determine risk band from score"""
        for band, (low, high) in RISK_BANDS.items():
            if low <= score <= high:
                return band
        return "LOW"


# ============== FACTORY ==============

class RiskEngineFactory:
    """Factory to get the appropriate risk engine based on configuration"""
    
    @staticmethod
    def get_engine(engine_type: str = "rule_based") -> RuleBasedRiskEngine:
        """
        Get risk engine instance.
        
        Args:
            engine_type: "rule_based" or "ml" (ml not implemented yet)
            
        Returns:
            RiskEngine instance
        """
        if engine_type == "rule_based":
            return RuleBasedRiskEngine()
        elif engine_type == "ml":
            # TODO: Implement MLRiskEngine later
            raise NotImplementedError("ML Risk Engine not implemented yet")
        else:
            raise ValueError(f"Unknown engine type: {engine_type}")


# ============== CONVENIENCE FUNCTION ==============

def analyze_article(article: dict, engine_type: str = "rule_based") -> dict:
    """
    Convenience function to analyze a single article.
    
    Args:
        article: Article dict
        engine_type: Type of engine to use
        
    Returns:
        Dict with risk fields
    """
    engine = RiskEngineFactory.get_engine(engine_type)
    result = engine.analyze(article)
    return result.to_dict()


def analyze_articles_batch(articles: List[dict], engine_type: str = "rule_based") -> List[dict]:
    """
    Analyze multiple articles efficiently.
    
    Args:
        articles: List of article dicts
        engine_type: Type of engine to use
        
    Returns:
        List of risk analysis dicts
    """
    engine = RiskEngineFactory.get_engine(engine_type)
    results = []
    for article in articles:
        result = engine.analyze(article)
        results.append(result.to_dict())
    return results
