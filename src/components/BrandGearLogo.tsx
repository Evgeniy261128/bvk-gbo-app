import React, { useEffect, useState } from 'react';
import { ServiceType } from '../types';

interface BrandGearLogoProps {
  activeService: ServiceType;
  className?: string;
  animateOnSwitch?: boolean;
}

/**
 * BrandGearLogo
 *
 * Renders the customer's official logos:
 *   - `/logo-bvk.png` when BVK-AUTOSERVIS tab is active (green theme)
 *   - `/logo-gbo.png` when МирГбоСПб tab is active (red theme)
 *
 * The logo sits in a rounded square badge with a white background,
 * giving it a stylish inset on the dark graphite #121316 background.
 *
 * Animation: gear container rotates with a smooth transition
 * (duration-500) when the brand tab is switched in the header.
 */
const BrandGearLogo: React.FC<BrandGearLogoProps> = ({
  activeService,
  className = 'w-16 h-16',
  animateOnSwitch = true,
}) => {
  const [rotate, setRotate] = useState(false);

  useEffect(() => {
    if (animateOnSwitch) {
      setRotate(true);
      const timer = setTimeout(() => setRotate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeService, animateOnSwitch]);

  const logoSrc = activeService === 'bvo' ? '/logo-bvk.png' : '/logo-gbo.png';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className} transition-transform duration-500 ${rotate ? 'rotate-[15deg] scale-105' : 'rotate-0 scale-100'}`}
    >
      {/* Badge container: white background, rounded square */}
      <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-lg p-1.5">
        <img
          src={logoSrc}
          alt={activeService === 'bvo' ? 'BVK-AUTOSERVIS' : 'МирГбоСПб'}
          className="w-full h-full object-contain filter drop-shadow"
        />
      </div>
    </div>
  );
};

export default BrandGearLogo;
