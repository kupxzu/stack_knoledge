import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';

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
  const [showQRModal, setShowQRModal] = useState(false);
  const [regeneratingQR, setRegeneratingQR] = useState(false);
  
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

  useEffect(() => {
    loadPatient();
    loadAddresses();
    loadRooms();
    loadPhysicians();
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patients/${id}`);
      const patient = response.data.patient;
      
      // console.log('Patient data:', patient); 
      
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

      // Set QR data if available
      if (patient.qr_data) {
        // console.log('QR data found:', patient.qr_data); // Debug log
        setQrData(patient.qr_data);
      } else if (patient.qr_code) {
        // Fallback: load QR data separately if only qr_code is available
        // console.log('Loading QR data separately for code:', patient.qr_code); // Debug log
        loadQRData(patient.qr_code);
      } else {
        // console.log('No QR data found for patient'); // Debug log
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
      // console.log('Regenerate QR response:', response.data); // Debug log
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

  const handleAddAddress = async () => {
    if (newAddress.trim()) {
      try {
        await api.post('/patient-addresses', { address: newAddress.trim() });
        setFormData({ ...formData, address: newAddress.trim() });
        setNewAddress('');
        setShowAddressModal(false);
        loadAddresses();
      } catch (error) {
        const updatedAddresses = [...addresses, newAddress.trim()];
        setAddresses(updatedAddresses);
        localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
        setFormData({ ...formData, address: newAddress.trim() });
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
        setFormData({ 
          ...formData, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        });
        setNewRoom({ name: '', description: '' });
        setShowRoomModal(false);
        loadRooms();
      } catch (error) {
        const roomData = {
          id: Date.now(),
          name: newRoom.name.trim(),
          description: newRoom.description.trim()
        };
        const updatedRooms = [...rooms, roomData];
        setRooms(updatedRooms);
        localStorage.setItem('rooms', JSON.stringify(updatedRooms));
        setFormData({ 
          ...formData, 
          room_name: newRoom.name.trim(),
          room_description: newRoom.description.trim()
        });
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
        setFormData({
          ...formData,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        });
        setNewPhysician({
          first_name: '',
          last_name: '',
          middle_name: '',
          suffix: '',
          gender: 'male'
        });
        setShowPhysicianModal(false);
        loadPhysicians();
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
        setFormData({
          ...formData,
          physician_first_name: newPhysician.first_name.trim(),
          physician_last_name: newPhysician.last_name.trim(),
          physician_middle_name: newPhysician.middle_name.trim(),
          physician_suffix: newPhysician.suffix.trim(),
          physician_gender: newPhysician.gender
        });
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

  const handleRoomSelect = (room) => {
    setFormData({
      ...formData,
      room_name: room.name,
      room_description: room.description
    });
  };

  const handlePhysicianSelect = (physician) => {
    setFormData({
      ...formData,
      physician_first_name: physician.first_name,
      physician_last_name: physician.last_name,
      physician_middle_name: physician.middle_name,
      physician_suffix: physician.suffix,
      physician_gender: physician.gender
    });
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

  if (loading) {
    return (
      <AdmittingNavSide>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading patient details...</div>
            </div>
          </div>
        </div>
      </AdmittingNavSide>
    );
  }

  return (
    <AdmittingNavSide>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Edit Patient</h2>
            <div className="flex gap-2">
              {qrData && (
                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  View QR Code
                </button>
              )}
              <button
                onClick={() => navigate(`/admitting/patients/${id}`)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                View Patient
              </button>
            </div>
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          {/* QR Code Section */}
          {qrData ? (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Patient QR Code & Portal</h3>
                  <p className="text-sm text-blue-700">QR Code ID: {qrData.qr?.qrcode || 'N/A'}</p>
                  <p className="text-sm text-blue-700">Portal URL: {qrData.portal_url?.replace('http://a.view:8080', 'http://localhost:5173') || 'N/A'}</p>
                  <p className="text-sm text-blue-700">
                    Portal Expires: {qrData.portal?.expires_at ? new Date(qrData.portal.expires_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View QR
                  </button>
                  <button
                    onClick={regenerateQR}
                    disabled={regeneratingQR}
                    className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                  >
                    {regeneratingQR ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-yellow-900">No QR Code Found</h3>
                  <p className="text-sm text-yellow-700">This patient doesn't have a QR code yet.</p>
                </div>
                <button
                  onClick={regenerateQR}
                  disabled={regeneratingQR}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {regeneratingQR ? 'Generating...' : 'Generate QR Code'}
                </button>
              </div>
            </div>
          )}

          {/* Debug QR Data */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-50 rounded text-xs">
              <strong>Debug - QR Data:</strong>
              <pre>{JSON.stringify(qrData, null, 2)}</pre>
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields remain the same as before */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Suffix</label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Civil Status *</label>
                <select
                  name="civil_status"
                  value={formData.civil_status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                  <option value="separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                <input
                  type="text"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Admitted Date *</label>
                <input
                  type="date"
                  name="admitted_date"
                  value={formData.admitted_date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <div className="flex gap-2">
                <select
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select or type address</option>
                  {addresses.map((addr, index) => (
                    <option key={index} value={addr}>{addr}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="mt-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                >
                  +
                </button>
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Or type new address"
                required
                className="mt-2 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room *</label>
              <div className="flex gap-2">
                <select
                  value={formData.room_name}
                  onChange={(e) => {
                    const selectedRoom = rooms.find(room => room.name === e.target.value);
                    if (selectedRoom) {
                      handleRoomSelect(selectedRoom);
                    }
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                  className="mt-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                >
                  +
                </button>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Physician Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Physician *</label>
              <div className="flex gap-2">
                <select
                  value={`${formData.physician_first_name} ${formData.physician_last_name}`}
                  onChange={(e) => {
                    const selectedPhysician = physicians.find(physician => 
                      `${physician.first_name} ${physician.last_name}` === e.target.value
                    );
                    if (selectedPhysician) {
                      handlePhysicianSelect(selectedPhysician);
                    }
                  }}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
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
                  className="mt-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/admitting/patients`)}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Patient QR Code</h3>
            <div className="text-center">
              {qrData.qr_image_url ? (
                <img 
                  src={`${import.meta.env.VITE_API_URL}${qrData.qr_image_url}`}
                  alt="Patient QR Code" 
                  className="mx-auto mb-4 border rounded"
                  onError={(e) => {
                    console.log('QR image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-48 h-48 bg-gray-200 flex items-center justify-center mx-auto mb-4 rounded"
                style={{ display: qrData.qr_image_url ? 'none' : 'flex' }}
              >
                <span className="text-gray-500">QR Code not available</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Portal URL: {qrData.portal_url?.replace('http://a.view:8080', 'http://localhost:5173') || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                QR Code: {qrData.qr?.qrcode || 'Not available'}
              </p>
              <p className="text-xs text-gray-500">
                Scan this QR code to access patient portal
              </p>
              {qrData.portal_url && (
                <a 
                  href={qrData.portal_url?.replace('http://a.view:8080', 'http://localhost:5173')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Open Portal Link
                </a>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowQRModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={regenerateQR}
                disabled={regeneratingQR}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {regeneratingQR ? 'Regenerating...' : 'Regenerate QR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing modals remain the same */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add New Address</h3>
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter new address"
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddressModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add New Room</h3>
            <input
              type="text"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              placeholder="Room name"
              className="w-full border-gray-300 rounded-md shadow-sm mb-3"
            />
            <input
              type="text"
              value={newRoom.description}
              onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              placeholder="Room description"
              className="w-full border-gray-300 rounded-md shadow-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRoomModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRoom}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhysicianModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-medium mb-4">Add New Physician</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newPhysician.first_name}
                onChange={(e) => setNewPhysician({ ...newPhysician, first_name: e.target.value })}
                placeholder="First name"
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={newPhysician.last_name}
                onChange={(e) => setNewPhysician({ ...newPhysician, last_name: e.target.value })}
                placeholder="Last name"
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={newPhysician.middle_name}
                onChange={(e) => setNewPhysician({ ...newPhysician, middle_name: e.target.value })}
                placeholder="Middle name"
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="text"
                value={newPhysician.suffix}
                onChange={(e) => setNewPhysician({ ...newPhysician, suffix: e.target.value })}
                placeholder="Suffix"
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
              <select
                value={newPhysician.gender}
                onChange={(e) => setNewPhysician({ ...newPhysician, gender: e.target.value })}
                className="w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPhysicianModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPhysician}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </AdmittingNavSide>
  );
};

export default EditPatient;