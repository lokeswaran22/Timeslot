import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, LogOut, ChartBar, History, UserPlus } from 'lucide-react';
import TimesheetGrid from '../components/TimesheetGrid';
import ActivityModal from '../components/ActivityModal';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [activities, setActivities] = useState({});
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ userId: null, timeSlot: null });

    // Format date for API (YYYY-MM-DD)
    const getDateKey = (date) => format(date, 'yyyy-MM-dd');

    useEffect(() => {
        loadData();
    }, [currentDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const dateKey = getDateKey(currentDate);
            const [userRes, actRes] = await Promise.all([
                fetch('/api/users'),
                fetch(`/api/activities?dateKey=${dateKey}`)
            ]);

            if (userRes.ok && actRes.ok) {
                const userData = await userRes.json();
                const actData = await actRes.json();
                setEmployees(userData);
                setActivities(actData);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const openModal = (userId, timeSlot) => {
        setModalData({ userId, timeSlot });
        setModalOpen(true);
    };

    const handleSaveActivity = async (data) => {
        try {
            const res = await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save');

            await loadData(); // Refresh data
            setModalOpen(false);
        } catch (error) {
            console.error('Save error', error);
            throw error; // Let modal handle error display
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/logogo.jpg" alt="Logo" className="h-10 w-auto" />
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">PRISTONIX</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-slate-600 font-medium hidden md:block">
                            {user?.name} ({user?.role})
                        </span>

                        {isAdmin && (
                            <>
                                <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors" title="Analytics">
                                    <ChartBar size={20} />
                                </button>
                                <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors" title="Audit Log">
                                    <History size={20} />
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                                    <UserPlus size={16} />
                                    <span className="hidden sm:inline">Add Employee</span>
                                </button>
                            </>
                        )}

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-sm transition-colors border border-red-200"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Date Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-800 font-serif">Daily Timesheet</h2>

                        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
                            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white hover:text-blue-600 rounded-md transition-all">
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center px-4 border-l border-r border-slate-200 mx-1">
                                <input
                                    type="date"
                                    value={getDateKey(currentDate)}
                                    onChange={(e) => setCurrentDate(new Date(e.target.value))}
                                    className="bg-transparent border-none focus:ring-0 text-slate-700 font-medium"
                                />
                            </div>

                            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-all mr-1">
                                Today
                            </button>

                            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white hover:text-blue-600 rounded-md transition-all">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timesheet Grid */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-500">Loading data...</div>
                    ) : (
                        <TimesheetGrid
                            employees={employees}
                            activities={activities}
                            dateKey={getDateKey(currentDate)}
                            isAdmin={isAdmin}
                            currentUserId={user?.id}
                            onOpenModal={openModal}
                        />
                    )}
                </div>

            </main>

            {/* Activity Modal */}
            <ActivityModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                userId={modalData.userId}
                timeSlot={modalData.timeSlot}
                dateKey={getDateKey(currentDate)}
                onSave={handleSaveActivity}
            />
        </div>
    );
};

export default Dashboard;
