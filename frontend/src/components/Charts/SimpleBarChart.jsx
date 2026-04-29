import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SimpleBarChart = ({ data, labels, color = '#001440' }) => {
  const chartData = useMemo(() => {
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: color,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [data, labels, color]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 20, 64, 0.9)',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => `${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="h-16 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default SimpleBarChart;
