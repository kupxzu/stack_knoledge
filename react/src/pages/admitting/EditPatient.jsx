import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  QrCodeIcon, 
  ArrowPathIcon,
  CalendarIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';
import { getPortalUrl, getApiAssetUrl } from '@/utils/urlReplace';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    civil_status: 'single',
    gender: 'male',
    dob: '',
    contact_number: '',
    admitted_date: '',
    address: '',
    room_name: '',
    room_description: '',
    physician_first_name: '',
    physician_last_name: '',
    physician_middle_name: '',
    physician_suffix: '',
    physician_gender: 'male'
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  
  // QR Code related states
  const [qrData, setQrData] = useState(null);
  const [regeneratingQR, setRegeneratingQR] = useState(false);
  
  // Address search states
  const [addressSearch, setAddressSearch] = useState('');
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showPhysicianModal, setShowPhysicianModal] = useState(false);
  
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [newPhysician, setNewPhysician] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    gender: 'male'
  });

  // Skeleton Loading Component
  const EditPatientSkeleton = () => (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton height={32} width={200} className="mb-2" />
            <Skeleton height={20} width={300} />
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Skeleton height={40} width={120} className="rounded-lg" />
          </div>
        </div>

        {/* Main Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* QR Code Section Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit">
              <div className="text-center space-y-6">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                  <Skeleton circle height={56} width={56} />
                </div>
                <Skeleton height={24} width={150} className="mx-auto" />
                <Skeleton height={16} width={200} className="mx-auto" />

                {/* QR Code Display */}
                <Skeleton height={192} width={192} className="mx-auto rounded-lg" />

                {/* QR Info */}
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton height={16} width={80} />
                      <Skeleton height={16} width={100} />
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Skeleton height={48} className="rounded-lg" />
                  <Skeleton height={48} className="rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Form Section Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <Skeleton height={24} width={180} className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i}>
                        <Skeleton height={16} width={100} className="mb-2" />
                        <Skeleton height={48} className="rounded-lg" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}>
                        <Skeleton height={16} width={80} className="mb-2" />
                        <Skeleton height={48} className="rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact & Admission */}
                <div>
                  <Skeleton height={24} width={220} className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i}>
                        <Skeleton height={16} width={120} className="mb-2" />
                        <Skeleton height={48} className="rounded-lg" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Skeleton height={16} width={80} className="mb-2" />
                    <Skeleton height={48} className="rounded-lg" />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  <Skeleton height={48} width={100} className="rounded-lg" />
                  <Skeleton height={48} width={120} className="rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );

  useEffect(() => {
    loadPatient();
    loadAddresses();
    loadRooms();
    loadPhysicians();
  }, [id]);

  // Filter addresses based on search
  useEffect(() => {
    if (addressSearch) {
      const filtered = addresses.filter(addr => 
        addr.toLowerCase().includes(addressSearch.toLowerCase())
      );
      setFilteredAddresses(filtered);
    } else {
      setFilteredAddresses(addresses);
    }
  }, [addressSearch, addresses]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patients/${id}`);
      const patient = response.data.patient;
      
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        first_name: patient.patient_info?.first_name || '',
        last_name: patient.patient_info?.last_name || '',
        middle_name: patient.patient_info?.middle_name || '',
        suffix: patient.patient_info?.suffix || '',
        civil_status: patient.patient_info?.civil_status || 'single',
        gender: patient.patient_info?.gender || 'male',
        dob: formatDate(patient.patient_info?.dob),
        contact_number: patient.patient_info?.contact_number || '',
        admitted_date: formatDate(patient.patient_info?.admitted_date),
        address: patient.patient_address?.address || '',
        room_name: patient.patient_room?.room_name || '',
        room_description: patient.patient_room?.description || '',
        physician_first_name: patient.patient_physician?.first_name || '',
        physician_last_name: patient.patient_physician?.last_name || '',
        physician_middle_name: patient.patient_physician?.middle_name || '',
        physician_suffix: patient.patient_physician?.suffix || '',
        physician_gender: patient.patient_physician?.gender || 'male'
      });

      // Set address search to current address
      setAddressSearch(patient.patient_address?.address || '');

      if (patient.qr_data) {
        setQrData(patient.qr_data);
      } else if (patient.qr_code) {
        loadQRData(patient.qr_code);
      } else {
        setQrData(null);
      }
    } catch (error) {
      setMessage('Error loading patient details');
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
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

  const regenerateQR = async () => {
    setRegeneratingQR(true);
    try {
      const response = await api.post(`/patients/${id}/regenerate-qr`);
      setQrData(response.data.qr_data);
      setMessage('QR code regenerated successfully!');
    } catch (error) {
      setMessage('Error regenerating QR code');
      console.error('Error regenerating QR:', error);
    } finally {
      setRegeneratingQR(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await api.get('/patient-addresses');
      const addressList = response.data.data.map(addr => addr.address);
      setAddresses(addressList);
    } catch (error) {
      console.error('Error loading addresses:', error);
      const savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
      setAddresses(savedAddresses);
    }
  };

  const loadRooms = async () => {
    try {
      const response = await api.get('/patient-rooms');
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
      setRooms(savedRooms);
    }
  };

  const loadPhysicians = async () => {
    try {
      const response = await api.get('/patient-physicians');
      setPhysicians(response.data.data || []);
    } catch (error) {
      console.error('Error loading physicians:', error);
      const savedPhysicians = JSON.parse(localStorage.getItem('physicians') || '[]');
      setPhysicians(savedPhysicians);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle address input changes
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddressSearch(value);
    setFormData({
      ...formData,
      address: value
    });
    setShowAddressDropdown(true);
  };

  // Handle address selection from dropdown
  const handleAddressSelect = (address) => {
    setAddressSearch(address);
    setFormData({
      ...formData,
      address: address
    });
    setShowAddressDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.put(`/patients/${id}`, formData);

      if (response.data) {
        setMessage('Patient updated successfully!');
        setTimeout(() => navigate(`/admitting/patients/${id}`), 1500);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating patient');
    } finally {
      setSubmitting(false);
    }
  };

  // QR Code Component
  const QRCodeSection = () => {
    const isExpired = qrData?.portal?.expires_at ? 
      new Date(qrData.portal.expires_at) < new Date() : false;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 h-fit sticky top-6">
        <div className="text-center">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <QrCodeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Patient QR Code</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">Access portal and patient information</p>

          {qrData ? (
            <div className="space-y-4 sm:space-y-6">
              {/* QR Code Display */}
              <div className="relative">
                {qrData.qr_image_url ? (
                  <div className="relative">
                    <img 
                      src={getApiAssetUrl(qrData.qr_image_url)}
                      alt="Patient QR Code" 
                      className="w-32 h-32 sm:w-48 sm:h-48 mx-auto border-2 border-gray-200 rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-lg border-2 border-dashed border-gray-300"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center">
                        <QrCodeIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                        <span className="text-gray-500 text-xs sm:text-sm">QR Code not available</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <QrCodeIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-500 text-xs sm:text-sm">QR Code not available</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Info */}
              <div className="space-y-2 sm:space-y-3 text-left bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">QR Code ID:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-mono truncate max-w-24 sm:max-w-32">
                    {qrData.qr?.qrcode || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-xs sm:text-sm px-2 py-1 rounded-full ${
                    isExpired 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>

                
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Expires:
                  </span>
                  <span className={`text-xs sm:text-sm ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {qrData.portal_url && (
                <a
                  href={getPortalUrl(qrData.portal_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-black px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm"
                >
                  <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Open Portal</span>
                  <span className="sm:hidden">Portal</span>
                </a>
              )}
              
              <button
                onClick={regenerateQR}
                disabled={regeneratingQR}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-400 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-xs sm:text-sm"
              >
                <ArrowPathIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${regeneratingQR ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{regeneratingQR ? 'Regenerating...' : 'Regenerate QR'}</span>
                <span className="sm:hidden">{regeneratingQR ? 'Regen...' : 'Regen'}</span>
              </button>
            </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* No QR Code State */}
              <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gray-100 flex items-center justify-center mx-auto rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <ExclamationTriangleIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 text-xs sm:text-sm">No QR Code Found</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mr-2" />
                  <span className="text-xs sm:text-sm font-medium text-yellow-800">QR Code Missing</span>
                </div>
                <p className="text-xs sm:text-sm text-yellow-700">
                  This patient doesn't have a QR code yet. Generate one to enable portal access.
                </p>
              </div>
              
              <button
                onClick={regenerateQR}
                disabled={regeneratingQR}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                <QrCodeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {regeneratingQR ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdmittingNavSide>
        <EditPatientSkeleton />
      </AdmittingNavSide>
    );
  }

  return (
    <AdmittingNavSide>
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Patient</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Update patient information and manage QR code access</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <button
              onClick={() => navigate(`/admitting/patients/${id}`)}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Patient
            </button>
          </div>
        </div>
        
        {/* Success/Error Message */}
        {message && (
          <div className={`p-3 sm:p-4 rounded-lg border ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.includes('successfully') ? (
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              <span className="text-sm sm:text-base">{message}</span>
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* QR Code Section - Left Side */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <QRCodeSection />
          </div>
          
          {/* Form Section - Right Side */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Patient Information */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                    Patient Information
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                      <input
                        type="text"
                        name="suffix"
                        value={formData.suffix}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Civil Status *</label>
                      <select
                        name="civil_status"
                        value={formData.civil_status}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="divorced">Divorced</option>
                        <option value="separated">Separated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Admission */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                    Contact & Admission Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admitted Date *</label>
                      <input
                        type="date"
                        name="admitted_date"
                        value={formData.admitted_date}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Enhanced Address Field */}
                  <div className="mt-3 sm:mt-4 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        value={addressSearch}
                        onChange={handleAddressChange}
                        onFocus={() => setShowAddressDropdown(true)}
                        onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                        placeholder="Type or search for an address..."
                        required
                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2 sm:p-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                      <ChevronDownIcon 
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
                          showAddressDropdown ? 'rotate-180' : ''
                        }`}
                      />
                      
                      {/* Address Dropdown */}
                      {showAddressDropdown && filteredAddresses.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredAddresses.map((addr, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleAddressSelect(addr)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                            >
                              {addr}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room and Physician sections - Add similar responsive design here... */}
                
                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/admitting/patient-list')}
                    className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                  >
                    {submitting ? 'Updating...' : 'Update Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Keep existing modals here... */}
    </AdmittingNavSide>
  );
};

export default EditPatient;