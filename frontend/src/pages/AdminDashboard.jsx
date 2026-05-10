import React, { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();

    const socket = io('/', { path: '/socket.io' });
    
    socket.on('VOTE_UPDATE', (data) => {
      setStats(prevStats => {
        if (!prevStats) return prevStats;
        return {
          ...prevStats,
          totalVotes: data.totalVotes,
          votes: data.votes
        };
      });
    });

    return () => socket.disconnect();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/admin/stats');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Not authenticated, redirect to login
        navigate('/admin/login');
      } else {
        setError('Failed to fetch stats');
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="text-center">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  // Prepare chart data
  const chartLabels = stats.nominees.map(n => n.name);
  const chartDataValues = stats.nominees.map(n => {
    const voteRecord = stats.votes.find(v => v._id === n._id);
    return voteRecord ? voteRecord.count : 0;
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Votes',
        data: chartDataValues,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // var(--accent-color)
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#f8fafc' }
      },
      title: {
        display: true,
        text: 'Live Vote Counts',
        color: '#f8fafc',
        font: { size: 18 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="glass-container animate-fade-in">
      <div className="text-center" style={{ marginBottom: '2rem' }}>
        <h2>Admin Dashboard</h2>
        <p>Live polling statistics for: <strong>{stats.poll.title}</strong></p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card glass-container">
          <div className="stat-value">{stats.totalVotes}</div>
          <div className="stat-label">Total Votes</div>
        </div>
        {stats.nominees.map((nominee, idx) => {
          const count = chartDataValues[idx];
          const percentage = stats.totalVotes === 0 ? 0 : Math.round((count / stats.totalVotes) * 100);
          return (
            <div key={nominee._id} className="stat-card glass-container" style={{ padding: '1rem' }}>
              <div className="stat-value" style={{ fontSize: '1.8rem' }}>{count}</div>
              <div className="stat-label">{nominee.name} ({percentage}%)</div>
            </div>
          );
        })}
      </div>

      <div className="chart-container glass-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AdminDashboard;
