import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';

const FairUsageAuditTrail = ({ auditLogs }) => {
  const getActionIcon = (action) => {
    if (action.includes('APPROVED')) return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    if (action.includes('REJECTED')) return <XCircle className="h-5 w-5 text-red-400" />;
    if (action.includes('DAMAGE')) return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    if (action.includes('WAITLIST') || action.includes('PROMOTED')) return <Users className="h-5 w-5 text-indigo-400" />;
    return <Clock className="h-5 w-5 text-blue-400" />;
  };

  const getActionColor = (action) => {
    if (action.includes('APPROVED')) return 'border-emerald-500';
    if (action.includes('REJECTED')) return 'border-red-500';
    if (action.includes('DAMAGE')) return 'border-amber-500';
    if (action.includes('WAITLIST') || action.includes('PROMOTED')) return 'border-indigo-500';
    return 'border-blue-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-2">Fair Usage & Audit Trail</h2>
        <p className="text-slate-400">Transparent view of all system events and human-in-the-loop decisions</p>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">System Events Timeline</h3>
        </div>
        <div className="p-6">
          {auditLogs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No audit logs available</p>
          ) : (
            <div className="space-y-4">
              {auditLogs.slice().reverse().map((log, index) => (
                <div key={log.id || index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full bg-slate-900 border-2 ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    {index < auditLogs.length - 1 && <div className="w-0.5 h-16 bg-slate-700 mt-2" />}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{log.action.replace(/_/g, ' ')}</h4>
                        <span className="text-xs text-slate-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{log.reasoning}</p>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Actor: {log.actorEmail}</span>
                        <span>Booking ID: {log.bookingId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FairUsageAuditTrail;
