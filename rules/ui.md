# UI Rules

## Purpose
This document defines UI/UX standards for the **Department Event Management System**.  
All frontend development must follow these rules to ensure **consistency, accessibility, and a professional university look**.

---

## 🧩 Framework & Tools
- React.js (functional components only)
- Tailwind CSS or Bootstrap (choose one and stay consistent)
- No inline hardcoded colors
- Use theme variables for all colors

---

## 🎨 Theme & Color Usage

### 🌤️ Light Theme Palette

| Usage | Color |
|-----|------|
| Primary | `#3674B5` |
| Secondary | `#578FCA` |
| Accent | `#A1E3F9` |
| Background | `#D1F8EF` |

**Rules**
- Page background: `#D1F8EF`
- Headers & primary buttons: `#3674B5`
- Secondary buttons & highlights: `#578FCA`
- Cards & badges: `#A1E3F9`
- Text: Dark gray (`#1f2933` or similar)

---

### 🌙 Dark Theme Palette

| Usage | Color |
|-----|------|
| Background | `#151965` |
| Surface | `#32407B` |
| Card | `#515585` |
| Accent | `#46B5D1` |

**Rules**
- Page background: `#151965`
- Navbar & sidebar: `#32407B`
- Cards & containers: `#515585`
- Buttons, links, active states: `#46B5D1`
- Text: White or light gray

---

## 🔄 Theme Switching
- Theme toggle must be global
- Persist theme preference using `localStorage`
- No mixing of light and dark theme colors
- Use CSS variables or Tailwind theme config

---

## 🧱 Component Design Rules

### Buttons
- Primary: Theme primary color
- Secondary: Theme secondary color
- Hover: Slightly darker shade
- Disabled: 40–50% opacity

### Cards
- Rounded corners
- Soft shadows only
- No heavy borders
- Padding must be consistent

### Forms
- Controlled inputs only
- Clear labels and placeholders
- Focus state uses accent color
- Error messages shown below fields

---

## 📱 Responsiveness
- Mobile-first approach
- Must support:
  - Mobile
  - Tablet
  - Desktop
- Use grid and flex layouts
- No fixed widths unless required

---

## 🧠 UX Rules
- Show loading indicators
- Show success and error feedback
- Confirm destructive actions (delete, cancel)
- Keep navigation simple and role-based

---

## 🧼 Code Quality
- One component = one responsibility
- Reusable components (Button, Card, Modal)
- Avoid deeply nested JSX
- Keep files small and readable

---

## 🚫 Restrictions
- Do not hardcode colors
- Do not use random UI libraries
- Do not mix multiple design systems
- Avoid pure black (`#000000`) and pure white (`#FFFFFF`)

---

## ♿ Accessibility
- Maintain proper contrast ratio
- Buttons and links must be clearly visible
- Font sizes must be readable
- Icons must have labels or tooltips

---

## 📌 Final Note
All UI agents and developers must strictly follow this file.  
Any UI change must comply with the defined **theme, layout, and UX rules**.
