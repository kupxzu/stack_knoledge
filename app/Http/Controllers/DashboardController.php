<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientInfo;
use App\Models\PatientRoom;
use App\Models\PatientPhysician;
use App\Models\PatientAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $dateRange = $this->getDateRange($period);

            $stats = [
                'totalPatients' => Patient::count(),
                'todayAdmissions' => Patient::whereDate('DateCreated', today())->count(),
                'totalPhysicians' => PatientPhysician::count(),
                'averageStayDays' => $this->calculateAverageStay()
            ];

            return response()->json(['stats' => $stats]);
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Unable to fetch stats',
                'stats' => [
                    'totalPatients' => 0,
                    'todayAdmissions' => 0,
                    'totalPhysicians' => 0,
                    'averageStayDays' => 0
                ]
            ], 200);
        }
    }

    public function getTrends(Request $request)
    {
        try {
            $period = $request->get('period', 'today');
            $dateRange = $this->getDateRange($period);

            $currentPeriodAdmissions = Patient::whereBetween('DateCreated', $dateRange)->count();
            $previousPeriodAdmissions = $this->getPreviousPeriodAdmissions($period);
            
            $admissionsGrowth = $previousPeriodAdmissions > 0 
                ? (($currentPeriodAdmissions - $previousPeriodAdmissions) / $previousPeriodAdmissions) * 100 
                : 0;

            // Calculate room utilization based on occupied rooms
            $totalRooms = PatientRoom::count();
            $occupiedRooms = Patient::whereNotNull('ptroom_id')->distinct('ptroom_id')->count();
            $roomUtilization = $totalRooms > 0 ? ($occupiedRooms / $totalRooms) * 100 : 0;

            $trends = [
                'admissionsGrowth' => round($admissionsGrowth, 1),
                'roomUtilization' => round($roomUtilization, 1)
            ];

            return response()->json(['trends' => $trends]);
        } catch (\Exception $e) {
            \Log::error('Dashboard trends error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Unable to fetch trends',
                'trends' => [
                    'admissionsGrowth' => 0,
                    'roomUtilization' => 0
                ]
            ], 200);
        }
    }

    public function getChartData(Request $request)
    {
        try {
            $period = $request->get('period', 'today');

            $chartData = [
                'admissions' => $this->getAdmissionsData($period),
                'roomUsage' => $this->getRoomUsageData(),
                'patientAddresses' => $this->getPatientAddressesData(),
                'topPhysicians' => $this->getTopPhysiciansData()
            ];

            return response()->json(['chartData' => $chartData]);
        } catch (\Exception $e) {
            \Log::error('Dashboard chart data error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Unable to fetch chart data',
                'chartData' => [
                    'admissions' => [],
                    'roomUsage' => [],
                    'patientAddresses' => [],
                    'topPhysicians' => []
                ]
            ], 200);
        }
    }

    private function getDateRange($period)
    {
        switch ($period) {
            case 'today':
                return [Carbon::today(), Carbon::today()->endOfDay()];
            case 'week':
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
            case 'month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
            case 'year':
                return [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()];
            default:
                return [Carbon::today(), Carbon::today()->endOfDay()];
        }
    }

    private function calculateAverageStay()
    {
        // Calculate based on admission dates - real calculation
        $patients = Patient::join('patient_info', 'patients.ptinfo_id', '=', 'patient_info.id')
            ->whereNotNull('patient_info.admitted_date')
            ->select('patient_info.admitted_date', 'patients.DateCreated')
            ->get();

        if ($patients->count() === 0) {
            return 0;
        }

        $totalDays = 0;
        foreach ($patients as $patient) {
            $admittedDate = Carbon::parse($patient->admitted_date);
            $createdDate = Carbon::parse($patient->DateCreated);
            $daysDiff = $createdDate->diffInDays($admittedDate);
            $totalDays += $daysDiff;
        }

        return round($totalDays / $patients->count(), 1);
    }

    private function getPreviousPeriodAdmissions($period)
    {
        switch ($period) {
            case 'today':
                return Patient::whereDate('DateCreated', Carbon::yesterday())->count();
            case 'week':
                $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
                $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
                return Patient::whereBetween('DateCreated', [$lastWeekStart, $lastWeekEnd])->count();
            case 'month':
                $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
                $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
                return Patient::whereBetween('DateCreated', [$lastMonthStart, $lastMonthEnd])->count();
            case 'year':
                $lastYearStart = Carbon::now()->subYear()->startOfYear();
                $lastYearEnd = Carbon::now()->subYear()->endOfYear();
                return Patient::whereBetween('DateCreated', [$lastYearStart, $lastYearEnd])->count();
            default:
                return 0;
        }
    }

    private function getAdmissionsData($period)
    {
        try {
            if ($period === 'week') {
                $data = [];
                $start = Carbon::now()->startOfWeek();
                
                for ($i = 0; $i < 7; $i++) {
                    $date = $start->copy()->addDays($i);
                    $admissions = Patient::whereDate('DateCreated', $date)->count();
                    
                    $data[] = [
                        'name' => $date->format('D'),
                        'admissions' => $admissions,
                        'discharges' => 0 // No discharge tracking yet
                    ];
                }
                
                return $data;
            }
            
            // For other periods, return last 7 days
            $data = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $admissions = Patient::whereDate('DateCreated', $date)->count();
                
                $data[] = [
                    'name' => $date->format('M j'),
                    'admissions' => $admissions,
                    'discharges' => 0
                ];
            }
            
            return $data;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getRoomUsageData()
    {
        try {
            // Get room usage statistics - patients per room
            $roomUsage = PatientRoom::select(
                    'patient_room.room_name as name',
                    DB::raw('COUNT(patients.id) as patients')
                )
                ->leftJoin('patients', 'patient_room.id', '=', 'patients.ptroom_id')
                ->groupBy('patient_room.id', 'patient_room.room_name')
                ->orderBy('patients', 'desc')
                ->limit(10)
                ->get();

            return $roomUsage->map(function ($room) {
                return [
                    'name' => $room->name,
                    'patients' => (int) $room->patients
                ];
            })->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getPatientAddressesData()
    {
        try {
            // Extract cities from addresses and count patients
            $addressData = PatientAddress::select(
                    'patient_address.address',
                    DB::raw('COUNT(patients.id) as patients')
                )
                ->leftJoin('patients', 'patient_address.id', '=', 'patients.ptaddress_id')
                ->groupBy('patient_address.id', 'patient_address.address')
                ->orderBy('patients', 'desc')
                ->limit(50) // Increased limit to catch more addresses
                ->get();

            $cityData = [];
            $philippineCities = $this->getPhilippineCities();
            
            foreach ($addressData as $address) {
                $addressLower = strtolower($address->address);
                $city = 'Unknown';
                $foundCity = false;
                
                // Try to find Philippine city names in address
                foreach ($philippineCities as $cityName) {
                    $cityLower = strtolower($cityName);
                    if (str_contains($addressLower, $cityLower)) {
                        $city = $cityName;
                        $foundCity = true;
                        break;
                    }
                }
                
                // If no specific city found, try to extract any part with "city"
                if (!$foundCity) {
                    $addressParts = explode(',', $address->address);
                    foreach ($addressParts as $part) {
                        $part = trim($part);
                        if (str_contains(strtolower($part), 'city')) {
                            $city = $part;
                            break;
                        }
                    }
                }
                
                // Group by city
                if (isset($cityData[$city])) {
                    $cityData[$city] += (int) $address->patients;
                } else {
                    $cityData[$city] = (int) $address->patients;
                }
            }

            // Convert to chart format
            $result = [];
            foreach ($cityData as $city => $count) {
                $result[] = [
                    'name' => $city,
                    'patients' => $count,
                    'color' => $this->getRandomColor()
                ];
            }

            // Sort by patient count
            usort($result, function($a, $b) {
                return $b['patients'] - $a['patients'];
            });

            return array_slice($result, 0, 10); // Top 10 cities
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getPhilippineCities()
    {
        return [
            // Major Cities
            'Quezon City', 'Manila', 'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong',
            'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'San Juan',
            'Taguig', 'Valenzuela',
            
            // Luzon Cities
            'Alaminos', 'Angeles', 'Antipolo', 'Bacolod', 'Bago', 'Baguio', 'Balanga', 'Bataan',
            'Batangas', 'Bayawan', 'Biñan', 'Butuan', 'Cabanatuan', 'Cabuyao', 'Calamba',
            'Calapan', 'Calbayog', 'Candon', 'Canlaon', 'Cauayan', 'Cavite', 'Dagupan',
            'Danao', 'Dapitan', 'Dasmariñas', 'Dipolog', 'Dumaguete', 'Gapan', 'General Santos',
            'General Trias', 'Gingoog', 'Himamaylan', 'Ilagan', 'Iloilo', 'Imus', 'Iriga',
            'Isabela', 'Kabankalan', 'Kidapawan', 'Koronadal', 'La Carlota', 'Lamitan',
            'Laoag', 'Lapu-Lapu', 'Las Piñas', 'Legazpi', 'Ligao', 'Lipa', 'Lucena',
            'Maasin', 'Mabalacat', 'Makati', 'Malabon', 'Malaybalay', 'Malolos', 'Mandaluyong',
            'Mandaue', 'Manila', 'Marawi', 'Marikina', 'Masbate', 'Mati', 'Meycauayan',
            'Muñoz', 'Muntinlupa', 'Naga', 'Navotas', 'Olongapo', 'Ormoc', 'Oroquieta',
            'Ozamiz', 'Pagadian', 'Palayan', 'Panabo', 'Parañaque', 'Pasay', 'Pasig',
            'Passi', 'Puerto Princesa', 'Quezon City', 'Roxas', 'Sagay', 'Samal', 'San Carlos',
            'San Fernando', 'San Jose', 'San Juan', 'San Pablo', 'San Pedro', 'Santa Rosa',
            'Santiago', 'Silay', 'Sipalay', 'Sorsogon', 'Surigao', 'Tabaco', 'Tabuk',
            'Tacloban', 'Tacurong', 'Tagaytay', 'Tagbilaran', 'Taguig', 'Tagum', 'Talisay',
            'Tanauan', 'Tandag', 'Tangub', 'Tanjay', 'Tarlac', 'Tayabas', 'Toledo',
            'Trece Martires', 'Tuguegarao', 'Urdaneta', 'Valencia', 'Valenzuela', 'Victorias',
            'Vigan', 'Zamboanga',
            
            // Visayas Cities
            'Balamban', 'Bantayan', 'Barili', 'Bogo', 'Borbon', 'Carcar', 'Carmen', 'Catmon',
            'Compostela', 'Consolacion', 'Cordova', 'Daanbantayan', 'Dalaguete', 'Danao',
            'Dumanjug', 'Lapu-Lapu', 'Liloan', 'Madridejos', 'Malabuyoc', 'Mandaue', 'Medellin',
            'Minglanilla', 'Moalboal', 'Naga', 'Oslob', 'Pilar', 'Pinamungajan', 'Poro',
            'Ronda', 'San Fernando', 'San Francisco', 'San Remigio', 'Santa Fe', 'Santander',
            'Sibonga', 'Sogod', 'Tabogon', 'Tabuelan', 'Talisay', 'Toledo', 'Tuburan',
            'Tudela',
            
            // Mindanao Cities
            'Alabel', 'Alamada', 'Aleosan', 'Antipas', 'Arakan', 'Banisilan', 'Carmen',
            'Cotabato', 'Esperanza', 'Isulan', 'Kabacan', 'Kidapawan', 'Koronadal', 'Lambayong',
            'Lebak', 'Libungan', 'Lutayan', 'Maasim', 'Magpet', 'Maitum', 'Malungon',
            'Matalam', 'Midsayap', 'Mlang', 'Norala', 'Palimbang', 'Pigcawayan', 'Pikit',
            'President Roxas', 'Santo Niño', 'Surallah', 'T\'Boli', 'Tampakan', 'Tantangan',
            'Tupi', 'Columbio', 'Esperanza', 'Isulan', 'Kalamansig', 'Lebak', 'Lutayan',
            'Palimbang', 'Senator Ninoy Aquino',
            
            // Additional Cities
            'Abra de Ilog', 'Agoo', 'Apalit', 'Arayat', 'Baliwag', 'Bocaue', 'Bulacan',
            'Calumpit', 'Guiguinto', 'Hagonoy', 'Marilao', 'Norzagaray', 'Obando', 'Pandi',
            'Plaridel', 'Pulilan', 'San Ildefonso', 'San Miguel', 'San Rafael', 'Santa Maria',
            'Caloocan', 'Las Piñas', 'Makati', 'Malabon', 'Mandaluyong', 'Marikina',
            'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Quezon City', 'San Juan',
            'Taguig', 'Valenzuela',
            
            // Provincial Capitals and Other Major Cities
            'Baler', 'Batac', 'Bayombong', 'Boac', 'Bontoc', 'Cabarroguis', 'Calapan',
            'Catarman', 'Catbalogan', 'Coron', 'Cuyo', 'El Nido', 'Kalibo', 'Mamburao',
            'Marinduque', 'Palawan', 'Romblon', 'San Jose', 'Taytay', 'Virac'
        ];
    }

    private function getTopPhysiciansData()
    {
        try {
            // Get top physicians by patient count using admitting physician
            $physicians = PatientPhysician::select(
                    'patient_physician.id',
                    DB::raw('CONCAT(patient_physician.first_name, " ", patient_physician.last_name) as name'),
                    DB::raw('COUNT(patients.id) as patients')
                )
                ->leftJoin('patients', 'patient_physician.id', '=', 'patients.ptphysician_id')
                ->groupBy('patient_physician.id', 'patient_physician.first_name', 'patient_physician.last_name')
                ->orderBy('patients', 'desc')
                ->limit(5)
                ->get();

            return $physicians->map(function ($physician) {
                return [
                    'name' => $physician->name,
                    'patients' => (int) $physician->patients
                ];
            })->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function getRandomColor()
    {
        $colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ];
        return $colors[array_rand($colors)];
    }
}