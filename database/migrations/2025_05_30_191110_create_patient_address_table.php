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
        Schema::create('patient_address', function (Blueprint $table) {
            $table->id();
            $table->text('address');
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
        Schema::dropIfExists('patient_address');
    }
};
