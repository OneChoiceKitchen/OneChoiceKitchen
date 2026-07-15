import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function EventBookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('HALL');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    if (step === 2) {
      if (!date || !startTime || !endTime) {
        setError('Please select date and times');
        return;
      }
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct local date/time strings and convert to UTC
      const startDateTimeStr = `${date}T${startTime}:00`;
      const endDateTimeStr = `${date}T${endTime}:00`;

      const startUtc = new Date(startDateTimeStr).toISOString();
      const endUtc = new Date(endDateTimeStr).toISOString();

      if (new Date(startUtc) >= new Date(endUtc)) {
        throw new Error('Start time must be before end time');
      }

      await axios.post('/api/bookings', {
        tenantId: 'tenant-1', // Default tenant for customer web
        customerId: 'customer-user-id', // In a real app, from auth context
        serviceType,
        eventStartDate: startUtc,
        eventEndDate: endUtc,
        specialRequirements
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 mt-12 bg-white rounded-xl shadow text-center border border-gray-200">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Your event booking has been successfully submitted and is awaiting partner confirmation.</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 mt-12 bg-white rounded-xl shadow border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Event Booking Engine</h1>
      
      {/* Progress Bar */}
      <div className="flex mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex-1 text-center relative">
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold mb-2 ${step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {num}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {num === 1 ? 'Service' : num === 2 ? 'Date & Time' : 'Details'}
            </div>
            {num < 3 && (
              <div className={`absolute top-4 left-1/2 w-full h-1 ${step > num ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ zIndex: -1 }} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Service Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">What service do you need?</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {['HALL', 'PHOTOGRAPHY', 'DECORATION'].map((type) => (
              <div 
                key={type}
                onClick={() => setServiceType(type)}
                className={`cursor-pointer border rounded-lg p-4 text-center transition-all ${serviceType === type ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
              >
                <div className="text-2xl mb-2">{type === 'HALL' ? '🏰' : type === 'PHOTOGRAPHY' ? '📸' : '🎈'}</div>
                <div className="font-medium text-gray-900">{type}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">When is your event?</h2>
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
            <input 
              id="event-date"
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                id="start-time"
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                id="end-time"
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Any special requirements?</h2>
          <div>
            <label htmlFor="special-reqs" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea 
              id="special-reqs"
              rows={4}
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="Tell us about seating arrangements, specific themes, etc."
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
            />
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        {step > 1 ? (
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white">
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        {step < 3 ? (
          <button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Continue
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
