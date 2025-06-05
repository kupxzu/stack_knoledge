<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Redis;

Route::get('/test-redis', function () {
    try {
        // Test ping
        $pong = Redis::ping();
        
        // Test set/get
        Redis::set('test_key', 'test_value');
        $value = Redis::get('test_key');
        
        return [
            'ping' => $pong,
            'set_get_test' => $value,
            'status' => 'Redis is working!'
        ];
    } catch (\Exception $e) {
        return 'Redis not working: ' . $e->getMessage();
    }
});

Route::get('/', function () {
    return view('welcome');
});
