export const BUTTON_TYPES = [
  'primary',
  'secondary',
  'outline',
  'dashed',
  'text',
] as const;
export type ButtonTypes = typeof BUTTON_TYPES[number];

export const BUTTON_SHAPES = [
  'square',
  'round',
  'circle'
]
export type ButtonShapes = typeof BUTTON_SHAPES[number];