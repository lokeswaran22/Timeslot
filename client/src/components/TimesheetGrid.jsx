import { useMemo } from 'react';
import { Plus } from 'lucide-react';

const TIME_SLOTS = [
    '9:00-10:00', '10:00-11:00', '11:00-11:10', '11:10-12:00',
    '12:00-01:00', '01:00-01:40', '01:40-03:00', '03:00-03:50',
    '03:50-04:00', '04:00-05:00', '05:00-06:00'
];

const TimesheetGrid = ({ employees, activities, dateKey, isAdmin, currentUserId, onOpenModal }) => {

    // Filter employees based on role
    const visibleEmployees = useMemo(() => {
        if (isAdmin) return employees.filter(e => e.role !== 'admin');
        return employees.filter(e => e.id === currentUserId);
    }, [employees, isAdmin, currentUserId]);

    const getActivity = (userId, slot) => {
        return activities[dateKey]?.[userId]?.[slot] || [];
    };

    const calculateStats = (userId) => {
        const slots = activities[dateKey]?.[userId] || {};
        let stats = { proof: 0, epub: 0, calibr: 0 };

        Object.values(slots).forEach(actList => {
            if (Array.isArray(actList)) {
                actList.forEach(act => {
                    const p = parseInt(act.pagesDone) || 0;
                    if (act.type === 'proof') stats.proof += p;
                    if (act.type === 'epub') stats.epub += p;
                    if (act.type === 'calibr') stats.calibr += p;
                });
            }
        });
        return stats;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th rowSpan="2" className="px-6 py-3 font-bold sticky left-0 bg-slate-50 z-20 border-r border-slate-200 min-w-[150px]">
                            Employee Name
                        </th>
                        <th colSpan="3" className="px-4 py-2 text-center border-r border-slate-200 bg-blue-50/50 text-blue-800">
                            Total Pages
                        </th>
                        {TIME_SLOTS.map(slot => (
                            <th key={slot} rowSpan="2" className="px-4 py-3 min-w-[140px] border-r border-slate-200 text-center whitespace-nowrap">
                                {slot}
                            </th>
                        ))}
                        {isAdmin && <th rowSpan="2" className="px-4 py-3 text-center">Actions</th>}
                    </tr>
                    <tr>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-blue-50/50 text-xs font-semibold">Proof</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-blue-50/50 text-xs font-semibold">Epub</th>
                        <th className="px-2 py-2 text-center border-r border-slate-200 bg-blue-50/50 text-xs font-semibold">Calibr</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {visibleEmployees.length === 0 ? (
                        <tr><td colSpan={100} className="p-8 text-center text-slate-400">No employees found</td></tr>
                    ) : (
                        visibleEmployees.map(emp => {
                            const stats = calculateStats(emp.id);
                            return (
                                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 sticky left-0 bg-white border-r border-slate-100 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        {emp.name}
                                    </td>

                                    {/* Stats */}
                                    <td className="px-2 py-4 text-center font-bold text-slate-700 border-r border-slate-100">{stats.proof || '-'}</td>
                                    <td className="px-2 py-4 text-center font-bold text-slate-700 border-r border-slate-100">{stats.epub || '-'}</td>
                                    <td className="px-2 py-4 text-center font-bold text-slate-700 border-r border-slate-100">{stats.calibr || '-'}</td>

                                    {/* Time Slots */}
                                    {TIME_SLOTS.map(slot => {
                                        const acts = getActivity(emp.id, slot);
                                        const hasActivity = acts.length > 0;

                                        return (
                                            <td key={slot} className="px-2 py-2 border-r border-slate-100 align-top h-24">
                                                <div
                                                    className={`h-full w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all
                             ${hasActivity
                                                            ? 'border-transparent bg-white'
                                                            : 'border-slate-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer group'
                                                        }`}
                                                    onClick={() => {
                                                        if (!isAdmin && onOpenModal) {
                                                            onOpenModal(emp.id, slot);
                                                        }
                                                    }}
                                                >
                                                    {hasActivity ? (
                                                        acts.map((act, idx) => (
                                                            <div key={idx} className="w-full mb-1 last:mb-0">
                                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-full text-center
                                   ${act.type === 'break' ? 'bg-amber-100 text-amber-700' :
                                                                        act.type === 'lunch-break' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {act.type}
                                                                </span>
                                                                {act.description && (
                                                                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight text-center line-clamp-2">
                                                                        {act.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        !isAdmin && <Plus className="text-slate-300 group-hover:text-blue-400" size={16} />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}

                                    {isAdmin && (
                                        <td className="px-4 py-4 text-center">
                                            <button className="text-slate-400 hover:text-blue-600 mr-2">✎</button>
                                            <button className="text-slate-400 hover:text-red-600">🗑</button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TimesheetGrid;
