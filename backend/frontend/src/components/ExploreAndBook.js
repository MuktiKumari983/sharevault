import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';

const ExploreAndBook = ({ resources, onRequestAccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: '', location: '', availability: '' });
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filters.category || resource.category === filters.category;
    const matchesLocation = !filters.location || resource.location === filters.location;
    const matchesAvailability = filters.availability === '' || resource.isAvailable === (filters.availability === 'true');
    return matchesSearch && matchesCategory && matchesLocation && matchesAvailability;
  });

  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];
  const locations = [...new Set(resources.map(r => r.location).filter(Boolean))];

  const getEligibilityTag = (resource) => {
    if (resource.mandatoryQualification) {
      return <span className="px-2 py-1 text-xs bg-amber-900/50 text-amber-400 rounded-full border border-amber-700">Qualification Required</span>;
    }
    return <span className="px-2 py-1 text-xs bg-emerald-900/50 text-emerald-400 rounded-full border border-emerald-700">Open Access</span>;
  };

  const handleRequestAccess = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    onRequestAccess(selectedResource.id);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">Explore & Book Resources</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search equipment or spaces..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          >
            <option value="">All Locations</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filters.availability}
            onChange={(e) => setFilters({...filters, availability: e.target.value})}
          >
            <option value="">All Availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <div key={resource.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-indigo-500 transition-colors">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-white">{resource.title}</h3>
                {getEligibilityTag(resource)}
              </div>
              <p className="text-slate-400 text-sm mb-2">{resource.category} • {resource.location}</p>
              <p className="text-slate-300 mb-4 line-clamp-2">{resource.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-emerald-400 font-semibold">${resource.hourlyRate}/hour</span>
                <span className={`text-sm ${resource.isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resource.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <button
                onClick={() => handleRequestAccess(resource)}
                disabled={!resource.isAvailable}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                {resource.isAvailable ? 'Request Access' : 'Not Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Request Access</h3>
            <p className="text-slate-300 mb-4">Requesting: {selectedResource.title}</p>
            <form onSubmit={submitRequest} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                <input type="datetime-local" className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">End Time</label>
                <input type="datetime-local" className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Qualification Proof</label>
                <textarea className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" rows="3" placeholder="Describe your qualifications..."></textarea>
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Submit Request</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreAndBook;
