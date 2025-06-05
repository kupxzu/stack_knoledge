<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Log;

class CacheService
{
    /**
     * Cache key prefix
     */
    private const PREFIX = 'cas_billing:';
    
    /**
     * Default cache TTL (1 hour)
     */
    private const DEFAULT_TTL = 3600;
    const CACHE_TTL_SHORT = 300;   // 5 minutes
    const CACHE_TTL_MEDIUM = 1800; // 30 minutes
    const CACHE_TTL_LONG = 86400;  // 24 hours

    /**
     * Get data from cache or execute callback
     *
     * @param string $key Cache key
     * @param callable $callback Function that returns data
     * @param int|null $ttl Time to live in seconds
     * @return array Data with fromCache flag
     */
    public static function remember($key, $callback, $ttl = null)
    {
        $fullKey = self::getFullKey($key);
        $ttl = $ttl ?? self::DEFAULT_TTL;
        
        try {
            // Check if data exists in Redis
            $cachedData = Redis::get($fullKey);
            
            if ($cachedData !== null && $cachedData !== false) {
                $data = json_decode($cachedData, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    return [
                        'data' => $data,
                        'fromCache' => true
                    ];
                }
                
                // Invalid JSON in cache, remove it
                Redis::del($fullKey);
            }
        } catch (\Exception $e) {
            Log::warning("Redis cache error for key {$key}: " . $e->getMessage());
        }
        
        // Get fresh data
        $freshData = $callback();
        
        try {
            // Store in Redis
            $success = Redis::setex(
                $fullKey,
                $ttl,
                json_encode($freshData, JSON_PRESERVE_ZERO_FRACTION)
            );
            
            if (!$success) {
                Log::warning("Failed to store data in Redis cache for key: {$key}");
            }
        } catch (\Exception $e) {
            Log::warning("Redis cache storage error for key {$key}: " . $e->getMessage());
        }
        
        return [
            'data' => $freshData,
            'fromCache' => false
        ];
    }
    
    /**
     * Store data in cache
     *
     * @param string $key Cache key
     * @param mixed $data Data to store
     * @param int|null $ttl Time to live in seconds
     * @return bool Success
     */
    public static function put($key, $data, $ttl = null)
    {
        $fullKey = self::getFullKey($key);
        $ttl = $ttl ?? self::DEFAULT_TTL;
        
        try {
            return Redis::setex(
                $fullKey,
                $ttl,
                json_encode($data, JSON_PRESERVE_ZERO_FRACTION)
            );
        } catch (\Exception $e) {
            Log::warning("Redis cache put error for key {$key}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get data from cache
     *
     * @param string $key Cache key
     * @param mixed $default Default value if not found
     * @return mixed Cached data or default
     */
    public static function get($key, $default = null)
    {
        $fullKey = self::getFullKey($key);
        
        try {
            $data = Redis::get($fullKey);
            
            if ($data !== null && $data !== false) {
                $decoded = json_decode($data, true);
                return json_last_error() === JSON_ERROR_NONE ? $decoded : $default;
            }
        } catch (\Exception $e) {
            Log::warning("Redis cache get error for key {$key}: " . $e->getMessage());
        }
        
        return $default;
    }
    
    /**
     * Remove an item from cache
     *
     * @param string $key Cache key
     * @return bool Success
     */
    public static function forget($key)
    {
        try {
            $fullKey = self::getFullKey($key);
            return Redis::del($fullKey) > 0;
        } catch (\Exception $e) {
            Log::warning("Redis cache forget error for key {$key}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Remove multiple items by pattern
     *
     * @param string $pattern Key pattern
     * @return int Number of keys removed
     */
    public static function forgetPattern($pattern)
    {
        try {
            $fullPattern = self::getFullKey($pattern) . '*';
            $removed = 0;
            $cursor = '0';
            
            do {
                [$cursor, $keys] = Redis::scan($cursor, ['match' => $fullPattern, 'count' => 100]);
                
                if (!empty($keys)) {
                    $removed += Redis::del(...$keys);
                }
            } while ($cursor != '0');
            
            return $removed;
        } catch (\Exception $e) {
            Log::warning("Redis cache forgetPattern error for pattern {$pattern}: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Check if key exists in cache
     *
     * @param string $key Cache key
     * @return bool Exists
     */
    public static function has($key)
    {
        try {
            $fullKey = self::getFullKey($key);
            return Redis::exists($fullKey) > 0;
        } catch (\Exception $e) {
            Log::warning("Redis cache has error for key {$key}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get full cache key with prefix
     *
     * @param string $key Base key
     * @return string Full key
     */
    private static function getFullKey($key)
    {
        return self::PREFIX . $key;
    }
}