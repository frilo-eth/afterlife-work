'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { RolodexPrice } from '@/components/ui/RolodexPrice'
import { Switch } from '@/components/ui/switch'
import { TabItem, Tabs, TabsList } from '@/components/ui/tabs'
import { Elevated } from '@/lib/elevated'
import { AFTERLIFE_PRICE_LABEL, PRICE_TIERS } from '@/lib/price-constants'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'

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
      wordmark?: boolean | string
      domain?: string
    },
  ) => void
}

const money = (value: number) => `$${value.toLocaleString()}`

const TIERS: Record<
  TierType,
  {
    label: string
    title: string
    description: (withWordmark: boolean) => string
    features: string[]
  }
> = {
  summon: {
    label: 'Summon',
    title: 'Basic package',
    description: () => 'Essential files. Instant delivery.',
    features: ['Exclusive use licence', 'Basic editable formats (.ai, .pdf, .svg)'],
  },
  revival: {
    label: 'Revival',
    title: 'Advanced brand package',
    description: (withWordmark) =>
      `Full editable files. Delivery in ${withWordmark ? '5–7 work days' : '2–3 days'}.`,
    features: [
      'Exclusive use licence',
      'Complete editable formats (.ai, .pdf, .svg, .eps)',
      'Figma Guidelines',
      'Typography licence recommendation',
    ],
  },
  afterlife: {
    label: 'Afterlife',
    title: 'Monthly brand partnership',
    description: () => 'Ongoing design support. Billed monthly.',
    features: ['Everything in Revival', 'Dedicated design capacity', 'Cancel anytime'],
  },
}

export const PricingSelectorTabs = ({ price, onSelect }: PricingSelectorTabsProps) => {
  const shape = useShape()
  const [selectedTier, setSelectedTier] = useState<TierType>('revival')
  const [withWordmark, setWithWordmark] = useState(false)
  const [wordmarkText, setWordmarkText] = useState('')

  const isSubscription = selectedTier === 'afterlife'
  const tier = TIERS[selectedTier]

  // Derived rather than mirrored into state. The previous version recomputed
  // the same figures inside an effect and stored them, which meant the summary
  // could render one interaction behind the controls that produced it.
  const summary = useMemo(() => {
    const base =
      selectedTier === 'summon'
        ? price.summon
        : selectedTier === 'revival'
          ? price.revival
          : PRICE_TIERS.afterlife
    const wordmark = !isSubscription && withWordmark ? WORDMARK_PRICE : 0
    return { base, wordmark, total: base + wordmark }
  }, [selectedTier, withWordmark, price, isSubscription])

  const displayPrice = isSubscription
    ? AFTERLIFE_PRICE_LABEL
    : money(withWordmark ? summary.total : summary.base)

  const ctaLabel = isSubscription
    ? `Subscribe for ${AFTERLIFE_PRICE_LABEL}`
    : `Buy for ${money(withWordmark ? summary.total : summary.base)}`

  const handlePurchase = () => {
    onSelect(
      selectedTier,
      !isSubscription && withWordmark && wordmarkText ? { wordmark: wordmarkText } : undefined,
    )
  }

  return (
    <Elevated
      offset={1}
      className={cn('overflow-hidden border border-border pb-0', shape.container)}
    >
      <Card className="border-0 bg-transparent pb-0 shadow-none">
        <CardContent className="space-y-5 p-5">
          {/*
          Tier choice is the first decision. Sentence case keeps the Fluid tabs
          reading as part of the product, not a stamped product code. Content
          sits outside TabPanels so the price reel can animate across tiers
          without remounting the whole block.
        */}
          <Tabs value={selectedTier} onValueChange={(value) => setSelectedTier(value as TierType)}>
            <TabsList className="flex w-full">
              {(Object.keys(TIERS) as TierType[]).map((key) => (
                <TabItem
                  key={key}
                  value={key}
                  label={TIERS[key].label}
                  className="flex-1 justify-center"
                />
              ))}
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <RolodexPrice value={displayPrice} className="text-3xl font-bold text-foreground" />
              <div className="space-y-1">
                <h2 className="text-label font-medium text-foreground">{tier.title}</h2>
                <p className="text-caption text-foreground-muted text-pretty">
                  {tier.description(withWordmark && !isSubscription)}
                </p>
              </div>
            </div>

            {/*
            Features are the sale — they stay visible. Hiding them behind a
            disclosure buried the reason to pick one tier over another.
          */}
            <ul className="space-y-1.5">
              {tier.features.map((feature) => (
                <li key={feature} className="text-caption text-foreground-muted">
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {!isSubscription && (
            <div className="space-y-3 border-t border-border pt-4">
              <Switch
                size="compact"
                label={`Add wordmark (+${money(WORDMARK_PRICE)})`}
                checked={withWordmark}
                onToggle={() => setWithWordmark((current) => !current)}
              />

              {withWordmark && (
                <div className="space-y-2">
                  <InputGroup>
                    <InputField
                      index={0}
                      label="Brand name"
                      hideLabel
                      placeholder="Brand name"
                      value={wordmarkText}
                      onChange={setWordmarkText}
                    />
                  </InputGroup>

                  {/*
                  Summary only appears once there is something to add up —
                  otherwise it restates the price already shown above. No
                  hairline above Total: spacing alone groups the rows.
                */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-caption text-foreground-muted">
                      <span>Base</span>
                      <span className="tabular-nums">{money(summary.base)}</span>
                    </div>
                    <div className="flex justify-between text-caption text-foreground-muted">
                      <span>Wordmark</span>
                      <span className="tabular-nums">{money(summary.wordmark)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-label font-medium text-foreground">
                      <span>Total</span>
                      <span aria-live="polite" className="tabular-nums">
                        {money(summary.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Button variant="primary" size="lg" className="w-full" onClick={handlePurchase}>
            {ctaLabel}
          </Button>
        </CardContent>
      </Card>
    </Elevated>
  )
}
