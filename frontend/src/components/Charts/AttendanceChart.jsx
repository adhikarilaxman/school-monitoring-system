import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AttendanceChart = ({ data, type = 'bar', period = 'daily' }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = data.map(d => {
      if (period === 'daily') {
        return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
      } else if (period === 'weekly') {
        return d.week;
      } else {
        return d.month;
      }
    });

    const commonOptions = {
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    };

    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data: data.map(d => d.students),
          backgroundColor: type === 'bar' ? 'rgba(0, 20, 64, 0.8)' : 'transparent',
          borderColor: '#001440',
          borderWidth: 2,
          ...commonOptions,
          fill: type === 'line',
        },
        {
          label: 'Teachers',
          data: data.map(d => d.teachers),
          backgroundColor: type === 'bar' ? 'rgba(56, 178, 172, 0.8)' : 'transparent',
          borderColor: '#38B2AC',
          borderWidth: 2,
          ...commonOptions,
          fill: type === 'line',
        },
        {
          label: 'Staff',
          data: data.map(d => d.staff),
          backgroundColor: type === 'bar' ? 'rgba(148, 163, 184, 0.8)' : 'transparent',
          borderColor: '#94A3B8',
          borderWidth: 2,
          ...commonOptions,
          fill: type === 'line',
        },
      ],
    };
  }, [data, type, period]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: 'Inter',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 20, 64, 0.9)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          family: 'Inter',
        },
        bodyFont: {
          size: 12,
          family: 'Inter',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => value + '%',
          font: {
            size: 11,
            family: 'Inter',
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter',
          },
        },
      },
    },
  };

  const ChartComponent = type === 'bar' ? Bar : Line;

  return (
    <div className="h-64">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
};

export default AttendanceChart;
