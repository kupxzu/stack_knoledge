import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';

const PatientPortal = () => {
  const { accessHash } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatientPortal();
  }, [accessHash]);

  const loadPatientPortal = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient-portal/${accessHash}`);
      setPatient(response.data.patient);
    } catch (error) {
      setError(error.response?.data?.error || 'Unable to access patient portal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please contact the hospital if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold">Patient Portal</h1>
          <p className="text-blue-100">View your hospital information and billing details</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Patient Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="text-sm text-gray-900">
                    {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">
                    {patient.patient_info?.dob ? new Date(patient.patient_info.dob).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="text-sm text-gray-900 capitalize">{patient.patient_info?.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
                  <dd className="text-sm text-gray-900 capitalize">{patient.patient_info?.civil_status}</dd>
                </div>
              </dl>
            </div>
            <div>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                  <dd className="text-sm text-gray-900">{patient.patient_info?.contact_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">{patient.patient_address?.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admitted Date</dt>
                  <dd className="text-sm text-gray-900">
                    {patient.patient_info?.admitted_date ? new Date(patient.patient_info.admitted_date).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Room and Physician Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Room Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Room</dt>
                <dd className="text-sm text-gray-900">{patient.patient_room?.room_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="text-sm text-gray-900">{patient.patient_room?.description || 'N/A'}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Attending Physician</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Physician</dt>
                <dd className="text-sm text-gray-900">
                  Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.middle_name} {patient.patient_physician?.last_name} {patient.patient_physician?.suffix}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900">
                ₱{parseFloat(patient.total_amount || 0).toFixed(2)}
              </div>
              <div className="text-sm text-blue-700">Total Amount Due</div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          {patient.transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement of Account</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patient.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₱{parseFloat(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {transaction.soa_pdf ? (
                          <a
                            href={transaction.soa_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Download SOA
                          </a>
                        ) : (
                          <span className="text-gray-500">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Access Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Access Information</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Portal access expires: {new Date(patient.access_expires_at).toLocaleString()}
                </p>
                <p className="mt-1">
                  For assistance or questions about your account, please contact the hospital billing department.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2025 Hospital Management System. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This is a secure patient portal. Do not share your access link with others.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PatientPortal;