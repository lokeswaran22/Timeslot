import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateKey, setDateKey] = useState(format(new Date(), 'yyyy-MM-dd'));

    useEffect(() => {
        loadLogs();
    }, [dateKey]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/activity-log?date=${dateKey}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to load logs', error);
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

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="text-slate-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">Audit History Log</h1>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="font-semibold text-slate-700">Select Date:</label>
                        <input
                            type="date"
                            value={dateKey}
                            onChange={(e) => setDateKey(e.target.value)}
                            className="form-input border-slate-300 rounded-md"
                        />
                        <button onClick={loadLogs} className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-700">Time</th>
                                <th className="p-4 font-semibold text-slate-700">User</th>
                                <th className="p-4 font-semibold text-slate-700">Action</th>
                                <th className="p-4 font-semibold text-slate-700">Details</th>
                                <th className="p-4 font-semibold text-slate-700">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading history...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No activity logs found for this date.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="p-4 text-slate-600 whitespace-nowrap">
                                            {format(new Date(log.timestamp || log.action_timestamp), 'HH:mm:ss')}
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{log.username || log.user_id}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${log.action_type === 'create' ? 'bg-green-100 text-green-700' :
                                                    log.action_type === 'delete' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 max-w-md truncate" title={JSON.stringify(log.new_data)}>
                                            {log.time_slot}
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">{log.ip_address}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default History;
