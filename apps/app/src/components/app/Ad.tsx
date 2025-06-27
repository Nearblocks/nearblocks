import React, { useEffect } from 'react';

declare global {
  interface Window {
    growthmate: {
      register: (unitId: string) => void;
      unregister: (unitId: string) => void;
    };
  }
}

interface IAd {
  accountId?: string;
  className?: string;
  format: string;
  network?: string;
  unitId: string;
}

const Ad: React.FC<IAd> = ({
  accountId,
  className,
  format,
  network,
  unitId,
}) => {
  useEffect(() => {
    const register = () => {
      if (window.growthmate) window.growthmate.register(unitId);
    };

    register();

    let script = document.querySelector<HTMLScriptElement>('#gm-ad-script');
    if (!script) {
      script = document.createElement('script');
      script.src = '/scripts/ad-unit-manager.react.js';
      script.id = 'gm-ad-script';
      document.head.appendChild(script);
    }

    script.addEventListener('load', register);

    return () => {
      if (window.growthmate) window.growthmate.unregister?.(unitId);
      script?.removeEventListener('load', register);
    };
  }, [unitId]);

  return (
    <a
      className={`gm-ad-unit ${className ?? ''}`}
      data-gm-account-id={accountId ?? null}
      data-gm-format={format}
      data-gm-id={unitId}
      data-gm-network={network ?? null}
    ></a>
  );
};

export { Ad };
export type { IAd };
