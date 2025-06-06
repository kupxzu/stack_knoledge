<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Patient::create([
            'ptinfo_id' => 1,
            'ptaddress_id' => 1,
            'ptroom_id' => 1,
            'ptphysician_id' => 1,
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        Patient::create([
            'ptinfo_id' => 2,
            'ptaddress_id' => 2,
            'ptroom_id' => 2,
            'ptphysician_id' => 2,
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        Patient::create([
            'ptinfo_id' => 3,
            'ptaddress_id' => 3,
            'ptroom_id' => 3,
            'ptphysician_id' => 3,
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
