<?php

namespace Database\Seeders;

use App\Models\PatientRoom;
use Illuminate\Database\Seeder;

class PatientRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PatientRoom::create([
            'room_name' => 'Room 101',
            'description' => 'Private room with ensuite bathroom and window view',
            'DateCreated' => now(),
            'CreatedBy' => 'admin',
        ]);

        PatientRoom::create([
            'room_name' => 'Room 205',
            'description' => 'Semi-private room with shared bathroom',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);

        PatientRoom::create([
            'room_name' => 'Room 310',
            'description' => 'ICU room with advanced monitoring equipment',
            'DateCreated' => now(),
            'CreatedBy' => 'admitting',
        ]);
    }
}
