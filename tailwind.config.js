import { nextui } from '@nextui-org/react'
import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    // NextUI is being migrated out component by component. This entry can go
    // once nothing imports @nextui-org/react.
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Geist, resolved through the CSS variables next/font puts on <html>.
      // These previously named the families literally — "JetBrains Mono",
      // "Inter" — which never matched the scoped family names next/font
      // generates, so every font-mono element downloaded the webfont and then
      // rendered in system monospace.
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      // Published type roles, after Vercel's system: a fixed set with size,
      // leading and tracking bound together, so hierarchy cannot be improvised.
      // 62% of this interface previously rendered at a single size, with
      // weight and opacity doing all the work.
      fontSize: {
        display: [
          'clamp(2.75rem, 6vw, 4.5rem)',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' },
        ],
        title: [
          'clamp(2rem, 4vw, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'heading-24': [
          '1.5rem',
          { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' },
        ],
        'heading-20': [
          '1.25rem',
          { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' },
        ],
        'heading-16': ['1rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        lede: ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.005em' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        label: ['0.875rem', { lineHeight: '1.4' }],
        caption: ['0.8125rem', { lineHeight: '1.45' }],
        metadata: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
      },
      // Every colour resolves through a CSS variable so the palette is themed
      // in one place. The previous config hardcoded background/foreground,
      // which meant shadcn tokens like bg-primary had nothing to resolve to.
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        // The foreground ladder, replacing sixteen ad-hoc white/N steps.
        'foreground-muted': 'hsl(var(--foreground-muted))',
        'foreground-subtle': 'hsl(var(--foreground-subtle))',
        'border-strong': 'hsl(var(--border-strong))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Interaction states used by the @fluid components.
        hover: 'hsl(var(--hover))',
        active: 'hsl(var(--active))',
        // Fluid's eight elevation surfaces. Hex values, so no hsl() wrapper.
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-4': 'var(--surface-4)',
        'surface-5': 'var(--surface-5)',
        'surface-6': 'var(--surface-6)',
        'surface-7': 'var(--surface-7)',
        'surface-8': 'var(--surface-8)',
      },
      boxShadow: {
        'surface-1': 'var(--shadow-1)',
        'surface-2': 'var(--shadow-2)',
        'surface-3': 'var(--shadow-3)',
        'surface-4': 'var(--shadow-4)',
        'surface-5': 'var(--shadow-5)',
        'surface-6': 'var(--shadow-6)',
        'surface-7': 'var(--shadow-7)',
        'surface-8': 'var(--shadow-8)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Fluid Functionalism: motion carries information, so the easings are
      // named for what they communicate rather than for their curve.
      transitionTimingFunction: {
        // Settling into place — for anything arriving or expanding.
        settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
        // Snapping to a decision — for state that flips rather than travels.
        decide: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        instant: '120ms',
        quick: '180ms',
        settled: '320ms',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui(), tailwindcssAnimate],
}

export default config
