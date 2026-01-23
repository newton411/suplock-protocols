import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface TokenomicsData {
  totalSupply: number;
  burned: number;
  dividendsPaid: number;
  veRewards: number;
}

export const TokenomicsCharts: React.FC<{ data: TokenomicsData }> = ({ data }) => {
  const supplyChartData = {
    labels: ['Total Supply', 'Burned', 'Circulating'],
    datasets: [
      {
        data: [
          data.totalSupply,
          data.burned,
          data.totalSupply - data.burned,
        ],
        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'],
        borderColor: '#111111',
        borderWidth: 2,
      },
    ],
  };

  const revenueChartData = {
    labels: ['Buyback & Burn', 'Dividends', 'veSUPRA Rewards', 'Treasury'],
    datasets: [
      {
        label: 'Distribution %',
        data: [50, 35, 10, 5],
        backgroundColor: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520'],
        borderColor: '#111111',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#D1D5DB',
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-darkGray border border-gold rounded-lg p-6">
        <h3 className="text-gold font-bold mb-4">SUPRA Supply Distribution</h3>
        <div style={{ height: '300px' }}>
          <Pie data={supplyChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-darkGray border border-gold rounded-lg p-6">
        <h3 className="text-gold font-bold mb-4">Revenue Distribution (Pre-Floor)</h3>
        <div style={{ height: '300px' }}>
          <Bar data={revenueChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
