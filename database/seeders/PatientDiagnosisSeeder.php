<?php

namespace Database\Seeders;

use App\Models\PatientDiagnosis;
use Illuminate\Database\Seeder;

class PatientDiagnosisSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientDiagnosis::create([
            'diagnosis_name' => 'Pneumonia',
            'description' => 'Bacterial pneumonia affecting left lung, requiring antibiotic treatment',
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        PatientDiagnosis::create([
            'diagnosis_name' => 'Hypertension',
            'description' => 'High blood pressure requiring medication and lifestyle changes',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        PatientDiagnosis::create([
            'diagnosis_name' => 'Type 2 Diabetes',
            'description' => 'Non-insulin dependent diabetes mellitus with complications',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
