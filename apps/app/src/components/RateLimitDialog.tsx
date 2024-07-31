import React from 'react';
const RateLimitDialog: React.FC<any> = () => {
  return (
    <div className="text-gray-500 text-sm">
      <span className="inline-block pb-1 text-gray-600 font-semibold">
        Hold up!
      </span>
      <br />
      You’ve hit the rate limit. Our servers need a moment to catch their
      breath.
      <br />
      We appreciate your patience!
    </div>
  );
};

export default RateLimitDialog;
