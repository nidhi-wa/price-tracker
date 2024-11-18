// components/PriceHistoryChart.tsx
"use client"
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components with Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


interface PriceHistoryChartProps {
  amazonPriceData: { displayDate: string; fullDate: string; price: number }[];
  flipkartPriceData: { displayDate: string; fullDate: string; price: number }[];
  competitorPriceData: { displayDate: string; fullDate: string; price: number }[];
  selectedSource: "amazon" | "flipkart"; // Determines whether to show Amazon or Flipkart data
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  amazonPriceData,
  flipkartPriceData,
  competitorPriceData,
  selectedSource,
}) => {
  // Determine the primary data source based on the selectedSource prop
  const selectedData =
    selectedSource === "amazon"
      ? amazonPriceData
      : selectedSource === "flipkart"
      ? flipkartPriceData
      : competitorPriceData;
  // const selectedData = selectedSource === "amazon" ? amazonPriceData : flipkartPriceData;
  const selectedLabel = selectedSource === "amazon" ? "Amazon Price History" : "Flipkart Price History";

  const data = {
    labels: selectedData.map((entry) => entry.displayDate),
    datasets: [
      {
        label: selectedLabel,
        data: selectedData.map((entry) => entry.price),
        borderColor: selectedSource === "amazon" ? "blue" : "green",
        fill: false,
      },
      {
        label: "Competitor Price History",
        data: competitorPriceData.map((entry) => entry.price),
        borderColor: "red",
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
        text: "Product Price History",
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            return selectedSource === "amazon"
              ? amazonPriceData[index].fullDate
              : competitorPriceData[index].fullDate; // Tooltip adapts based on the selected data source
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceHistoryChart;

// interface PriceHistoryChartProps {
//   amazonPriceData: { displayDate: string; fullDate: string; price: number }[];
//   flipkartPriceData: { displayDate: string; fullDate: string; price: number }[];
//   competitorPriceData: { displayDate: string; fullDate: string; price: number }[];
  
// }

// const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ amazonPriceData,flipkartPriceData,competitorPriceData }) => {
//   const data = {
//     labels:amazonPriceData.map((entry) => entry.displayDate),
//     datasets: [
//       {
//         label: 'Amazon',
//         data:amazonPriceData.map((entry) => entry.price),
//         borderColor: 'blue',
//         fill: false,
//       },
//       {
//         label: 'Flipkart',
//         data: flipkartPriceData.map((entry) => entry.price),
//         borderColor: 'green',
//         fill: false,
//       },
//       {
//         label: 'Competitor',
//         data: competitorPriceData.map((entry) => entry.price),
//         borderColor: 'green',
//         fill: false,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: true,
//       },
//       title: {
//         display: true,
//         text: 'Product Price History',
//       },
//       tooltip: {
//         callbacks: {
//           title: (tooltipItems: any) => {
//             const index = tooltipItems[0].dataIndex;
//             return amazonPriceData[index].fullDate; // Display fullDate in the tooltip
//           },
//         },
//       },
//     },
//   };

//   return <Line data={data} options={options} />;
// };

// export default PriceHistoryChart;