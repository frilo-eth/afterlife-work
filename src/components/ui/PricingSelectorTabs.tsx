'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { RolodexPrice } from '@/components/ui/RolodexPrice'
import { Switch } from '@/components/ui/switch'
import { TabItem, Tabs, TabsList } from '@/components/ui/tabs'
import { Elevated } from '@/lib/elevated'
import { useIcon } from '@/lib/icon-context'
import { PRICE_TIERS, WORDMARK_PRICE } from '@/lib/price-constants'
import { useShape } from '@/lib/shape-context'
import { cn } from '@/lib/utils'

type TierType = 'summon' | 'revival' | 'afterlife'

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

/**
 * Summon / Revival stay compact (wordmark controls fill the rest).
 * Afterlife lists more benefits in that freed space.
 */
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
    title: 'The logo, yours now',
    description: (withWordmark) =>
      withWordmark ? 'Delivery in 2–3 work days' : 'Instant download',
    features: [
      'Exclusive commercial licence',
      'Editable .ai, .pdf, and .svg',
      'One-time payment',
    ],
  },
  revival: {
    label: 'Revival',
    title: 'Full brand package',
    description: (withWordmark) =>
      withWordmark ? 'Delivery in 5–7 work days' : 'Delivery in 2–3 work days',
    features: [
      'Everything in Summon',
      'Full source + Figma guidelines',
      'Typography licence recommendation',
    ],
  },
  afterlife: {
    label: 'Afterlife',
    title: 'Monthly design partnership',
    description: () => 'Billed monthly. Pause or cancel anytime.',
    features: [
      'Everything in Revival',
      'Unlimited tasks, one at a time',
      'Weekly meeting',
      'Senior designer',
      'Web, brand, or product design',
      'Pause or cancel anytime',
    ],
  },
}

export const PricingSelectorTabs = ({ price, onSelect }: PricingSelectorTabsProps) => {
  const shape = useShape()
  const Check = useIcon('check')
  const [selectedTier, setSelectedTier] = useState<TierType>('revival')
  const [withWordmark, setWithWordmark] = useState(false)
  const [wordmarkText, setWordmarkText] = useState('')

  const isSubscription = selectedTier === 'afterlife'
  const tier = TIERS[selectedTier]
  const showWordmarkInput = !isSubscription && withWordmark

  const summary = useMemo(() => {
    const base =
      selectedTier === 'summon'
        ? price.summon
        : selectedTier === 'revival'
          ? price.revival
          : PRICE_TIERS.afterlife
    const wordmark = !isSubscription && withWordmark ? WORDMARK_PRICE : 0
    return { base, total: base + wordmark }
  }, [selectedTier, withWordmark, price, isSubscription])

  const displayPrice = money(summary.total)

  const handlePurchase = () => {
    onSelect(
      selectedTier,
      !isSubscription && withWordmark
        ? { wordmark: wordmarkText || true }
        : undefined,
    )
  }

  return (
    <Elevated
      offset={1}
      className={cn('overflow-hidden border border-border pb-0', shape.container)}
    >
      <Card className="border-0 bg-transparent pb-0 shadow-none">
        <CardContent className="flex flex-col gap-5 p-5">
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

          <div className="space-y-2">
            <div className="flex h-[3.75rem] items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col justify-center space-y-0.5">
                <h2 className="truncate text-heading-16 font-medium text-foreground">
                  {tier.title}
                </h2>
                <p className="truncate text-caption text-foreground-muted">
                  {tier.description(withWordmark && !isSubscription)}
                </p>
              </div>
              <div className="flex h-full shrink-0 flex-col items-end justify-between leading-none">
                <RolodexPrice
                  value={displayPrice}
                  className="text-3xl font-bold tabular-nums text-foreground"
                />
                <span
                  className={cn(
                    'text-metadata leading-none',
                    isSubscription ? 'text-foreground-muted' : 'invisible',
                  )}
                  aria-hidden={!isSubscription}
                >
                  /mo
                </span>
              </div>
            </div>

            {/*
              One-time tiers: 3 benefits + wordmark controls.
              Afterlife: more benefits, same min-height so the card doesn’t shrink.
            */}
            <div className="flex min-h-[9.75rem] flex-col gap-3">
              <ul className="space-y-0.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex min-w-0 items-center gap-1.5 text-metadata text-foreground-muted"
                    title={feature}
                  >
                    <Check
                      size={12}
                      strokeWidth={2}
                      className="shrink-0 text-foreground-subtle"
                      aria-hidden
                    />
                    <span className="truncate">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isSubscription ? (
                <div className="mt-auto space-y-3">
                  <div className="flex h-8 items-center justify-between gap-3">
                    <Switch
                      size="compact"
                      label="Add wordmark"
                      checked={withWordmark}
                      onToggle={() => setWithWordmark((current) => !current)}
                      className="min-w-0 flex-1 px-0"
                    />
                    <span className="shrink-0 text-metadata tabular-nums text-foreground-subtle">
                      +{money(WORDMARK_PRICE)}
                    </span>
                  </div>

                  <div
                    className={cn(
                      'min-h-9',
                      !showWordmarkInput && 'invisible pointer-events-none',
                    )}
                    aria-hidden={!showWordmarkInput}
                  >
                    <InputGroup className="w-full">
                      <InputField
                        index={0}
                        label="Brand name"
                        hideLabel
                        placeholder="Brand name"
                        value={wordmarkText}
                        onChange={setWordmarkText}
                        disabled={!showWordmarkInput}
                      />
                    </InputGroup>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <Button variant="primary" size="lg" className="mt-auto w-full" onClick={handlePurchase}>
            {isSubscription ? 'Subscribe' : 'Buy now'}
          </Button>
        </CardContent>
      </Card>
    </Elevated>
  )
}
