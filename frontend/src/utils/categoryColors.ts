export interface CategoryColorSwatch {
  id: string;
  dot: string;
  bg: string;
  text: string;
}

export const CATEGORY_COLORS: CategoryColorSwatch[] = [
  { id: 'orange', dot: 'bg-orange-500',    bg: 'bg-orange-50',        text: 'text-orange-700' },
  { id: 'green',  dot: 'bg-green-500',     bg: 'bg-green-50',         text: 'text-green-700' },
  { id: 'blue',   dot: 'bg-blue-500',      bg: 'bg-blue-50',          text: 'text-blue-700' },
  { id: 'red',    dot: 'bg-red-500',       bg: 'bg-red-50',           text: 'text-red-700' },
  { id: 'purple', dot: 'bg-[#AF52DE]',     bg: 'bg-[#F6ECFB]',        text: 'text-[#8944AB]' },
  { id: 'pink',   dot: 'bg-[#FF2D55]',     bg: 'bg-[#FFEAEF]',        text: 'text-[#C81E42]' },
  { id: 'teal',   dot: 'bg-[#30B0C7]',     bg: 'bg-[#E6F6F9]',        text: 'text-[#1D8194]' },
];

export function findCategoryColor(color: string | null | undefined): CategoryColorSwatch | null {
  return CATEGORY_COLORS.find(c => c.id === color) ?? null;
}

export function categoryColorDotClass(color: string | null | undefined): string | null {
  return findCategoryColor(color)?.dot ?? null;
}
