import React from 'react';

interface CalendarFiltersProps {
  filters: {
    provider: string;
    search: string;
    startDate: string;
    endDate: string;
  };
  onFilterChange: (filters: Partial<CalendarFiltersProps['filters']>) => void;
  loading: boolean;
  viewType: 'calendar' | 'list';
  onViewTypeChange: (viewType: 'calendar' | 'list') => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFilterChange,
  loading,
  viewType,
  onViewTypeChange,
}) => {
  const providers = [
    { value: '', label: 'All Providers' },
    { value: 'google', label: 'Google Calendar' },
    { value: 'outlook', label: 'Outlook Calendar' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ provider: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ endDate: e.target.value });
  };

  const clearFilters = () => {
    onFilterChange({
      provider: '',
      search: '',
      startDate: '',
      endDate: '',
    });
  };

  const setQuickDateRange = (range: 'today' | 'week' | 'month') => {
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);

    switch (range) {
      case 'today':
        // Already set to today
        break;
      case 'week':
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        break;
      case 'month':
        startDate.setDate(1); // First day of month
        endDate.setMonth(today.getMonth() + 1, 0); // Last day of month
        break;
    }

    onFilterChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  };

  const hasActiveFilters = filters.provider || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewTypeChange('calendar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </button>
          <button
            onClick={() => onViewTypeChange('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewType === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List
          </button>
        </div>

        {/* Quick Date Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Quick filters:</span>
          <button
            onClick={() => setQuickDateRange('today')}
            disabled={loading}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Today
          </button>
          <button
            onClick={() => setQuickDateRange('week')}
            disabled={loading}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            This Week
          </button>
          <button
            onClick={() => setQuickDateRange('month')}
            disabled={loading}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search events..."
              disabled={loading}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Provider Filter */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            id="provider"
            value={filters.provider}
            onChange={handleProviderChange}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {providers.map((provider) => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={handleStartDateChange}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={filters.endDate}
            onChange={handleEndDateChange}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => onFilterChange({ search: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.provider && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Provider: {providers.find(p => p.value === filters.provider)?.label}
              <button
                onClick={() => onFilterChange({ provider: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:text-green-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.startDate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <button
                onClick={() => onFilterChange({ startDate: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.endDate && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <button
                onClick={() => onFilterChange({ endDate: '' })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:text-yellow-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarFilters;