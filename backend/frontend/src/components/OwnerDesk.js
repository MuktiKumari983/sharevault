import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';

const OwnerDesk = ({ pendingBookings, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  const handleReject = (bookingId) => {
    if (rejectReason.trim()) {
      onReject(bookingId, rejectReason);
      setRejectReason('');
      setRejectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">Owner Desk</h2>
        <p className="text-slate-400">Manage pending booking requests for your resources</p>
      </div>

      <div className="space-y-4">
        {pendingBookings.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 text-center">
            <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No pending booking requests</p>
          </div>
        ) : (
          pendingBookings.map(booking => (
            <div key={booking.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{booking.resource?.title}</h3>
                  <p className="text-slate-400">Requested by: {booking.requester?.name} ({booking.requester?.email})</p>
                </div>
                <span className="px-3 py-1 bg-amber-900/50 text-amber-400 rounded-full text-sm border border-amber-700">
                  PENDING
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-400">Start Time</p>
                  <p className="text-white">{new Date(booking.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">End Time</p>
                  <p className="text-white">{new Date(booking.endTime).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onApprove(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => setRejectingId(booking.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>

              {rejectingId === booking.id && (
                <div className="mt-4 p-4 bg-slate-900 rounded-lg">
                  <label className="block text-sm text-slate-400 mb-2">Rejection Reason</label>
                  <textarea
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white mb-3"
                    rows="3"
                    placeholder="Provide reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(booking.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {setRejectingId(null); setRejectReason('');}}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerDesk;
