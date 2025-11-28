/**
 * Color utilities for account relationship graph visualization
 * Provides consistent, accessible colors for nodes, edges, and highlights
 */

export interface ColorScheme {
  background: string;
  border: string;
  text: string;
  accent: string;
}

/**
 * Account type color mapping for node styling
 * Colors are tailwind-compatible and work in both light and dark modes
 */
export const getAccountTypeColor = (accountType?: string): ColorScheme => {
  if (!accountType) {
    return {
      background: "hsl(var(--muted))",
      border: "hsl(var(--border))",
      text: "hsl(var(--muted-foreground))",
      accent: "hsl(var(--accent))",
    };
  }

  // Hash the account type name to get a consistent color
  const hash = accountType.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colors: ColorScheme[] = [
    {
      background: "hsl(142 76% 96%)",
      border: "hsl(142 76% 45%)",
      text: "hsl(142 76% 25%)",
      accent: "hsl(142 76% 55%)",
    },
    {
      background: "hsl(221 83% 96%)",
      border: "hsl(221 83% 53%)",
      text: "hsl(221 83% 25%)",
      accent: "hsl(221 83% 63%)",
    },
    {
      background: "hsl(262 83% 96%)",
      border: "hsl(262 83% 58%)",
      text: "hsl(262 83% 25%)",
      accent: "hsl(262 83% 68%)",
    },
    {
      background: "hsl(346 77% 96%)",
      border: "hsl(346 77% 50%)",
      text: "hsl(346 77% 25%)",
      accent: "hsl(346 77% 60%)",
    },
    {
      background: "hsl(24 95% 96%)",
      border: "hsl(24 95% 53%)",
      text: "hsl(24 95% 25%)",
      accent: "hsl(24 95% 63%)",
    },
    {
      background: "hsl(198 93% 96%)",
      border: "hsl(198 93% 50%)",
      text: "hsl(198 93% 25%)",
      accent: "hsl(198 93% 60%)",
    },
    {
      background: "hsl(49 98% 96%)",
      border: "hsl(49 98% 50%)",
      text: "hsl(49 98% 25%)",
      accent: "hsl(49 98% 60%)",
    },
    {
      background: "hsl(280 65% 96%)",
      border: "hsl(280 65% 60%)",
      text: "hsl(280 65% 25%)",
      accent: "hsl(280 65% 70%)",
    },
  ];

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Dark mode version of account type colors
 */
export const getAccountTypeColorDark = (accountType?: string): ColorScheme => {
  if (!accountType) {
    return {
      background: "hsl(var(--muted))",
      border: "hsl(var(--border))",
      text: "hsl(var(--muted-foreground))",
      accent: "hsl(var(--accent))",
    };
  }

  const hash = accountType.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const colors: ColorScheme[] = [
    {
      background: "hsl(142 76% 15%)",
      border: "hsl(142 76% 45%)",
      text: "hsl(142 76% 85%)",
      accent: "hsl(142 76% 55%)",
    },
    {
      background: "hsl(221 83% 15%)",
      border: "hsl(221 83% 53%)",
      text: "hsl(221 83% 85%)",
      accent: "hsl(221 83% 63%)",
    },
    {
      background: "hsl(262 83% 15%)",
      border: "hsl(262 83% 58%)",
      text: "hsl(262 83% 85%)",
      accent: "hsl(262 83% 68%)",
    },
    {
      background: "hsl(346 77% 15%)",
      border: "hsl(346 77% 50%)",
      text: "hsl(346 77% 85%)",
      accent: "hsl(346 77% 60%)",
    },
    {
      background: "hsl(24 95% 15%)",
      border: "hsl(24 95% 53%)",
      text: "hsl(24 95% 85%)",
      accent: "hsl(24 95% 63%)",
    },
    {
      background: "hsl(198 93% 15%)",
      border: "hsl(198 93% 50%)",
      text: "hsl(198 93% 85%)",
      accent: "hsl(198 93% 60%)",
    },
    {
      background: "hsl(49 98% 20%)",
      border: "hsl(49 98% 50%)",
      text: "hsl(49 98% 90%)",
      accent: "hsl(49 98% 60%)",
    },
    {
      background: "hsl(280 65% 15%)",
      border: "hsl(280 65% 60%)",
      text: "hsl(280 65% 85%)",
      accent: "hsl(280 65% 70%)",
    },
  ];

  return colors[Math.abs(hash) % colors.length];
};

/**
 * Edge color based on relationship type
 */
export const getEdgeColor = (
  isRecent?: boolean,
  isDark?: boolean
): string => {
  if (isRecent) {
    return isDark ? "hsl(142 76% 55%)" : "hsl(142 76% 45%)";
  }
  return isDark ? "hsl(var(--border))" : "hsl(var(--border))";
};

/**
 * Node highlight colors for selection and hover states
 */
export const NODE_HIGHLIGHT_COLORS = {
  selected: {
    light: "hsl(var(--primary))",
    dark: "hsl(var(--primary))",
  },
  hover: {
    light: "hsl(var(--accent))",
    dark: "hsl(var(--accent))",
  },
  recent: {
    light: "hsl(142 76% 45%)",
    dark: "hsl(142 76% 55%)",
  },
};

/**
 * Get consistent color for a specific account address
 * Useful for maintaining color across different views
 */
export const getAccountAddressColor = (address: string): string => {
  const hash = address.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

