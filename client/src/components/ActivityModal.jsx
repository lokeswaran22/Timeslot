import { useState, useEffect } from 'react';
import '../modal.css'; // Import ported modal styles

const ActivityModal = ({ isOpen, onClose, userId, timeSlot, dateKey, onSave }) => {
    const [formData, setFormData] = useState({
        type: '',
        description: '',
        startPage: '',
        endPage: '',
        startTime: '',
        endTime: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setFormData({
                type: '',
                description: '',
                startPage: '',
                endPage: '',
                startTime: '',
                endTime: ''
            });
        }
    }, [isOpen, timeSlot]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                ...formData,
                userId,
                timeSlot,
                dateKey
            });
            onClose();
        } catch (error) {
            alert('Failed to save: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = (formData.endPage && formData.startPage)
        ? Math.max(0, parseInt(formData.endPage) - parseInt(formData.startPage) + 1)
        : 0;

    return (
        <div className="modal" style={{ display: 'flex', opacity: 1, visibility: 'visible' }}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Activity - {timeSlot}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Activity Type */}
                        <div className="form-group">
                            <label>Activity Type</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
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

                        {/* Description */}
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                className="form-input"
                                rows="3"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Page Range (Only for work types) */}
                        {['epub', 'proof', 'calibr'].includes(formData.type) && (
                            <div className="form-group">
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Start Page</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.startPage}
                                            onChange={e => setFormData({ ...formData, startPage: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>End Page</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.endPage}
                                            onChange={e => setFormData({ ...formData, endPage: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Total</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={totalPages}
                                            readOnly
                                            style={{ background: '#f1f5f9' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Activity'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;
