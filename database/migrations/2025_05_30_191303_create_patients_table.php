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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('medical_rec_no')->unique();
            $table->foreignId('ptinfo_id')->constrained('patient_info')->onDelete('cascade');
            $table->foreignId('ptaddress_id')->constrained('patient_address')->onDelete('cascade');
            $table->foreignId('ptroom_id')->constrained('patient_room')->onDelete('cascade');
            $table->foreignId('ptphysician_id')->constrained('patient_physician')->onDelete('cascade');
            $table->foreignId('ptdiagnosis_id')->constrained('patient_diagnosis')->onDelete('cascade');
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
        Schema::dropIfExists('patients');
    }
};
