# Kiamiko Catholic Church — Website Design

**Date:** 2026-03-19
**Type:** Static landing page (HTML/CSS/JS)
**Client:** Kiamiko Catholic Church, Kenya

---

## Goal

A single, beautiful landing page that serves as the church's online presence. Prioritizes aesthetics with a glassmorphism design system over a rich background.

---

## Branding

| Token | Value |
|---|---|
| Primary | Deep Burgundy `#6B0F1A` |
| Accent | Gold `#C9A84C` |
| Glass bg | `rgba(255, 255, 255, 0.1)` |
| Glass border | `rgba(255, 255, 255, 0.2)` |
| Backdrop blur | `blur(12px)` |
| Heading font | Playfair Display (serif) |
| Body font | Inter (sans-serif) |

Languages: English + Swahili

---

## Page Sections (top to bottom)

### 1. Navbar
- Fixed/sticky, glass background
- Logo/church name left, nav links right (Home, About, Mass Times, Ministries, Contact)
- Hamburger menu on mobile

### 2. Hero
- Full-screen background (church or Kenyan landscape image)
- Dark overlay + glass card centered
- Church name: "Kiamiko Catholic Church"
- Tagline (e.g. "Karibu — Welcome Home")
- CTA button: "View Mass Times"

### 3. About / Welcome
- Glass card, two-column (text + image)
- Brief welcome message from the parish
- English + optional Swahili subtitle

### 4. Mass Schedule
- Glass table/card
- Days and times for all weekly Masses
- Highlighted Sunday Masses

### 5. Ministries
- 4 glass cards in a grid
- Youth Group, Women's Guild, Choir, Men's Fellowship
- Icon + name + one-line description each

### 6. Upcoming Events
- 2–3 event cards (glass)
- Date badge, event title, short description

### 7. Contact & Location
- Glass card: address, phone, email
- Embedded Google Map (iframe)

### 8. Footer
- Church name, social media icons
- Copyright line

---

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — glassmorphism via `backdrop-filter`, CSS custom properties for tokens
- **Vanilla JS** — mobile menu toggle, smooth scroll
- **Google Fonts** — Playfair Display + Inter
- **No build tools** — open `index.html` directly or deploy to Netlify/GitHub Pages

---

## File Structure

```
landing page/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   └── images/
└── docs/
    └── plans/
```

---

## Success Criteria

- Loads fast (no framework overhead)
- Looks stunning on mobile and desktop
- Glass effect renders correctly (Chrome, Firefox, Safari, Edge)
- All sections visible and readable against background
