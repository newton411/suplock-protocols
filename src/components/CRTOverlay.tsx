import React from 'react';

const CRTOverlay: React.FC = () => {
  return (
    <>
      <div className="crt-overlay" />
      <div className="fixed inset-0 pointer-events-none z-[9998] crt-flicker bg-transparent" />
      <div className="fixed inset-0 pointer-events-none z-[9997] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </>
  );
};

export default CRTOverlay;
