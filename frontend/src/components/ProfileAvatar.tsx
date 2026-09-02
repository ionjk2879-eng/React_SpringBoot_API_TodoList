import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';

interface Props {
  email: string;
  hasProfileImage: boolean;
  version?: number;
  className?: string;
}

export default function ProfileAvatar({ email, hasProfileImage, version = 0, className }: Props) {
  const { data: blob } = useQuery({
    queryKey: ['profile-image', version],
    queryFn: async () => {
      const res = await client.get('/users/me/profile-image', { responseType: 'blob' });
      return res.data as Blob;
    },
    enabled: hasProfileImage,
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

  if (hasProfileImage && url) {
    return <img src={url} className={`${className ?? ''} object-cover rounded-full`} alt="" />;
  }
  return (
    <div className={`${className ?? ''} rounded-full bg-orange-500 text-white font-semibold flex items-center justify-center`}>
      {email.charAt(0).toUpperCase()}
    </div>
  );
}
