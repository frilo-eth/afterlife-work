'use client'

import { useEffect, useState } from 'react'
import { InputField, InputGroup } from '@/components/ui/input-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

export type DesignerOption = {
  id: string
  name: string
  email: string
}

export type DesignerFieldValue =
  | { mode: 'none' }
  | { mode: 'existing'; id: string }
  | { mode: 'new'; name: string; email: string }

interface DesignerFieldProps {
  value: DesignerFieldValue
  onChange: (value: DesignerFieldValue) => void
  disabled?: boolean
  /** Keep the currently assigned designer visible even if not in the fetched list */
  currentDesigner?: DesignerOption | null
}

const NONE = '__none__'
const NEW = '__new__'

export function DesignerField({ value, onChange, disabled, currentDesigner }: DesignerFieldProps) {
  const [designers, setDesigners] = useState<DesignerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const response = await fetch('/api/admin/designers')
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load designers')
        }
        if (cancelled) return
        const list = Array.isArray(data.designers)
          ? data.designers.map((d: DesignerOption) => ({
              id: d.id,
              name: d.name,
              email: d.email,
            }))
          : []
        setDesigners(list)
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load designers')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const options =
    currentDesigner && !designers.some((d) => d.id === currentDesigner.id)
      ? [currentDesigner, ...designers]
      : designers

  const selectValue = value.mode === 'existing' ? value.id : value.mode === 'new' ? NEW : NONE

  const newName = value.mode === 'new' ? value.name : ''
  const newEmail = value.mode === 'new' ? value.email : ''

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span id="designer-field-label" className="shrink-0 text-caption text-foreground-muted">
          Designer
        </span>
        <Select
          value={selectValue}
          onValueChange={(next) => {
            if (next === NONE) {
              onChange({ mode: 'none' })
              return
            }
            if (next === NEW) {
              onChange({ mode: 'new', name: newName, email: newEmail })
              return
            }
            onChange({ mode: 'existing', id: next })
          }}
          disabled={disabled || loading}
        >
          <SelectTrigger
            aria-labelledby="designer-field-label"
            className="min-w-[12rem] max-w-full"
            placeholder={loading ? 'Loading…' : 'No designer'}
          />
          <SelectContent>
            <SelectItem index={0} value={NONE}>
              No designer
            </SelectItem>
            <SelectItem index={1} value={NEW}>
              Add new designer…
            </SelectItem>
            {options.map((designer, index) => (
              <SelectItem key={designer.id} index={index + 2} value={designer.id}>
                {designer.name} ({designer.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError ? <p className="text-caption text-destructive">{loadError}</p> : null}

      {value.mode === 'new' ? (
        <InputGroup className="w-full">
          <InputField
            index={0}
            label="Designer name"
            hideLabel
            placeholder="Designer name"
            value={newName}
            onChange={(name) => onChange({ mode: 'new', name, email: newEmail })}
            disabled={disabled}
            required
          />
          <InputField
            index={1}
            label="Designer email"
            hideLabel
            type="email"
            placeholder="designer@email.com"
            value={newEmail}
            onChange={(email) => onChange({ mode: 'new', name: newName, email })}
            disabled={disabled}
            required
          />
        </InputGroup>
      ) : null}
    </div>
  )
}

export function designerFieldToFormData(value: DesignerFieldValue, formData: FormData) {
  if (value.mode === 'existing') {
    formData.append('designerId', value.id)
    return
  }
  if (value.mode === 'new') {
    formData.append('designerName', value.name.trim())
    formData.append('designerEmail', value.email.trim())
    return
  }
  formData.append('clearDesigner', 'true')
}

export function designerFieldFromLogo(logo: {
  designerId?: string | null
  designer?: { id: string } | null
}): DesignerFieldValue {
  const id = logo.designer?.id || logo.designerId
  if (id) return { mode: 'existing', id }
  return { mode: 'none' }
}

export function isDesignerFieldValid(value: DesignerFieldValue): boolean {
  if (value.mode === 'none' || value.mode === 'existing') return true
  return Boolean(value.name.trim() && value.email.trim().includes('@'))
}

export function designerFieldChanged(
  value: DesignerFieldValue,
  logo: { designerId?: string | null; designer?: { id: string } | null },
): boolean {
  const baseline = designerFieldFromLogo(logo)
  if (value.mode !== baseline.mode) return true
  if (value.mode === 'existing' && baseline.mode === 'existing') {
    return value.id !== baseline.id
  }
  return false
}
