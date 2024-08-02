import { useState, useEffect } from 'react';

// Custom hook to detect if we are on a mobile device
const useIsMobile = (maxWidth = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < maxWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < maxWidth);
    };

    window.addEventListener('resize', handleResize);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [maxWidth]);

  return isMobile;
};

export default useIsMobile;