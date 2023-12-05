import React, { useEffect, useState } from 'react';

const Banner1 = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust the width threshold as needed
    };

    handleResize(); // Check initial width

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Code to find the walletId
      var walletId;
      var storage = Object.entries(localStorage);
      var found = storage.find(([key]) => /wallet_auth_key*/.test(key));
      if (found) {
        walletId = JSON.parse(found[1]).accountId;
      }

      // Create and append the script tag based on device type
      const script = document.createElement('script');
      if (isMobile) {
        script.src = `https://api.pr3sence.xyz/request/content?zone_id=20&walletId=${walletId}&type=js&device=mobile`;
      } else {
        script.src = `https://api.pr3sence.xyz/request/content?zone_id=21&walletId=${walletId}&type=js&device=desktop`;
      }
      document.head.appendChild(script);

      // Clean up the script tag when the component unmounts
      return () => {
        document.head.removeChild(script);
      };
    }
    return () => {};
  }, [isMobile]);

  // Render different content based on device type
  if (isMobile) {
    return (
      <div className="w-full justify-center flex -my-3">
        <div style={{ minWidth: 300, minHeight: 100 }}>
          <div id="p-d-hp-300x-100x" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-full justify-center flex -my-3">
        <div style={{ minWidth: 970, minHeight: 90 }}>
          <div id="p-d-ll-970x-90x" />
        </div>
      </div>
    );
  }
};

export default Banner1;
