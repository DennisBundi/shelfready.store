# Kiamiko Catholic Church Landing Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a beautiful, single-page React website for Kiamiko Catholic Church, Kenya, using glassmorphism design over a rich background image.

**Architecture:** Vite + React. Each page section is its own component. Styles live in CSS Modules per component. Design tokens are global CSS custom properties in `index.css`. No state management library needed — this is a static display page.

**Tech Stack:** Vite, React 18, CSS Modules, Google Fonts (Playfair Display + Inter)

---

## Design Tokens (global, in `src/index.css`)

```css
:root {
  --color-primary: #6B0F1A;
  --color-accent: #C9A84C;
  --color-text-light: #ffffff;
  --glass-bg: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.20);
  --glass-blur: blur(12px);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.30);
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --radius: 16px;
  --section-padding: 80px 20px;
  --max-width: 1200px;
}
```

---

## File Structure

```
src/
├── components/
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.module.css
│   ├── Hero/
│   │   ├── Hero.jsx
│   │   └── Hero.module.css
│   ├── About/
│   │   ├── About.jsx
│   │   └── About.module.css
│   ├── MassSchedule/
│   │   ├── MassSchedule.jsx
│   │   └── MassSchedule.module.css
│   ├── Ministries/
│   │   ├── Ministries.jsx
│   │   └── Ministries.module.css
│   ├── Events/
│   │   ├── Events.jsx
│   │   └── Events.module.css
│   ├── Contact/
│   │   ├── Contact.jsx
│   │   └── Contact.module.css
│   └── Footer/
│       ├── Footer.jsx
│       └── Footer.module.css
├── App.jsx
├── App.module.css
├── index.css
└── main.jsx
assets/
└── images/
    └── README.txt
```

---

### Task 1: Vite + React Project Setup

**Files:**
- All scaffolded by Vite CLI

**Step 1: Scaffold the project**

Run in the `landing page` directory:

```bash
npm create vite@latest . -- --template react
```

When prompted: select **React**, then **JavaScript**.

**Step 2: Install dependencies**

```bash
npm install
```

**Step 3: Clean up Vite boilerplate**

Delete these files:
- `src/App.css` (will use CSS Modules instead)
- `src/assets/react.svg`
- `public/vite.svg`

Replace `src/App.jsx` with:
```jsx
function App() {
  return <div>Kiamiko</div>
}
export default App
```

Replace `src/index.css` with the design tokens + global reset (see Task 2).

**Step 4: Run dev server**

```bash
npm run dev
```

Expected: browser opens at `http://localhost:5173`, shows "Kiamiko"

**Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold Vite + React project for Kiamiko church"
```

---

### Task 2: Global Styles + Background

**Files:**
- Modify: `src/index.css`
- Create: `src/App.module.css`
- Modify: `src/App.jsx`
- Create: `assets/images/README.txt`

**Step 1: Write `src/index.css`**

```css
/* === GOOGLE FONTS === */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

/* === RESET === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); color: var(--color-text-light); min-height: 100vh; }
img { max-width: 100%; display: block; }
a { text-decoration: none; color: inherit; }

/* === DESIGN TOKENS === */
:root {
  --color-primary: #6B0F1A;
  --color-accent: #C9A84C;
  --color-text-light: #ffffff;
  --glass-bg: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.20);
  --glass-blur: blur(12px);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.30);
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --radius: 16px;
  --section-padding: 80px 20px;
  --max-width: 1200px;
}

/* === GLASS UTILITY === */
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius);
  box-shadow: var(--glass-shadow);
}

/* === SHARED SECTION STYLES === */
.sectionContainer {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--section-padding);
}
.sectionLabel {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 12px;
}
.sectionTitle {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 40px;
  color: #fff;
}
.centered { text-align: center; }
```

**Step 2: Write `src/App.module.css`**

```css
.app {
  background:
    linear-gradient(135deg, rgba(107, 15, 26, 0.88) 0%, rgba(0, 0, 0, 0.72) 100%),
    url('/assets/images/hero-bg.jpg') center / cover fixed no-repeat;
  background-color: #2a0a10;
  min-height: 100vh;
}
```

**Step 3: Update `src/App.jsx`**

```jsx
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <p style={{ color: 'white', padding: '2rem' }}>Sections go here</p>
    </div>
  )
}
export default App
```

**Step 4: Create `public/assets/images/README.txt`**

```
Place a high-resolution church or Kenyan landscape photo here named: hero-bg.jpg
Recommended: 1920x1080px minimum, compressed to <500KB
Free source: https://unsplash.com (search "catholic church kenya" or "kenya landscape")
```

Note: In Vite, static images in `public/` are served at the root, so the CSS url `/assets/images/hero-bg.jpg` will work.

**Step 5: Verify — background gradient renders in browser**

**Step 6: Commit**

```bash
git add src/index.css src/App.module.css src/App.jsx public/assets/images/README.txt
git commit -m "feat: add global design tokens, reset, and background"
```

---

### Task 3: Navbar Component

**Files:**
- Create: `src/components/Navbar/Navbar.jsx`
- Create: `src/components/Navbar/Navbar.module.css`
- Modify: `src/App.jsx`

**Step 1: Create `src/components/Navbar/Navbar.jsx`**

```jsx
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

const links = [
  { href: '#about', label: 'About' },
  { href: '#mass-schedule', label: 'Mass Times' },
  { href: '#ministries', label: 'Ministries' },
  { href: '#events', label: 'Events' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.cross}>✝</span>
          <span>Kiamiko Catholic Church</span>
        </div>

        <button
          className={styles.toggle}
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>

        <ul className={`${styles.links} ${open ? styles.open : ''}`}>
          {links.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={() => setOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
```

**Step 2: Create `src/components/Navbar/Navbar.module.css`**

```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  background: rgba(107, 15, 26, 0.30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.3s, padding 0.3s;
}
.scrolled {
  background: rgba(107, 15, 26, 0.70);
  padding: 0;
}
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 1.05rem;
  color: var(--color-accent);
}
.cross { font-size: 1.3rem; }
.links {
  list-style: none;
  display: flex;
  gap: 32px;
}
.links a {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #fff;
  transition: color 0.2s;
}
.links a:hover { color: var(--color-accent); }
.toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .toggle { display: flex; }
  .links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0; right: 0;
    flex-direction: column;
    gap: 0;
    background: rgba(107, 15, 26, 0.95);
    backdrop-filter: blur(16px);
    padding: 16px 24px 24px;
  }
  .links.open { display: flex; }
  .links li { padding: 10px 0; border-bottom: 1px solid var(--glass-border); }
}
```

**Step 3: Add Navbar to `src/App.jsx`**

```jsx
import styles from './App.module.css'
import Navbar from './components/Navbar/Navbar'

function App() {
  return (
    <div className={styles.app}>
      <Navbar />
    </div>
  )
}
export default App
```

**Step 4: Verify — navbar renders fixed to top, hamburger works on mobile (resize DevTools)**

**Step 5: Commit**

```bash
git add src/components/Navbar/ src/App.jsx
git commit -m "feat: add Navbar component with mobile toggle and scroll effect"
```

---

### Task 4: Hero Component

**Files:**
- Create: `src/components/Hero/Hero.jsx`
- Create: `src/components/Hero/Hero.module.css`
- Modify: `src/App.jsx`

**Step 1: Create `src/components/Hero/Hero.jsx`**

```jsx
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={`glass ${styles.card}`}>
        <p className={styles.subtitle}>Karibu — Welcome Home</p>
        <h1 className={styles.title}>
          Kiamiko<br />Catholic Church
        </h1>
        <p className={styles.tagline}>
          A community of faith, hope, and love in the heart of Kenya
        </p>
        <a href="#mass-schedule" className={styles.btn}>View Mass Times</a>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/Hero/Hero.module.css`**

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 20px 80px;
}
.card {
  max-width: 640px;
  padding: 56px 48px;
}
.subtitle {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 16px;
}
.title {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  color: #fff;
  margin-bottom: 20px;
}
.tagline {
  font-size: 1rem;
  font-weight: 300;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.80);
  margin-bottom: 36px;
}
.btn {
  display: inline-block;
  padding: 14px 36px;
  background: var(--color-accent);
  color: #1a1a1a;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  border-radius: 50px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 168, 76, 0.40);
}

@media (max-width: 480px) {
  .card { padding: 40px 28px; }
}
```

**Step 3: Add Hero to `src/App.jsx`**

```jsx
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'

function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
    </div>
  )
}
```

**Step 4: Verify — hero glass card centered on full-screen background, button visible**

**Step 5: Commit**

```bash
git add src/components/Hero/
git commit -m "feat: add Hero component"
```

---

### Task 5: About Component

**Files:**
- Create: `src/components/About/About.jsx`
- Create: `src/components/About/About.module.css`

**Step 1: Create `src/components/About/About.jsx`**

```jsx
import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.text}>
            <p className="sectionLabel">About Us — Kuhusu Sisi</p>
            <h2 className={styles.title}>A Parish Rooted in Faith</h2>
            <p>
              Kiamiko Catholic Church is a vibrant parish community dedicated to worshipping God,
              serving one another, and reaching out to the wider community. Guided by the teachings
              of the Catholic Church, we welcome all who seek grace, healing, and belonging.
            </p>
            <p>
              Tunakukaribisha kwa jina la Baba, na Mwana, na Roho Mtakatifu. Amen.
            </p>
          </div>
          <div className={styles.icon}>✝</div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/About/About.module.css`**

```css
.section { padding: var(--section-padding); }
.container { max-width: var(--max-width); margin: 0 auto; }
.card {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 56px 48px;
}
.text { flex: 1; }
.title {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #fff;
  margin: 12px 0 24px;
}
.text p {
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
  font-size: 1rem;
}
.icon {
  font-size: 8rem;
  color: var(--color-accent);
  opacity: 0.35;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .card { flex-direction: column; gap: 24px; padding: 36px 28px; }
  .icon { font-size: 4rem; }
}
```

**Step 3: Add About to `src/App.jsx`** (import + add `<About />` after `<Hero />`)

**Step 4: Verify — about card renders, cross icon visible**

**Step 5: Commit**

```bash
git add src/components/About/
git commit -m "feat: add About component"
```

---

### Task 6: Mass Schedule Component

**Files:**
- Create: `src/components/MassSchedule/MassSchedule.jsx`
- Create: `src/components/MassSchedule/MassSchedule.module.css`

**Step 1: Create `src/components/MassSchedule/MassSchedule.jsx`**

```jsx
import styles from './MassSchedule.module.css'

const masses = [
  { day: 'Sunday / Jumapili', time: '7:00 AM', language: 'Swahili', highlight: true },
  { day: 'Sunday / Jumapili', time: '9:30 AM', language: 'English', highlight: true },
  { day: 'Sunday / Jumapili', time: '12:00 PM', language: 'Swahili', highlight: true },
  { day: 'Monday – Friday / Jumatatu – Ijumaa', time: '6:30 AM', language: 'Swahili', highlight: false },
  { day: 'Saturday / Jumamosi', time: '8:00 AM', language: 'English', highlight: false },
]

export default function MassSchedule() {
  return (
    <section id="mass-schedule" className={styles.section}>
      <div className={styles.container}>
        <p className={`sectionLabel centered`}>Mass Times — Nyakati za Misa</p>
        <h2 className={`${styles.title} centered`}>Join Us in Worship</h2>
        <div className={`glass ${styles.card}`}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Day / Siku</th>
                  <th>Time / Saa</th>
                  <th>Language / Lugha</th>
                </tr>
              </thead>
              <tbody>
                {masses.map((m, i) => (
                  <tr key={i} className={m.highlight ? styles.highlight : ''}>
                    <td>{m.day}</td>
                    <td>{m.time}</td>
                    <td>{m.language}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/MassSchedule/MassSchedule.module.css`**

```css
.section { padding: var(--section-padding); }
.container { max-width: var(--max-width); margin: 0 auto; }
.title {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin-bottom: 40px;
}
.card { padding: 40px; }
.tableWrap { overflow-x: auto; }
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.table th {
  font-family: var(--font-heading);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
  padding: 12px 20px;
  text-align: left;
  border-bottom: 1px solid var(--glass-border);
}
.table td {
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.highlight td { color: #fff; font-weight: 500; }
.highlight { background: rgba(201, 168, 76, 0.08); }
.table tbody tr:hover { background: rgba(255, 255, 255, 0.05); }
```

**Step 3: Add MassSchedule to `src/App.jsx`**

**Step 4: Verify — table renders, Sunday rows highlighted in gold tint**

**Step 5: Commit**

```bash
git add src/components/MassSchedule/
git commit -m "feat: add MassSchedule component"
```

---

### Task 7: Ministries Component

**Files:**
- Create: `src/components/Ministries/Ministries.jsx`
- Create: `src/components/Ministries/Ministries.module.css`

**Step 1: Create `src/components/Ministries/Ministries.jsx`**

```jsx
import styles from './Ministries.module.css'

const ministries = [
  { icon: '🙏', name: 'Youth Group', desc: 'Empowering the next generation through faith, fellowship, and service. Meets every Saturday at 3 PM.' },
  { icon: '👑', name: "Women's Guild", desc: 'A sisterhood of prayer, charity, and support. Umoja wa Wanawake. Meets first Sunday monthly.' },
  { icon: '🎵', name: 'Parish Choir', desc: 'Lifting hearts through music and praise. Rehearsals every Friday at 6 PM. All voices welcome.' },
  { icon: '🤝', name: "Men's Fellowship", desc: 'Brotherhood rooted in faith and service to family and community. Meets second Sunday monthly.' },
]

export default function Ministries() {
  return (
    <section id="ministries" className={styles.section}>
      <div className={styles.container}>
        <p className="sectionLabel centered">Ministries — Huduma</p>
        <h2 className={`${styles.title} centered`}>Find Your Community</h2>
        <div className={styles.grid}>
          {ministries.map(({ icon, name, desc }) => (
            <div key={name} className={`glass ${styles.card}`}>
              <div className={styles.icon}>{icon}</div>
              <h3 className={styles.name}>{name}</h3>
              <p className={styles.desc}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/Ministries/Ministries.module.css`**

```css
.section { padding: var(--section-padding); }
.container { max-width: var(--max-width); margin: 0 auto; }
.title {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin-bottom: 40px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.card {
  padding: 36px 28px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.40);
}
.icon { font-size: 2.5rem; margin-bottom: 16px; }
.name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  color: var(--color-accent);
  margin-bottom: 12px;
}
.desc {
  font-size: 0.9rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.80);
}
```

**Step 3: Add Ministries to `src/App.jsx`**

**Step 4: Verify — 4 cards in grid, hover lift works**

**Step 5: Commit**

```bash
git add src/components/Ministries/
git commit -m "feat: add Ministries component"
```

---

### Task 8: Events Component

**Files:**
- Create: `src/components/Events/Events.jsx`
- Create: `src/components/Events/Events.module.css`

**Step 1: Create `src/components/Events/Events.jsx`**

```jsx
import styles from './Events.module.css'

const events = [
  { day: '29', month: 'Mar', title: 'Palm Sunday Procession', desc: 'Join us as we commemorate Jesus\' triumphal entry into Jerusalem. Procession begins at 8:30 AM.' },
  { day: '18', month: 'Apr', title: 'Easter Vigil Mass', desc: 'The pinnacle of the liturgical year. Holy Saturday at 7:30 PM. All parishioners and guests welcome.' },
  { day: '04', month: 'May', title: 'Parish Family Day', desc: 'A day of fun, food, and fellowship for the whole family. Grounds open from 10 AM. Karibu wote!' },
]

export default function Events() {
  return (
    <section id="events" className={styles.section}>
      <div className={styles.container}>
        <p className="sectionLabel centered">Events — Matukio</p>
        <h2 className={`${styles.title} centered`}>Upcoming Gatherings</h2>
        <div className={styles.list}>
          {events.map(({ day, month, title, desc }) => (
            <div key={title} className={`glass ${styles.card}`}>
              <div className={styles.dateBadge}>
                <span className={styles.day}>{day}</span>
                <span className={styles.month}>{month}</span>
              </div>
              <div className={styles.info}>
                <h3 className={styles.eventTitle}>{title}</h3>
                <p className={styles.eventDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/Events/Events.module.css`**

```css
.section { padding: var(--section-padding); }
.container { max-width: var(--max-width); margin: 0 auto; }
.title {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin-bottom: 40px;
}
.list { display: flex; flex-direction: column; gap: 20px; }
.card {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 28px 36px;
  transition: transform 0.2s;
}
.card:hover { transform: translateX(6px); }
.dateBadge {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
  background: rgba(201, 168, 76, 0.15);
  border: 1px solid rgba(201, 168, 76, 0.30);
  border-radius: 12px;
  padding: 12px 16px;
  flex-shrink: 0;
}
.day {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-accent);
  line-height: 1;
}
.month {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(201, 168, 76, 0.80);
}
.eventTitle {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  color: #fff;
  margin-bottom: 8px;
}
.eventDesc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

@media (max-width: 480px) {
  .card { flex-direction: column; align-items: flex-start; gap: 16px; padding: 24px; }
}
```

**Step 3: Add Events to `src/App.jsx`**

**Step 4: Verify — event cards stack, gold date badges render correctly**

**Step 5: Commit**

```bash
git add src/components/Events/
git commit -m "feat: add Events component"
```

---

### Task 9: Contact Component

**Files:**
- Create: `src/components/Contact/Contact.jsx`
- Create: `src/components/Contact/Contact.module.css`

**Step 1: Create `src/components/Contact/Contact.jsx`**

```jsx
import styles from './Contact.module.css'

const details = [
  { icon: '📍', label: 'Address', value: "Kiamiko, Murang'a County\nKenya" },
  { icon: '📞', label: 'Phone', value: '+254 700 000 000' },
  { icon: '✉️', label: 'Email', value: 'info@kiamikocatholic.co.ke' },
  { icon: '🕐', label: 'Office Hours', value: 'Mon – Fri: 8:00 AM – 5:00 PM\nSat: 9:00 AM – 1:00 PM' },
]

export default function Contact() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.container}>
        <p className="sectionLabel centered">Contact — Wasiliana Nasi</p>
        <h2 className={`${styles.title} centered`}>Find Us</h2>
        <div className={styles.grid}>
          <div className={`glass ${styles.info}`}>
            {details.map(({ icon, label, value }) => (
              <div key={label} className={styles.item}>
                <span className={styles.icon}>{icon}</span>
                <div>
                  <strong className={styles.label}>{label}</strong>
                  <p className={styles.value}>{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={`glass ${styles.mapWrap}`}>
            <iframe
              title="Kiamiko Catholic Church location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0!2d37.15!3d-0.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMCowMCJOIDM3wrAwOScwMCJF!5e0!3m2!1sen!2ske!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '12px', minHeight: '360px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
```

**Step 2: Create `src/components/Contact/Contact.module.css`**

```css
.section { padding: var(--section-padding); }
.container { max-width: var(--max-width); margin: 0 auto; }
.title {
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 3rem);
  color: #fff;
  margin-bottom: 40px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: stretch;
}
.info {
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.item { display: flex; align-items: flex-start; gap: 16px; }
.icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
.label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 4px;
}
.value {
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.80);
  white-space: pre-line;
}
.mapWrap {
  min-height: 380px;
  overflow: hidden;
  padding: 8px;
}

@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
  .mapWrap { min-height: 280px; }
}
```

**Step 3: Add Contact to `src/App.jsx`**

**Step 4: Verify — contact info and map side by side, stacks on mobile**

**Note:** Client should update the `src` URL in the iframe with a real Google Maps embed for Kiamiko's exact location.

**Step 5: Commit**

```bash
git add src/components/Contact/
git commit -m "feat: add Contact component with map embed"
```

---

### Task 10: Footer Component

**Files:**
- Create: `src/components/Footer/Footer.jsx`
- Create: `src/components/Footer/Footer.module.css`

**Step 1: Create `src/components/Footer/Footer.jsx`**

```jsx
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span>✝</span>
          <span>Kiamiko Catholic Church</span>
        </div>
        <div className={styles.socials}>
          <a href="#" aria-label="Facebook">Facebook</a>
          <a href="#" aria-label="YouTube">YouTube</a>
          <a href="#" aria-label="WhatsApp">WhatsApp</a>
        </div>
        <p className={styles.copy}>&copy; {new Date().getFullYear()} Kiamiko Catholic Church. All rights reserved.</p>
      </div>
    </footer>
  )
}
```

**Step 2: Create `src/components/Footer/Footer.module.css`**

```css
.footer {
  background: rgba(107, 15, 26, 0.50);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--glass-border);
  padding: 40px 24px;
  text-align: center;
}
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.brand {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-accent);
  display: flex;
  align-items: center;
  gap: 10px;
}
.socials { display: flex; gap: 24px; }
.socials a {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.60);
  transition: color 0.2s;
}
.socials a:hover { color: var(--color-accent); }
.copy { font-size: 0.8rem; color: rgba(255, 255, 255, 0.40); }
```

**Step 3: Add Footer to `src/App.jsx`** — also finalize App.jsx:

```jsx
import styles from './App.module.css'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import MassSchedule from './components/MassSchedule/MassSchedule'
import Ministries from './components/Ministries/Ministries'
import Events from './components/Events/Events'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className={styles.app}>
      <Navbar />
      <Hero />
      <About />
      <MassSchedule />
      <Ministries />
      <Events />
      <Contact />
      <Footer />
    </div>
  )
}
export default App
```

**Step 4: Verify — full page renders end to end, smooth scroll works between sections**

**Step 5: Commit**

```bash
git add src/components/Footer/ src/App.jsx
git commit -m "feat: add Footer and wire all components into App"
```

---

### Task 11: Scroll Fade-In Animations

**Files:**
- Create: `src/hooks/useFadeIn.js`
- Modify: each component that needs animation

**Step 1: Create `src/hooks/useFadeIn.js`**

```js
import { useEffect, useRef } from 'react'

export function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )

    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return ref
}
```

**Step 2: Apply to glass cards** — example in `About.jsx`:

```jsx
import { useFadeIn } from '../../hooks/useFadeIn'

export default function About() {
  const ref = useFadeIn()
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <div ref={ref} className={`glass ${styles.card}`}>
          {/* ... */}
        </div>
      </div>
    </section>
  )
}
```

Apply the same pattern to: `Hero` card, `MassSchedule` card, each `ministry-card`, each `event-card`, `Contact` info and map.

**Step 3: Verify — elements fade in as you scroll down the page**

**Step 4: Commit**

```bash
git add src/hooks/ src/components/
git commit -m "feat: add scroll fade-in animations via IntersectionObserver hook"
```

---

### Task 12: Build + Responsive QA

**Step 1: Run production build**

```bash
npm run build
```

Expected: `dist/` folder created with no errors.

**Step 2: Preview production build**

```bash
npm run preview
```

Open `http://localhost:4173` and verify the built site.

**Step 3: Responsive QA checklist in Chrome DevTools**

Test at 375px, 768px, 1280px:
- [ ] Navbar hamburger works on mobile
- [ ] Hero card readable and button tappable
- [ ] About stacks vertically on mobile
- [ ] Mass table scrolls horizontally on small screens
- [ ] Ministry grid collapses to 1–2 columns on mobile
- [ ] Event cards stack on mobile
- [ ] Contact grid stacks to 1 column on mobile, map still renders
- [ ] Footer centered and readable

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Kiamiko Catholic Church landing page v1.0"
```

---

## Deployment

**Netlify (recommended):**
1. `npm run build`
2. Drag `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

**GitHub Pages:**
1. Add `base: '/repo-name/'` to `vite.config.js`
2. Push `dist/` to `gh-pages` branch or use `gh-pages` npm package
