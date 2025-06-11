import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const AdmissionSetting = () => {
  const [activeTab, setActiveTab] = useState('addresses');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

  const tabs = [
    { id: 'addresses', label: 'Addresses', icon: HomeIcon },
    { id: 'rooms', label: 'Rooms', icon: BuildingOfficeIcon },
    { id: 'physicians', label: 'Physicians', icon: UserIcon }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.current_page, pagination.per_page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, current_page: 1 }));
      loadData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: searchTerm || ''
      });

      switch (activeTab) {
        case 'addresses':
          const addressResponse = await api.get(`/patient-addresses?${params}`);
          setAddresses(addressResponse.data.data);
          setPagination(addressResponse.data);
          break;
        case 'rooms':
          const roomResponse = await api.get(`/patient-rooms?${params}`);
          setRooms(roomResponse.data.data);
          setPagination(roomResponse.data);
          break;
        case 'physicians':
          const physicianResponse = await api.get(`/patient-physicians?${params}`);
          setPhysicians(physicianResponse.data.data);
          setPagination(physicianResponse.data);
          break;
      }
      setMessage('');
    } catch (error) {
      setMessage('Error loading data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData(getEmptyForm());
    setShowModal(true);
    setMessage('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'rooms') {
      setFormData({
        room_name: item.name || item.room_name,
        description: item.description || ''
      });
    } else {
      setFormData(item);
    }
    setShowModal(true);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const endpoint = getEndpoint();
        await api.delete(`${endpoint}/${id}`);
        setMessage('Item deleted successfully');
        loadData();
      } catch (error) {
        setMessage('Error deleting item');
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    
    try {
      const endpoint = getEndpoint();
      
      if (editingItem) {
        const response = await api.put(`${endpoint}/${editingItem.id}`, formData);
        setMessage('Item updated successfully');
      } else {
        const response = await api.post(endpoint, formData);
        setMessage('Item created successfully');
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        setMessage(`Validation error: ${errors.join(', ')}`);
      } else {
        setMessage(error.response?.data?.error || error.response?.data?.message || 'Error saving item');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getEndpoint = () => {
    switch (activeTab) {
      case 'addresses': return '/patient-addresses';
      case 'rooms': return '/patient-rooms';
      case 'physicians': return '/patient-physicians';
      default: return '';
    }
  };

  const getEmptyForm = () => {
    switch (activeTab) {
      case 'addresses':
        return { address: '' };
      case 'rooms':
        return { room_name: '', description: '' };
      case 'physicians':
        return { 
          first_name: '', 
          last_name: '', 
          middle_name: '', 
          suffix: '', 
          gender: 'male',
          physician: 'admitting'
        };
      default:
        return {};
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (perPage) => {
    setPagination(prev => ({ 
      ...prev, 
      per_page: parseInt(perPage),
      current_page: 1 
    }));
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'addresses':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Enter complete address"
            />
          </div>
        );
      
      case 'rooms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
              <input
                type="text"
                value={formData.room_name || ''}
                onChange={(e) => setFormData({ ...formData, room_name: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Room 101, ICU-A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Room description or type"
              />
            </div>
          </div>
        );
      
      case 'physicians':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name || ''}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Middle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                <input
                  type="text"
                  value={formData.suffix || ''}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Jr., Sr., III"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  value={formData.gender || 'male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Physician Role *</label>
                <select
                  value={formData.physician || 'admitting'}
                  onChange={(e) => setFormData({ ...formData, physician: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="admitting">Admitting</option>
                  <option value="attending">Attending</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                </div>
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">Physician Roles:</p>
                  <p><span className="font-medium">Admitting:</span> Physician who admits the patient to the hospital.</p>
                  <p><span className="font-medium">Attending:</span> Physician primarily responsible for patient care during the stay.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderMobileCard = (item) => {
    switch (activeTab) {
      case 'addresses':
        return (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm text-gray-900 leading-relaxed">{item.address}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'rooms':
        return (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'physicians':
        return (
          <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  Dr. {item.first_name} {item.middle_name && item.middle_name + ' '}{item.last_name} {item.suffix}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 capitalize">Gender: {item.gender}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    item.physician === 'attending' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.physician ? 
                      item.physician.charAt(0).toUpperCase() + item.physician.slice(1) + ' Physician'
                      : 'Admitting Physician'
                    }
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'addresses':
        return (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {getCurrentData().map((address) => (
                <tr key={address.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md">{address.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'rooms':
        return (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {getCurrentData().map((room) => (
                <tr key={room.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{room.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">{room.description || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'physicians':
        return (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {getCurrentData().map((physician) => (
                <tr key={physician.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Dr. {physician.first_name} {physician.middle_name && physician.middle_name + ' '}{physician.last_name} {physician.suffix}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{physician.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      physician.physician === 'attending' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {physician.physician ? 
                        physician.physician.charAt(0).toUpperCase() + physician.physician.slice(1)
                        : 'Admitting'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(physician)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(physician.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      default:
        return null;
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'addresses': return addresses;
      case 'rooms': return rooms;
      case 'physicians': return physicians;
      default: return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'addresses': return 'Addresses';
      case 'rooms': return 'Rooms';
      case 'physicians': return 'Physicians';
      default: return '';
    }
  };

  const PaginationComponent = () => {
    const startPage = Math.max(1, pagination.current_page - 2);
    const endPage = Math.min(pagination.last_page, pagination.current_page + 2);
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-6 pt-6 border-t border-gray-100">
        <div className="text-sm text-gray-600 font-medium">
          Showing {pagination.from} to {pagination.to} of {pagination.total} results
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 font-medium">Show:</span>
            <select
              value={pagination.per_page}
              onChange={(e) => handlePerPageChange(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  1
                </button>
                {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
              </>
            )}

            {pages.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  page === pagination.current_page
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < pagination.last_page && (
              <>
                {endPage < pagination.last_page - 1 && <span className="px-1 text-gray-400">...</span>}
                <button
                  onClick={() => handlePageChange(pagination.last_page)}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  {pagination.last_page}
                </button>
              </>
            )}

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TableSkeleton = () => (
    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={80} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={100} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={60} />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {[...Array(5)].map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4">
                <Skeleton height={16} width={120} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={180} />
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Skeleton height={32} width={32} className="rounded-xl" />
                  <Skeleton height={32} width={32} className="rounded-xl" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const MobileCardSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton height={20} width={200} className="mb-2" />
              <Skeleton height={16} width={150} />
            </div>
            <div className="flex space-x-2 ml-4">
              <Skeleton height={32} width={32} className="rounded-xl" />
              <Skeleton height={32} width={32} className="rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const currentData = getCurrentData();

  return (
    <AdmittingNavSide>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                message.includes('successfully') 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
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

            {/* Main Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {/* Mobile Tab Selector */}
              <div className="block sm:hidden border-b border-gray-100 p-6">
                <select
                  value={activeTab}
                  onChange={(e) => {
                    setActiveTab(e.target.value);
                    setMessage('');
                    setSearchTerm('');
                  }}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden sm:block border-b border-gray-100">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMessage('');
                          setSearchTerm('');
                        }}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header with Search and Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={`Search ${getTabTitle().toLowerCase()}...`}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add {getTabTitle().slice(0, -1)}
                  </button>
                </div>

                {/* Loading State */}
                {loading ? (
                  <SkeletonTheme baseColor="#f8f9fa" highlightColor="#e9ecef">
                    <div>
                      <div className="block lg:hidden">
                        <MobileCardSkeleton />
                      </div>
                      <div className="hidden lg:block">
                        <TableSkeleton />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-6 pt-6 border-t border-gray-100">
                        <Skeleton height={20} width={200} />
                        <div className="flex items-center space-x-4">
                          <Skeleton height={40} width={100} />
                          <div className="flex items-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <Skeleton key={i} height={40} width={40} className="rounded-xl" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SkeletonTheme>
                ) : (
                  <>
                    {/* Mobile Cards */}
                    <div className="block lg:hidden space-y-4">
                      {currentData.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <div className="text-2xl">📋</div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {getTabTitle().toLowerCase()} found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm ? 'Try adjusting your search terms.' : `Click "Add ${getTabTitle().slice(0, -1)}" to create one.`}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleCreate}
                              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200"
                            >
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Add {getTabTitle().slice(0, -1)}
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          {currentData.map((item) => renderMobileCard(item))}
                          <PaginationComponent />
                        </>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden lg:block">
                      {currentData.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <div className="text-2xl">📋</div>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {getTabTitle().toLowerCase()} found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm ? 'Try adjusting your search terms.' : `Click "Add ${getTabTitle().slice(0, -1)}" to create one.`}
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={handleCreate}
                              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200"
                            >
                              <PlusIcon className="w-4 h-4 mr-2" />
                              Add {getTabTitle().slice(0, -1)}
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                            {renderTable()}
                          </div>
                          <PaginationComponent />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit' : 'Add New'} {getTabTitle().slice(0, -1)}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMessage('');
                }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {renderForm()}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdmittingNavSide>
  );
};

export default AdmissionSetting;