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
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import patientService from '@/services/patientService';

const TableSkeleton = () => (
  <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={80} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={60} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={50} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={80} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={70} />
            </th>
            <th className="px-6 py-4 text-left">
              <Skeleton height={16} width={60} />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="hover:bg-gray-50/50">
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
                  <Skeleton height={20} width={20} />
                  <Skeleton height={20} width={20} />
                  <Skeleton height={20} width={20} />
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
      <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Skeleton height={20} width={200} className="mb-2" />
            <Skeleton height={16} width={60} />
          </div>
          <div className="flex space-x-2">
            <Skeleton height={32} width={32} className="rounded-xl" />
            <Skeleton height={32} width={32} className="rounded-xl" />
            <Skeleton height={32} width={32} className="rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Skeleton height={14} width={50} className="mb-1" />
          <Skeleton height={16} width="100%" />
        </div>
      </div>
    ))}
  </div>
);

const SearchFiltersSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
    <div className="space-y-4">
      <Skeleton height={48} className="rounded-xl" />
      
      <div className="flex items-center justify-between lg:hidden">
        <Skeleton height={40} width={80} className="rounded-xl" />
        <Skeleton height={16} width={100} />
      </div>

      <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton height={40} width={120} className="rounded-xl" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton height={16} width={40} />
          <Skeleton height={40} width={60} className="rounded-xl" />
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
          className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
            i === pagination.current_page
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const PatientCard = ({ patient }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
          </h3>
          <p className="text-sm text-gray-500 mt-1">ID: #{patient.id}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/admitting/patients/${patient.id}`}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <EyeIcon className="w-5 h-5" />
          </Link>
          <Link
            to={`/admitting/patients/${patient.id}/edit`}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <PencilIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={() => deletePatient(patient.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block mb-1">Contact:</span>
          <p className="font-medium text-gray-900">{patient.patient_info?.contact_number || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Room:</span>
          <p className="font-medium text-gray-900">{patient.patient_room?.room_name || 'N/A'}</p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Physician:</span>
          <p className="font-medium text-gray-900">
            Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}
          </p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1">Admitted:</span>
          <p className="font-medium text-gray-900">{new Date(patient.DateCreated).toLocaleDateString()}</p>
        </div>
      </div>

      {patient.patient_address?.address && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
          <span className="text-gray-500 block mb-1">Address:</span>
          <p className="font-medium text-gray-900 truncate">{patient.patient_address.address}</p>
        </div>
      )}
    </div>
  );

  return (
    <AdmittingNavSide>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
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

            {/* Content */}
            {loading ? (
              <SkeletonTheme baseColor="#f8f9fa" highlightColor="#e9ecef">
                <div className="space-y-6">
                  <SearchFiltersSkeleton />
                  <MobileCardsSkeleton />
                  <TableSkeleton />
                  
                  {/* Pagination Skeleton */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                      <Skeleton height={16} width={150} />
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
                {/* Search and Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative">
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Search patients by name, ID, or contact..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        {search && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setSearchInput('');
                            }}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </form>

                    {/* Filter Toggle - Mobile */}
                    <div className="flex items-center justify-between lg:hidden">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                        Filters
                      </button>
                      <span className="text-sm text-gray-500 font-medium">
                        {pagination.total} patients
                      </span>
                    </div>

                    {/* Filters */}
                    <div className={`${showFilters || 'hidden'} lg:flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 lg:space-x-4`}>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="desc">Newest First</option>
                          <option value="asc">Oldest First</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3">
                        <label className="text-sm text-gray-600 font-medium">Show:</label>
                        <select
                          value={pagination.per_page}
                          onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                <div className="lg:hidden space-y-4">
                  {patients.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                        <UserGroupIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                      <p className="text-gray-500">
                        {search ? 'Try adjusting your search criteria.' : 'Get started by adding your first patient.'}
                      </p>
                      {!search && (
                        <Link
                          to="/admitting/admit-patient"
                          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 mt-4"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Patient
                        </Link>
                      )}
                    </div>
                  ) : (
                    patients.map((patient) => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Physician
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Admitted
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {patients.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center">
                              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <UserGroupIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                              <p className="text-gray-500 mb-4">
                                {search ? 'Try adjusting your search criteria.' : 'Get started by adding your first patient.'}
                              </p>
                              {!search && (
                                <Link
                                  to="/admitting/admit-patient"
                                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200"
                                >
                                  <PlusIcon className="w-4 h-4 mr-2" />
                                  Add Patient
                                </Link>
                              )}
                            </td>
                          </tr>
                        ) : (
                          patients.map((patient) => (
                            <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">
                                  {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {patient.patient_info?.gender} | {patient.patient_info?.civil_status}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {patient.patient_info?.contact_number || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="font-medium">{patient.patient_room?.room_name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{patient.patient_room?.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {new Date(patient.DateCreated).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Link
                                    to={`/admitting/patients/${patient.id}`}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                  >
                                    <EyeIcon className="w-5 h-5" />
                                  </Link>
                                  <Link
                                    to={`/admitting/patients/${patient.id}/edit`}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
                                  >
                                    <PencilIcon className="w-5 h-5" />
                                  </Link>
                                  <button
                                    onClick={() => deletePatient(patient.id)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                  >
                                    <TrashIcon className="w-5 h-5" />
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
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                      <div className="text-sm text-gray-600 font-medium">
                        Page {pagination.current_page} of {pagination.last_page}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.current_page === 1}
                          className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                            pagination.current_page === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          First
                        </button>

                        {renderPagination()}

                        <button
                          onClick={() => handlePageChange(pagination.last_page)}
                          disabled={pagination.current_page === pagination.last_page}
                          className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 ${
                            pagination.current_page === pagination.last_page
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
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
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default AdmitPatientList;