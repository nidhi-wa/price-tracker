// components/PriceHistoryChart.tsx
"use client"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PriceHistoryChartProps {
  priceData: { displayDate: string; fullDate: string; price: number }[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ priceData }) => {
  const data = {
    labels: priceData.map((entry) => entry.displayDate),
    datasets: [
      {
        label: 'Price History',
        data: priceData.map((entry) => entry.price),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
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
            return priceData[index].fullDate; // Display fullDate in the tooltip
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceHistoryChart;