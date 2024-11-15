// components/PriceHistoryChart.tsx
"use client"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceHistoryChartProps {
  amazonPriceData: { displayDate: string; fullDate: string; price: number }[];
  flipkartPriceData: { displayDate: string; fullDate: string; price: number }[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ amazonPriceData,flipkartPriceData }) => {
  const data = {
    labels:amazonPriceData.map((entry) => entry.displayDate),
    datasets: [
      {
        label: 'Amazon',
        data:amazonPriceData.map((entry) => entry.price),
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Flipkart',
        data: flipkartPriceData.map((entry) => entry.price),
        borderColor: 'green',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: 'Product Price History',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return amazonPriceData[index].fullDate; // Display fullDate in the tooltip
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceHistoryChart;