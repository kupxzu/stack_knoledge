<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientQRTPAController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::post('/login', [UserController::class, 'login']);
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Public patient portal access
Route::get('/patient-portal/{accessHash}', [PatientQRTPAController::class, 'getPatientPortal']);
Route::get('/download-pdf', [PatientQRTPAController::class, 'downloadPDF']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::post('/logout', [UserController::class, 'logout']);
    Route::post('/logout-all', [UserController::class, 'logoutAll']);
    Route::get('/login-history', [UserController::class, 'loginHistory']);
    
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
    
    Route::get('/patient-addresses', [PatientController::class, 'getAddresses']);
    Route::post('/patient-addresses', [PatientController::class, 'storeAddress']);
    Route::put('/patient-addresses/{id}', [PatientController::class, 'updateAddress']);
    Route::delete('/patient-addresses/{id}', [PatientController::class, 'destroyAddress']);
    
    Route::get('/patient-rooms', [PatientController::class, 'getRooms']);
    Route::post('/patient-rooms', [PatientController::class, 'storeRoom']);
    Route::put('/patient-rooms/{id}', [PatientController::class, 'updateRoom']);
    Route::delete('/patient-rooms/{id}', [PatientController::class, 'destroyRoom']);
    
    Route::get('/patient-physicians', [PatientController::class, 'getPhysicians']);
    Route::post('/patient-physicians', [PatientController::class, 'storePhysician']);
    Route::put('/patient-physicians/{id}', [PatientController::class, 'updatePhysician']);
    Route::delete('/patient-physicians/{id}', [PatientController::class, 'destroyPhysician']);

    Route::get('/physicians/admitting', function(Request $request) {
        $request->merge(['type' => 'admitting']);
        return app(PatientController::class)->getPhysicians($request);
    });
    
    Route::get('/physicians/attending', function(Request $request) {
        $request->merge(['type' => 'attending']);
        return app(PatientController::class)->getPhysicians($request);
    });

    // Alternative physician routes (cleaner endpoints)
    Route::get('/physicians', [PatientController::class, 'getPhysicians']);
    Route::post('/physicians', [PatientController::class, 'storePhysician']);
    Route::put('/physicians/{id}', [PatientController::class, 'updatePhysician']);
    Route::delete('/physicians/{id}', [PatientController::class, 'destroyPhysician']);

    // Patient QR, Transaction, Portal routes
    Route::get('/billing/active-patients', [PatientQRTPAController::class, 'getActivePatients']);
    Route::get('/billing/patients/{id}', [PatientQRTPAController::class, 'getPatientForBilling']);
    Route::post('/billing/transactions', [PatientQRTPAController::class, 'addTransaction']);
    Route::post('/billing/patients/{id}/discharge', [PatientQRTPAController::class, 'dischargePatient']);
    Route::get('/qr-codes/{qrCode}', [PatientQRTPAController::class, 'getQRCode']);
    
    Route::post('/patients/{id}/regenerate-qr', [PatientQRTPAController::class, 'regenerateQRAndPortal']);

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/dashboard/trends', [DashboardController::class, 'getTrends']);
    Route::get('/dashboard/charts', [DashboardController::class, 'getChartData']);
});