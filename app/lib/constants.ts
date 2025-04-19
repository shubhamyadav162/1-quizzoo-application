// Define language constants to avoid circular dependencies
export const LANGUAGE_EN = 'en' as const;
export const LANGUAGE_HI = 'hi' as const;

export type Language = typeof LANGUAGE_EN | typeof LANGUAGE_HI; 