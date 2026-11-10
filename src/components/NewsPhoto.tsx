import { useNewsImage } from "@/hooks/useCountyNews";
import { Newspaper } from "lucide-react";
export default function NewsPhoto({ url, alt, className = "" }: { url: string | null; alt: string; className?: string }) {
  const { data } = useNewsImage(url);
  return data ? <img src={data} alt={alt} className={`w-full object-cover ${className}`} /> : <div className={`bg-muted grid place-items-center ${className}`}><Newspaper className="h-8 w-8 text-muted-foreground" /></div>;
}