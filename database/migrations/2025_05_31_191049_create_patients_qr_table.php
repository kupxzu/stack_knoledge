<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('patients_qr', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('pttransaction_id')->nullable();
            $table->string('qrcode')->unique();
            $table->unsignedBigInteger('ptportal_id')->nullable();
            $table->enum('action', ['active', 'discharge'])->default('active');
            $table->timestamps();

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->index(['patient_id', 'action']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients_qr');
    }
};