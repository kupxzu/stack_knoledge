import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BillingNavSide from '@/components/BillingNavSide';
import api from '@/services/api';

const BillingTransaction = () => {
  const navigate = useNavigate();
  const [activePatients, setActivePatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  
  const [transactionData, setTransactionData] = useState({
    amount: '',
    soa_pdf: null
  });

  useEffect(() => {
    loadActivePatients();
  }, []);

  const loadActivePatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing/active-patients');
      setActivePatients(response.data.data);
    } catch (error) {
      setMessage('Error loading active patients');
      console.error('Error loading active patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetails = async (patientId) => {
    try {
      const response = await api.get(`/billing/patients/${patientId}`);
      setSelectedPatient(response.data.patient);
      setShowPatientModal(true);
    } catch (error) {
      setMessage('Error loading patient details');
      console.error('Error loading patient details:', error);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('patient_id', selectedPatient.id);
      formData.append('amount', transactionData.amount);
      if (transactionData.soa_pdf) {
        formData.append('soa_pdf', transactionData.soa_pdf);
      }

      await api.post('/billing/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Transaction added successfully');
      setShowTransactionModal(false);
      setTransactionData({ amount: '', soa_pdf: null });
      
      // Reload patient details
      loadPatientDetails(selectedPatient.id);
      loadActivePatients();
    } catch (error) {
      setMessage('Error adding transaction');
      console.error('Error adding transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischargePatient = async () => {
    setSubmitting(true);
    try {
      await api.post(`/billing/patients/${selectedPatient.id}/discharge`);
      setMessage('Patient discharged successfully');
      setShowDischargeModal(false);
      setShowPatientModal(false);
      loadActivePatients();
    } catch (error) {
      setMessage('Error discharging patient');
      console.error('Error discharging patient:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BillingNavSide>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Billing & Transactions</h2>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading active patients...</div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Active Patients ({activePatients.length})</h3>
              </div>

              {activePatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active patients found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physician</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activePatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: #{patient.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.patient_room?.room_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₱{parseFloat(patient.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.transaction_count} transaction(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => loadPatientDetails(patient.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Patient Details & Transactions</h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="text-gray-900">
                      {selectedPatient.patient_info?.first_name} {selectedPatient.patient_info?.middle_name} {selectedPatient.patient_info?.last_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Room:</dt>
                    <dd className="text-gray-900">{selectedPatient.patient_room?.room_name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Physician:</dt>
                    <dd className="text-gray-900">
                      Dr. {selectedPatient.patient_physician?.first_name} {selectedPatient.patient_physician?.last_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Contact:</dt>
                    <dd className="text-gray-900">{selectedPatient.patient_info?.contact_number}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Billing Summary</h4>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-900">
                    ₱{parseFloat(selectedPatient.total_amount || 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">Total Amount</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Transaction History</h4>
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Transaction
                </button>
              </div>
              
              {selectedPatient.transactions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No transactions yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SOA</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPatient.transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ₱{parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {transaction.soa_pdf ? (
                              <a
                                href={`${import.meta.env.VITE_API_URL}/storage/${transaction.soa_pdf}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                View SOA
                              </a>
                            ) : (
                              <span className="text-gray-500">No SOA</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPatientModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => setShowDischargeModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Discharge Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add Transaction</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SOA PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setTransactionData({ ...transactionData, soa_pdf: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Upload SOA PDF file</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Confirmation Modal */}
      {showDischargeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Discharge Patient</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to discharge this patient? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDischargeModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDischargePatient}
                disabled={submitting}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {submitting ? 'Discharging...' : 'Discharge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BillingNavSide>
  );
};

export default BillingTransaction;