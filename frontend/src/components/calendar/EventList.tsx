import React from 'react';
import { CalendarEvent } from '../../types/integrations';

interface EventListProps {
  events: CalendarEvent[];
  loading: boolean;
  pagination: {
    page: number;
    hasNext: boolean;
    hasPrevious: boolean;
    total: number;
  };
  onPageChange: (page: number) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  pagination,
  onPageChange,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">G</span>
          </div>
        );
      case 'outlook':
        return (
          <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">O</span>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
        );
    }
  };

  const getEventDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffHours}h`;
    }
    return `${diffMinutes}m`;
  };

  const isEventToday = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  };

  const isEventPast = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    events.forEach(event => {
      const dateKey = formatDate(event.start_time);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  if (loading && events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Events ({pagination.total})
          </h3>
          
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-gray-200">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="p-6">
            {/* Date Header */}
            <div className="flex items-center mb-4">
              <h4 className={`text-sm font-medium ${
                dateEvents.some(event => isEventToday(event.start_time))
                  ? 'text-blue-600'
                  : 'text-gray-900'
              }`}>
                {date}
                {dateEvents.some(event => isEventToday(event.start_time)) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Today
                  </span>
                )}
              </h4>
            </div>
            
            {/* Events for this date */}
            <div className="space-y-3">
              {dateEvents.map((event) => (
                <div
                  key={event.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border ${
                    isEventPast(event.end_time)
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  } transition-colors`}
                >
                  {/* Provider Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getProviderIcon('calendar')}
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className={`text-sm font-medium ${
                          isEventPast(event.end_time) ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {event.title || 'Untitled Event'}
                        </h5>
                        
                        {event.description && (
                          <p className={`text-sm mt-1 ${
                            isEventPast(event.end_time) ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {event.description.length > 100
                              ? `${event.description.substring(0, 100)}...`
                              : event.description}
                          </p>
                        )}
                        
                        {event.location && (
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </div>
                        )}
                      </div>
                      
                      {/* Time and Duration */}
                      <div className="flex-shrink-0 text-right ml-4">
                        <div className={`text-sm font-medium ${
                          isEventPast(event.end_time) ? 'text-gray-500' : 'text-gray-900'
                        }`}>
                          {formatTime(event.start_time)}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isEventPast(event.end_time) ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {getEventDuration(event.start_time, event.end_time)}
                        </div>
                        <div className={`text-xs mt-1 capitalize ${
                          isEventPast(event.end_time) ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Calendar Event
                        </div>
                      </div>
                    </div>
                    
                    {/* Event metadata */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>ID: {event.provider_event_id ? event.provider_event_id.substring(0, 8) : 'N/A'}...</span>
                        {event.is_all_day && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            All Day
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Synced: {new Date(event.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {events.length > 0 && (pagination.hasNext || pagination.hasPrevious) && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {pagination.page}
          </span>
          
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventList;