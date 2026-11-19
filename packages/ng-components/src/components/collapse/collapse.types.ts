export type CollapsePanelValue = string | number;

export type CollapseValue = Array<CollapsePanelValue>;

export const COLLAPSE_EXPAND_ICON_PLACEMENTS = ['left', 'right'] as const;

export type CollapseExpandIconPlacement = (typeof COLLAPSE_EXPAND_ICON_PLACEMENTS)[number];
