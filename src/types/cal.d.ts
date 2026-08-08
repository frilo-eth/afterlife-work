interface CalApi {
  init: (options: { origin: string }) => void;
  inline: (options: {
    elementOrSelector: string;
    calLink: string;
    config?: {
      theme?: 'dark' | 'light';
      layout?: 'month_view' | 'week_view' | 'day_view';
      styles?: {
        branding?: {
          brandColor?: string;
        };
        body?: {
          background?: string;
        };
      };
    };
  }) => void;
  ui?: (options: {
    theme?: 'dark' | 'light';
    styles?: {
      branding?: {
        brandColor?: string;
      };
      body?: {
        background?: string;
      };
    };
  }) => void;
  namespace?: (name: string) => void;
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[];
}

interface Window {
  Cal?: CalApi | ((...args: unknown[]) => void);
} 