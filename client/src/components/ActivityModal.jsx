import { useState, useEffect } from 'react';

function ActivityModal({ employee, timeSlot, activity, onClose, onSave, onClear }) {
    const [activityType, setActivityType] = useState('epub');
    const [description, setDescription] = useState('');
    const [pagesDone, setPagesDone] = useState('');

    useEffect(() => {
        if (activity) {
            setActivityType(activity.type);
            setDescription(activity.description || '');
            setPagesDone(activity.pagesDone || '');
        } else {
            setActivityType('epub');
            setDescription('');
            setPagesDone('');
        }
    }, [activity]);

    const showPageFields = activityType === 'proof' || activityType === 'epub' || activityType === 'calibr';

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!activityType) {
            alert('Please select an activity type');
            return;
        }

        const activityData = {
            type: activityType,
            description: (activityType === 'break' || activityType === 'lunch') ? activityType.toUpperCase() : description,
            timestamp: new Date().toISOString()
        };

        if (showPageFields) {
            activityData.pagesDone = pagesDone;
        }

        onSave(activityData);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="modal show" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{employee?.name} - {timeSlot}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="activityType">Activity Type</label>
                            <select
                                id="activityType"
                                className="form-input"
                                value={activityType}
                                onChange={(e) => setActivityType(e.target.value)}
                                required
                            >
                                <option value="">Select Activity</option>
                                <option value="epub">Epub Process</option>
                                <option value="proof">Proof Reading</option>
                                <option value="calibr">Calibr Process</option>
                                <option value="meeting">Meeting</option>
                                <option value="break">Break</option>
                                <option value="lunch">Lunch</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="activityDescription">Notes / Description</label>
                            <textarea
                                id="activityDescription"
                                className="form-input"
                                rows="3"
                                placeholder="Add notes about this activity..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {showPageFields && (
                            <div className="form-group">
                                <label htmlFor="pagesDone">Pages Completed</label>
                                <input
                                    type="number"
                                    id="pagesDone"
                                    className="form-input"
                                    placeholder="Enter pages completed in this time slot"
                                    value={pagesDone}
                                    onChange={(e) => setPagesDone(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn"
                                onClick={onClear}
                                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none' }}
                            >
                                Clear
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Save Activity
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ActivityModal;
