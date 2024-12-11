import { Logo } from '../types'

export const sortLogos = (logos: Logo[], sortBy: string) => {
  switch (sortBy) {
    case 'price-asc':
      return [...logos].sort((a, b) => a.price.glyph - b.price.glyph)
    case 'price-desc':
      return [...logos].sort((a, b) => b.price.glyph - a.price.glyph)
    case 'recent':
      // Assuming we add a dateAdded field to logos
      return [...logos].sort((a, b) => 
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
      )
    default:
      return logos
  }
} 