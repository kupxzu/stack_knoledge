<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('qweqweqwe'),
            'role' => 'admin',
        ]);
        User::factory()->create([
            'name' => 'Admitting User',
            'username' => 'admitting',
            'email' => 'admitting@example.com',
            'password' => Hash::make('qweqweqwe'),
            'role' => 'admitting',
        ]);
        User::factory()->create([
            'name' => 'Billing User',
            'username' => 'billing',
            'email' => 'billing@example.com',
            'password' => Hash::make('qweqweqwe'),
            'role' => 'billing',
        ]);

        $this->call([
            PatientInfoSeeder::class,
            PatientAddressSeeder::class,
            PatientRoomSeeder::class,
            PatientPhysicianSeeder::class,
            PatientSeeder::class,
        ]);
    }
}
