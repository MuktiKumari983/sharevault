import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, UserCheck, Activity, FileText } from 'lucide-react';
import ExploreAndBook from './components/ExploreAndBook';
import OwnerDesk from './components/OwnerDesk';
import ActiveSessions from './components/ActiveSessions';
import FairUsageAuditTrail from './components/FairUsageAuditTrail';
import { resourceService, bookingService, auditService } from './services/api';

const seedResources = [
  {
    id: 1,
    title: "3D Printer Lab",
    category: "Manufacturing",
    description: "Industrial-grade 3D printer for prototyping and research projects",
    location: "Engineering Building, Room 301",
    hourlyRate: 25.0,
    isAvailable: true,
    mandatoryQualification: "CAD/CAM Certification",
    maxWeeklyHoursPerUser: 10
  },
  {
    id: 2,
    title: "Electron Microscopy Suite",
    category: "Research",
    description: "High-resolution scanning electron microscope for materials analysis",
    location: "Science Center, Lab 205",
    hourlyRate: 150.0,
    isAvailable: true,
    mandatoryQualification: "Microscopy Safety Training",
    maxWeeklyHoursPerUser: 5
  },
  {
    id: 3,
    title: "Conference Room A",
    category: "Space",
    description: "Large conference room with AV equipment and video conferencing",
    location: "Admin Building, Floor 2",
    hourlyRate: 40.0,
    isAvailable: false,
    mandatoryQualification: null,
    maxWeeklyHoursPerUser: 20
  }
];

const seedBookings = [
  {
    id: 101,
    resource: { title: "3D Printer Lab" },
    requester: { name: "John Doe", email: "john@university.edu", id: 1 },
    startTime: "2026-10-29T10:00:00",
    endTime: "2026-10-29T14:00:00",
    status: "PENDING"
  }
];

const seedAuditLogs = [
  {
    id: 1,
    bookingId: 101,
    actorEmail: "john@university.edu",
    action: "BOOKING_REQUEST_CREATED",
    reasoning: "Booking request submitted",
    timestamp: "2026-10-28T09:30:00"
  },
  {
    id: 2,
    bookingId: 50,
    actorEmail: "manager@university.edu",
    action: "BOOKING_APPROVED",
    reasoning: "Qualifications verified and resource available",
    timestamp: "2026-10-28T10:15:00"
  }
];

function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [resources, setResources] = useState(seedResources);
  const [pendingBookings, setPendingBookings] = useState(seedBookings);
  const [activeBookings, setActiveBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState(seedAuditLogs);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resourcesData, auditData] = await Promise.all([
        resourceService.getAll(),
        auditService.getAll()
      ]);
      if (resourcesData && resourcesData.length > 0) setResources(resourcesData);
      if (auditData && auditData.length > 0) setAuditLogs(auditData);
      setBackendOnline(true);
    } catch (error) {
      console.log('Backend offline, using seed data');
      setBackendOnline(false);
    }
  };

  const handleRequestAccess = async (resourceId) => {
    try {
      if (backendOnline) {
        await bookingService.create({
          userId: 1,
          resourceId: resourceId,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          qualificationProof: "User qualification provided"
        });
        alert('Booking request submitted successfully!');
      } else {
        alert('Booking request submitted (demo mode)!');
      }
    } catch (error) {
      alert('Error submitting booking request');
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      if (backendOnline) {
        await bookingService.review(bookingId, { managerId: 2, approve: true, reason: "Approved" });
      }
      setPendingBookings(pendingBookings.filter(b => b.id !== bookingId));
      alert('Booking approved!');
    } catch (error) {
      alert('Error approving booking');
    }
  };

  const handleReject = async (bookingId, reason) => {
    try {
      if (backendOnline) {
        await bookingService.review(bookingId, { managerId: 2, approve: false, reason: reason });
      }
      setPendingBookings(pendingBookings.filter(b => b.id !== bookingId));
      alert('Booking rejected!');
    } catch (error) {
      alert('Error rejecting booking');
    }
  };

  const handleCheckIn = async (bookingId, checkInData) => {
    try {
      if (backendOnline) {
        await bookingService.checkIn(bookingId, checkInData);
      }
      setActiveBookings(activeBookings.map(b => 
        b.id === bookingId ? { ...b, status: 'CHECKED_IN' } : b
      ));
      alert('Check-in completed!');
    } catch (error) {
      alert('Error during check-in');
    }
  };

  const handleCheckOut = async (bookingId, checkOutData) => {
    try {
      if (backendOnline) {
        await bookingService.checkOut(bookingId, checkOutData);
      }
      setActiveBookings(activeBookings.filter(b => b.id !== bookingId));
      alert('Check-out completed!');
    } catch (error) {
      alert('Error during check-out');
    }
  };

  const tabs = [
    { id: 'explore', name: 'Explore & Book', icon: Search },
    { id: 'owner', name: 'Owner Desk', icon: UserCheck },
    { id: 'sessions', name: 'Active Sessions', icon: Activity },
    { id: 'audit', name: 'Fair Usage & Audit', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-indigo-400 mr-3" />
              <h1 className="text-xl font-bold text-white">ShareVault</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded">
                {backendOnline ? '🟢 Online' : '🟡 Demo Mode'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explore' && <ExploreAndBook resources={resources} onRequestAccess={handleRequestAccess} />}
        {activeTab === 'owner' && <OwnerDesk pendingBookings={pendingBookings} onApprove={handleApprove} onReject={handleReject} />}
        {activeTab === 'sessions' && <ActiveSessions activeBookings={activeBookings} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} />}
        {activeTab === 'audit' && <FairUsageAuditTrail auditLogs={auditLogs} />}
      </main>
    </div>
  );
}

export default App;
