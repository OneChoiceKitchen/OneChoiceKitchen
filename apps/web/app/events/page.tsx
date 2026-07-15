import React from 'react';
import EventBookingFlow from '../components/EventBookingFlow';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Book Your Perfect Event
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          From party halls to photography and decoration, we've got your events covered.
        </p>
      </div>
      <EventBookingFlow />
    </div>
  );
}
