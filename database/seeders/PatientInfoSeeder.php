<?php

namespace Database\Seeders;

use App\Models\PatientInfo;
use Illuminate\Database\Seeder;

class PatientInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientInfo::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'Smith',
            'suffix' => 'Jr',
            'gender' => 'male',
            'dob' => '1990-01-15',
            'contact_number' => '+1234567890',
            'national_id_number' => '123456789',
            'admitted_date' => '2025-05-30 10:30:00',
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        PatientInfo::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'middle_name' => 'Marie',
            'suffix' => null,
            'gender' => 'female',
            'dob' => '1985-03-22',
            'contact_number' => '+0987654321',
            'national_id_number' => '987654321',
            'admitted_date' => '2025-05-31 14:15:00',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        PatientInfo::create([
            'first_name' => 'Michael',
            'last_name' => 'Johnson',
            'middle_name' => 'Robert',
            'suffix' => 'Sr',
            'gender' => 'male',
            'dob' => '1975-07-08',
            'contact_number' => '+1122334455',
            'national_id_number' => null,
            'admitted_date' => '2025-05-29 09:45:00',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
