import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import BillingNavSide from '@/components/BillingNavSide';
import api from '@/services/api';
import {
  UserIcon,
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  CreditCardIcon,
  CalendarIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

// Create a patient cache service to store patient details
const patientCache = {
  data: new Map(),
  set: function(id, data) {
    this.data.set(id, {
      data,
      timestamp: Date.now()
    });
  },
  get: function(id) {
    const cached = this.data.get(id);
    if (cached && Date.now() - cached.timestamp < 60000) { // Cache for 1 minute
      return cached.data;
    }
    return null;
  }
};

// Memoize the PatientListItem component
const PatientListItem = memo(({ patient, isSelected, onClick }) => (
  <div 
    onClick={() => onClick(patient)}
    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isSelected ? 'bg-blue-600' : 'bg-gray-400'
        }`}>
          <UserIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">
            {patient.patient_info?.first_name} {patient.patient_info?.last_name}
          </h4>
          <p className="text-sm text-gray-500">
            Room {patient.patient_room?.room_name} • #{patient.id}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-blue-600">
          ₱{parseFloat(patient.total_amount || 0).toFixed(2)}
        </p>
        <p className="text-xs text-gray-500">
          {patient.transaction_count} transactions
        </p>
      </div>
    </div>
  </div>
));

const BillingTransaction = () => {
  const navigate = useNavigate();
  const [activePatients, setActivePatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    soa_pdf: null
  });

  // Load active patients once on component mount
  useEffect(() => {
    loadActivePatients();
  }, []);

  // Filter patients whenever search term or active patient list changes
  const filterPatients = useCallback(() => {
    if (!searchTerm) {
      setFilteredPatients(activePatients);
      return;
    }

    const filtered = activePatients.filter(patient => {
      const fullName = `${patient.patient_info?.first_name} ${patient.patient_info?.middle_name} ${patient.patient_info?.last_name}`.toLowerCase();
      const room = patient.patient_room?.room_name?.toLowerCase() || '';
      const physician = `${patient.patient_physician?.first_name} ${patient.patient_physician?.last_name}`.toLowerCase();
      
      return fullName.includes(searchTerm.toLowerCase()) ||
             room.includes(searchTerm.toLowerCase()) ||
             physician.includes(searchTerm.toLowerCase()) ||
             patient.id.toString().includes(searchTerm);
    });

    setFilteredPatients(filtered);
  }, [searchTerm, activePatients]);

  // Apply filtering when dependencies change
  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

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

  // Optimized patient details loading with cache
  const loadPatientDetails = useCallback(async (patient) => {
    // First, set a temporary selection immediately for responsive UI
    setSelectedPatient(prevSelected => {
      // If the same patient is selected, don't update
      if (prevSelected?.id === patient.id) return prevSelected;
      
      // Return a basic patient object for immediate UI update
      return {
        ...patient,
        isLoading: true, // Add loading flag
        transactions: [] // Initialize empty transactions
      };
    });
    
    // Check cache first
    const cachedPatient = patientCache.get(patient.id);
    if (cachedPatient) {
      setSelectedPatient({
        ...cachedPatient,
        isLoading: false
      });
      return;
    }
    
    // If not in cache, fetch from API
    setPatientLoading(true);
    try {
      const response = await api.get(`/billing/patients/${patient.id}`);
      const fullPatientData = response.data.patient;
      
      // Update patient with full data and remove loading state
      setSelectedPatient({
        ...fullPatientData,
        isLoading: false
      });
      
      // Cache the result
      patientCache.set(patient.id, fullPatientData);
    } catch (error) {
      setMessage('Error loading patient details');
      console.error('Error loading patient details:', error);
      // Reset selection on error
      setSelectedPatient(null);
    } finally {
      setPatientLoading(false);
    }
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    
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
      setTransactionData({ amount: '', soa_pdf: null });
      setSelectedPdf(null);
      
      // Remove from cache to force refresh
      patientCache.data.delete(selectedPatient.id);
      
      // Reload patient details
      loadPatientDetails({id: selectedPatient.id});
      loadActivePatients();
    } catch (error) {
      setMessage('Error adding transaction');
      console.error('Error adding transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischargePatient = async () => {
    if (!selectedPatient) return;
    
    setSubmitting(true);
    try {
      await api.post(`/billing/patients/${selectedPatient.id}/discharge`);
      setMessage('Patient discharged successfully');
      
      // Remove from cache
      patientCache.data.delete(selectedPatient.id);
      
      setSelectedPatient(null);
      loadActivePatients();
    } catch (error) {
      setMessage('Error discharging patient');
      console.error('Error discharging patient:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setTransactionData({ ...transactionData, soa_pdf: file });
      const fileUrl = URL.createObjectURL(file);
      setSelectedPdf(fileUrl);
    }
  };

  // Main loading state
  if (loading) {
    return (
      <BillingNavSide>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-200 h-96 rounded-2xl animate-pulse"></div>
            <div className="lg:col-span-2 bg-gray-200 h-96 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </BillingNavSide>
    );
  }

  return (
    <BillingNavSide>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-slide-in-from-top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Transactions</h1>
              <p className="text-gray-600">Manage patient billing and transaction records</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{activePatients.length}</p>
                  <p className="text-sm text-blue-700">Active Patients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl border animate-slide-in-from-top ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.includes('successfully') ? (
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                )}
                {message}
              </div>
              <button 
                onClick={() => setMessage('')}
                className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Search & List */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Active Patients</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {filteredPatients.length}
                </span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Patient List with Memoized Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No patients found</p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <PatientListItem
                      key={patient.id}
                      patient={patient}
                      isSelected={selectedPatient?.id === patient.id}
                      onClick={loadPatientDetails}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Patient Details & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {selectedPatient ? (
              <>
                {/* Patient Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
                  {patientLoading || selectedPatient.isLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-6 bg-blue-100 rounded w-48"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="h-12 bg-gray-100 rounded-xl"></div>
                          <div className="h-12 bg-gray-100 rounded-xl"></div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="h-36 bg-blue-100 rounded-2xl"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <UserIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              {selectedPatient.patient_info?.first_name} {selectedPatient.patient_info?.last_name}
                            </h2>
                            <p className="text-gray-500">Patient ID: #{selectedPatient.id}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDischargePatient}
                          disabled={submitting}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:transform-none"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-1"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              <span>Discharge</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <HomeIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Room</p>
                              <p className="font-medium text-gray-900">{selectedPatient.patient_room?.room_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <UserGroupIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Physician</p>
                              <p className="font-medium text-gray-900">
                                Dr. {selectedPatient.patient_physician?.first_name} {selectedPatient.patient_physician?.last_name}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                            <h4 className="text-lg font-bold mb-2">Billing Summary</h4>
                            <div className="text-3xl font-bold">
                              ₱{parseFloat(selectedPatient.total_amount || 0).toFixed(2)}
                            </div>
                            <p className="text-blue-100">Total Amount Due</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Add Transaction Form */}
                {!patientLoading && !selectedPatient.isLoading && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <PlusIcon className="w-5 h-5 mr-2 text-green-600" />
                      Add New Transaction
                    </h3>
                    
                    <form onSubmit={handleAddTransaction} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Transaction Amount <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={transactionData.amount}
                              onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                              required
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            SOA PDF (Optional)
                          </label>
                          <div className="relative">
                            <DocumentArrowUpIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* PDF Preview */}
                      {selectedPdf && (
                        <div className="border border-gray-300 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">PDF Preview</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPdf(null);
                                setTransactionData({ ...transactionData, soa_pdf: null });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <iframe
                            src={selectedPdf}
                            className="w-full h-64 rounded-lg border"
                            title="PDF Preview"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting || !transactionData.amount}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 font-medium shadow-lg disabled:transform-none"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Adding Transaction...
                          </div>
                        ) : (
                          'Add Transaction'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Transaction History */}
                {!patientLoading && !selectedPatient.isLoading ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Transaction History
                    </h3>
                    
                    {selectedPatient.transactions?.length === 0 ? (
                      <div className="text-center py-8">
                        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-gray-400 text-sm">Add the first transaction above</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedPatient.transactions?.map((transaction, index) => (
                          <div 
                            key={transaction.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                <CurrencyDollarIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  ₱{parseFloat(transaction.amount).toFixed(2)}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <CalendarIcon className="w-4 h-4" />
                                  <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {transaction.soa_pdf && (
                              <a
                                href={`${import.meta.env.VITE_API_URL}/storage/${transaction.soa_pdf}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View SOA
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-fade-in">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-2 mb-6">
                        <div className="w-5 h-5 bg-blue-200 rounded"></div>
                        <div className="h-5 bg-blue-100 rounded w-36"></div>
                      </div>
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center animate-fade-in">
                <UserIcon className="w-16 h-16 mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">Select a Patient</h3>
                <p className="text-gray-400">Choose a patient from the list to view details and manage transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BillingNavSide>
  );
};

export default BillingTransaction;