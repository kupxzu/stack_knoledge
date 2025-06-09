<?php


namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Patient;
use App\Models\PatientQR;
use App\Models\PatientInfo;
use App\Models\PatientPhysician;
use App\Models\PatientRoom;
use App\Models\PatientTransaction;
use Carbon\Carbon;

class BillingDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $period = $request->get('period', 'week');

            // Active Patients (patients with 'active' QR codes but no 'discharge' QR codes)
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id')->unique();
            $activePatients = Patient::whereNotIn('id', $dischargedPatientIds)->count();

            // Total Revenue (sum all PatientTransaction amounts) - ensure numeric
            $totalRevenue = (float) (PatientTransaction::sum('amount') ?? 0);

            // Today's Revenue - ensure numeric
            $todayRevenue = (float) (PatientTransaction::whereDate('created_at', today())->sum('amount') ?? 0);

            // Discharged Patients (using QR records with discharge action)
            $dischargedPatients = PatientQR::where('action', 'discharge')->distinct('patient_id')->count();

            // Pending Transactions (estimate based on patients without recent transactions)
            $pendingTransactions = $this->getPendingTransactionsCount();

            // Average Transaction Amount - ensure numeric
            $averageTransactionAmount = (float) (PatientTransaction::avg('amount') ?? 0);

            $stats = [
                'activePatients' => (int) $activePatients,
                'totalRevenue' => $totalRevenue,
                'todayRevenue' => $todayRevenue,
                'dischargedPatients' => (int) $dischargedPatients,
                'pendingTransactions' => (int) $pendingTransactions,
                'averageTransactionAmount' => $averageTransactionAmount
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching billing stats: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'stats' => [
                    'activePatients' => 0,
                    'totalRevenue' => 0.0,
                    'todayRevenue' => 0.0,
                    'dischargedPatients' => 0,
                    'pendingTransactions' => 0,
                    'averageTransactionAmount' => 0.0
                ]
            ], 200);
        }
    }

    private function getPendingTransactionsCount()
    {
        try {
            // Count active patients who haven't had transactions in the last 7 days
            $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
            
            $activePatients = Patient::whereNotIn('id', $dischargedPatientIds)->get();
            
            $pendingCount = 0;
            foreach ($activePatients as $patient) {
                $hasRecentTransaction = PatientTransaction::where('patient_id', $patient->id)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->exists();
                
                if (!$hasRecentTransaction) {
                    $pendingCount++;
                }
            }
            
            return $pendingCount;
            
        } catch (\Exception $e) {
            \Log::error('Error calculating pending transactions: ' . $e->getMessage());
            return 0;
        }
    }

    public function getDischargeStats(Request $request)
    {
        try {
            $period = $request->get('period', 'week');

            // Calculate average stay duration using PatientQR records
            $averageStay = $this->calculateAverageStayDuration();

            // Today's discharges using QR records
            $todayDischarges = PatientQR::where('action', 'discharge')
                ->whereDate('created_at', today())
                ->count();

            // Discharge trend based on period
            $dischargeTrend = $this->getDischargeByPeriod($period);

            $stats = [
                'averageStayDuration' => $averageStay,
                'todayDischarges' => $todayDischarges,
                'dischargeTrend' => $dischargeTrend
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching discharge stats: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'stats' => [
                    'averageStayDuration' => 0,
                    'todayDischarges' => 0,
                    'dischargeTrend' => []
                ]
            ], 200);
        }
    }

    private function calculateAverageStayDuration()
    {
        try {
            // Get discharged patients with their admission and discharge QR records
            $dischargedPatients = Patient::whereHas('qrCodes', function($query) {
                $query->where('action', 'discharge');
            })->with(['qrCodes' => function($query) {
                $query->whereIn('action', ['active', 'discharge'])
                      ->orderBy('created_at', 'asc');
            }])->get();

            $totalDays = 0;
            $patientCount = 0;

            foreach ($dischargedPatients as $patient) {
                $qrCodes = $patient->qrCodes;
                
                // Find the first 'active' QR (admission) and last 'discharge' QR
                $admissionQR = $qrCodes->where('action', 'active')->first();
                $dischargeQR = $qrCodes->where('action', 'discharge')->last();
                
                if ($admissionQR && $dischargeQR) {
                    $stayDuration = $dischargeQR->created_at->diffInDays($admissionQR->created_at);
                    $totalDays += $stayDuration;
                    $patientCount++;
                }
            }

            return $patientCount > 0 ? round($totalDays / $patientCount, 1) : 0;

        } catch (\Exception $e) {
            \Log::error('Error calculating average stay duration: ' . $e->getMessage());
            return 0;
        }
    }

    private function getDischargeByPeriod($period)
    {
        $dischargeData = [];
        
        switch ($period) {
            case 'today':
                // Hourly data for today (24 hours)
                for ($i = 0; $i < 24; $i++) {
                    $hour = Carbon::today()->addHours($i);
                    $nextHour = Carbon::today()->addHours($i + 1);
                    
                    $discharges = PatientQR::where('action', 'discharge')
                        ->whereBetween('created_at', [$hour, $nextHour])
                        ->count();
                    
                    $dischargeData[] = [
                        'date' => $hour->format('g A'),
                        'discharges' => $discharges
                    ];
                }
                break;
                
            case 'week':
                // Daily data for the current week
                $startOfWeek = now()->startOfWeek();
                for ($i = 0; $i < 7; $i++) {
                    $date = $startOfWeek->copy()->addDays($i);
                    
                    $discharges = PatientQR::where('action', 'discharge')
                        ->whereDate('created_at', $date)
                        ->count();
                    
                    $dischargeData[] = [
                        'date' => $date->format('D, M j'),
                        'discharges' => $discharges
                    ];
                }
                break;
                
            case 'month':
                // Daily data for the current month
                $startOfMonth = now()->startOfMonth();
                $daysInMonth = now()->daysInMonth;
                
                for ($i = 0; $i < $daysInMonth; $i++) {
                    $date = $startOfMonth->copy()->addDays($i);
                    
                    $discharges = PatientQR::where('action', 'discharge')
                        ->whereDate('created_at', $date)
                        ->count();
                    
                    $dischargeData[] = [
                        'date' => $date->format('M j'),
                        'discharges' => $discharges
                    ];
                }
                break;
                
            case 'year':
                // Monthly data for the current year
                $startOfYear = now()->startOfYear();
                
                for ($i = 0; $i < 12; $i++) {
                    $month = $startOfYear->copy()->addMonths($i);
                    
                    $discharges = PatientQR::where('action', 'discharge')
                        ->whereBetween('created_at', [
                            $month->startOfMonth(),
                            $month->endOfMonth()
                        ])
                        ->count();
                    
                    $dischargeData[] = [
                        'date' => $month->format('M Y'),
                        'discharges' => $discharges
                    ];
                }
                break;
                
            default:
                // Default to last 7 days
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $discharges = PatientQR::where('action', 'discharge')
                        ->whereDate('created_at', $date)
                        ->count();
                    
                    $dischargeData[] = [
                        'date' => $date->format('M j'),
                        'discharges' => $discharges
                    ];
                }
        }
        
        return $dischargeData;
    }

    public function getTransactionStats(Request $request)
    {
        try {
            $period = $request->get('period', 'week');

            // Revenue growth calculation based on period
            $revenueGrowth = $this->calculateRevenueGrowth($period);

            // Revenue by time period
            $revenueByDay = $this->getRevenueByPeriod($period);

            // Unpaid patients (patients with no recent transactions)
            $unpaidPatients = Patient::with(['patientInfo', 'patientPhysician'])
                ->get()
                ->filter(function($patient) {
                    $hasRecentTransaction = PatientTransaction::where('patient_id', $patient->id)
                        ->where('created_at', '>=', now()->subDays(30))
                        ->exists();
                    return !$hasRecentTransaction;
                })
                ->take(5)
                ->map(function($patient) {
                    $lastTransaction = PatientTransaction::where('patient_id', $patient->id)
                        ->latest()
                        ->first();
                    
                    $daysWithoutPayment = $lastTransaction 
                        ? now()->diffInDays($lastTransaction->created_at)
                        : 30;

                    return [
                        'name' => ($patient->patientInfo->first_name ?? '') . ' ' . ($patient->patientInfo->last_name ?? ''),
                        'physician' => $patient->patientPhysician 
                            ? 'Dr. ' . ($patient->patientPhysician->first_name ?? '') . ' ' . ($patient->patientPhysician->last_name ?? '')
                            : 'Not assigned',
                        'days_without_payment' => $daysWithoutPayment
                    ];
                });

            $stats = [
                'revenueGrowth' => round($revenueGrowth, 1),
                'revenueByDay' => $revenueByDay,
                'unpaidPatients' => $unpaidPatients
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching transaction stats: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'stats' => [
                    'revenueGrowth' => 0,
                    'revenueByDay' => [],
                    'unpaidPatients' => []
                ]
            ], 200);
        }
    }

    private function calculateRevenueGrowth($period)
    {
        switch ($period) {
            case 'today':
                $currentRevenue = PatientTransaction::whereDate('created_at', today())->sum('amount') ?? 0;
                $previousRevenue = PatientTransaction::whereDate('created_at', today()->subDay())->sum('amount') ?? 0;
                break;
                
            case 'week':
                $currentRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->sum('amount') ?? 0;
                
                $previousRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->subWeek()->startOfWeek(),
                    now()->subWeek()->endOfWeek()
                ])->sum('amount') ?? 0;
                break;
                
            case 'month':
                $currentRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->startOfMonth(),
                    now()->endOfMonth()
                ])->sum('amount') ?? 0;
                
                $previousRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->subMonth()->startOfMonth(),
                    now()->subMonth()->endOfMonth()
                ])->sum('amount') ?? 0;
                break;
                
            case 'year':
                $currentRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->startOfYear(),
                    now()->endOfYear()
                ])->sum('amount') ?? 0;
                
                $previousRevenue = PatientTransaction::whereBetween('created_at', [
                    now()->subYear()->startOfYear(),
                    now()->subYear()->endOfYear()
                ])->sum('amount') ?? 0;
                break;
                
            default:
                $currentRevenue = PatientTransaction::whereDate('created_at', today())->sum('amount') ?? 0;
                $previousRevenue = PatientTransaction::whereDate('created_at', today()->subDay())->sum('amount') ?? 0;
        }

        return $previousRevenue > 0 ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
    }

    private function getRevenueByPeriod($period)
    {
        $revenueData = [];
        
        switch ($period) {
            case 'today':
                // Hourly data for today (24 hours)
                for ($i = 0; $i < 24; $i++) {
                    $hour = Carbon::today()->addHours($i);
                    $nextHour = Carbon::today()->addHours($i + 1);
                    
                    $revenue = (float) (PatientTransaction::whereBetween('created_at', [
                        $hour,
                        $nextHour
                    ])->sum('amount') ?? 0);
                    
                    $revenueData[] = [
                        'date' => $hour->format('g A'), // 1 AM, 2 PM, etc.
                        'revenue' => $revenue
                    ];
                }
                break;
                
            case 'week':
                // Daily data for the current week (7 days)
                $startOfWeek = now()->startOfWeek();
                for ($i = 0; $i < 7; $i++) {
                    $date = $startOfWeek->copy()->addDays($i);
                    
                    $revenue = (float) (PatientTransaction::whereDate('created_at', $date)->sum('amount') ?? 0);
                    
                    $revenueData[] = [
                        'date' => $date->format('D, M j'), // Mon, Dec 9
                        'revenue' => $revenue
                    ];
                }
                break;
                
            case 'month':
                // Daily data for the current month
                $startOfMonth = now()->startOfMonth();
                $daysInMonth = now()->daysInMonth;
                
                for ($i = 0; $i < $daysInMonth; $i++) {
                    $date = $startOfMonth->copy()->addDays($i);
                    
                    $revenue = (float) (PatientTransaction::whereDate('created_at', $date)->sum('amount') ?? 0);
                    
                    $revenueData[] = [
                        'date' => $date->format('M j'), // Dec 9
                        'revenue' => $revenue
                    ];
                }
                break;
                
            case 'year':
                // Monthly data for the current year (12 months)
                $startOfYear = now()->startOfYear();
                
                for ($i = 0; $i < 12; $i++) {
                    $month = $startOfYear->copy()->addMonths($i);
                    $nextMonth = $month->copy()->addMonth();
                    
                    $revenue = (float) (PatientTransaction::whereBetween('created_at', [
                        $month->startOfMonth(),
                        $month->endOfMonth()
                    ])->sum('amount') ?? 0);
                    
                    $revenueData[] = [
                        'date' => $month->format('M Y'), // Dec 2024
                        'revenue' => $revenue
                    ];
                }
                break;
                
            default:
                // Default to weekly view
                for ($i = 6; $i >= 0; $i--) {
                    $date = now()->subDays($i);
                    $revenue = (float) (PatientTransaction::whereDate('created_at', $date)->sum('amount') ?? 0);
                    
                    $revenueData[] = [
                        'date' => $date->format('M j'),
                        'revenue' => $revenue
                    ];
                }
        }
        
        return $revenueData;
    }

    public function getPhysicianStats(Request $request)
    {
        try {
            // Physician types distribution using the 'physician' field
            $physicianTypes = PatientPhysician::select('physician', DB::raw('count(*) as count'))
                ->groupBy('physician')
                ->get()
                ->map(function($item, $index) {
                    $colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                    return [
                        'type' => ucfirst($item->physician ?? 'Unknown'),
                        'count' => $item->count,
                        'color' => $colors[$index % count($colors)]
                    ];
                });

            // Top physicians by patient count
            $topPhysicians = Patient::with('patientPhysician')
                ->select('ptphysician_id', DB::raw('count(*) as patient_count'))
                ->whereNotNull('ptphysician_id')
                ->groupBy('ptphysician_id')
                ->orderBy('patient_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    $physician = $item->patientPhysician;
                    return [
                        'physician' => $physician ? 'Dr. ' . ($physician->first_name ?? '') . ' ' . ($physician->last_name ?? '') : 'Unknown',
                        'type' => $physician ? ucfirst($physician->physician ?? 'General') : 'General',
                        'patients' => $item->patient_count
                    ];
                });

            $stats = [
                'physicianTypes' => $physicianTypes,
                'topPhysiciansByRevenue' => $topPhysicians
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching physician stats: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'stats' => [
                    'physicianTypes' => [],
                    'topPhysiciansByRevenue' => []
                ]
            ], 200);
        }
    }

    public function getPatientsList(Request $request)
    {
        try {
            $status = $request->get('status', 'active');
            $search = $request->get('search', '');
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);

            $query = Patient::with(['patientInfo', 'patientRoom', 'patientPhysician'])
                ->withCount('transactions')
                ->withSum('transactions', 'amount');

            // Filter by status - since there's no status column, use different logic
            if ($status === 'discharged') {
                // Get patients who have discharge QR records
                $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
                $query->whereIn('id', $dischargedPatientIds);
            } elseif ($status === 'active') {
                // Get patients who don't have discharge records
                $dischargedPatientIds = PatientQR::where('action', 'discharge')->pluck('patient_id');
                $query->whereNotIn('id', $dischargedPatientIds);
            }
            // 'all' doesn't need additional filtering

            // Search functionality
            if ($search) {
                $query->whereHas('patientInfo', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%");
                });
            }

            // Pagination
            $total = $query->count();
            $patients = $query->skip(($page - 1) * $perPage)
                             ->take($perPage)
                             ->get()
                             ->map(function($patient) use ($status) {
                                 // Determine status based on QR records
                                 $hasDischargeQR = PatientQR::where('patient_id', $patient->id)
                                     ->where('action', 'discharge')
                                     ->exists();
                                 
                                 return [
                                     'id' => $patient->id,
                                     'status' => $hasDischargeQR ? 'discharged' : 'active',
                                     'total_amount' => $patient->transactions_sum_amount ?? 0,
                                     'transaction_count' => $patient->transactions_count ?? 0,
                                     'patient_info' => $patient->patientInfo,
                                     'patient_room' => $patient->patientRoom,
                                     'patient_physician' => $patient->patientPhysician
                                 ];
                             });

            $totalPages = ceil($total / $perPage);

            $pagination = [
                'current_page' => (int) $page,
                'total_pages' => $totalPages,
                'total' => $total,
                'per_page' => (int) $perPage,
                'has_prev' => $page > 1,
                'has_next' => $page < $totalPages
            ];

            return response()->json([
                'success' => true,
                'patients' => $patients,
                'pagination' => $pagination
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching patients list: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'patients' => [],
                'pagination' => [
                    'current_page' => 1,
                    'total_pages' => 1,
                    'total' => 0,
                    'per_page' => 10,
                    'has_prev' => false,
                    'has_next' => false
                ]
            ], 200);
        }
    }

    private function getDateRange($period)
    {
        $end = Carbon::now();
        
        switch ($period) {
            case 'today':
                $start = Carbon::today();
                break;
            case 'week':
                $start = Carbon::now()->startOfWeek();
                break;
            case 'month':
                $start = Carbon::now()->startOfMonth();
                break;
            case 'year':
                $start = Carbon::now()->startOfYear();
                break;
            default:
                $start = Carbon::today();
        }

        return [$start, $end];
    }
}