import { useState, useEffect } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  UserIcon,
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';

const AdmitPatient = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    civil_status: 'single',
    gender: 'male',
    dob: '',
    contact_number: '',
    admitted_date: new Date().toISOString().split('T')[0],
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
  const [errors, setErrors] = useState({});
  
  const [addresses, setAddresses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showPhysicianModal, setShowPhysicianModal] = useState(false);
  
  const [newAddress, setNewAddress] = useState('');
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [newPhysician, setNewPhysician] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    gender: 'male'
  });

  const [addressMode, setAddressMode] = useState('existing'); // 'existing' or 'new'

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [addressesRes, roomsRes, physiciansRes] = await Promise.all([
        api.get('/patient-addresses'),
        api.get('/patient-rooms'),
        api.get('/patient-physicians')
      ]);

      setAddresses(addressesRes.data.data?.map(addr => addr.address) || []);
      setRooms(roomsRes.data.data || []);
      setPhysicians(physiciansRes.data.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      const savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
      const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
      const savedPhysicians = JSON.parse(localStorage.getItem('physicians') || '[]');
      
      setAddresses(savedAddresses);
      setRooms(savedRooms);
      setPhysicians(savedPhysicians);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.room_name.trim()) newErrors.room_name = 'Room selection is required';
    if (!formData.physician_first_name.trim() || !formData.physician_last_name.trim()) {
      newErrors.physician = 'Physician selection is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAddress = async () => {
    if (newAddress.trim()) {
      try {
        await api.post('/patient-addresses', { address: newAddress.trim() });
        const updatedAddresses = [...addresses, newAddress.trim()];
        setAddresses(updatedAddresses);
        setFormData(prev => ({ ...prev, address: newAddress.trim() }));
        setNewAddress('');
        setShowAddressModal(false);
      } catch (error) {
        const updatedAddresses = [...addresses, newAddress.trim()];
        setAddresses(updatedAddresses);
        localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
        setFormData(prev => ({ ...prev, address: newAddress.trim() }));
        setNewAddress('');
        setShowAddressModal(false);
      }
    }
  };

  const handleAddRoom = async () => {
    if (newRoom.name.trim()) {
      try {
        await api.post('/patient-rooms', {
          room_name: newRoom.name.trim(),
          description: newRoom.description.trim()
        });
        const roomData = {
          id: Date.now(),
          name: newRoom.name.trim(),
          description: newRoom.description.trim()
        };
        const updatedRooms = [...rooms, roomData];
        setRooms(updatedRooms);
        setFormData(prev => ({ 
          ...prev, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        }));
        setNewRoom({ name: '', description: '' });
        setShowRoomModal(false);
      } catch (error) {
        const roomData = {
          id: Date.now(),
          name: newRoom.name.trim(),
          description: newRoom.description.trim()
        };
        const updatedRooms = [...rooms, roomData];
        setRooms(updatedRooms);
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));
        setFormData(prev => ({ 
          ...prev, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        }));
        setNewRoom({ name: '', description: '' });
        setShowRoomModal(false);
      }
    }
  };

  const handleAddPhysician = async () => {
    if (newPhysician.first_name.trim() && newPhysician.last_name.trim()) {
      try {
        await api.post('/patient-physicians', {
          first_name: newPhysician.first_name.trim(),
          last_name: newPhysician.last_name.trim(),
          middle_name: newPhysician.middle_name.trim(),
          suffix: newPhysician.suffix.trim(),
          gender: newPhysician.gender
        });
        const physicianData = {
          id: Date.now(),
          ...newPhysician,
          first_name: newPhysician.first_name.trim(),
          last_name: newPhysician.last_name.trim(),
          middle_name: newPhysician.middle_name.trim(),
          suffix: newPhysician.suffix.trim()
        };
        const updatedPhysicians = [...physicians, physicianData];
        setPhysicians(updatedPhysicians);
        setFormData(prev => ({
          ...prev,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        }));
        setNewPhysician({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          gender: 'male'
        });
        setShowPhysicianModal(false);
      } catch (error) {
        const physicianData = {
          id: Date.now(),
          ...newPhysician,
          first_name: newPhysician.first_name.trim(),
          last_name: newPhysician.last_name.trim(),
          middle_name: newPhysician.middle_name.trim(),
          suffix: newPhysician.suffix.trim()
        };
        const updatedPhysicians = [...physicians, physicianData];
        setPhysicians(updatedPhysicians);
        localStorage.setItem('physicians', JSON.stringify(updatedPhysicians));
        setFormData(prev => ({
          ...prev,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        }));
        setNewPhysician({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          gender: 'male'
        });
        setShowPhysicianModal(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/patients', formData);

      if (response.data) {
        setMessage('Patient admitted successfully!');
        setFormData({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          civil_status: 'single',
          gender: 'male',
          dob: '',
          contact_number: '',
          admitted_date: new Date().toISOString().split('T')[0],
          address: '',
          room_name: '',
          room_description: '',
          physician_first_name: '',
          physician_last_name: '',
          physician_middle_name: '',
          physician_suffix: '',
          physician_gender: 'male'
        });
        setErrors({});
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error admitting patient');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, error, required = false, className = "", ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`block w-full px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
            Icon ? 'pl-11' : ''
          } ${
            error 
              ? 'ring-2 ring-red-500 bg-red-50' 
              : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  const SelectField = ({ label, error, required = false, children, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`block w-full px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
          error 
            ? 'ring-2 ring-red-500 bg-red-50' 
            : ''
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdmittingNavSide>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admit New Patient</h1>
          <p className="text-gray-600 mt-2">Complete patient information for admission</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl flex items-center ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.includes('successfully') ? (
              <CheckCircleIcon className="w-5 h-5 mr-3" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-3" />
            )}
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-8 space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <UserIcon className="w-6 h-6 mr-3 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  label="First Name"
                  icon={IdentificationIcon}
                  required
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                />
                
                <InputField
                  label="Last Name"
                  icon={IdentificationIcon}
                  required
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                />
                
                <InputField
                  label="Middle Name"
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                  autoComplete="additional-name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <InputField
                  label="Suffix"
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  placeholder="Jr., Sr., III"
                />
                
                <SelectField
                  label="Civil Status"
                  required
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  error={errors.civil_status}
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                  <option value="separated">Separated</option>
                </SelectField>
                
                <SelectField
                  label="Gender"
                  required
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  error={errors.gender}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </SelectField>
                
                <InputField
                  label="Date of Birth"
                  icon={CalendarIcon}
                  required
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  error={errors.dob}
                />
              </div>
            </div>

            {/* Contact & Address */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <PhoneIcon className="w-6 h-6 mr-3 text-green-600" />
                Contact & Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                  label="Contact Number"
                  icon={PhoneIcon}
                  required
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  error={errors.contact_number}
                  placeholder="Enter contact number"
                  autoComplete="tel"
                />
                
                <InputField
                  label="Admitted Date"
                  icon={CalendarIcon}
                  required
                  type="date"
                  name="admitted_date"
                  value={formData.admitted_date}
                  onChange={handleChange}
                  error={errors.admitted_date}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                
                {/* Switch buttons */}
                <div className="flex mb-3 bg-gray-100 rounded-lg p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setAddressMode('existing')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      addressMode === 'existing'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('new')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      addressMode === 'new'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Create New
                  </button>
                </div>

                {/* Conditional input based on mode */}
                {addressMode === 'existing' ? (
                  <div className="flex gap-3">
                    <select
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`flex-1 px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                        errors.address 
                          ? 'ring-2 ring-red-500 bg-red-50' 
                          : ''
                      }`}
                    >
                      <option value="">Select existing address</option>
                      {addresses.map((addr, index) => (
                        <option key={index} value={addr}>{addr}</option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      title="Add new address"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none ${
                      errors.address 
                        ? 'ring-2 ring-red-500 bg-red-50' 
                        : ''
                    }`}
                    placeholder="Enter complete address here..."
                  />
                )}
                
                {errors.address && <p className="text-sm text-red-600 mt-2">{errors.address}</p>}
              </div>
            </div>

            {/* Room & Physician */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BuildingOfficeIcon className="w-6 h-6 mr-3 text-purple-600" />
                Room & Physician Assignment
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Room Assignment <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-12">
                    <select
                      value={formData.room_name}
                      onChange={(e) => {
                        const selectedRoom = rooms.find(room => room.name === e.target.value);
                        if (selectedRoom) {
                          setFormData(prev => ({
                            ...prev,
                            room_name: selectedRoom.name,
                            room_description: selectedRoom.description
                          }));
                        } else {
                          setFormData(prev => ({ ...prev, room_name: e.target.value }));
                        }
                        if (errors.room_name) {
                          setErrors(prev => ({ ...prev, room_name: '' }));
                        }
                      }}
                      className={`flex-1 px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                        errors.room_name 
                          ? 'ring-2 ring-red-500 bg-red-50' 
                          : ''
                      }`}
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
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      title="Add new room"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.room_name && <p className="text-sm text-red-600 mt-2">{errors.room_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Attending Physician <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <select
                      value={`${formData.physician_first_name} ${formData.physician_last_name}`.trim()}
                      onChange={(e) => {
                        const selectedPhysician = physicians.find(physician => 
                          `${physician.first_name} ${physician.last_name}` === e.target.value
                        );
                        if (selectedPhysician) {
                          setFormData(prev => ({
                            ...prev,
                            physician_first_name: selectedPhysician.first_name,
                            physician_last_name: selectedPhysician.last_name,
                            physician_middle_name: selectedPhysician.middle_name,
                            physician_suffix: selectedPhysician.suffix,
                            physician_gender: selectedPhysician.gender
                          }));
                        }
                        if (errors.physician) {
                          setErrors(prev => ({ ...prev, physician: '' }));
                        }
                      }}
                      className={`flex-1 px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
                        errors.physician 
                          ? 'ring-2 ring-red-500 bg-red-50' 
                          : ''
                      }`}
                    >
                      <option value="">Select physician</option>
                      {physicians.map((physician) => (
                        <option key={physician.id} value={`${physician.first_name} ${physician.last_name}`}>
                          Dr. {physician.first_name} {physician.middle_name} {physician.last_name} {physician.suffix}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => setShowPhysicianModal(true)}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      title="Add new physician"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {errors.physician && <p className="text-sm text-red-600 mt-2">{errors.physician}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Admitting Patient...
                  </span>
                ) : (
                  'Admit Patient'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add New Address"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter complete address"
              rows={4}
              className="w-full px-4 py-3 border-0 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddAddress}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Address
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        title="Add New Room"
      >
        <div className="space-y-6">
          <InputField
            label="Room Name"
            required
            type="text"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
            placeholder="e.g., Room 101, ICU-A"
          />
          
          <InputField
            label="Description"
            type="text"
            value={newRoom.description}
            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            placeholder="Room description or type"
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowRoomModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddRoom}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Room
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPhysicianModal}
        onClose={() => setShowPhysicianModal(false)}
        title="Add New Physician"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="First Name"
              required
              type="text"
              value={newPhysician.first_name}
              onChange={(e) => setNewPhysician({ ...newPhysician, first_name: e.target.value })}
              placeholder="First name"
            />
            
            <InputField
              label="Last Name"
              required
              type="text"
              value={newPhysician.last_name}
              onChange={(e) => setNewPhysician({ ...newPhysician, last_name: e.target.value })}
              placeholder="Last name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Middle Name"
              type="text"
              value={newPhysician.middle_name}
              onChange={(e) => setNewPhysician({ ...newPhysician, middle_name: e.target.value })}
              placeholder="Middle name"
            />
            
            <InputField
              label="Suffix"
              type="text"
              value={newPhysician.suffix}
              onChange={(e) => setNewPhysician({ ...newPhysician, suffix: e.target.value })}
              placeholder="Jr., Sr., III"
            />
          </div>
          
          <SelectField
            label="Gender"
            required
            value={newPhysician.gender}
            onChange={(e) => setNewPhysician({ ...newPhysician, gender: e.target.value })}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </SelectField>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPhysicianModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddPhysician}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Physician
            </button>
          </div>
        </div>
      </Modal>
    </AdmittingNavSide>
  );
};

export default AdmitPatient;