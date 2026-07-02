import React from 'react';
import { LockUI } from '../components/LockUI'; // reuse where possible

const Swap = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Swap / Bridge</h1>
      <p className="text-gray-400 mb-8">Coming soon — powered by HyperNova routing.</p>
      <LockUI /> {/* Temporary reuse for testing */}
    </div>
  );
};

export default Swap;
