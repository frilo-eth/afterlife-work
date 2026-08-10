#!/usr/bin/env node
/**
 * Repairs the two files the @fluid registry overwrites on every install.
 *
 * `shadcn add` rewrites shared registry dependencies wholesale rather than
 * merging, so each install drops project-specific code from lib/utils.ts and
 * reintroduces two incompatibilities in lib/icon-context.tsx. Run this after
 * any `shadcn add @fluid/...`.
 *
 * Idempotent — safe to run repeatedly.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const UTILS = 'src/lib/utils.ts'
const ICONS = 'src/lib/icon-context.tsx'

let changed = false

// 1. utils.ts — Fluid ships only cn(); the project's own helpers get dropped.
{
  const current = readFileSync(UTILS, 'utf8')
  if (!current.includes('generatePublicReference')) {
    // Recover the helpers from the last commit that still had them.
    const previous = execSync(
      `git log --format=%H -S generatePublicReference -1 -- ${UTILS}`
    )
      .toString()
      .trim()
    const original = execSync(`git show ${previous}:${UTILS}`).toString()
    const marker = original.indexOf('/**\n * Generates a display-only reference')
    if (marker === -1) throw new Error('Could not locate helpers to restore.')
    writeFileSync(UTILS, `${current.trimEnd()}\n\n${original.slice(marker)}`)
    console.log(`  restored project helpers in ${UTILS}`)
    changed = true
  }
}

// 2. icon-context.tsx — two incompatibilities with the pinned lucide version.
{
  let source = readFileSync(ICONS, 'utf8')
  const before = source

  // lucide ships icons as ForwardRefExoticComponent, which does not satisfy
  // ComponentType<IconComponentProps> because of propTypes variance.
  if (!source.includes('| LucideIcon')) {
    source = source.replace(
      'export type IconComponent = ComponentType<IconComponentProps>;',
      'export type IconComponent = ComponentType<IconComponentProps> | LucideIcon;'
    )
    if (!source.includes('type LucideIcon')) {
      source = source.replace(
        '"use client";\n',
        '"use client";\n\nimport type { LucideIcon } from "lucide-react";\n'
      )
    }
  }

  // The registry's icon map references identifiers its own import omits.
  const mapStart = source.indexOf('export const defaultIcons')
  const mapEnd = source.indexOf('const IconContext')
  const used = new Set(
    [...source.slice(mapStart, mapEnd).matchAll(/:\s*([A-Z][A-Za-z0-9_]*)\s*,/g)].map(m => m[1])
  )
  const importMatch = source.match(/import \{([^}]*)\} from "lucide-react";/)

  if (importMatch) {
    const imported = new Set(
      importMatch[1]
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
    )
    const missing = [...used].filter(name => !imported.has(name)).sort()

    if (missing.length > 0) {
      const merged = `${importMatch[1].trimEnd().replace(/,$/, '')},\n  ${missing.join(',\n  ')},\n`
      source =
        source.slice(0, importMatch.index! + 'import {'.length) +
        merged +
        source.slice(importMatch.index! + 'import {'.length + importMatch[1].length)
      console.log(`  added ${missing.length} missing lucide import(s) to ${ICONS}`)
    }
  }

  if (source !== before) {
    writeFileSync(ICONS, source)
    changed = true
  }
}

console.log(changed ? '  fluid install repaired' : '  nothing to repair')
