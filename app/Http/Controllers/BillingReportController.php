<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Patient;
use App\Models\PatientTransaction;
use App\Models\PatientQR;
use Carbon\Carbon;

class BillingReportController extends Controller
{
    /**
     * Get billing reports with various filters
     */
    public function getReports(Request $request)
    {
        try {
            $mode = $request->get('mode', 'default'); // 'default' or 'advanced'
            
            if ($mode === 'advanced') {
                return $this->getAdvancedReports($request);
            } else {
                return $this->getDefaultReports($request);
            }
            
        } catch (\Exception $e) {
            \Log::error('Error fetching billing reports: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching reports',
                'data' => []
            ], 500);
        }
    }

    /**
     * Default mode: Today, Week, Month, Year filters
     */
    private function getDefaultReports(Request $request)
    {
        $period = $request->get('period', 'today'); // today, week, month, year
        $status = $request->get('status', 'all'); // active, discharged, all
        $rows = (int) $request->get('rows', 10); // 10, 20, 50, 100
        $page = (int) $request->get('page', 1);

        // Get date range based on period
        [$startDate, $endDate] = $this->getDateRange($period);

        // Build query
        $query = $this->buildPatientQuery($status, $startDate, $endDate);

        // Get total count and amount for summary
        $totalCount = $query->count();
        $totalAmount = $this->getTotalAmount($status, $startDate, $endDate);

        // Apply pagination
        $offset = ($page - 1) * $rows;
        $patients = $query->skip($offset)->take($rows)->get();

        // Format patient data
        $formattedPatients = $this->formatPatientData($patients);

        return response()->json([
            'success' => true,
            'mode' => 'default',
            'period' => $period,
            'data' => [
                'patients' => $formattedPatients,
                'summary' => [
                    'total_patients' => $totalCount,
                    'total_amount' => $totalAmount,
                    'period_label' => $this->getPeriodLabel($period),
                    'date_range' => [
                        'start' => $startDate->format('Y-m-d'),
                        'end' => $endDate->format('Y-m-d')
                    ]
                ],
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $rows,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $rows),
                    'has_prev' => $page > 1,
                    'has_next' => $page < ceil($totalCount / $rows)
                ]
            ]
        ]);
    }

    /**
     * Advanced mode: Custom date range and row settings
     */
    private function getAdvancedReports(Request $request)
    {
        $status = $request->get('status', 'all'); // active, discharged, all
        $rows = (int) $request->get('rows', 10); // Custom row count
        $page = (int) $request->get('page', 1);
        
        // Custom date range
        $startDate = $request->get('start_date') 
            ? Carbon::parse($request->get('start_date'))->startOfDay()
            : Carbon::today()->startOfDay();
        
        $endDate = $request->get('end_date') 
            ? Carbon::parse($request->get('end_date'))->endOfDay()
            : Carbon::today()->endOfDay();

        // Build query
        $query = $this->buildPatientQuery($status, $startDate, $endDate);

        // Get total count and amount for summary
        $totalCount = $query->count();
        $totalAmount = $this->getTotalAmount($status, $startDate, $endDate);

        // Apply pagination
        $offset = ($page - 1) * $rows;
        $patients = $query->skip($offset)->take($rows)->get();

        // Format patient data
        $formattedPatients = $this->formatPatientData($patients);

        return response()->json([
            'success' => true,
            'mode' => 'advanced',
            'data' => [
                'patients' => $formattedPatients,
                'summary' => [
                    'total_patients' => $totalCount,
                    'total_amount' => $totalAmount,
                    'date_range' => [
                        'start' => $startDate->format('Y-m-d'),
                        'end' => $endDate->format('Y-m-d')
                    ]
                ],
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $rows,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $rows),
                    'has_prev' => $page > 1,
                    'has_next' => $page < ceil($totalCount / $rows)
                ]
            ]
        ]);
    }

    /**
     * Build patient query with filters
     */
    private function buildPatientQuery($status, $startDate, $endDate)
    {
        $query = Patient::with(['patientInfo', 'patientPhysician', 'patientRoom'])
            ->withSum('transactions', 'amount')
            ->withCount('transactions');

        // Filter by transaction date range
        $query->whereHas('transactions', function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        });

        // Filter by patient status
        if ($status === 'active') {
            // Patients without discharge QR
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
            $query->whereNotIn('id', $dischargedPatientIds);
        } elseif ($status === 'discharged') {
            // Patients with discharge QR
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
            $query->whereIn('id', $dischargedPatientIds);
        }
        // 'all' status doesn't need additional filtering

        // Order by total amount descending
        $query->orderBy('transactions_sum_amount', 'desc');

        return $query;
    }

    /**
     * Get total amount for the filtered criteria
     */
    private function getTotalAmount($status, $startDate, $endDate)
    {
        $query = PatientTransaction::whereBetween('created_at', [$startDate, $endDate]);

        if ($status === 'active') {
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
            $query->whereNotIn('patient_id', $dischargedPatientIds);
        } elseif ($status === 'discharged') {
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
            $query->whereIn('patient_id', $dischargedPatientIds);
        }

        return (float) ($query->sum('amount') ?? 0);
    }

    /**
     * Format patient data for response
     */
    private function formatPatientData($patients)
    {
        return $patients->map(function($patient) {
            // Determine status based on QR records
            $hasDischargeQR = PatientQR::where('patient_id', $patient->id)
                ->where('action', 'discharge')
                ->exists();

            $patientInfo = $patient->patientInfo;
            $physician = $patient->patientPhysician;
            $room = $patient->patientRoom;

            return [
                'id' => $patient->id,
                'name' => $patientInfo 
                    ? trim(($patientInfo->first_name ?? '') . ' ' . ($patientInfo->middle_name ?? '') . ' ' . ($patientInfo->last_name ?? '') . ' ' . ($patientInfo->suffix ?? ''))
                    : 'Unknown Patient',
                'total_amount' => (float) ($patient->transactions_sum_amount ?? 0),
                'transaction_count' => $patient->transactions_count ?? 0,
                'status' => $hasDischargeQR ? 'discharged' : 'active',
                'physician' => $physician 
                    ? 'Dr. ' . trim(($physician->first_name ?? '') . ' ' . ($physician->last_name ?? ''))
                    : 'Not assigned',
                'room' => $room ? $room->room_name : 'Not assigned',
                'contact' => $patientInfo->contact_number ?? 'N/A',
                'admitted_date' => $patientInfo && $patientInfo->admitted_date 
                    ? $patientInfo->admitted_date->format('M d, Y')
                    : 'N/A'
            ];
        });
    }

    /**
     * Get date range based on period
     */
    private function getDateRange($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'today':
                return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
                
            case 'week':
                return [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()];
                
            case 'month':
                return [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
                
            case 'year':
                return [$now->copy()->startOfYear(), $now->copy()->endOfYear()];
                
            default:
                return [$now->copy()->startOfDay(), $now->copy()->endOfDay()];
        }
    }

    /**
     * Get period label for display
     */
    private function getPeriodLabel($period)
    {
        $labels = [
            'today' => 'Today (' . Carbon::today()->format('M d, Y') . ')',
            'week' => 'This Week (' . Carbon::now()->startOfWeek()->format('M d') . ' - ' . Carbon::now()->endOfWeek()->format('M d, Y') . ')',
            'month' => Carbon::now()->format('F Y'),
            'year' => Carbon::now()->format('Y')
        ];

        return $labels[$period] ?? 'Today';
    }

    /**
     * Export reports to CSV/Excel
     */
    public function exportReports(Request $request)
    {
        try {
            $mode = $request->get('mode', 'default');
            $format = $request->get('format', 'csv');

            // Get ALL data for export (not paginated)
            $exportRequest = clone $request;
            $exportRequest->merge(['rows' => 9999, 'page' => 1]); // Get all records

            // Get the same data as the reports
            if ($mode === 'advanced') {
                $response = $this->getAdvancedReports($exportRequest);
            } else {
                $response = $this->getDefaultReports($exportRequest);
            }

            $data = $response->getData(true);
            
            if (!$data['success']) {
                return response()->json(['error' => 'Failed to generate report'], 500);
            }

            $patients = $data['data']['patients'];
            $summary = $data['data']['summary'];

            // Generate filename with proper timestamp
            $timestamp = now()->format('Y-m-d_H-i-s');
            $modeLabel = ucfirst($mode);
            $periodLabel = $mode === 'default' ? ucfirst($request->get('period', 'today')) : 'Custom';
            $filename = "Billing_Report_{$modeLabel}_{$periodLabel}_{$timestamp}";

            if ($format === 'csv') {
                return $this->exportToCsv($patients, $summary, $filename . '.csv', $request);
            } else {
                return $this->exportToExcel($patients, $summary, $filename . '.xlsx', $request);
            }

        } catch (\Exception $e) {
            \Log::error('Error exporting reports: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export to CSV with better formatting
     */
    private function exportToCsv($patients, $summary, $filename, $request)
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        $callback = function() use ($patients, $summary, $request) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8 support in Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Company Header
            fputcsv($file, ['ACEMCT BILLING SYSTEM - BILLING REPORT']);
            fputcsv($file, ['Generated on: ' . now()->format('F d, Y g:i A')]);
            fputcsv($file, []); // Empty row
            
            // Report Details
            fputcsv($file, ['REPORT SUMMARY']);
            fputcsv($file, ['Mode', ucfirst($request->get('mode', 'default'))]);
            
            if ($request->get('mode') === 'default') {
                fputcsv($file, ['Period', ucfirst($request->get('period', 'today'))]);
                if (isset($summary['period_label'])) {
                    fputcsv($file, ['Date Range', $summary['period_label']]);
                }
            } else {
                fputcsv($file, ['Start Date', $summary['date_range']['start'] ?? 'N/A']);
                fputcsv($file, ['End Date', $summary['date_range']['end'] ?? 'N/A']);
            }
            
            fputcsv($file, ['Patient Status Filter', ucfirst($request->get('status', 'all'))]);
            fputcsv($file, ['Total Patients', number_format($summary['total_patients'] ?? 0)]);
            fputcsv($file, ['Total Revenue', 'PHP ' . number_format($summary['total_amount'] ?? 0, 2)]);
            
            // Calculate additional statistics
            $averagePerPatient = ($summary['total_patients'] ?? 0) > 0 
                ? ($summary['total_amount'] ?? 0) / $summary['total_patients'] 
                : 0;
            fputcsv($file, ['Average per Patient', 'PHP ' . number_format($averagePerPatient, 2)]);
            
            fputcsv($file, []); // Empty row
            fputcsv($file, []); // Empty row
            
            // Patient Data Header
            fputcsv($file, ['PATIENT BILLING DETAILS']);
            fputcsv($file, []); // Empty row
            
            // Table headers
            fputcsv($file, [
                '#',
                'Patient ID',
                'Patient Name', 
                'Status',
                'Total Amount (PHP)',
                'Transaction Count',
                'Attending Physician',
                'Room Assignment',
                'Contact Number',
                'Admission Date'
            ]);
            
            // Add patient data with row numbers
            $rowNumber = 1;
            foreach ($patients as $patient) {
                fputcsv($file, [
                    $rowNumber++,
                    $patient['id'],
                    $this->cleanCsvValue($patient['name']),
                    ucfirst($patient['status']),
                    number_format($patient['total_amount'], 2),
                    $patient['transaction_count'],
                    $this->cleanCsvValue($patient['physician']),
                    $this->cleanCsvValue($patient['room']),
                    $this->cleanCsvValue($patient['contact']),
                    $patient['admitted_date']
                ]);
            }
            
            // Add summary footer
            fputcsv($file, []); // Empty row
            fputcsv($file, []); // Empty row
            fputcsv($file, ['SUMMARY TOTALS']);
            fputcsv($file, ['Total Records', count($patients)]);
            fputcsv($file, ['Total Revenue', 'PHP ' . number_format($summary['total_amount'] ?? 0, 2)]);
            fputcsv($file, ['Report Generated By', 'ACEMCT Billing System']);
            fputcsv($file, ['Export Date', now()->format('Y-m-d H:i:s')]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to Excel with better formatting
     */
    private function exportToExcel($patients, $summary, $filename, $request)
    {
        // For now, we'll create a properly formatted CSV that Excel can read well
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ];

        $callback = function() use ($patients, $summary, $request) {
            $file = fopen('php://output', 'w');
            
            // Excel-friendly CSV format
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM for UTF-8
            
            // Header with styling information for Excel
            fputcsv($file, ['ACEMCT BILLING SYSTEM - BILLING REPORT'], ',', '"');
            fputcsv($file, ['Generated: ' . now()->format('F d, Y g:i A')], ',', '"');
            fputcsv($file, [], ',', '"'); // Empty row
            
            // Summary section
            fputcsv($file, ['REPORT CONFIGURATION'], ',', '"');
            fputcsv($file, ['Report Mode', ucfirst($request->get('mode', 'default'))], ',', '"');
            
            if ($request->get('mode') === 'default') {
                fputcsv($file, ['Time Period', ucfirst($request->get('period', 'today'))], ',', '"');
            } else {
                fputcsv($file, ['Date Range', $summary['date_range']['start'] . ' to ' . $summary['date_range']['end']], ',', '"');
            }
            
            fputcsv($file, ['Status Filter', ucfirst($request->get('status', 'all')) . ' patients'], ',', '"');
            fputcsv($file, [], ',', '"'); // Empty row
            
            // Financial summary
            fputcsv($file, ['FINANCIAL SUMMARY'], ',', '"');
            fputcsv($file, ['Total Patients', number_format($summary['total_patients'] ?? 0)], ',', '"');
            fputcsv($file, ['Total Revenue', number_format($summary['total_amount'] ?? 0, 2)], ',', '"');
            
            $averagePerPatient = ($summary['total_patients'] ?? 0) > 0 
                ? ($summary['total_amount'] ?? 0) / $summary['total_patients'] 
                : 0;
            fputcsv($file, ['Average per Patient', number_format($averagePerPatient, 2)], ',', '"');
            fputcsv($file, [], ',', '"'); // Empty row
            fputcsv($file, [], ',', '"'); // Empty row
            
            // Data table
            fputcsv($file, ['PATIENT BILLING DATA'], ',', '"');
            fputcsv($file, [], ',', '"'); // Empty row
            
            // Headers
            fputcsv($file, [
                'Row #',
                'Patient ID',
                'Full Name',
                'Status',
                'Total Amount',
                'Transactions',
                'Physician',
                'Room',
                'Contact',
                'Admitted'
            ], ',', '"');
            
            // Data rows
            $rowNumber = 1;
            foreach ($patients as $patient) {
                fputcsv($file, [
                    $rowNumber++,
                    'PT-' . str_pad($patient['id'], 6, '0', STR_PAD_LEFT),
                    $this->cleanCsvValue($patient['name']),
                    strtoupper($patient['status']),
                    number_format($patient['total_amount'], 2),
                    $patient['transaction_count'],
                    $this->cleanCsvValue($patient['physician']),
                    $this->cleanCsvValue($patient['room']),
                    $this->formatPhoneNumber($patient['contact']),
                    $patient['admitted_date']
                ], ',', '"');
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Clean CSV values to prevent formatting issues
     */
    private function cleanCsvValue($value)
    {
        if (is_null($value) || $value === '') {
            return 'N/A';
        }
        
        // Remove extra spaces and clean up the value
        $cleaned = trim(preg_replace('/\s+/', ' ', $value));
        
        // Remove any potentially problematic characters
        $cleaned = str_replace(['"', "\n", "\r", "\t"], ['""', ' ', ' ', ' '], $cleaned);
        
        return $cleaned;
    }

    /**
     * Format phone number for better display
     */
    private function formatPhoneNumber($phone)
    {
        if (is_null($phone) || $phone === '' || $phone === 'N/A') {
            return 'N/A';
        }
        
        // Remove non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phone);
        
        // Format based on length
        if (strlen($cleaned) === 11 && substr($cleaned, 0, 2) === '09') {
            // Philippine mobile format: 09XX-XXX-XXXX
            return substr($cleaned, 0, 4) . '-' . substr($cleaned, 4, 3) . '-' . substr($cleaned, 7);
        } elseif (strlen($cleaned) === 10) {
            // Format as XXX-XXX-XXXX
            return substr($cleaned, 0, 3) . '-' . substr($cleaned, 3, 3) . '-' . substr($cleaned, 6);
        }
        
        return $cleaned;
    }

    /**
     * Get enhanced report statistics
     */
    public function getReportStats(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $mode = $request->get('mode', 'default');
            
            if ($mode === 'advanced') {
                $startDate = $request->get('start_date') 
                    ? Carbon::parse($request->get('start_date'))->startOfDay()
                    : Carbon::today()->startOfDay();
                $endDate = $request->get('end_date') 
                    ? Carbon::parse($request->get('end_date'))->endOfDay()
                    : Carbon::today()->endOfDay();
            } else {
                [$startDate, $endDate] = $this->getDateRange($period);
            }

            $stats = [
                'total_revenue' => $this->getTotalAmount('all', $startDate, $endDate),
                'active_patients_revenue' => $this->getTotalAmount('active', $startDate, $endDate),
                'discharged_patients_revenue' => $this->getTotalAmount('discharged', $startDate, $endDate),
                'total_transactions' => PatientTransaction::whereBetween('created_at', [$startDate, $endDate])->count(),
                'average_per_patient' => 0,
                'highest_billing' => 0,
                'lowest_billing' => 0
            ];

            // Calculate average per patient
            $totalPatients = Patient::whereHas('transactions', function($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate]);
            })->count();

            if ($totalPatients > 0) {
                $stats['average_per_patient'] = $stats['total_revenue'] / $totalPatients;
                
                // Get highest and lowest billing amounts
                $billingAmounts = Patient::whereHas('transactions', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                })->withSum('transactions', 'amount')->pluck('transactions_sum_amount')->filter();
                
                if ($billingAmounts->count() > 0) {
                    $stats['highest_billing'] = $billingAmounts->max();
                    $stats['lowest_billing'] = $billingAmounts->min();
                }
            }

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'date_range' => [
                    'start' => $startDate->format('Y-m-d'),
                    'end' => $endDate->format('Y-m-d')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching report stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics'
            ], 500);
        }
    }

    /**
     * Add this method for testing
     */
    public function test()
    {
        return response()->json([
            'success' => true,
            'message' => 'BillingReportController is working!'
        ]);
    }
}