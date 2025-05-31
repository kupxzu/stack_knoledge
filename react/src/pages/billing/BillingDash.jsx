import BillingNavSide from '@/components/BillingNavSide';

const BillingDash = () => {
  return (
    <BillingNavSide>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Admitting</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">New Admissions</h3>
                  <p className="text-blue-700 mt-2">Register new patients</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">Patient Records</h3>
                  <p className="text-green-700 mt-2">View and update patient information</p>
                </div>
              </div>
            </div>
          </div>
    </BillingNavSide>
  );
};

export default BillingDash;