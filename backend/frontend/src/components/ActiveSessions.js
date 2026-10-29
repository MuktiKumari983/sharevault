import React, { useState } from 'react';
import { Camera, FileText, LogIn, LogOut } from 'lucide-react';

const ActiveSessions = ({ activeBookings, onCheckIn, onCheckOut }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    conditionNotes: '',
    imageUrl: '',
    damageReported: false
  });

  const handleAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setFormData({ conditionNotes: '', imageUrl: '', damageReported: false });
  };

  const submitAction = (e) => {
    e.preventDefault();
    if (actionType === 'checkin') {
      onCheckIn(selectedBooking.id, {
        userId: selectedBooking.requester?.id || 1,
        conditionNotes: formData.conditionNotes,
        imageUrl: formData.imageUrl
      });
    } else if (actionType === 'checkout') {
      onCheckOut(selectedBooking.id, {
        userId: selectedBooking.requester?.id || 1,
        conditionNotes: formData.conditionNotes,
        imageUrl: formData.imageUrl,
        damageReported: formData.damageReported
      });
    }
    setSelectedBooking(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">Active Sessions (Check-In / Return)</h2>
        <p className="text-slate-400">Manage your current bookings and equipment returns</p>
      </div>

      <div className="space-y-4">
        {activeBookings.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
            <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No active sessions</p>
          </div>
        ) : (
          activeBookings.map(booking => (
            <div key={booking.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{booking.resource?.title}</h3>
                  <p className="text-slate-400">{booking.resource?.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm border ${
                  booking.status === 'APPROVED' ? 'bg-blue-900/50 text-blue-400 border-blue-700' :
                  booking.status === 'CHECKED_IN' ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700' :
                  'bg-slate-700 text-slate-400 border-slate-600'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="flex gap-3">
                {booking.status === 'APPROVED' && (
                  <button
                    onClick={() => handleAction(booking, 'checkin')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Check In
                  </button>
                )}
                {booking.status === 'CHECKED_IN' && (
                  <button
                    onClick={() => handleAction(booking, 'checkout')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Check Out / Return
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBooking && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {actionType === 'checkin' ? 'Check In' : 'Check Out'} - {selectedBooking.resource?.title}
            </h3>
            <form onSubmit={submitAction} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  <Camera className="h-4 w-4 inline mr-1" />
                  Photo URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Condition Notes
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
                  rows="4"
                  placeholder="Describe the condition of the equipment..."
                  value={formData.conditionNotes}
                  onChange={(e) => setFormData({...formData, conditionNotes: e.target.value})}
                  required
                />
              </div>
              {actionType === 'checkout' && (
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={formData.damageReported}
                    onChange={(e) => setFormData({...formData, damageReported: e.target.checked})}
                    className="w-4 h-4"
                  />
                  Damage Reported
                </label>
              )}
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  Submit
                </button>
                <button type="button" onClick={() => setSelectedBooking(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveSessions;
