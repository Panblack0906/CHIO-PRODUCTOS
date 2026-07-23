import { useState, useEffect } from 'react';

interface LogoImageProps {
  className?: string;
  style?: React.CSSProperties;
  crossOrigin?: "" | "anonymous" | "use-credentials" | undefined;
  customSrc?: string;
}

export function LogoImage({ className, style, crossOrigin, customSrc }: LogoImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [logoSource, setLogoSource] = useState<string>('');

  useEffect(() => {
    // Listen to changes in customSrc or fallback to localStorage
    if (customSrc) {
      setLogoSource(customSrc);
      setUseFallback(false);
    } else {
      const storedLogo = localStorage.getItem('chio_custom_logo');
      if (storedLogo) {
        setLogoSource(storedLogo);
        setUseFallback(false);
      } else {
        setLogoSource('/images/products1/CHIO.png');
        setUseFallback(false);
      }
    }
  }, [customSrc]);

  // Handle case when storage changes in another component/tab
  useEffect(() => {
    const handleStorageChange = () => {
      if (!customSrc) {
        const storedLogo = localStorage.getItem('chio_custom_logo');
        if (storedLogo) {
          setLogoSource(storedLogo);
        } else {
          setLogoSource('/images/products1/CHIO.png');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Poll or listen to custom event to handle same-page updates
    window.addEventListener('chio_logo_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chio_logo_updated', handleStorageChange);
    };
  }, [customSrc]);

  if (useFallback || !logoSource) {
    // Beautiful, clean Pure CSS/Tailwind Badge for CHIO Productos logo
    return (
      <div
        id="chio-text-logo-fallback"
        className={`flex items-center justify-center rounded-full bg-[#FDB913] font-black text-black select-none text-center shadow-md border-2 border-white`}
        style={{
          width: style?.width || '96px',
          height: style?.height || '96px',
          fontSize: '18px',
          ...style
        }}
      >
        <span className="tracking-tighter">CHIO</span>
      </div>
    );
  }

  return (
    <img
      id="chio-logo-img"
      src={logoSource}
      alt="CHIO Productos"
      className={className}
      style={style}
      crossOrigin={crossOrigin}
      onError={() => {
        // Safe, zero external calls fallback
        setUseFallback(true);
      }}
    />
  );
}
