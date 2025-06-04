import { useState, useEffect } from 'react';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';
import {
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const AdmitPatient = () => {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    civil_status: 'single',
    gender: 'male',
    dob: '',
    contact_number: '',
    admitted_date: getTodayDate(),
    address: '',
    room_name: '',
    room_description: '',
    physician_first_name: '',
    physician_last_name: '',
    physician_middle_name: '',
    physician_suffix: '',
    physician_gender: 'male'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  
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

  const [addressInputMode, setAddressInputMode] = useState('select');
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Load initial data ONCE
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [addressesRes, roomsRes, physiciansRes] = await Promise.all([
          api.get('/patient-addresses?per_page=1000'),
          api.get('/patient-rooms?per_page=1000'),
          api.get('/patient-physicians?per_page=1000')
        ]);

        setAddresses(addressesRes.data.data.map(addr => addr.address) || []);
        setRooms(roomsRes.data.data || []);
        setPhysicians(physiciansRes.data.data || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Address search filter
  useEffect(() => {
    if (addressSearchTerm.length > 0) {
      const filtered = addresses.filter(addr => 
        addr.toLowerCase().includes(addressSearchTerm.toLowerCase())
      );
      setFilteredAddresses(filtered.slice(0, 10));
      setShowAddressDropdown(filtered.length > 0);
    } else {
      setFilteredAddresses([]);
      setShowAddressDropdown(false);
    }
  }, [addressSearchTerm, addresses]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Simple address selection
  const handleAddressSelect = (address) => {
    setFormData({ ...formData, address });
    setAddressSearchTerm(address);
    setShowAddressDropdown(false);
  };

  const handleAddressSearchChange = (e) => {
    const value = e.target.value;
    setAddressSearchTerm(value);
    setFormData({ ...formData, address: value });
    
    if (value.length > 0) {
      setShowAddressDropdown(true);
    } else {
      setShowAddressDropdown(false);
    }
  };

  // Simple room selection
  const handleRoomSelect = (room) => {
    setFormData({
      ...formData,
      room_name: room.name,
      room_description: room.description
    });
  };

  // Simple room addition
  const handleAddRoom = async () => {
    if (!newRoom.name.trim()) return;

    try {
      const response = await api.post('/patient-rooms', {
        room_name: newRoom.name.trim(),
        description: newRoom.description.trim()
      });
      
      const newRoomData = {
        id: response.data.data.id,
        name: newRoom.name.trim(),
        description: newRoom.description.trim()
      };
      
      // Add to dropdown list
      setRooms(prev => [...prev, newRoomData]);
      
      // Set in form
      setFormData({
        ...formData,
        room_name: newRoom.name.trim(),
        room_description: newRoom.description.trim()
      });
      
      // Close modal
      setNewRoom({ name: '', description: '' });
      setShowRoomModal(false);
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  // Simple physician selection
  const handlePhysicianSelect = (physician) => {
    setFormData({
      ...formData,
      physician_first_name: physician.first_name,
      physician_last_name: physician.last_name,
      physician_middle_name: physician.middle_name || '',
      physician_suffix: physician.suffix || '',
      physician_gender: physician.gender
    });
  };

  // Simple physician addition
  const handleAddPhysician = async () => {
    if (!newPhysician.first_name.trim() || !newPhysician.last_name.trim()) return;

    try {
      const response = await api.post('/patient-physicians', {
        first_name: newPhysician.first_name.trim(),
        last_name: newPhysician.last_name.trim(),
        middle_name: newPhysician.middle_name.trim(),
        suffix: newPhysician.suffix.trim(),
        gender: newPhysician.gender
      });
      
      const newPhysicianData = {
        id: response.data.data.id,
        first_name: newPhysician.first_name.trim(),
        last_name: newPhysician.last_name.trim(),
        middle_name: newPhysician.middle_name.trim(),
        suffix: newPhysician.suffix.trim(),
        gender: newPhysician.gender
      };
      
      // Add to dropdown list
      setPhysicians(prev => [...prev, newPhysicianData]);
      
      // Set in form
      setFormData({
        ...formData,
        physician_first_name: newPhysicianData.first_name,
        physician_last_name: newPhysicianData.last_name,
        physician_middle_name: newPhysicianData.middle_name,
        physician_suffix: newPhysicianData.suffix,
        physician_gender: newPhysicianData.gender
      });
      
      // Close modal
      setNewPhysician({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        gender: 'male'
      });
      setShowPhysicianModal(false);
    } catch (error) {
      console.error('Error adding physician:', error);
    }
  };

  // SUPER SIMPLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/patients', formData);

      if (response.data) {
        setMessage('Patient admitted successfully!');
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          civil_status: 'single',
          gender: 'male',
          dob: '',
          contact_number: '',
          admitted_date: getTodayDate(),
          address: '',
          room_name: '',
          room_description: '',
          physician_first_name: '',
          physician_last_name: '',
          physician_middle_name: '',
          physician_suffix: '',
          physician_gender: 'male'
        });

        // Reset search
        setAddressSearchTerm('');
        setFilteredAddresses([]);
        setShowAddressDropdown(false);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error admitting patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdmittingNavSide>
      <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admit New Patient</h1>
          <p className="text-gray-600 mt-1">Fill in the patient information to complete admission</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.includes('successfully') ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              )}
              {message}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Patient Information Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter middle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Jr., Sr., etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Civil Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact & Admission Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Contact & Admission Details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admitted Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="admitted_date"
                  value={formData.admitted_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.room_name}
                    onChange={(e) => {
                      const selectedRoom = rooms.find(room => room.name === e.target.value);
                      if (selectedRoom) {
                        handleRoomSelect(selectedRoom);
                      } else {
                        setFormData({ ...formData, room_name: '', room_description: '' });
                      }
                    }}
                    className="flex-1 w-50 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.name}>
                        {room.name} - {room.description}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(true)}
                    className="bg-blue-600 text-white px-3 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Add New</span>
                  <button
                    type="button"
                    onClick={() => setAddressInputMode(addressInputMode === 'select' ? 'manual' : 'select')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      addressInputMode === 'manual' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        addressInputMode === 'manual' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {addressInputMode === 'select' ? (
                <div className="relative">
                  <input
                    type="text"
                    value={addressSearchTerm}
                    onChange={handleAddressSearchChange}
                    onFocus={() => {
                      if (addressSearchTerm.length > 0 && filteredAddresses.length > 0) {
                        setShowAddressDropdown(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setShowAddressDropdown(false), 200)}
                    placeholder="Search existing addresses..."
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  
                  {showAddressDropdown && filteredAddresses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAddresses.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleAddressSelect(address)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          {address}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                />
              )}
            </div>
          </div>

          {/* Physician Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
              Physician Information
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physician <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <select
                  value={formData.physician_first_name && formData.physician_last_name ? 
                    `${formData.physician_first_name} ${formData.physician_last_name}` : ''
                  }
                  onChange={(e) => {
                    const selectedPhysician = physicians.find(physician => 
                      `${physician.first_name} ${physician.last_name}` === e.target.value
                    );
                    if (selectedPhysician) {
                      handlePhysicianSelect(selectedPhysician);
                    } else {
                      setFormData({
                        ...formData,
                        physician_first_name: '',
                        physician_last_name: '',
                        physician_middle_name: '',
                        physician_suffix: '',
                        physician_gender: 'male'
                      });
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select physician</option>
                  {physicians.map((physician) => (
                    <option key={physician.id} value={`${physician.first_name} ${physician.last_name}`}>
                      Dr. {physician.first_name} {physician.middle_name && `${physician.middle_name} `}{physician.last_name} {physician.suffix}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowPhysicianModal(true)}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pb-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Admitting Patient...
                </div>
              ) : (
                'Admit Patient'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Room</h3>
                <button onClick={() => setShowRoomModal(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Room 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Private room"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                disabled={!newRoom.name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physician Modal */}
      {showPhysicianModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Physician</h3>
                <button onClick={() => setShowPhysicianModal(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={newPhysician.first_name}
                    onChange={(e) => setNewPhysician({ ...newPhysician, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={newPhysician.last_name}
                    onChange={(e) => setNewPhysician({ ...newPhysician, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                  <input
                    type="text"
                    value={newPhysician.middle_name}
                    onChange={(e) => setNewPhysician({ ...newPhysician, middle_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                  <input
                    type="text"
                    value={newPhysician.suffix}
                    onChange={(e) => setNewPhysician({ ...newPhysician, suffix: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={newPhysician.gender}
                  onChange={(e) => setNewPhysician({ ...newPhysician, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setShowPhysicianModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhysician}
                disabled={!newPhysician.first_name.trim() || !newPhysician.last_name.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Physician
              </button>
            </div>
          </div>
        </div>
      )}
    </AdmittingNavSide>
  );
};

export default AdmitPatient;  