import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdmittingNavSide from '@/components/AdmittingNavSide';
import api from '@/services/api';

const ViewPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patients/${id}`);
      setPatient(response.data.patient);
    } catch (error) {
      setMessage('Error loading patient details');
      console.error('Error loading patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async () => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        setMessage('Patient deleted successfully');
        setTimeout(() => navigate('/admitting/patients'), 1500);
      } catch (error) {
        setMessage('Error deleting patient');
        console.error('Error deleting patient:', error);
      }
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

  if (!patient) {
    return (
      <AdmittingNavSide>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">Patient not found</div>
              <Link
                to="/admitting/patient-list"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
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
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Patient Details</h2>
            <div className="flex gap-2">
              <Link
                to={`/admitting/patients/${id}/edit`}
                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Edit
              </Link>
              <button
                onClick={deletePatient}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <Link
                to="/admitting/patient-list"
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Back to List
              </Link>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('successfully') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Patient ID</dt>
                    <dd className="text-sm text-gray-900">#{patient.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900">
                      {patient.patient_info?.first_name} {patient.patient_info?.middle_name} {patient.patient_info?.last_name} {patient.patient_info?.suffix}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900 capitalize">{patient.patient_info?.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
                    <dd className="text-sm text-gray-900 capitalize">{patient.patient_info?.civil_status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900">
                      {patient.patient_info?.dob ? new Date(patient.patient_info.dob).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                    <dd className="text-sm text-gray-900">{patient.patient_info?.contact_number}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">Admission Details</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Admitted Date</dt>
                    <dd className="text-sm text-gray-900">
                      {patient.patient_info?.admitted_date ? new Date(patient.patient_info.admitted_date).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Room</dt>
                    <dd className="text-sm text-gray-900">
                      {patient.patient_room?.room_name}
                      {patient.patient_room?.description && (
                        <span className="text-gray-500 ml-2">({patient.patient_room.description})</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Attending Physician</dt>
                    <dd className="text-sm text-gray-900">
                      Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.middle_name} {patient.patient_physician?.last_name} {patient.patient_physician?.suffix}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Physician Gender</dt>
                    <dd className="text-sm text-gray-900 capitalize">{patient.patient_physician?.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created Date</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(patient.DateCreated).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                    <dd className="text-sm text-gray-900">{patient.CreatedBy}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-900 mb-4">Address Information</h3>
              <dl>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Address</dt>
                  <dd className="text-sm text-gray-900 mt-1">{patient.patient_address?.address}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AdmittingNavSide>
  );
};

export default ViewPatient;