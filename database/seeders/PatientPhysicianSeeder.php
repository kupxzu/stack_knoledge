<?php

namespace Database\Seeders;

use App\Models\PatientPhysician;
use Illuminate\Database\Seeder;

class PatientPhysicianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientPhysician::create([
            'first_name' => 'Sarah',
            'last_name' => 'Wilson',
            'middle_name' => 'Elizabeth',
            'suffix' => 'MD',
            'gender' => 'female',
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        PatientPhysician::create([
            'first_name' => 'David',
            'last_name' => 'Brown',
            'middle_name' => 'James',
            'suffix' => 'MD, PhD',
            'gender' => 'male',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        PatientPhysician::create([
            'first_name' => 'Lisa',
            'last_name' => 'Garcia',
            'middle_name' => 'Marie',
            'suffix' => 'DO',
            'gender' => 'female',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
