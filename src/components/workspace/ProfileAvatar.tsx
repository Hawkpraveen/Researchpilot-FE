import { useEffect, useState } from "react";

export function ProfileAvatar({ url, initials, className }: { url?: string; initials: string; className: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [url]);
  const safeImageUrl = url?.startsWith("https://") || /^data:image\/(?:png|jpeg|webp);base64,/i.test(url ?? "") ? url : undefined;

  return <span className={`user-avatar ${className}`}>
    {safeImageUrl && !imageFailed
      ? <img className="avatar-photo" src={safeImageUrl} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} />
      : initials}
  </span>;
}
