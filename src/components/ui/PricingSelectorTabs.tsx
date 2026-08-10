'use client'

import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputGroup, InputField } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabItem, TabPanel } from '@/components/ui/tabs'
import { Tooltip } from '@/components/ui/tooltip'

type TierType = 'summon' | 'revival' | 'afterlife'

const WORDMARK_PRICE = 1500

interface PricingSelectorTabsProps {
  price: {
    summon: number
    revival: number
    afterlife: string
  }
  // Only the identity is needed here; the component renders nothing else from
  // the logo. Kept narrow so callers are not forced to build a full record.
  logo: { id: string }
  onSelect: (
    tier: TierType,
    options?: {
      wordmark?: string
      domain?: string
    }
  ) => void
}

const money = (value: number) => `$${value.toLocaleString()}`

export const PricingSelectorTabs = ({ price, onSelect }: PricingSelectorTabsProps) => {
  const [selectedTier, setSelectedTier] = useState<TierType>('revival')
  const [withWordmark, setWithWordmark] = useState(false)
  const [wordmarkText, setWordmarkText] = useState('')

  const isCustomTier = selectedTier === 'afterlife'

  // Derived rather than mirrored into state. The previous version recomputed
  // the same figures inside an effect and stored them, which meant the summary
  // could render one interaction behind the controls that produced it.
  const summary = useMemo(() => {
    const base = selectedTier === 'summon' ? price.summon : selectedTier === 'revival' ? price.revival : 0
    const wordmark = withWordmark ? WORDMARK_PRICE : 0
    return { base, wordmark, total: base + wordmark }
  }, [selectedTier, withWordmark, price])

  const handlePurchase = () => {
    onSelect(
      selectedTier,
      withWordmark && wordmarkText ? { wordmark: wordmarkText } : undefined
    )
  }

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <Tabs value={selectedTier} onValueChange={value => setSelectedTier(value as TierType)}>
          <TabsList>
            <TabItem value="summon" label="SUMMON" />
            <TabItem value="revival" label="REVIVAL" />
            <TabItem value="afterlife" label="AFTERLIFE" />
          </TabsList>

          <TabPanel value="summon">
            <div className="mt-4 space-y-6">
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-wider opacity-50">
                  Basic package
                </span>
                <p className="mb-3 text-sm text-muted-foreground">
                  Essential files. Instant delivery.
                </p>
                {/* Figures come from the logo's price record, not from literals. */}
                <span className="text-3xl font-bold">{money(price.summon)}</span>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Exclusive use licence</li>
                <li>• Basic editable formats (.ai, .pdf, .svg)</li>
              </ul>
            </div>
          </TabPanel>

          <TabPanel value="revival">
            <div className="mt-4 space-y-6">
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-wider opacity-50">
                  Advanced brand package
                </span>
                <p className="mb-3 text-sm text-muted-foreground">
                  Full editable files. Delivery in {withWordmark ? '5–7 work days' : '2–3 days'}.
                </p>
                <span className="text-3xl font-bold">{money(price.revival)}</span>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Exclusive use licence</li>
                <li>• Complete editable formats (.ai, .pdf, .svg, .eps)</li>
                <li>• Figma files</li>
                <li>• Typography licence recommendation</li>
              </ul>
            </div>
          </TabPanel>

          <TabPanel value="afterlife">
            <div className="mt-4 space-y-6">
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-wider opacity-50">
                  Custom branding experience
                </span>
                <p className="mb-3 text-sm text-muted-foreground">
                  Bespoke brand development. Two-week sprint.
                </p>
                <span className="text-3xl font-bold">{price.afterlife}</span>
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Everything in Revival</li>
                <li className="flex items-center gap-2">
                  • Ongoing partnership
                  <Tooltip
                    content={
                      <div className="space-y-1">
                        <p>$10,000 monthly retainer afterwards</p>
                        <span className="rounded-full bg-foreground/20 px-2 py-0.5 text-xs">
                          50% off
                        </span>
                      </div>
                    }
                  >
                    {/* Focusable so the tooltip is reachable by keyboard, not hover alone. */}
                    <button type="button" aria-label="Retainer details" className="inline-flex">
                      <Info className="h-4 w-4 opacity-60" />
                    </button>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </TabPanel>
        </Tabs>

        {!isCustomTier && (
          <div className="space-y-4">
            <Switch
              label={`Add wordmark (+${money(WORDMARK_PRICE)})`}
              checked={withWordmark}
              onToggle={() => setWithWordmark(current => !current)}
            />

            {withWordmark && (
              <div className="space-y-2">
                <InputGroup>
                  <InputField
                    index={0}
                    label="Brand name"
                    placeholder="Insert brand name"
                    value={wordmarkText}
                    onChange={setWordmarkText}
                  />
                </InputGroup>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll design a custom wordmark to match your logo. Delivery within
                  48 hours.
                </p>
              </div>
            )}

            <div>
              <span className="mb-4 block font-mono text-sm uppercase tracking-wider opacity-50">
                Order summary
              </span>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base price</span>
                  <span>{money(summary.base)}</span>
                </div>
                {withWordmark && (
                  <div className="flex justify-between text-sm">
                    <span>Wordmark design</span>
                    <span>{money(summary.wordmark)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
                  <span>Total</span>
                  {/*
                    Announced politely: the total changes as a consequence of a
                    control elsewhere, so screen reader users need to hear it.
                  */}
                  <span aria-live="polite">{money(summary.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button variant="primary" size="lg" className="w-full" onClick={handlePurchase}>
          {isCustomTier ? 'Book a call' : 'Buy now'}
        </Button>
      </CardContent>
    </Card>
  )
}
