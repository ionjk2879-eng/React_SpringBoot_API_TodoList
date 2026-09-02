import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import StampIcon from './StampIcon';

interface Props {
  categoryId?: number | null;
  stampShape: string;
  hasCustomStamp?: boolean;
  version?: number;
  className?: string;
}

export default function CategoryStamp({ categoryId, stampShape, hasCustomStamp, version = 0, className }: Props) {
  const { data: blob } = useQuery({
    queryKey: ['stamp-image', categoryId, version],
    queryFn: async () => {
      const res = await client.get(`/categories/${categoryId}/stamp-image`, { responseType: 'blob' });
      return res.data as Blob;
    },
    enabled: !!hasCustomStamp && categoryId != null,
    staleTime: Infinity,
    gcTime: 0,
  });

  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob) { setUrl(null); return; }
    const objUrl = URL.createObjectURL(blob);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [blob]);

  if (hasCustomStamp && url) {
    return <img src={url} className={`${className ?? ''} object-cover rounded-full`} alt="" />;
  }
  return <StampIcon shape={stampShape} className={className} />;
}
