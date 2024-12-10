export interface Logo {
  id: string;
  title: string;
  thumbnail: string;
  tags: string[];
  description: string;
  price: {
    glyph: number;
    system: number;
    custom: string;
  };
}

export interface PricingTierProps {
  title: string;
  price: number | string;
  features: string[];
  highlighted?: boolean;
} 