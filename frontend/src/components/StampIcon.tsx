export const STAMP_SHAPES = [
  { id: 'circle', label: '동그라미' },
  { id: 'star', label: '별' },
  { id: 'heart', label: '하트' },
  { id: 'check', label: '체크' },
  { id: 'diamond', label: '마름모' },
  { id: 'triangle', label: '세모' },
] as const;

export type StampShape = (typeof STAMP_SHAPES)[number]['id'];

interface Props {
  shape: string;
  className?: string;
}

function Path({ shape }: { shape: string }) {
  switch (shape) {
    case 'star':
      return <path d="M6 1L7.3 4.4L11 4.6L8.1 6.9L9.1 10.4L6 8.3L2.9 10.4L3.9 6.9L1 4.6L4.7 4.4Z" />;
    case 'heart':
      return <path d="M6 10C6 10 1.5 7.2 1.5 4.2C1.5 2.6 2.7 1.5 4.1 1.5C5 1.5 5.7 2 6 2.6C6.3 2 7 1.5 7.9 1.5C9.3 1.5 10.5 2.6 10.5 4.2C10.5 7.2 6 10 6 10Z" />;
    case 'check':
      return <path d="M2 6.2L4.8 9L10 3" />;
    case 'diamond':
      return <path d="M6 1.5L10.5 6L6 10.5L1.5 6Z" />;
    case 'triangle':
      return <path d="M6 1.5L10.5 9.5H1.5Z" />;
    case 'circle':
    default:
      return <circle cx="6" cy="6" r="4.3" />;
  }
}

export default function StampIcon({ shape, className }: Props) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <Path shape={shape} />
    </svg>
  );
}
