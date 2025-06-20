import React from 'react';

interface EmailFiltersProps {
  filters: {
    provider: string;
    search: string;
    isRead: boolean | undefined;
    isImportant: boolean | undefined;
  };
  onFilterChange: (filters: Partial<EmailFiltersProps['filters']>) => void;
  loading: boolean;
}

const EmailFilters: React.FC<EmailFiltersProps> = ({
  filters,
  onFilterChange,
  loading,
}) => {
  const providers = [
    { value: '', label: 'All Providers' },
    { value: 'gmail', label: 'Gmail' },
    { value: 'outlook', label: 'Outlook' },
  ];

  const readStatusOptions = [
    { value: undefined, label: 'All' },
    { value: false, label: 'Unread' },
    { value: true, label: 'Read' },
  ];

  const importanceOptions = [
    { value: undefined, label: 'All' },
    { value: true, label: 'Important' },
    { value: false, label: 'Normal' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ search: e.target.value });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ provider: e.target.value });
  };

  const handleReadStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      isRead: value === '' ? undefined : value === 'true' 
    });
  };

  const handleImportanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      isImportant: value === '' ? undefined : value === 'true' 
    });
  };

  const clearFilters = () => {
    onFilterChange({
      provider: '',
      search: '',
      isRead: undefined,
      isImportant: undefined,
    });
  };

  const hasActiveFilters = filters.provider || filters.search || 
    filters.isRead !== undefined || filters.isImportant !== undefined;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
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
              placeholder="Search emails..."
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

        {/* Read Status Filter */}
        <div>
          <label htmlFor="readStatus" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="readStatus"
            value={filters.isRead === undefined ? '' : filters.isRead.toString()}
            onChange={handleReadStatusChange}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {readStatusOptions.map((option, index) => (
              <option key={index} value={option.value === undefined ? '' : option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Importance Filter */}
        <div>
          <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-1">
            Importance
          </label>
          <select
            id="importance"
            value={filters.isImportant === undefined ? '' : filters.isImportant.toString()}
            onChange={handleImportanceChange}
            disabled={loading}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importanceOptions.map((option, index) => (
              <option key={index} value={option.value === undefined ? '' : option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
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
          
          {filters.isRead !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Status: {filters.isRead ? 'Read' : 'Unread'}
              <button
                onClick={() => onFilterChange({ isRead: undefined })}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          
          {filters.isImportant !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Importance: {filters.isImportant ? 'Important' : 'Normal'}
              <button
                onClick={() => onFilterChange({ isImportant: undefined })}
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

export default EmailFilters;