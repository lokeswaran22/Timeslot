import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Analytics = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dateKey, setDateKey] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [summary, setSummary] = useState({ employees: 0, activities: 0, totalPages: 0 });
    const [charts, setCharts] = useState({ productivity: [], distribution: [] });

    useEffect(() => {
        loadData();
    }, [dateKey]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sumRes, chartRes] = await Promise.all([
                fetch(`/api/analytics/summary?date=${dateKey}`),
                fetch(`/api/analytics/charts?date=${dateKey}`)
            ]);

            if (sumRes.ok) setSummary(await sumRes.json());
            if (chartRes.ok) setCharts(await chartRes.json());

        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-red-600 font-bold">Access Denied</h2>
                <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">Return to Dashboard</button>
            </div>
        );
    }

    const barData = {
        labels: charts.productivity.map(d => d.name),
        datasets: [{
            label: 'Pages',
            data: charts.productivity.map(d => d.totalPages),
            backgroundColor: '#1e3a8a',
            borderRadius: 4
        }]
    };

    const doughnutData = {
        labels: charts.distribution.map(d => d.type),
        datasets: [{
            data: charts.distribution.map(d => d.count),
            backgroundColor: ['#1e3a8a', '#d4af37', '#10b981', '#ef4444', '#f59e0b']
        }]
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="text-slate-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <label className="font-semibold text-slate-700">Select Date:</label>
                        <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} className="form-input border-slate-300 rounded-md" />
                    </div>

                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700">{summary.employees}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Active Employees</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{summary.activities}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Activities Logged</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-500">{summary.totalPages}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Total Pages</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Productivity Chart */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Employee Productivity</h3>
                        <div className="h-64">
                            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        </div>
                    </div>

                    {/* Activity Distribution */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Activity Distribution</h3>
                        <div className="h-64 flex justify-center">
                            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
