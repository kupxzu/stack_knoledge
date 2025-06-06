import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import patientService from '@/services/patientService';

const TableSkeleton = () => (
  <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={30} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={80} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={60} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={50} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={80} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={70} />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton height={16} width={60} />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <Skeleton height={16} width={40} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={150} className="mb-1" />
                <Skeleton height={14} width={100} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={120} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={80} className="mb-1" />
                <Skeleton height={12} width={60} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={140} />
              </td>
              <td className="px-6 py-4">
                <Skeleton height={16} width={80} />
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Skeleton height={16} width={16} />
                  <Skeleton height={16} width={16} />
                  <Skeleton height={16} width={16} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MobileCardsSkeleton = () => (
  <div className="lg:hidden space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Skeleton height={20} width={200} className="mb-1" />
            <Skeleton height={16} width={60} />
          </div>
          <div className="flex space-x-2">
            <Skeleton height={24} width={24} />
            <Skeleton height={24} width={24} />
            <Skeleton height={24} width={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Skeleton height={14} width={50} className="mb-1" />
            <Skeleton height={16} width={100} />
          </div>
          <div>
            <Skeleton height={14} width={40} className="mb-1" />
            <Skeleton height={16} width={80} />
          </div>
          <div>
            <Skeleton height={14} width={60} className="mb-1" />
            <Skeleton height={16} width={120} />
          </div>
          <div>
            <Skeleton height={14} width={50} className="mb-1" />
            <Skeleton height={16} width={90} />
          </div>
        </div>

        <div className="mt-3">
          <Skeleton height={14} width={50} className="mb-1" />
          <Skeleton height={16} width="100%" />
        </div>
      </div>
    ))}
  </div>
);

const SearchFiltersSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="space-y-4">
      <Skeleton height={40} className="rounded-lg" />
      
      <div className="flex items-center justify-between lg:hidden">
        <Skeleton height={32} width={80} className="rounded-lg" />
        <Skeleton height={16} width={100} />
      </div>

      <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton height={32} width={120} className="rounded-lg" />
          <Skeleton height={32} width={120} className="rounded-lg" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton height={16} width={40} />
          <Skeleton height={32} width={60} className="rounded" />
        </div>
      </div>

      <div className="hidden lg:flex justify-between items-center">
        <Skeleton height={16} width={200} />
      </div>
    </div>
  </div>
);

const AdmitPatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [search, sortOrder]);

  const loadPatients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await patientService.getPatients({
        page,
        per_page: pagination.per_page,
        search,
        sort_by: 'DateCreated',
        sort_order: sortOrder
      });

      setPatients(response.data || []);
      setPagination({
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0
      });
    } catch (error) {
      setMessage('Error loading patients');
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handlePageChange = (page) => {
    loadPatients(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage }));
    loadPatients(1);
  };

  const deletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        setMessage('Patient deleted successfully');
        loadPatients(pagination.current_page);
      } catch (error) {
        setMessage('Error deleting patient');
        console.error('Error deleting patient:', error);
      }
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 3;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, pagination.current_page - halfVisible);
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm border ${
            i === pagination.current_page
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const PatientCard = ({ patient }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-gray-900">
            {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
          </h3>
          <p className="text-sm text-gray-500">ID: #{patient.id}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/admitting/patients/${patient.id}`}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          >
            <EyeIcon className="w-4 h-4" />
          </Link>
          <Link
            to={`/admitting/patients/${patient.id}/edit`}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
          >
            <PencilIcon className="w-4 h-4" />
          </Link>
          <button
            onClick={() => deletePatient(patient.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Contact:</span>
          <p className="font-medium">{patient.patient_info?.contact_number || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Room:</span>
          <p className="font-medium">{patient.patient_room?.room_name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500">Physician:</span>
          <p className="font-medium">
            Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Admitted:</span>
          <p className="font-medium">{new Date(patient.DateCreated).toLocaleDateString()}</p>
        </div>
      </div>

      {patient.patient_address?.address && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500">Address:</span>
          <p className="font-medium truncate">{patient.patient_address.address}</p>
        </div>
      )}
    </div>
  );

  return (
    <AdmittingNavSide>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Patient List</h1>
          <Link
            to="/admitting/admit-patient"
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Patient
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
            <div className="space-y-6">
              <SearchFiltersSkeleton />
              <MobileCardsSkeleton />
              <TableSkeleton />
              
              {/* Pagination Skeleton */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <Skeleton height={16} width={150} />
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} height={32} width={32} className="rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SkeletonTheme>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search patients by name, ID, or contact..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setSearchInput('');
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Filter Toggle - Mobile */}
                <div className="flex items-center justify-between lg:hidden">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  <span className="text-sm text-gray-500">
                    {pagination.total} patients
                  </span>
                </div>

                {/* Filters */}
                <div className={`${showFilters || 'hidden'} lg:flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4`}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={pagination.per_page}
                      onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Results Info - Desktop */}
                <div className="hidden lg:flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} patients
                    {search && ' (filtered)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            {/* Mobile Cards View */}
            <div className="lg:hidden">
              {patients.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    {search ? 'No patients found matching your search.' : 'No patients found.'}
                  </p>
                </div>
              ) : (
                patients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Physician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          {search ? 'No patients found matching your search.' : 'No patients found.'}
                        </td>
                      </tr>
                    ) : (
                      patients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
                            </div>
                            <div className="text-sm text-gray-500">
                              {patient.patient_info?.gender} | {patient.patient_info?.civil_status}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {patient.patient_info?.contact_number || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{patient.patient_room?.room_name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{patient.patient_room?.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(patient.DateCreated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Link
                                to={`/admitting/patients/${patient.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/admitting/patients/${patient.id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => deletePatient(patient.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600">
                    Page {pagination.current_page} of {pagination.last_page}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.current_page === 1}
                      className={`px-3 py-2 text-sm border rounded-l ${
                        pagination.current_page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      First
                    </button>

                    {renderPagination()}

                    <button
                      onClick={() => handlePageChange(pagination.last_page)}
                      disabled={pagination.current_page === pagination.last_page}
                      className={`px-3 py-2 text-sm border rounded-r ${
                        pagination.current_page === pagination.last_page
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                          : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdmittingNavSide>
  );
};

export default AdmitPatientList;