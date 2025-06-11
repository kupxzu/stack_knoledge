import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  UserIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  IdentificationIcon,
  UserCircleIcon,
  QrCodeIcon,
  LinkIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';
import patientService from '@/services/patientService';
import { getPortalUrl, getApiAssetUrl } from '@/utils/urlReplace';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [qrData, setQrData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async (options = {}) => {
    try {
      if (!options.refresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const result = await patientService.getPatient(id, options);
      const patientData = result.data.patient;
      setPatient(patientData);
      setFromCache(result.fromCache || false);
      
      // Load QR data if available
      if (patientData.qr_data) {
        setQrData(patientData.qr_data);
      } else if (patientData.qr_code) {
        loadQRData(patientData.qr_code);
      }
    } catch (error) {
      setMessage('Error loading patient details');
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadQRData = async (qrCode) => {
    try {
      const response = await api.get(`/qr-codes/${qrCode}`);
      setQrData(response.data);
    } catch (error) {
      console.error('Error loading QR data:', error);
    }
  };

  const deletePatient = async () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        setMessage('Patient deleted successfully');
        setTimeout(() => navigate('/admitting/patient-list'), 1500);
      } catch (error) {
        setMessage('Error deleting patient');
        console.error('Error deleting patient:', error);
      }
    }
  };

  // Skeleton Loading Component
  const ViewPatientSkeleton = () => (
    <SkeletonTheme baseColor="#f8f9fa" highlightColor="#e9ecef">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Skeleton circle height={32} width={32} />
            <div>
              <Skeleton height={32} width={250} className="mb-2" />
              <Skeleton height={20} width={300} />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton height={40} width={80} className="rounded-xl" />
            <Skeleton height={40} width={80} className="rounded-xl" />
            <Skeleton height={40} width={120} className="rounded-xl" />
          </div>
        </div>

        {/* Main Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* QR Code Section Skeleton */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="text-center space-y-4">
                <Skeleton circle height={56} width={56} className="mx-auto" />
                <Skeleton height={24} width={150} className="mx-auto" />
                <Skeleton height={16} width={200} className="mx-auto" />
                <Skeleton height={192} width={192} className="mx-auto rounded-xl" />
                
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton height={16} width={80} />
                      <Skeleton height={16} width={100} />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <Skeleton height={48} className="rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Section Skeleton */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Cards Skeleton */}
            {[...Array(3)].map((_, cardIndex) => (
              <div key={cardIndex} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center mb-6">
                  <Skeleton circle height={32} width={32} className="mr-3" />
                  <Skeleton height={24} width={180} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(cardIndex === 2 ? 2 : 4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton height={16} width={100} />
                      <Skeleton height={20} width={150} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );

  // QR Code Component
  const QRCodeSection = () => {
    const isExpired = qrData?.portal?.expires_at ? 
      new Date(qrData.portal.expires_at) < new Date() : false;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-fit sticky top-6">
        <div className="text-center">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <QrCodeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Patient QR Code</h2>
          <p className="text-gray-600 text-sm mb-6">Access portal and patient information</p>

          {qrData ? (
            <div className="space-y-6">
              {/* QR Code Display */}
              <div className="relative">
                {qrData.qr_image_url ? (
                  <div className="relative">
                    <img 
                      src={getApiAssetUrl(qrData.qr_image_url)}
                      alt="Patient QR Code" 
                      className="w-48 h-48 mx-auto border border-gray-200 rounded-xl shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-48 h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-xl border-2 border-dashed border-gray-300"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center">
                        <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-500 text-sm">QR Code not available</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-500 text-sm">QR Code not available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Info */}
              <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">QR Code ID:</span>
                  <span className="text-sm text-gray-900 font-mono">
                    {qrData.qr?.qrcode || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    isExpired 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Expires:
                  </span>
                  <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {qrData.portal?.expires_at 
                      ? new Date(qrData.portal.expires_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {qrData.portal_url && (
                  <a
                    href={getPortalUrl(qrData.portal_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
                  >
                    <LinkIcon className="w-5 h-5" />
                    Open Portal Link
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* No QR Code State */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 text-sm">No QR Code Found</span>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-800">QR Code Missing</span>
                </div>
                <p className="text-sm text-amber-700">
                  This patient doesn't have a QR code yet. Generate one to enable portal access.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdmittingNavSide>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <ViewPatientSkeleton />
          </div>
        </div>
      </AdmittingNavSide>
    );
  }

  if (!patient) {
    return (
      <AdmittingNavSide>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
              <p className="text-gray-600 mb-6">The patient you're looking for doesn't exist or has been removed.</p>
              <Link
                to="/admitting/patient-list"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Patient List
              </Link>
            </div>
          </div>
        </div>
      </AdmittingNavSide>
    );
  }

  return (
    <AdmittingNavSide>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <EyeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Patient Details</h1>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/admitting/patients/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </Link>
                <Link
                  to="/admitting/patient-list"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to List
                </Link>
              </div>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                message.includes('successfully') 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {message.includes('successfully') ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                      ✓
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                      !
                    </div>
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* QR Code Section - Left Side */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <QRCodeSection />
              </div>
              
              {/* Content Section - Right Side */}
              <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                {/* Personal Information Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <UserCircleIcon className="w-4 h-4 mr-2" />
                          Full Name
                        </label>
                        <p className="text-lg font-semibold text-gray-900">
                          {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Gender</label>
                        <p className="text-lg font-medium text-gray-900 capitalize">{patient.patient_info?.gender}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Civil Status</label>
                        <p className="text-lg font-medium text-gray-900 capitalize">{patient.patient_info?.civil_status}</p>
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Date of Birth
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {patient.patient_info?.dob ? new Date(patient.patient_info.dob).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        Contact Number
                      </label>
                      <p className="text-lg font-medium text-gray-900">{patient.patient_info?.contact_number}</p>
                    </div>
                  </div>
                </div>

                {/* Admission Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                      <BuildingOfficeIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Admission Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Admitted Date
                        </label>
                        <p className="text-lg font-medium text-gray-900">
                          {patient.patient_info?.admitted_date ? new Date(patient.patient_info.admitted_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                          Room Assignment
                        </label>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-lg font-semibold text-gray-900">
                            {patient.patient_room?.room_name}
                          </p>
                          {patient.patient_room?.description && (
                            <span className="text-gray-600 text-sm">({patient.patient_room.description})</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-500 mb-2">
                          <IdentificationIcon className="w-4 h-4 mr-2" />
                          Attending Physician
                        </label>
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                          <p className="text-lg font-semibold text-gray-900">
                            Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.middle_name ? `${patient.patient_physician.middle_name} ` : ''}{patient.patient_physician?.last_name}{patient.patient_physician?.suffix ? ` ${patient.patient_physician.suffix}` : ''}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              patient.patient_physician?.physician === 'attending' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {patient.patient_physician?.physician ? 
                                patient.patient_physician.physician.charAt(0).toUpperCase() + patient.patient_physician.physician.slice(1) + ' Physician'
                                : 'Admitting Physician'
                              }
                            </span>
                            <span className="text-sm text-gray-600 capitalize">
                              {patient.patient_physician?.gender}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Created By</label>
                        <p className="text-lg font-medium text-gray-900">{patient.CreatedBy}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Physician Role Information */}
                  {patient.patient_physician?.physician && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Physician Role Information</h4>
                        <p className="text-sm text-blue-800">
                          {patient.patient_physician.physician === 'attending' 
                            ? 'This physician is primarily responsible for the patient\'s care during their hospital stay.'
                            : 'This physician admitted the patient to the hospital and initiated their care.'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Information Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                      <HomeIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-500 mb-3">
                      <HomeIcon className="w-4 h-4 mr-2" />
                      Full Address
                    </label>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-lg font-medium text-gray-900 leading-relaxed">
                        {patient.patient_address?.address || 'No address provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default ViewPatient;