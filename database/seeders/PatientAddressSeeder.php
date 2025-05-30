<?php

namespace Database\Seeders;

use App\Models\PatientAddress;
use Illuminate\Database\Seeder;

class PatientAddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientAddress::create([
            'address' => '123 Main Street, Downtown City, State 12345',
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        PatientAddress::create([
            'address' => '456 Oak Avenue, Uptown District, State 67890',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        PatientAddress::create([
            'address' => '789 Pine Road, Suburban Area, State 54321',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
