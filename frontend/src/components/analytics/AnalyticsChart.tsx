import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../common/Card';

interface DataPoint {
  date?: string;
  name?: string;
  [key: string]: any;
}

interface AnalyticsChartProps {
  data: DataPoint[];
  title: string;
  type?: 'line' | 'area' | 'bar';
  dataKeys: {
    key: string;
    color: string;
    name?: string;
  }[];
  xAxisKey?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  type = 'line',
  dataKeys,
  xAxisKey = 'date',
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    const axisProps = {
      stroke: '#4a4a4a',
      style: { fontSize: '12px', fill: '#9ca3af' },
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              {dataKeys.map((dk, index) => (
                <linearGradient key={index} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={dk.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={dk.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {dataKeys.map((dk, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                fill={`url(#gradient-${dk.key})`}
                name={dk.name || dk.key}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {dataKeys.map((dk, index) => (
              <Bar key={index} dataKey={dk.key} fill={dk.color} name={dk.name || dk.key} />
            ))}
          </BarChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey={xAxisKey} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            {dataKeys.map((dk, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dk.key}
                stroke={dk.color}
                strokeWidth={2}
                name={dk.name || dk.key}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <Card padding="lg">
      <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </Card>
  );
};

export default AnalyticsChart;
