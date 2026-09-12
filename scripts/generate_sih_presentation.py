import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ==============================================================================
# OFFICIAL & HARMONIOUS COLOR PALETTE (SIH 2026 BRANDING)
# ==============================================================================
NAVY_PRIMARY = RGBColor(14, 43, 92)       # #0E2B5C - MoSJE Deep Navy
ROYAL_BLUE = RGBColor(0, 112, 192)        # #0070C0 - Template Accent Blue
CYAN_ACCENT = RGBColor(14, 165, 233)      # #0EA5E9 - Process / Ingress Cyan
EMERALD_GREEN = RGBColor(16, 149, 106)    # #10956A - Success / Outcome Green
AMBER_WARNING = RGBColor(217, 119, 6)     # #D97706 - Warning / Risk Amber
ROSE_RED = RGBColor(225, 29, 72)          # #E11D48 - Problem / Crisis Crimson
INDIGO_DEEP = RGBColor(67, 56, 202)       # #4338CA - Institutional Deep Indigo
SAFFRON_ORANGE = RGBColor(245, 130, 32)   # #F58220 - India Stack Saffron Accent
SLATE_DARK = RGBColor(15, 23, 42)         # #0F172A - High-Contrast Dark Text
SLATE_MUTED = RGBColor(71, 85, 105)       # #475569 - Secondary Muted Text
BORDER_GRAY = RGBColor(226, 232, 240)     # #E2E8F0 - Subtle Border Gray
CARD_BG_WHITE = RGBColor(255, 255, 255)   # #FFFFFF - Crisp Pure White
CARD_BG_LIGHT = RGBColor(248, 250, 252)   # #F8FAFC - Soft Neutral Fill
CARD_BG_BLUE = RGBColor(239, 246, 255)    # #EFF6FF - Soft Blue Tint
CARD_BG_GREEN = RGBColor(240, 253, 244)   # #F0FDF4 - Soft Green Tint
CARD_BG_ROSE = RGBColor(255, 241, 242)    # #FFF1F2 - Soft Crimson Tint
CARD_BG_AMBER = RGBColor(254, 243, 199)   # #FEF3C7 - Soft Amber Tint
CARD_BG_CYAN = RGBColor(240, 249, 255)    # #F0F9FF - Soft Cyan Tint
CARD_BG_INDIGO = RGBColor(238, 242, 255)  # #EEF2FF - Soft Indigo Tint
TEXT_WHITE = RGBColor(255, 255, 255)

TEMPLATE_PATH = r'e:\SIH@\SIH\SIH\SIH2026-IDEA-Presentation-Format.pptx'
OUTPUT_PATH = r'e:\SIH@\SIH\SIH\SAHAYAK_SIH2026_Presentation_AltioraX.pptx'

prs = pptx.Presentation(TEMPLATE_PATH)

# ==============================================================================
# AESTHETIC INFOGRAPHIC SHAPE BUILDERS
# ==============================================================================
def add_card(slide, left, top, width, height, bg_color=CARD_BG_WHITE, border_color=BORDER_GRAY, border_width=Pt(1)):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = border_width
    else:
        card.line.fill.background()
    return card

def add_accent_card(slide, left, top, width, height, bg_color=CARD_BG_WHITE, border_color=BORDER_GRAY, accent_color=ROYAL_BLUE, accent_width=Inches(0.08)):
    # Base rounded card
    card = add_card(slide, left, top, width, height, bg_color, border_color, Pt(1))
    
    # Left accent colored vertical strip
    strip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, accent_width, height)
    strip.fill.solid()
    strip.fill.fore_color.rgb = accent_color
    strip.line.fill.background()
    return card

def add_pill_badge(slide, left, top, width, height, text, bg_color=ROYAL_BLUE, text_color=TEXT_WHITE, font_size=Pt(7.5), bold=True):
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    badge.fill.solid()
    badge.fill.fore_color.rgb = bg_color
    badge.line.fill.background()
    tf = badge.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_top = Inches(0)
    tf.margin_bottom = Inches(0)
    tf.margin_left = Inches(0.04)
    tf.margin_right = Inches(0.04)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.name = 'Arial'
    r.font.size = font_size
    r.font.bold = bold
    r.font.color.rgb = text_color
    return badge

def add_stat_card(slide, left, top, width, height, stat_num, stat_label, desc_text, accent_color, bg_color=CARD_BG_WHITE):
    card = add_card(slide, left, top, width, height, bg_color, BORDER_GRAY, Pt(1))
    
    # Left vertical accent bar
    strip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(0.08), height)
    strip.fill.solid()
    strip.fill.fore_color.rgb = accent_color
    strip.line.fill.background()
    
    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.06)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.10)
    
    # Header: Big Stat + Label
    p1 = tf.paragraphs[0]
    r_stat = p1.add_run()
    r_stat.text = stat_num + " "
    r_stat.font.name = 'Arial Black'
    r_stat.font.size = Pt(13)
    r_stat.font.bold = True
    r_stat.font.color.rgb = accent_color
    
    r_lbl = p1.add_run()
    r_lbl.text = stat_label
    r_lbl.font.name = 'Arial'
    r_lbl.font.size = Pt(8.5)
    r_lbl.font.bold = True
    r_lbl.font.color.rgb = SLATE_DARK
    
    # Desc
    p2 = tf.add_paragraph()
    p2.space_before = Pt(2)
    r_desc = p2.add_run()
    r_desc.text = desc_text
    r_desc.font.name = 'Arial'
    r_desc.font.size = Pt(7.6)
    r_desc.font.color.rgb = SLATE_MUTED
    return card

def add_connector(slide, left, top, width, height, text="▼", font_size=Pt(8), font_color=ROYAL_BLUE, bg_color=None):
    if bg_color:
        box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        box.fill.solid()
        box.fill.fore_color.rgb = bg_color
        box.line.color.rgb = font_color
        box.line.width = Pt(0.75)
    else:
        box = slide.shapes.add_textbox(left, top, width, height)
    
    tf = box.text_frame
    tf.word_wrap = False
    tf.margin_top = Inches(0)
    tf.margin_bottom = Inches(0)
    tf.margin_left = Inches(0)
    tf.margin_right = Inches(0)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = text
    r.font.name = 'Arial'
    r.font.size = font_size
    r.font.bold = True
    r.font.color.rgb = font_color
    return box

def setup_slide_header_and_oval(slide, slide_num, title_text, subtitle_text):
    for s in list(slide.shapes):
        if "Oval" in s.name and s.has_text_frame:
            s.text_frame.clear()
            p = s.text_frame.paragraphs[0]
            p.text = "AltioraX"
            p.alignment = PP_ALIGN.CENTER
            p.font.name = 'Arial'
            p.font.size = Pt(14)
            p.font.bold = True
            p.font.color.rgb = ROYAL_BLUE
        elif s.name == 'Title 1' or s.shape_id in [15361, 17409]:
            s.left = Inches(1.8)
            s.width = Inches(8.5)
            s.top = Inches(0.08)
            s.height = Inches(0.72)
            s.text_frame.clear()
            s.text_frame.vertical_anchor = MSO_ANCHOR.TOP
            p = s.text_frame.paragraphs[0]
            p.text = title_text
            p.alignment = PP_ALIGN.CENTER
            p.font.name = 'Times New Roman'
            p.font.size = Pt(26)
            p.font.bold = True
            p.font.color.rgb = SLATE_DARK
        elif "TextBox" in s.name and s.has_text_frame and s.top > Inches(1.5):
            s.text_frame.clear()
            s.left = Inches(15) # move off-screen
        elif s.has_text_frame and ('template' in s.text_frame.text.lower() or 'submission' in s.text_frame.text.lower()):
            try:
                sp = s._element
                sp.getparent().remove(sp)
            except Exception:
                pass
            
    # Subtitle below title
    sub = slide.shapes.add_textbox(Inches(1.8), Inches(0.80), Inches(8.5), Inches(0.35))
    tf_sub = sub.text_frame
    tf_sub.word_wrap = True
    tf_sub.margin_top = Inches(0)
    tf_sub.margin_bottom = Inches(0)
    p_s = tf_sub.paragraphs[0]
    p_s.alignment = PP_ALIGN.CENTER
    r = p_s.add_run()
    r.text = subtitle_text
    r.font.name = 'Arial'
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = SLATE_MUTED


# ==============================================================================
# SLIDE 1: TITLE PAGE
# ==============================================================================
print("Configuring Slide 1: TITLE PAGE...")
slide1 = prs.slides[0]

for s in slide1.shapes:
    if s.has_text_frame and "Problem Statement ID" in s.text_frame.text:
        s.top = Inches(2.06)
        s.height = Inches(4.35)
        s.left = Inches(0.36)
        s.width = Inches(6.8)
        tf = s.text_frame
        tf.clear()
        tf.word_wrap = True
        
        details = [
            ("Problem Statement ID – ", "SIH26092", ROYAL_BLUE),
            ("Problem Statement Title – ", "AI-Powered Citizen Scheme Matching & Channel Partner Routing Platform", SLATE_DARK),
            ("Ministry – ", "Ministry of Social Justice & Empowerment (MoSJE)", NAVY_PRIMARY),
            ("Theme – ", "Smart Automation", EMERALD_GREEN),
            ("PS Category – ", "Software", SLATE_DARK),
            ("Team ID – ", "[Team ID]", ROYAL_BLUE),
            ("Team Name (Registered on portal) – ", "AltioraX", ROYAL_BLUE),
        ]
        
        for i, (label, val, val_color) in enumerate(details):
            p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
            p.space_after = Pt(7)
            p.space_before = Pt(0)
            
            r_bullet = p.add_run()
            r_bullet.text = "• "
            r_bullet.font.name = 'Arial'
            r_bullet.font.size = Pt(14)
            r_bullet.font.bold = True
            r_bullet.font.color.rgb = ROYAL_BLUE
            
            r_lbl = p.add_run()
            r_lbl.text = label
            r_lbl.font.name = 'Times New Roman'
            r_lbl.font.size = Pt(14)
            r_lbl.font.bold = True
            r_lbl.font.color.rgb = SLATE_DARK
            
            r_val = p.add_run()
            r_val.text = val
            r_val.font.name = 'Arial'
            r_val.font.size = Pt(14)
            r_val.font.bold = True
            r_val.font.color.rgb = val_color


# ==============================================================================
# SLIDE 2: IDEA TITLE (THE CRISIS & CONNECTED PROCESS TIMELINE INFOGRAPHIC)
# ==============================================================================
print("Configuring Slide 2: IDEA TITLE & PROCESS TIMELINE INFOGRAPHIC...")
slide2 = prs.slides[1]
setup_slide_header_and_oval(slide2, 2, "IDEA TITLE: SAHAYAK (सहायक)", "Cross-Scheme Household View · Audio-First Inclusion · Rejection Transparency · Grievance Escalation")

# Left Column - Top 3 Ground Crisis Metric Chips
crisis_chips = [
    ("🚨 28% Illiteracy", "Target rural citizens lack smartphones", CARD_BG_ROSE, ROSE_RED),
    ("⏱️ 90+ Days Delay", "Files stall at partner desks", CARD_BG_AMBER, AMBER_WARNING),
    ("💸 ₹15k Broker Cuts", "Extorted by offline middlemen", CARD_BG_ROSE, ROSE_RED),
]
chip_w = Inches(1.88)
chip_h = Inches(0.48)
chip_x = Inches(0.6)
for title, desc, bg_c, bdr_c in crisis_chips:
    c = add_card(slide2, chip_x, Inches(1.26), chip_w, chip_h, bg_c, bdr_c, Pt(1))
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.04)
    tf.margin_left = Inches(0.06)
    tf.margin_right = Inches(0.06)
    p1 = tf.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    r1 = p1.add_run()
    r1.text = title
    r1.font.name = 'Arial'
    r1.font.size = Pt(8.5)
    r1.font.bold = True
    r1.font.color.rgb = bdr_c
    p2 = tf.add_paragraph()
    p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(6.8)
    r2.font.color.rgb = SLATE_MUTED
    chip_x += Inches(1.96)

# Left Column - Card 1: Critical Gaps in Current Welfare Delivery (with Left Rose Accent Strip)
card_prob = add_accent_card(slide2, Inches(0.6), Inches(1.82), Inches(5.8), Inches(2.05), CARD_BG_WHITE, BORDER_GRAY, ROSE_RED)
tf_cp = card_prob.text_frame
tf_cp.word_wrap = True
tf_cp.margin_top = Inches(0.06)
tf_cp.margin_left = Inches(0.14)
tf_cp.margin_right = Inches(0.12)

p_cp_h = tf_cp.paragraphs[0]
r = p_cp_h.add_run()
r.text = "⚠️ Critical Gaps in Current Welfare Delivery"
r.font.name = 'Arial'
r.font.size = Pt(11)
r.font.bold = True
r.font.color.rgb = ROSE_RED

prob_bullets = [
    ("Single-Citizen Silos (No Family View): ", "Portals treat users as isolated sessions; multi-generation families miss simultaneous schemes."),
    ("Severe Digital Divide & Text Heavy UI: ", "28% of target rural citizens lack smartphones; dense forms cause drop-offs & broker dependence."),
    ("Opaque Rejections (Silent Drop-offs): ", "Applicants receive flat 'Rejected' notices without knowing if issues are minor/fixable."),
    ("Unaccountable Review Stalls: ", "Files languish for weeks at SCA/Bank desks with zero citizen recourse or escalation paths."),
    ("Predatory Intermediaries: ", "Marginalized citizens pay ₹5k–₹15k broker cuts to navigate confusing eligibility criteria."),
]
for lbl, desc in prob_bullets:
    p = tf_cp.add_paragraph()
    p.space_before = Pt(2)
    r1 = p.add_run()
    r1.text = "• " + lbl
    r1.font.name = 'Arial'
    r1.font.size = Pt(8)
    r1.font.bold = True
    r1.font.color.rgb = SLATE_DARK
    r2 = p.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(8)
    r2.font.color.rgb = SLATE_MUTED

# Left Column - Card 2: 4 Core Game-Changing USPs (with Left Emerald Accent Strip)
card_sol = add_accent_card(slide2, Inches(0.6), Inches(3.96), Inches(5.8), Inches(2.72), CARD_BG_WHITE, BORDER_GRAY, EMERALD_GREEN)
tf_cs = card_sol.text_frame
tf_cs.word_wrap = True
tf_cs.margin_top = Inches(0.06)
tf_cs.margin_left = Inches(0.14)
tf_cs.margin_right = Inches(0.12)

p_cs_h = tf_cs.paragraphs[0]
r = p_cs_h.add_run()
r.text = "💡 How SAHAYAK Solves It: 4 Core Game-Changing USPs"
r.font.name = 'Arial'
r.font.size = Pt(11)
r.font.bold = True
r.font.color.rgb = EMERALD_GREEN

sol_bullets = [
    ("USP 1 — Cross-Scheme Household View: ", "Unifies entire family welfare matches (e.g. Mother: Mahila Samriddhi @ 4%, Son: Education Loan) in one view."),
    ("USP 2 — Explain-My-Rejection Diagnostic: ", "Surfaces exact statutory cause: triages into Fixable (1-click resubmit) vs Hard-Ineligible alternatives."),
    ("USP 3 — Grievance Auto-Escalation on Stalls: ", "Auto-detects files in review >1.5× SLA (>7 days), generating tickets routed to MoSJE Support Officers."),
    ("USP 4 — Audio-First & CSC Field Agent Desk: ", "11-Lang Web Speech questions, stepped range icon cards, confirm-back loop, & VLE proxy operator mode."),
]
for lbl, desc in sol_bullets:
    p = tf_cs.add_paragraph()
    p.space_before = Pt(3)
    r1 = p.add_run()
    r1.text = "★ " + lbl
    r1.font.name = 'Arial'
    r1.font.size = Pt(8.5)
    r1.font.bold = True
    r1.font.color.rgb = SLATE_DARK
    r2 = p.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(8)
    r2.font.color.rgb = SLATE_MUTED

# ----------------- RIGHT COLUMN: CONNECTED PROCESS TIMELINE INFOGRAPHIC -----------------
card_flow_bg = add_card(slide2, Inches(6.6), Inches(1.26), Inches(6.1), Inches(5.42), CARD_BG_LIGHT, BORDER_GRAY, Pt(1))

# Title of right container
rf_hdr = slide2.shapes.add_textbox(Inches(6.8), Inches(1.32), Inches(5.7), Inches(0.30))
tf_rf = rf_hdr.text_frame
tf_rf.word_wrap = True
tf_rf.margin_top = Inches(0)
tf_rf.margin_bottom = Inches(0)
p_rf = tf_rf.paragraphs[0]
r = p_rf.add_run()
r.text = "🔄 End-to-End Operational Workflow (Citizen-to-Gov Loop)"
r.font.name = 'Arial'
r.font.size = Pt(11.5)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

# Continuous Vertical Timeline Track Line
track_line = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.04), Inches(1.78), Inches(0.04), Inches(4.55))
track_line.fill.solid()
track_line.fill.fore_color.rgb = ROYAL_BLUE
track_line.line.fill.background()

timeline_steps = [
    ("1", "INGRESS", "STEP 01: Omni-Channel Intake & CSC Desk", "11-Lang Web Speech questions, stepped range cards (no bare inputs), confirm-back loop, WhatsApp bot & IVR.", CYAN_ACCENT),
    ("2", "MATCH", "STEP 02: Deterministic Rule Engine & Household Graph", "Evaluates all members independently without session resets; computes unified household credit absorption.", ROYAL_BLUE),
    ("3", "SIMULATE", "STEP 03: Concessional Moratorium Loan Modeler", "Interactive EMI simulator computing 4%-8% slab rates, moratorium grace periods & capital subsidies.", ROYAL_BLUE),
    ("4", "VERIFY", "STEP 04: 3-Layer Verification & Geo-Routing", "DigiLocker + OCR sanity check; ranks nearest SCA / RRB branch by proximity, quota & active capacity.", ROYAL_BLUE),
    ("5", "RECOURSE", "STEP 05: Explain-Rejection & Grievance Auto-Escalation", "Surfaces fixable flaws; auto-escalates stalled files (>1.5× SLA / >7d) directly to MoSJE Support Officers.", EMERALD_GREEN),
]

y_node = Inches(1.72)
for num_str, tag_str, title_str, desc_str, node_color in timeline_steps:
    # Circular Timeline Node Badge on track (Single digit, no wrap)
    node_circle = slide2.shapes.add_shape(MSO_SHAPE.OVAL, Inches(6.85), y_node + Inches(0.10), Inches(0.40), Inches(0.40))
    node_circle.fill.solid()
    node_circle.fill.fore_color.rgb = node_color
    node_circle.line.color.rgb = CARD_BG_WHITE
    node_circle.line.width = Pt(2)
    tf_nc = node_circle.text_frame
    tf_nc.word_wrap = False
    tf_nc.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_nc.margin_top = Inches(0)
    tf_nc.margin_bottom = Inches(0)
    tf_nc.margin_left = Inches(0)
    tf_nc.margin_right = Inches(0)
    p_nc = tf_nc.paragraphs[0]
    p_nc.alignment = PP_ALIGN.CENTER
    r_nc = p_nc.add_run()
    r_nc.text = num_str
    r_nc.font.name = 'Arial'
    r_nc.font.size = Pt(11)
    r_nc.font.bold = True
    r_nc.font.color.rgb = TEXT_WHITE
    
    # Step Card beside node
    s_card = add_card(slide2, Inches(7.34), y_node, Inches(5.18), Inches(0.85), CARD_BG_WHITE, BORDER_GRAY, Pt(0.75))
    tf_s = s_card.text_frame
    tf_s.word_wrap = True
    tf_s.margin_top = Inches(0.04)
    tf_s.margin_left = Inches(0.10)
    tf_s.margin_right = Inches(0.08)
    
    # Tag Pill inside card
    p1 = tf_s.paragraphs[0]
    r_tag = p1.add_run()
    r_tag.text = f"[{tag_str}]  "
    r_tag.font.name = 'Arial'
    r_tag.font.size = Pt(8)
    r_tag.font.bold = True
    r_tag.font.color.rgb = node_color
    
    r_tit = p1.add_run()
    r_tit.text = title_str
    r_tit.font.name = 'Arial'
    r_tit.font.size = Pt(8.5)
    r_tit.font.bold = True
    r_tit.font.color.rgb = NAVY_PRIMARY
    
    p2 = tf_s.add_paragraph()
    p2.space_before = Pt(1)
    r_desc = p2.add_run()
    r_desc.text = desc_str
    r_desc.font.name = 'Arial'
    r_desc.font.size = Pt(7.4)
    r_desc.font.color.rgb = SLATE_MUTED
    
    y_node += Inches(0.94)


# ==============================================================================
# SLIDE 3: TECHNICAL APPROACH (SYSTEM ARCHITECTURE BLUEPRINT SCHEMATIC)
# ==============================================================================
print("Configuring Slide 3: TECHNICAL APPROACH (SYSTEM ARCHITECTURE BLUEPRINT)...")
slide3 = prs.slides[2]
setup_slide_header_and_oval(slide3, 3, "TECHNICAL APPROACH", "Multi-Tier System Architecture & Operational Pipeline · Omni-Channel Ingress to Recourse")

# Top Architecture Philosophy Banner (Left Navy Accent Strip)
phil_banner = add_accent_card(slide3, Inches(0.6), Inches(1.24), Inches(12.13), Inches(0.48), CARD_BG_WHITE, BORDER_GRAY, NAVY_PRIMARY)
tf_pb = phil_banner.text_frame
tf_pb.word_wrap = True
tf_pb.vertical_anchor = MSO_ANCHOR.MIDDLE
p_pb = tf_pb.paragraphs[0]
p_pb.alignment = PP_ALIGN.CENTER
r_pb1 = p_pb.add_run()
r_pb1.text = "🏗️ Architecture Philosophy: "
r_pb1.font.name = 'Arial'
r_pb1.font.size = Pt(9.5)
r_pb1.font.bold = True
r_pb1.font.color.rgb = NAVY_PRIMARY
r_pb2 = p_pb.add_run()
r_pb2.text = "Citizen-centric C2G platform engineered under DPDP Act 2023 with client-side deterministic evaluation (<50ms), Household Graph (householdId), Explain-My-Rejection classifier, and SLA grievance escalation daemon."
r_pb2.font.name = 'Arial'
r_pb2.font.size = Pt(8.5)
r_pb2.font.color.rgb = SLATE_DARK

# ----------------- LAYER 1: OMNI-CHANNEL INGRESS (CYAN THEME) -----------------
layer1_cards = [
    ("🎙️ Multilingual Web UI", "[React 18 + TS]", "11-Lang Web Speech synthesis & voice input, stepped RangeIconPicker, confirm-back modal.", CYAN_ACCENT),
    ("🏢 CSC VLE Field Desk", "[Proxy Mode]", "Field agent assisted mode with biometric/operator ID consent & DPDP cryptographic audit logging.", ROYAL_BLUE),
    ("💬 WhatsApp Business Bot", "[Meta Webhook]", "Automated webhook executing deterministic EligibilityEngine for 100% cross-channel parity.", CYAN_ACCENT),
    ("📞 Toll-Free IVR Telephony", "[1800-202-SAHAYAK]", "Automated dialer voice pipeline for non-smartphone citizens; zero internet barrier.", ROYAL_BLUE)
]
l1_w = Inches(2.92)
l1_h = Inches(0.92)
l1_top = Inches(1.78)
l1_left = Inches(0.6)

for title, tag, desc, acc_col in layer1_cards:
    c = add_accent_card(slide3, l1_left, l1_top, l1_w, l1_h, CARD_BG_CYAN, CYAN_ACCENT, acc_col)
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.04)
    tf.margin_left = Inches(0.12)
    tf.margin_right = Inches(0.08)
    p1 = tf.paragraphs[0]
    r1 = p1.add_run()
    r1.text = title + " "
    r1.font.name = 'Arial'
    r1.font.size = Pt(8.8)
    r1.font.bold = True
    r1.font.color.rgb = NAVY_PRIMARY
    
    r_tag = p1.add_run()
    r_tag.text = tag
    r_tag.font.name = 'Arial'
    r_tag.font.size = Pt(7.2)
    r_tag.font.bold = True
    r_tag.font.color.rgb = acc_col
    
    p2 = tf.add_paragraph()
    p2.space_before = Pt(1.5)
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.4)
    r2.font.color.rgb = SLATE_MUTED
    l1_left += Inches(3.07)

# Data Bus Ribbon 1 (Dark Navy High-Tech Data Bus)
bus1 = add_card(slide3, Inches(0.6), Inches(2.74), Inches(12.13), Inches(0.24), NAVY_PRIMARY, None)
tf_b1 = bus1.text_frame
tf_b1.vertical_anchor = MSO_ANCHOR.MIDDLE
p_b1 = tf_b1.paragraphs[0]
p_b1.alignment = PP_ALIGN.CENTER
r_b1 = p_b1.add_run()
r_b1.text = "━━━━━ REST APIs & Webhooks  ·  DPDP Act 2023 Cryptographic Consent Envelope (AES-256) ━━━━━"
r_b1.font.name = 'Arial'
r_b1.font.size = Pt(7.8)
r_b1.font.bold = True
r_b1.font.color.rgb = TEXT_WHITE

# ----------------- LAYER 2: DETERMINISTIC CORE & FINANCIAL ENGINE (BLUE THEME) -----------------
layer2_cards = [
    ("⚡ Deterministic Scheme Engine", "[<50ms Pure Function]", "Zero-latency pure function evaluating statutory criteria across NSFDC, NBCFDC & NSKFDC with 100% logic parity.", ROYAL_BLUE),
    ("👨‍👩‍👦 Household Graph", "[householdId Model]", "Relational graph aggregating multi-member family welfare matches (e.g. Mother + Son) without session resets.", INDIGO_DEEP),
    ("📊 Concessional Moratorium Modeler", "[4%-8% Slab Engine]", "Statutory EMI calculator simulating 4%-8% slab rates, moratorium grace periods, capital subsidy & amortization.", ROYAL_BLUE)
]
l2_w = Inches(3.93)
l2_h = Inches(0.92)
l2_top = Inches(3.02)
l2_left = Inches(0.6)

for title, tag, desc, acc_col in layer2_cards:
    c = add_accent_card(slide3, l2_left, l2_top, l2_w, l2_h, CARD_BG_WHITE, ROYAL_BLUE, acc_col)
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.04)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.10)
    p1 = tf.paragraphs[0]
    r1 = p1.add_run()
    r1.text = title + " "
    r1.font.name = 'Arial'
    r1.font.size = Pt(9.2)
    r1.font.bold = True
    r1.font.color.rgb = ROYAL_BLUE
    
    r_tag = p1.add_run()
    r_tag.text = tag
    r_tag.font.name = 'Arial'
    r_tag.font.size = Pt(7.4)
    r_tag.font.bold = True
    r_tag.font.color.rgb = acc_col
    
    p2 = tf.add_paragraph()
    p2.space_before = Pt(1.5)
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.6)
    r2.font.color.rgb = SLATE_MUTED
    l2_left += Inches(4.10)

# Data Bus Ribbon 2
bus2 = add_card(slide3, Inches(0.6), Inches(3.98), Inches(12.13), Inches(0.24), NAVY_PRIMARY, None)
tf_b2 = bus2.text_frame
tf_b2.vertical_anchor = MSO_ANCHOR.MIDDLE
p_b2 = tf_b2.paragraphs[0]
p_b2.alignment = PP_ALIGN.CENTER
r_b2 = p_b2.add_run()
r_b2.text = "━━━━━ High-Trust Document Verification & Haversine Distance Channel Partner Routing ━━━━━"
r_b2.font.name = 'Arial'
r_b2.font.size = Pt(7.8)
r_b2.font.bold = True
r_b2.font.color.rgb = TEXT_WHITE

# ----------------- LAYER 3: TRUST, VERIFICATION & RECOURSE (GREEN THEME) -----------------
layer3_cards = [
    ("🛡️ 3-Layer Sanity Engine", "[DigiLocker + OCR]", "L1 DigiLocker Sandbox API + L2 Tesseract OCR fuzzy matching + L3 rule integrity flags (expiry, authority, format).", EMERALD_GREEN),
    ("📍 Haversine Geo-Routing", "[Nearest SCA / RRB]", "Geocodes nearest SCA / RRB / Bank branches; ranks by geographic proximity, scheme quota & live capacity.", ROYAL_BLUE),
    ("🔍 Explain-My-Rejection (USP 2)", "[Root Cause AI]", "Transforms opaque rejections into actionable paths: triages into Fixable (1-click re-upload) vs Hard Ineligible.", EMERALD_GREEN)
]
l3_w = Inches(3.93)
l3_h = Inches(0.92)
l3_top = Inches(4.26)
l3_left = Inches(0.6)

for title, tag, desc, acc_col in layer3_cards:
    c = add_accent_card(slide3, l3_left, l3_top, l3_w, l3_h, CARD_BG_GREEN, EMERALD_GREEN, acc_col)
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.04)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.10)
    p1 = tf.paragraphs[0]
    r1 = p1.add_run()
    r1.text = title + " "
    r1.font.name = 'Arial'
    r1.font.size = Pt(9.2)
    r1.font.bold = True
    r1.font.color.rgb = EMERALD_GREEN
    
    r_tag = p1.add_run()
    r_tag.text = tag
    r_tag.font.name = 'Arial'
    r_tag.font.size = Pt(7.4)
    r_tag.font.bold = True
    r_tag.font.color.rgb = acc_col
    
    p2 = tf.add_paragraph()
    p2.space_before = Pt(1.5)
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.6)
    r2.font.color.rgb = SLATE_MUTED
    l3_left += Inches(4.10)

# Data Bus Ribbon 3
bus3 = add_card(slide3, Inches(0.6), Inches(5.22), Inches(12.13), Inches(0.24), NAVY_PRIMARY, None)
tf_b3 = bus3.text_frame
tf_b3.vertical_anchor = MSO_ANCHOR.MIDDLE
p_b3 = tf_b3.paragraphs[0]
p_b3.alignment = PP_ALIGN.CENTER
r_b3 = p_b3.add_run()
r_b3.text = "━━━━━ Institutional Accountability  ·  CPGRAMS Grievance Telemetry & Ministerial Oversight Loop ━━━━━"
r_b3.font.name = 'Arial'
r_b3.font.size = Pt(7.8)
r_b3.font.bold = True
r_b3.font.color.rgb = TEXT_WHITE

# ----------------- LAYER 4: INSTITUTIONAL GOVERNANCE & TELEMETRY (INDIGO THEME) -----------------
layer4_cards = [
    ("⏱️ Grievance Auto-Escalation Daemon (USP 3)", "[48-Hr SLA Bus]", "Background cron auto-detects files stalled in review >1.5× SLA (>7 days), generating high-priority CPGRAMS-aligned tickets routed to MoSJE Support Officers for mandatory 48-hour resolution.", INDIGO_DEEP),
    ("📈 Ministry Analytics Dashboard & Funnel", "[Real-Time DPI Telemetry]", "Real-time funnel conversion metrics (Drop-off analysis), corporation quota tracking, fund allocation heatmap across 28 States & 8 UTs, and partner SLA performance tracking.", NAVY_PRIMARY)
]
l4_w = Inches(5.98)
l4_h = Inches(0.68)
l4_top = Inches(5.50)
l4_left = Inches(0.6)

for title, tag, desc, acc_col in layer4_cards:
    c = add_accent_card(slide3, l4_left, l4_top, l4_w, l4_h, CARD_BG_INDIGO, INDIGO_DEEP, acc_col)
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.04)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.12)
    p1 = tf.paragraphs[0]
    r1 = p1.add_run()
    r1.text = title + " "
    r1.font.name = 'Arial'
    r1.font.size = Pt(8.8)
    r1.font.bold = True
    r1.font.color.rgb = INDIGO_DEEP
    
    r_tag = p1.add_run()
    r_tag.text = tag
    r_tag.font.name = 'Arial'
    r_tag.font.size = Pt(7.2)
    r_tag.font.bold = True
    r_tag.font.color.rgb = acc_col
    
    p2 = tf.add_paragraph()
    p2.space_before = Pt(1)
    r2 = p2.add_run()
    r2.text = desc
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.4)
    r2.font.color.rgb = SLATE_MUTED
    l4_left += Inches(6.15)

# Bottom Production Tech Stack Ribbon
stack_bar = add_card(slide3, Inches(0.6), Inches(6.24), Inches(12.13), Inches(0.36), CARD_BG_LIGHT, BORDER_GRAY, Pt(0.75))
tf_sb = stack_bar.text_frame
tf_sb.word_wrap = True
tf_sb.vertical_anchor = MSO_ANCHOR.MIDDLE
p_sb = tf_sb.paragraphs[0]
p_sb.alignment = PP_ALIGN.CENTER
r_sb = p_sb.add_run()
r_sb.text = "💻 PRODUCTION STACK: React 18 & Vite  |  TypeScript 5.7 Strict  |  Node.js & Express  |  Web Speech API  |  Tesseract OCR  |  TailwindCSS  |  AES-256 DPDP Cryptographic Audit"
r_sb.font.name = 'Arial'
r_sb.font.size = Pt(8)
r_sb.font.bold = True
r_sb.font.color.rgb = NAVY_PRIMARY


# ==============================================================================
# SLIDE 4: FEASIBILITY AND VIABILITY (VISUAL FUNNEL & RISK DASHBOARD)
# ==============================================================================
print("Configuring Slide 4: FEASIBILITY AND VIABILITY...")
slide4 = prs.slides[3]
setup_slide_header_and_oval(slide4, 4, "FEASIBILITY AND VIABILITY", "Phased Viability Flow, Market Reach (TAM/SAM/SOM) & Strategic Risk Mitigation")

# Left Column Container (Phased Viability & Market Funnel)
card_feas_flow = add_card(slide4, Inches(0.6), Inches(1.26), Inches(5.8), Inches(5.42), CARD_BG_LIGHT, BORDER_GRAY, Pt(1))
tf_ff = card_feas_flow.text_frame
tf_ff.word_wrap = True
tf_ff.margin_top = Inches(0.08)
tf_ff.margin_left = Inches(0.16)

p_ff_h = tf_ff.paragraphs[0]
r = p_ff_h.add_run()
r.text = "🎯 4-Stage Phased Viability & Market Funnel Flow"
r.font.name = 'Arial'
r.font.size = Pt(11.5)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

# Stage 1: Technical Viability Card
s1_card = add_accent_card(slide4, Inches(0.8), Inches(1.64), Inches(5.4), Inches(0.78), CARD_BG_WHITE, BORDER_GRAY, ROYAL_BLUE)
tf_s1 = s1_card.text_frame
tf_s1.word_wrap = True
tf_s1.margin_top = Inches(0.04)
tf_s1.margin_left = Inches(0.14)
tf_s1.margin_right = Inches(0.10)
p = tf_s1.paragraphs[0]
r = p.add_run()
r.text = "STAGE 1: Technical Viability  "
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY
r_tag = p.add_run()
r_tag.text = "[<50ms Execution · Offline Voice Cache]"
r_tag.font.name = 'Arial'
r_tag.font.size = Pt(7.2)
r_tag.font.bold = True
r_tag.font.color.rgb = ROYAL_BLUE
p2 = tf_s1.add_paragraph()
r2 = p2.add_run()
r2.text = "Client-side deterministic evaluation executes in <50ms without costly GPU servers; offline-first voice caching for 2G/3G connectivity."
r2.font.name = 'Arial'
r2.font.size = Pt(7.5)
r2.font.color.rgb = SLATE_MUTED

# Connector 1
add_connector(slide4, Inches(0.8), Inches(2.44), Inches(5.4), Inches(0.18), "▼ [Non-Invasive Institutional Integration] ▼", Pt(7.2), ROYAL_BLUE)

# Stage 2: Operational Viability Card
s2_card = add_accent_card(slide4, Inches(0.8), Inches(2.64), Inches(5.4), Inches(0.78), CARD_BG_WHITE, BORDER_GRAY, ROYAL_BLUE)
tf_s2 = s2_card.text_frame
tf_s2.word_wrap = True
tf_s2.margin_top = Inches(0.04)
tf_s2.margin_left = Inches(0.14)
tf_s2.margin_right = Inches(0.10)
p = tf_s2.paragraphs[0]
r = p.add_run()
r.text = "STAGE 2: Operational & Institutional Viability  "
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY
r_tag = p.add_run()
r_tag.text = "[Zero Core CBS Changes]"
r_tag.font.name = 'Arial'
r_tag.font.size = Pt(7.2)
r_tag.font.bold = True
r_tag.font.color.rgb = ROYAL_BLUE
p2 = tf_s2.add_paragraph()
r2 = p2.add_run()
r2.text = "Non-invasive overlay on legacy SCA/RRB systems; automated grievance escalation enforces institutional SLAs without altering bank cores."
r2.font.name = 'Arial'
r2.font.size = Pt(7.5)
r2.font.color.rgb = SLATE_MUTED

# Connector 2
add_connector(slide4, Inches(0.8), Inches(3.44), Inches(5.4), Inches(0.18), "▼ [Concentric Beneficiary Market Funnel] ▼", Pt(7.2), ROYAL_BLUE)

# Stage 3: Visual Market Funnel Card (TAM / SAM / SOM Tiered)
s3_card = add_accent_card(slide4, Inches(0.8), Inches(3.64), Inches(5.4), Inches(1.35), CARD_BG_BLUE, ROYAL_BLUE, ROYAL_BLUE)
tf_s3 = s3_card.text_frame
tf_s3.word_wrap = True
tf_s3.margin_top = Inches(0.04)
tf_s3.margin_left = Inches(0.14)
tf_s3.margin_right = Inches(0.10)
p = tf_s3.paragraphs[0]
r = p.add_run()
r.text = "STAGE 3: Beneficiary Market Funnel (TAM / SAM / SOM)"
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

funnel_rows = [
    ("TAM (300M+ Marginalized): ", "All SC, OBC, Safai Karamcharis, EBC eligible for MoSJE schemes across 28 States & 8 UTs."),
    ("SAM (65M+ Credit-Seeking): ", "Households actively seeking self-employment, transport or education credit."),
    ("SOM (2.5M+ Year 1–2 Target): ", "Beneficiaries routed and sanctioned annually through digitized SCAs, RRBs & CSCs.")
]
for lbl, val in funnel_rows:
    pf = tf_s3.add_paragraph()
    pf.space_before = Pt(1.5)
    r1 = pf.add_run()
    r1.text = "▪ " + lbl
    r1.font.name = 'Arial'
    r1.font.size = Pt(7.6)
    r1.font.bold = True
    r1.font.color.rgb = ROYAL_BLUE
    r2 = pf.add_run()
    r2.text = val
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.3)
    r2.font.color.rgb = SLATE_MUTED

# Connector 3
add_connector(slide4, Inches(0.8), Inches(5.01), Inches(5.4), Inches(0.18), "▼ [Phased National Rollout Roadmap] ▼", Pt(7.2), EMERALD_GREEN)

# Stage 4: Horizontal Roadmap Strip
s4_card = add_accent_card(slide4, Inches(0.8), Inches(5.21), Inches(5.4), Inches(0.82), CARD_BG_GREEN, EMERALD_GREEN, EMERALD_GREEN)
tf_s4 = s4_card.text_frame
tf_s4.word_wrap = True
tf_s4.margin_top = Inches(0.04)
tf_s4.margin_left = Inches(0.14)
tf_s4.margin_right = Inches(0.10)
p = tf_s4.paragraphs[0]
r = p.add_run()
r.text = "STAGE 4: 3-Phase National Rollout Roadmap"
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = EMERALD_GREEN

p2 = tf_s4.add_paragraph()
p2.space_before = Pt(1.5)
r2 = p2.add_run()
r2.text = "Phase 1 (M1–4): 500 CSC VLE Pilot (5 states)  ➔  Phase 2 (M5–10): Direct SCA/RRB Quota Sync  ➔  Phase 3 (M11–18): Pan-India Scale & Bhashini Voice."
r2.font.name = 'Arial'
r2.font.size = Pt(7.5)
r2.font.bold = True
r2.font.color.rgb = SLATE_DARK

# Right Column - Strategic Risk vs Architectural Mitigation Dashboard
card_risk_mat = add_card(slide4, Inches(6.6), Inches(1.26), Inches(6.1), Inches(5.42), CARD_BG_WHITE, BORDER_GRAY, Pt(1))

risk_hdr = slide4.shapes.add_textbox(Inches(6.8), Inches(1.32), Inches(5.7), Inches(0.30))
tf_rh = risk_hdr.text_frame
tf_rh.word_wrap = True
tf_rh.margin_top = Inches(0)
tf_rh.margin_bottom = Inches(0)
p_rh = tf_rh.paragraphs[0]
r = p_rh.add_run()
r.text = "🛡️ Strategic Risk vs Architectural Mitigation Matrix"
r.font.name = 'Arial'
r.font.size = Pt(11.5)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

risk_matrix = [
    ("🚨 Risk: Low Rural Smartphone & Digital Literacy",
     "✔ Architectural Mitigation: Multilingual voice-first UI (11 languages), visual stepped range cards (no bare inputs), confirm-back loop, and 500k+ CSC VLE Assisted Desks.",
     CARD_BG_ROSE, ROSE_RED),
    ("🚨 Risk: Fraudulent Uploads & Certificate Forgery",
     "✔ Architectural Mitigation: 3-Layer Verification (L1 DigiLocker API + L2 Tesseract OCR fuzzy matching + L3 rule integrity flags on issuer and expiry).",
     CARD_BG_AMBER, AMBER_WARNING),
    ("🚨 Risk: Citizen Disillusionment & Application Opacity",
     "✔ Architectural Mitigation: Explain-My-Rejection (USP 2) surfaces plain statutory root causes and offers 1-click re-upload for fixable discrepancies.",
     CARD_BG_BLUE, ROYAL_BLUE),
    ("🚨 Risk: Bureaucratic Review Stalls & Partner Inaction",
     "✔ Architectural Mitigation: Grievance Auto-Escalation (USP 3) auto-triggers tickets when review exceeds 1.5× SLA (>7 days), enforcing 48-hr officer resolution.",
     CARD_BG_GREEN, EMERALD_GREEN),
]

y_rm = Inches(1.68)
for r_title, r_mit, bg_c, bdr_c in risk_matrix:
    rm_card = add_accent_card(slide4, Inches(6.8), y_rm, Inches(5.7), Inches(1.10), bg_c, bdr_c, bdr_c)
    tf_rc = rm_card.text_frame
    tf_rc.word_wrap = True
    tf_rc.margin_top = Inches(0.06)
    tf_rc.margin_left = Inches(0.14)
    tf_rc.margin_right = Inches(0.12)
    
    p1 = tf_rc.paragraphs[0]
    r1 = p1.add_run()
    r1.text = r_title
    r1.font.name = 'Arial'
    r1.font.size = Pt(8.8)
    r1.font.bold = True
    r1.font.color.rgb = SLATE_DARK
    
    p2 = tf_rc.add_paragraph()
    p2.space_before = Pt(2)
    r2 = p2.add_run()
    r2.text = r_mit
    r2.font.name = 'Arial'
    r2.font.size = Pt(7.8)
    r2.font.color.rgb = SLATE_MUTED
    
    y_rm += Inches(1.22)


# ==============================================================================
# SLIDE 5: IMPACT AND BENEFITS (TRANSFORMATION JOURNEY & METRIC STAT CALLOUTS)
# ==============================================================================
print("Configuring Slide 5: IMPACT AND BENEFITS...")
slide5 = prs.slides[4]
setup_slide_header_and_oval(slide5, 5, "IMPACT AND BENEFITS", "Household-Level Socio-Economic Uplift, Zero Opacity & Institutional Accountability")

# Top Feature: Dual-Track Citizen Journey Transformation Infographic
trans_card = add_card(slide5, Inches(0.6), Inches(1.24), Inches(12.13), Inches(1.36), CARD_BG_WHITE, BORDER_GRAY, Pt(1))

tf_tc = trans_card.text_frame
tf_tc.word_wrap = True
tf_tc.margin_top = Inches(0.06)
tf_tc.margin_left = Inches(0.14)

p_tc_h = tf_tc.paragraphs[0]
r = p_tc_h.add_run()
r.text = "🔄 Citizen Journey Transformation: Broken Status Quo vs SAHAYAK C2G Flow"
r.font.name = 'Arial'
r.font.size = Pt(11)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

# Row 1: The Broken Status Quo (Rose Red)
p_sq = tf_tc.add_paragraph()
p_sq.space_before = Pt(3)
r_sq1 = p_sq.add_run()
r_sq1.text = "✖ BROKEN STATUS QUO:  "
r_sq1.font.name = 'Arial'
r_sq1.font.size = Pt(8.5)
r_sq1.font.bold = True
r_sq1.font.color.rgb = ROSE_RED
r_sq2 = p_sq.add_run()
r_sq2.text = "Unaware of Schemes  ➔  Pays Broker ₹10,000 Cut  ➔  90-Day Review Blackhole  ➔  Opaque 'Rejected' Notice  ➔  Helpless Citizen Drop-off"
r_sq2.font.name = 'Arial'
r_sq2.font.size = Pt(8.2)
r_sq2.font.bold = True
r_sq2.font.color.rgb = SLATE_MUTED

# Row 2: Empowered SAHAYAK Flow (Emerald Green)
p_sy = tf_tc.add_paragraph()
p_sy.space_before = Pt(3)
r_sy1 = p_sy.add_run()
r_sy1.text = "✔ WITH SAHAYAK C2G:     "
r_sy1.font.name = 'Arial'
r_sy1.font.size = Pt(8.5)
r_sy1.font.bold = True
r_sy1.font.color.rgb = EMERALD_GREEN
r_sy2 = p_sy.add_run()
r_sy2.text = "Voice Intake in Native Tongue  ➔  Unified Family View (Mother + Son)  ➔  3-Layer Sanity  ➔  <14-Day Delivery  ➔  100% Transparency or 48-Hr Auto-Escalation!"
r_sy2.font.name = 'Arial'
r_sy2.font.size = Pt(8.2)
r_sy2.font.bold = True
r_sy2.font.color.rgb = NAVY_PRIMARY

# Middle Grid - 6 Visual Metric Stat Callout Cards
impact_stat_cards = [
    ("2.4×", "FAMILY UPLIFT (USP 1)", "2.4× higher household credit absorption via unified Cross-Scheme Household View across NSFDC, NBCFDC & NSKFDC.", ROYAL_BLUE),
    ("100%", "ZERO BARRIER & CSC DESK", "Audio-first question delivery (11 languages), stepped icon cards, confirm-back loop & CSC VLE desk empower 100% of illiterate citizens.", EMERALD_GREEN),
    ("85%", "FASTER TURNAROUND", "Slashes loan processing timeline from 90+ days to under 14 days via pre-cleared eligibility & instant OCR sanity.", ROYAL_BLUE),
    ("100%", "REJECTION TRANSPARENCY", "Explain-My-Rejection transforms rejections into actionable paths, preventing silent drop-offs, broker reliance and repeat office visits.", EMERALD_GREEN),
    ("48-Hr", "INSTITUTIONAL ACCOUNTABILITY", "SLA stall auto-escalation enforces 48-hour resolution by MoSJE Support Officers and penalizes unresponsive partner desks.", INDIGO_DEEP),
    ("100%", "OMNI-CHANNEL PARITY", "100% algorithmic logic parity across Web, WhatsApp Business bot, and toll-free IVR voice pipeline for 2G users.", ROYAL_BLUE),
]

card_w = Inches(3.93)
card_h = Inches(1.15)
col_coords = [Inches(0.6), Inches(4.70), Inches(8.80)]
row_coords = [Inches(2.70), Inches(3.95)]

for idx, (stat_num, stat_lbl, desc_txt, acc_col) in enumerate(impact_stat_cards):
    col = idx % 3
    row = idx // 3
    add_stat_card(slide5, col_coords[col], row_coords[row], card_w, card_h, stat_num, stat_lbl, desc_txt, acc_col)

# Key Metrics Strip across slide (Executive Glowing KPI Strip)
metric_banner = add_card(slide5, Inches(0.6), Inches(5.20), Inches(12.13), Inches(0.68), CARD_BG_WHITE, ROYAL_BLUE, Pt(1.2))
tf_mb = metric_banner.text_frame
tf_mb.word_wrap = True
tf_mb.vertical_anchor = MSO_ANCHOR.MIDDLE

p_mb = tf_mb.paragraphs[0]
p_mb.alignment = PP_ALIGN.CENTER

metrics = [
    ("👨‍👩‍👧 2.4× Higher", "Family Loan Absorption"),
    ("🔍 100%", "Rejection Reasons Surfaced"),
    ("⏱️ 48-Hour", "Grievance Resolution SLA"),
    ("🔒 100% DPDP Act", "Statutory Compliance"),
    ("⚡ <50ms", "Deterministic Execution")
]
for i, (metric_val, metric_lbl) in enumerate(metrics):
    r1 = p_mb.add_run()
    r1.text = metric_val + " "
    r1.font.name = 'Arial'
    r1.font.size = Pt(11)
    r1.font.bold = True
    r1.font.color.rgb = ROYAL_BLUE
    
    r2 = p_mb.add_run()
    r2.text = f"({metric_lbl})"
    r2.font.name = 'Arial'
    r2.font.size = Pt(8.5)
    r2.font.color.rgb = SLATE_MUTED
    
    if i < len(metrics) - 1:
        r_sep = p_mb.add_run()
        r_sep.text = "   |   "
        r_sep.font.size = Pt(10)
        r_sep.font.color.rgb = BORDER_GRAY

# Closing Quotes Box (with Left Royal Blue Accent Strip)
quote_box = add_accent_card(slide5, Inches(0.6), Inches(5.96), Inches(12.13), Inches(0.70), CARD_BG_LIGHT, BORDER_GRAY, ROYAL_BLUE)
tf_q = quote_box.text_frame
tf_q.word_wrap = True
tf_q.margin_top = Inches(0.06)
tf_q.margin_left = Inches(0.18)

p_q1 = tf_q.paragraphs[0]
r = p_q1.add_run()
r.text = '✔ "By unifying the household view, explaining rejections, and auto-escalating stalled applications, SAHAYAK closes the accountability loop most government tools never attempt."'
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

p_q2 = tf_q.add_paragraph()
p_q2.space_before = Pt(2)
r = p_q2.add_run()
r.text = '✔ "SAHAYAK bridges policy and people — transforming social welfare from a passive entitlement into active empowerment for every citizen."'
r.font.name = 'Arial'
r.font.size = Pt(8.8)
r.font.bold = True
r.font.color.rgb = ROYAL_BLUE


# ==============================================================================
# SLIDE 6: RESEARCH AND REFERENCES (DPI PIPELINE & STRUCTURED QUADRANTS)
# ==============================================================================
print("Configuring Slide 6: RESEARCH AND REFERENCES...")
slide6 = prs.slides[5]
setup_slide_header_and_oval(slide6, 6, "RESEARCH  AND REFERENCES", "Statutory Frameworks, Government Standards, Platform Benchmarks & Academic Citations")

# Top Feature: DPI & Statutory Synergy Flowchart Container
dpi_flow = add_card(slide6, Inches(0.6), Inches(1.24), Inches(12.13), Inches(1.05), CARD_BG_BLUE, ROYAL_BLUE, Pt(1.2))

dpi_hdr = slide6.shapes.add_textbox(Inches(0.8), Inches(1.28), Inches(11.7), Inches(0.28))
tf_dh = dpi_hdr.text_frame
tf_dh.word_wrap = False
tf_dh.margin_top = Inches(0)
tf_dh.margin_bottom = Inches(0)
tf_dh.margin_left = Inches(0)
tf_dh.margin_right = Inches(0)
p_dh = tf_dh.paragraphs[0]
r = p_dh.add_run()
r.text = "🌐 Digital Public Infrastructure (DPI) & Statutory Integration Pipeline"
r.font.name = 'Arial'
r.font.size = Pt(10.5)
r.font.bold = True
r.font.color.rgb = NAVY_PRIMARY

# 4 Interconnected DPI Pipeline Nodes
dpi_nodes = [
    ("🏛️ MoSJE Statutory Mandates", "NSFDC, NBCFDC & NSKFDC statutory lending policies and concession terms."),
    ("🏛️ India Stack (DPI) Integration", "DigiLocker sandbox APIs, Aadhaar OAuth, CPGRAMS & Bhashini voice trunk."),
    ("⚙️ SAHAYAK Deterministic Core", "Client-side rule engine, Household Graph, Explain-Rejection & SLA daemon."),
    ("🤝 Last-Mile Welfare Delivery", "500k+ CSC VLE Assisted Desks, State Channeling Agencies & Regional Rural Banks.")
]
n_w = Inches(2.78)
n_h = Inches(0.56)
n_top = Inches(1.60)
n_left = Inches(0.8)

for i, (n_title, n_desc) in enumerate(dpi_nodes):
    nc = add_card(slide6, n_left, n_top, n_w, n_h, CARD_BG_WHITE, ROYAL_BLUE, Pt(0.8))
    tf_nc = nc.text_frame
    tf_nc.word_wrap = True
    tf_nc.margin_top = Inches(0.04)
    tf_nc.margin_left = Inches(0.08)
    tf_nc.margin_right = Inches(0.08)
    pn1 = tf_nc.paragraphs[0]
    rn1 = pn1.add_run()
    rn1.text = n_title
    rn1.font.name = 'Arial'
    rn1.font.size = Pt(8.5)
    rn1.font.bold = True
    rn1.font.color.rgb = ROYAL_BLUE
    pn2 = tf_nc.add_paragraph()
    rn2 = pn2.add_run()
    rn2.text = n_desc
    rn2.font.name = 'Arial'
    rn2.font.size = Pt(6.8)
    rn2.font.color.rgb = SLATE_MUTED
    
    n_left += Inches(2.88)
    if i < len(dpi_nodes) - 1:
        add_connector(slide6, n_left - Inches(0.12), n_top + Inches(0.18), Inches(0.16), Inches(0.20), "➔", Pt(9), ROYAL_BLUE)
        n_left += Inches(0.14)

# Bottom 4 Reference Quadrants (with Left Accent Strips)
ref_cards = [
    ("1. Ministry of Social Justice & Empowerment (MoSJE) Policy Frameworks",
     [("NSFDC Lending Policy (2024-25): ", "Statutory guidelines for General Term Loans, Mahila Samriddhi Yojana (MSY), and Green Business Scheme for Scheduled Castes. Official portal: nsfdc.nic.in"),
      ("NBCFDC Credit Operations: ", "Concessional term loans and New Swarnima Scheme for Backward Classes with 4%-8% slab rates and capital subsidies. Official portal: nbcfdc.gov.in"),
      ("NSKFDC Manual Scavenger Rehabilitation: ", "Enterprise lending and Swachhta Udyami Yojana for Safai Karamcharis and their dependents. Official portal: nskfdc.nic.in")],
     NAVY_PRIMARY),
    
    ("2. Statutory Grievance Redressal & Digital Public Infrastructure",
     [("CPGRAMS & MoSJE Citizen Charter: ", "Statutory mandates for 48-hour time-bound resolution of citizen credit grievances and nodal officer escalation."),
      ("Digital Personal Data Protection (DPDP) Act, 2023: ", "MeitY provisions for purpose limitation, citizen consent capture, and zero server PII retention."),
      ("DigiLocker API Specifications (NeGD): ", "API architecture for cryptographically authenticating Aadhaar, caste, and income certificates.")],
     ROYAL_BLUE),
    
    ("3. Benchmarking & Government Platform Synergy",
     [("Synergy with myScheme.gov.in & Jan Samarth: ", "Unlike single-user search portals, SAHAYAK delivers Cross-Scheme Household Views, Explain-My-Rejection actionable paths, and SLA auto-escalation."),
      ("State Channelizing Agency (SCA) Network: ", "Analysis of State SC/OBC Finance Corporations and lead banking network operational models across Madhya Pradesh, Maharashtra and Uttar Pradesh.")],
     EMERALD_GREEN),
    
    ("4. Academic & Peer-Reviewed Research",
     [('"Last-Mile Delivery of Welfare Services in India": ', "Economic & Political Weekly (EPW, 2022). Examines bureaucratic friction, digital illiteracy barriers, and middleman leakages in welfare distribution."),
      ('"Deterministic Expert Systems vs Generative AI in Statutory Services": ', "IEEE Transactions on Computational Social Systems (2023). Demonstrates why explainable rule engines are required over LLMs in statutory credit assessment.")],
     INDIGO_DEEP),
]

ref_positions = [
    (Inches(0.6), Inches(2.38), Inches(5.95), Inches(2.05)),
    (Inches(6.78), Inches(2.38), Inches(5.95), Inches(2.05)),
    (Inches(0.6), Inches(4.52), Inches(5.95), Inches(2.05)),
    (Inches(6.78), Inches(4.52), Inches(5.95), Inches(2.05)),
]

for idx, (sec_title, bullets, acc_color) in enumerate(ref_cards):
    pos = ref_positions[idx]
    c = add_accent_card(slide6, pos[0], pos[1], pos[2], pos[3], CARD_BG_WHITE, BORDER_GRAY, acc_color)
    tf = c.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.08)
    tf.margin_left = Inches(0.14)
    tf.margin_right = Inches(0.14)
    
    p_h = tf.paragraphs[0]
    r = p_h.add_run()
    r.text = sec_title
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = NAVY_PRIMARY
    
    for b_title, b_desc in bullets:
        p = tf.add_paragraph()
        p.space_before = Pt(2)
        r1 = p.add_run()
        r1.text = "• " + b_title
        r1.font.name = 'Arial'
        r1.font.size = Pt(8)
        r1.font.bold = True
        r1.font.color.rgb = SLATE_DARK
        r2 = p.add_run()
        r2.text = b_desc
        r2.font.name = 'Arial'
        r2.font.size = Pt(7.5)
        r2.font.color.rgb = SLATE_MUTED


# ==============================================================================
# SLIDE 7: REMOVE INSTRUCTIONS SLIDE (STRICT 6 SLIDES RULE)
# ==============================================================================
print("Enforcing strict 6-slide limit: Deleting Slide 7 (Instructions slide)...")
if len(prs.slides) > 6:
    rId = prs.slides._sldIdLst[6].rId
    prs.part.drop_rel(rId)
    del prs.slides._sldIdLst[6]

print(f"Total slides remaining in presentation: {len(prs.slides)}")


# ==============================================================================
# REMOVE TEMPLATE FOOTERS ("@SIH Idea submission- Template")
# ==============================================================================
print("Purging '@SIH Idea submission- Template' footers across slides, masters, and layouts...")
footer_removed_count = 0
for slide in prs.slides:
    for s in list(slide.shapes):
        if s.has_text_frame and ('template' in s.text_frame.text.lower() or 'submission' in s.text_frame.text.lower()):
            try:
                sp = s._element
                sp.getparent().remove(sp)
                footer_removed_count += 1
            except Exception:
                pass

for m in prs.slide_masters:
    for s in list(m.shapes):
        if s.has_text_frame and ('template' in s.text_frame.text.lower() or 'submission' in s.text_frame.text.lower()):
            try:
                sp = s._element
                sp.getparent().remove(sp)
                footer_removed_count += 1
            except Exception:
                pass
    for l in m.slide_layouts:
        for s in list(l.shapes):
            if s.has_text_frame and ('template' in s.text_frame.text.lower() or 'submission' in s.text_frame.text.lower()):
                try:
                    sp = s._element
                    sp.getparent().remove(sp)
                    footer_removed_count += 1
                except Exception:
                    pass

print(f"Successfully purged {footer_removed_count} template footer shape instances.")

prs.save(OUTPUT_PATH)
print(f"[SUCCESS] Successfully created and saved: {OUTPUT_PATH}")

# Also sync to parent folder e:\SIH@\SAHAYAK_SIH2026_Presentation_AltioraX.pptx
import shutil
parent_pptx = r"e:\SIH@\SAHAYAK_SIH2026_Presentation_AltioraX.pptx"
try:
    shutil.copy2(OUTPUT_PATH, parent_pptx)
    print(f"[SYNC] Copied updated presentation to: {parent_pptx}")
except Exception as e:
    print(f"[WARN] Could not copy to parent folder: {e}")
