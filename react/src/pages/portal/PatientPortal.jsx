import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/services/api';
import { getApiAssetUrl } from '@/utils/urlReplace';
import { 
  UserIcon, 
  DocumentTextIcon, 
  HomeIcon, 
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PatientPortal = () => {
  const { accessHash } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());

  useEffect(() => {
    loadPatientPortal();
  }, [accessHash]);

  useEffect(() => {
    if (patient) {
      setTimeout(() => setAnimateElements(true), 300);
    }
  }, [patient]);

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

  const handleDownload = async (fileUrl, fileName, transactionId) => {
    if (downloadingFiles.has(transactionId)) return;

    setDownloadingFiles(prev => new Set([...prev, transactionId]));

    try {
      const params = new URLSearchParams({
        file_path: fileUrl,
        filename: fileName || `SOA_${transactionId}.pdf`
      });

      const response = await api.get(`/download-pdf?${params.toString()}`, {
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `SOA_${transactionId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      
      setTimeout(() => {
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(transactionId);
          return newSet;
        });
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-400 animate-pulse" />
              <p className="text-lg font-medium text-gray-700">Loading your health portal</p>
            </div>
            <p className="text-sm text-gray-500">Preparing your medical information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center transform animate-bounce">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-500">
              Please contact our hospital support team if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latestTransaction = patient?.transactions?.[0];

  const InfoCard = ({ icon: Icon, title, children, className = "", delay = 0 }) => (
    <div 
      className={`bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 transform ${animateElements ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const DataItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      <div className="flex-1">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-base font-semibold text-gray-900">{value || 'N/A'}</dd>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {
}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {
}
              <img
                src="/ace-banner.png"
                alt="ACE Medical Center"
                className="hidden md:block h-16 w-auto animate-fade-in"
                onError={(e) => {
                  console.error('Desktop image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
              
              {
}
              <img
                src="/ace-logo.png"
                alt="ACE Medical Center"
                className="md:hidden h-12 w-12 animate-fade-in"
                onError={(e) => {
                  console.error('Mobile image failed to load:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
              
            </div>
            
            {
}
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">Secure Access</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {
}
        <div className={`text-center mb-12 transition-all duration-1000 ${animateElements ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Hello There, {patient.patient_info?.first_name}!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This is your secure patient portal. Here you can view your medical information, billing details, and more
          </p>
        </div>

                {
}
        <InfoCard icon={CreditCardIcon} title="Billing Summary" delay={400}>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <CreditCardIcon className="w-8 h-8" />
              </div>
              <div className="text-5xl font-bold mb-3">
                ₱{parseFloat(latestTransaction?.amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-blue-100 text-lg mb-6">Current Amount Due</p>
              
              {latestTransaction?.soa_pdf ? (
                <div className="space-y-4">
                  <button
                    onClick={() => handleDownload(
                      latestTransaction.soa_pdf, 
                      `SOA_${latestTransaction.id}.pdf`,
                      latestTransaction.id
                    )}
                    disabled={downloadingFiles.has(latestTransaction.id)}
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingFiles.has(latestTransaction.id) ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Download Statement
                      </>
                    )}
                  </button>
                  <p className="text-blue-200 text-sm">
                    Last updated: {new Date(latestTransaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-blue-100">No billing statement available yet</p>
                </div>
              )}
            </div>
          </div>

          {
}
          {patient.transactions && patient.transactions.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="inline-flex items-center px-6 py-3 bg-gray-50 text-gray-700 font-medium rounded-2xl hover:bg-gray-100 transition-all duration-300 group"
              >
                {showHistory ? (
                  <ChevronUpIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                )}
                {showHistory ? 'Hide' : 'View'} Transaction History
              </button>
            </div>
          )}

          {
}
          <div className={`overflow-hidden transition-all duration-500 ${showHistory ? 'max-h-96 mt-6' : 'max-h-0'}`}>
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h4>
              {patient.transactions?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions recorded yet</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Statement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patient.transactions?.map((transaction, index) => (
                          <tr 
                            key={transaction.id} 
                            className={`hover:bg-white transition-colors duration-200 ${showHistory ? 'animate-fade-in' : ''}`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(transaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              ₱{parseFloat(transaction.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {transaction.soa_pdf ? (
                                <button
                                  onClick={() => handleDownload(
                                    transaction.soa_pdf, 
                                    `SOA_${transaction.id}.pdf`,
                                    transaction.id
                                  )}
                                  disabled={downloadingFiles.has(transaction.id)}
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                  {downloadingFiles.has(transaction.id) ? (
                                    <>
                                      <div className="w-4 h-4 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                      Downloading...
                                    </>
                                  ) : (
                                    <>
                                      <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                                      Download
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-gray-400">Not available</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </InfoCard>
              <br />
        {
}
        <InfoCard icon={UserIcon} title="Personal Information" className="mb-8" delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <DataItem 
                label="Full Name" 
                value={`${patient.patient_info?.first_name} ${patient.patient_info?.middle_name || ''} ${patient.patient_info?.last_name} ${patient.patient_info?.suffix || ''}`.trim()}
                icon={UserIcon}
              />
              <DataItem 
                label="Date of Birth" 
                value={patient.patient_info?.dob ? new Date(patient.patient_info.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                icon={CalendarIcon}
              />
              <DataItem 
                label="Gender" 
                value={patient.patient_info?.gender}
              />
              <DataItem 
                label="Civil Status" 
                value={patient.patient_info?.civil_status}
              />
            </div>
            <div className="space-y-1">
              <DataItem 
                label="Contact Number" 
                value={patient.patient_info?.contact_number}
                icon={PhoneIcon}
              />
              <DataItem 
                label="Address" 
                value={patient.patient_address?.address}
                icon={MapPinIcon}
              />
              <DataItem 
                label="Admitted Date" 
                value={patient.patient_info?.admitted_date ? new Date(patient.patient_info.admitted_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                icon={CalendarIcon}
              />
            </div>
          </div>
        </InfoCard>

        {
}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InfoCard icon={HomeIcon} title="Room Information" delay={200}>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {patient.patient_room?.room_name || 'Not Assigned'}
                </div>
                <p className="text-gray-600">{patient.patient_room?.description || 'Room assignment pending'}</p>
              </div>
            </div>
          </InfoCard>

          <InfoCard icon={UserIcon} title="Attending Physician" delay={300}>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-gray-800 mb-1">
                  Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.middle_name || ''} {patient.patient_physician?.last_name} {patient.patient_physician?.suffix || ''}
                </div>
                <p className="text-gray-600">Your caring physician</p>
              </div>
            </div>
          </InfoCard>
        </div>

              <br />
        {
}
        <div className={`bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white transition-all duration-1000 ${animateElements ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Secure Access Information</h3>
              <p className="text-amber-100 mb-2">
                Portal access expires: {new Date(patient.access_expires_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-amber-100 text-sm">
                For assistance or questions about your account, please contact our friendly hospital billing department.
              </p>
            </div>
          </div>
        </div>
      </main>

      {
}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            {
}
            <img 
              src="/ace-logo.png" 
              alt="ACE Medical Center" 
              className="h-12 w-auto mx-auto mb-6"
              onError={(e) => {
                console.error('Footer image failed to load:', e.target.src);
                e.target.style.display = 'none';
              }}
            />
            <h3 className="text-xl font-bold mb-2">Thank you for trusting us with your care</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Your health and well-being are our top priority. We're here for you every step of the way.
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-500">
                © 2025 Hospital Management System. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                This is a secure patient portal. Please keep your access link confidential.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {
}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PatientPortal;