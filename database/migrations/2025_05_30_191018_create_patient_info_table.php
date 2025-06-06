<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patient_info', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->enum('gender', ['male', 'female', 'others']);
            $table->enum('civil_status', ['single', 'married', 'widowed', 'divorced', 'separated']);
            $table->date('dob');
            $table->string('contact_number');
            $table->datetime('admitted_date');
            $table->timestamp('DateCreated');
            $table->string('CreatedBy');
            $table->timestamp('DateModified')->nullable();
            $table->string('ModifiedBy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_info');
    }
};
