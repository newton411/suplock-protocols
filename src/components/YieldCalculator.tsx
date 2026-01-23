import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, DollarSign, Percent, Clock } from 'lucide-react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';

export function YieldCalculator() {
  const [deposit, setDeposit] = useState<number>(1000);
  const [years, setYears] = useState<number>(1);
  const [apy, setApy] = useState<number>(25);
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    // Basic compound interest formula: A = P(1 + r/n)^(nt)
    // Assume daily compounding for DeFi (n=365)
    const n = 365;
    const r = apy / 100;
    const t = years;
    const amount = deposit * Math.pow(1 + r / n, n * t);
    setResult(amount);
  }, [deposit, years, apy]);

  return (
    <div className="matrix-card p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/20 border border-primary/50 rounded-sm">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary uppercase tracking-tighter">Yield Simulator</h3>
          <p className="text-xs text-muted-foreground uppercase">Phase 2+ APY Projections</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-4">
            <label className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Initial Deposit ($)
            </label>
            <span className="text-primary font-mono font-bold">${deposit.toLocaleString()}</span>
          </div>
          <Slider 
            value={[deposit]} 
            onValueChange={(val) => setDeposit(val[0])} 
            max={100000} 
            step={100}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-4">
            <label className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Time Period (Years)
            </label>
            <span className="text-primary font-mono font-bold">{years} {years === 1 ? 'Year' : 'Years'}</span>
          </div>
          <Slider 
            value={[years]} 
            onValueChange={(val) => setYears(val[0])} 
            max={10} 
            step={1}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-4">
            <label className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" /> Estimated APY (%)
            </label>
            <span className="text-primary font-mono font-bold">{apy}%</span>
          </div>
          <Slider 
            value={[apy]} 
            onValueChange={(val) => setApy(val[0])} 
            max={200} 
            step={5}
            className="[&_[role=slider]]:bg-primary"
          />
        </div>

        <div className="pt-8 border-t border-primary/20">
          <div className="bg-primary/5 p-6 border border-primary/30 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <TrendingUp className="w-12 h-12" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-bold">Estimated Maturity Balance</p>
            <h4 className="text-4xl font-bold text-primary font-mono neon-text">
              ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">PROFIT:</span>
                <span className="text-primary font-bold">+${(result - deposit).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">ROI:</span>
                <span className="text-primary font-bold">{((result/deposit - 1) * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
