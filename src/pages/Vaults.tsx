import React from 'react';
import { LockUI } from '../components/LockUI';

const Vaults = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Yield Vaults</h1>
      <p className="text-gray-400 mb-8">PT/YT splitting + restaking coming soon.</p>
      <LockUI /> {/* Temporary reuse for testing */}
    </div>
  );
};

export default Vaults;
