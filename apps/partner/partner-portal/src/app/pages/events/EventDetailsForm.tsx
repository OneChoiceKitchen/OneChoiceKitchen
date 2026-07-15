import React, { useState } from 'react';
import { BookingStatus } from '@prisma/client';

export interface EventDetailsFormProps {
  booking: any;
  onSave: (id: string, updates: any) => Promise<void>;
  onClose: () => void;
}

export function EventDetailsForm({ booking, onSave, onClose }: EventDetailsFormProps) {
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [specialRequirements, setSpecialRequirements] = useState(booking.specialRequirements || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSave(booking.id, { status, specialRequirements });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">Event Booking Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                {booking.serviceType}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                {booking.customerId}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (UTC)</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                {new Date(booking.eventStartDate).toLocaleString()}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (UTC)</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                {new Date(booking.eventEndDate).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
            <textarea
              rows={4}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
              placeholder="Enter special requirements or notes..."
            />
          </div>
        </form>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
