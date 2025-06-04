import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BillingNavSide from '@/components/BillingNavSide';
import api from '@/services/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/billing/dialog';
import { Button } from '@/components/billing/button';
import { Input } from '@/components/billing/input';
import { Label } from '@/components/billing/label';
import { Badge } from '@/components/billing/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/billing/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Building, 
  Stethoscope, // Replace UserDoctor with Stethoscope
  Phone, 
  Plus, 
  Eye, 
  FileText,
  AlertTriangle,
  Download
} from 'lucide-react';

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount));
};

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

const getFullName = (patientInfo) => {
  return [
    patientInfo?.first_name,
    patientInfo?.middle_name,
    patientInfo?.last_name
  ].filter(Boolean).join(' ');
};

// Loading skeleton component
const PatientTableSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    ))}
  </div>
);

// Main component
const BillingTransaction = () => {
  const navigate = useNavigate();
  
  // State
  const [activePatients, setActivePatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    soa_pdf: null
  });
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isDischargingPatient, setIsDischargingPatient] = useState(false);

  // Load active patients
  const loadActivePatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/active-patients');
      setActivePatients(response.data.data || []);
    } catch (error) {
      console.error('Error loading active patients:', error);
      setError('Failed to load patient data. Please try again.');
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load patient details
  const loadPatientDetails = useCallback(async (patientId) => {
    try {
      const response = await api.get(`/billing/patients/${patientId}`);
      setSelectedPatient(response.data.patient);
    } catch (error) {
      console.error('Error loading patient details:', error);
      toast.error('Failed to load patient details');
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadActivePatients();
  }, [loadActivePatients]);

  // Load patient details when selected
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId, loadPatientDetails]);

  // Handlers
  const handleViewDetails = useCallback((patientId) => {
    setSelectedPatientId(patientId);
  }, []);

  const handleAddTransaction = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !transactionData.amount || isAddingTransaction) return;

    try {
      setIsAddingTransaction(true);

      const formData = new FormData();
      formData.append('patient_id', selectedPatientId.toString());
      formData.append('amount', transactionData.amount);
      if (transactionData.soa_pdf) {
        formData.append('soa_pdf', transactionData.soa_pdf);
      }

      await api.post('/billing/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Transaction added successfully');
      setShowTransactionModal(false);
      setTransactionData({ amount: '', soa_pdf: null });
      
      // Reload data
      await loadActivePatients();
      await loadPatientDetails(selectedPatientId);

    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    } finally {
      setIsAddingTransaction(false);
    }
  }, [selectedPatientId, transactionData, isAddingTransaction, loadActivePatients, loadPatientDetails]);

  const handleDischargePatient = useCallback(async () => {
    if (!selectedPatientId || isDischargingPatient) return;

    try {
      setIsDischargingPatient(true);

      await api.post(`/billing/patients/${selectedPatientId}/discharge`);

      toast.success('Patient discharged successfully');
      setShowDischargeModal(false);
      setSelectedPatientId(null);
      setSelectedPatient(null);
      
      // Reload patients list
      await loadActivePatients();

    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error('Failed to discharge patient');
    } finally {
      setIsDischargingPatient(false);
    }
  }, [selectedPatientId, isDischargingPatient, loadActivePatients]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setTransactionData(prev => ({ ...prev, soa_pdf: file }));
  }, []);

  const handleAmountChange = useCallback((e) => {
    setTransactionData(prev => ({ ...prev, amount: e.target.value }));
  }, []);

  // Download handler
  const handleDownload = async (fileUrl, fileName, transactionId) => {
    try {
      const params = new URLSearchParams({
        file_path: fileUrl,
        filename: fileName || `SOA_${transactionId}.pdf`
      });

      const response = await api.get(`/download-pdf?${params.toString()}`, {
        responseType: 'blob' 
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `SOA_${transactionId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  // Memoized values
  const patientStats = useMemo(() => ({
    totalPatients: activePatients.length,
    totalAmount: activePatients.reduce((sum, patient) => sum + Number(patient.total_amount || 0), 0)
  }), [activePatients]);

  // Error boundary
  if (error) {
    return (
      <BillingNavSide>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <Button 
              onClick={loadActivePatients} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </BillingNavSide>
    );
  }

  return (
    <BillingNavSide>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Transactions</h1>
            <p className="text-gray-600">Manage patient billing and transaction records</p>
          </div>
          <Button onClick={loadActivePatients} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{patientStats.totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(patientStats.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <PatientTableSkeleton />
            ) : activePatients.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active patients found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Physician</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activePatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getFullName(patient.patient_info)}
                          </div>
                          <div className="text-sm text-gray-500">ID: #{patient.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {patient.patient_room?.room_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          <span>Dr. {patient.patient_physician?.first_name} {patient.patient_physician?.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(patient.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {patient.transaction_count} transaction{patient.transaction_count !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(patient.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Modal */}
      <Dialog open={!!selectedPatientId} onOpenChange={() => {
        setSelectedPatientId(null);
        setSelectedPatient(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details & Transactions</DialogTitle>
            <DialogDescription>
              View and manage patient billing information
            </DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{getFullName(selectedPatient.patient_info)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{selectedPatient.patient_room?.room_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                      <span>Dr. {selectedPatient.patient_physician?.first_name} {selectedPatient.patient_physician?.last_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedPatient.patient_info?.contact_number}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-blue-900">
                        {formatCurrency(selectedPatient.total_amount || 0)}
                      </div>
                      <div className="text-sm text-blue-700">Total Outstanding Amount</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Transaction History</CardTitle>
                    <Button onClick={() => setShowTransactionModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedPatient.transactions?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No transactions recorded yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>SOA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPatient.transactions?.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {transaction.soa_pdf ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(
                                    transaction.soa_pdf,
                                    `SOA_${transaction.id}.pdf`,
                                    transaction.id
                                  )}
                                  className="flex items-center gap-1"
                                >
                                  <Download className="h-4 w-4" />
                                  Download SOA
                                </Button>
                              ) : (
                                <span className="text-gray-500 text-sm">No SOA</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedPatientId(null);
              setSelectedPatient(null);
            }}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDischargeModal(true)}
            >
              Discharge Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Add a new billing transaction for this patient
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={transactionData.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="soa">SOA PDF (Optional)</Label>
              <Input
                id="soa"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500 mt-1">Upload Statement of Account PDF file</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTransactionModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isAddingTransaction || !transactionData.amount}
              >
                {isAddingTransaction ? 'Adding...' : 'Add Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discharge Confirmation Modal */}
      <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to discharge this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDischargeModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDischargePatient}
              disabled={isDischargingPatient}
            >
              {isDischargingPatient ? 'Discharging...' : 'Discharge Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BillingNavSide>
  );
};

export default BillingTransaction;