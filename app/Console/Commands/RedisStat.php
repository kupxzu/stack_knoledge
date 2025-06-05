<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class RedisStat extends Command
{
    protected $signature = 'redis:stat {--debug : Show detailed debug information}';
    protected $description = 'Display Redis statistics';

    public function handle()
    {
        $this->info('Testing Redis connection...');

        try {
            // Try a basic Redis ping to test connectivity
            $pingResult = Redis::ping();
            $this->info('Redis ping: ' . ($pingResult === true || $pingResult === '+PONG' ? 'Success ✓' : 'Failed ✗'));

            // Get Redis connection info
            $this->info('Fetching Redis info...');
            $info = Redis::info();
            
            if ($this->option('debug')) {
                $this->info('Raw Redis info structure:');
                $this->line(json_encode(array_keys($info), JSON_PRETTY_PRINT));
            }

            // Display Redis server stats
            $this->info('Redis Statistics:');
            $stats = [
                ['Redis Connected', 'Yes ✓'],
                ['Server', config('database.redis.default.host') . ':' . config('database.redis.default.port')],
                ['Client', class_exists('Predis\Client') ? 'Predis' : 'PhpRedis'],
            ];

            // PhpRedis organizes info differently than Predis
            if (isset($info['Memory'])) {
                // PhpRedis format - info is segmented
                if (isset($info['Memory']['used_memory_human'])) {
                    $stats[] = ['Memory Usage', $info['Memory']['used_memory_human']];
                }
                
                if (isset($info['Server']['redis_version'])) {
                    $stats[] = ['Redis Version', $info['Server']['redis_version']];
                }
                
                if (isset($info['Server']['uptime_in_days'])) {
                    $stats[] = ['Uptime', $info['Server']['uptime_in_days'] . ' days'];
                }
                
                if (isset($info['Clients']['connected_clients'])) {
                    $stats[] = ['Connected Clients', $info['Clients']['connected_clients']];
                }
            } else {
                // Flat format (possible with Predis or older phpredis)
                $infoKeys = [
                    'redis_version' => 'Redis Version',
                    'used_memory_human' => 'Memory Usage',
                    'uptime_in_days' => 'Uptime (days)',
                    'connected_clients' => 'Connected Clients'
                ];

                foreach ($infoKeys as $key => $label) {
                    if (isset($info[$key])) {
                        $stats[] = [$label, $info[$key]];
                    }
                }
            }

            $this->table(['Metric', 'Value'], $stats);

            // Let's test key-value operations
            $testKey = 'cas_billing:test:' . time();
            Redis::set($testKey, 'Test value');
            $testValue = Redis::get($testKey);
            
            $this->info('Redis Set/Get Test: ' . ($testValue === 'Test value' ? 'Success ✓' : 'Failed ✗'));
            Redis::del($testKey);

            // Show keys matching our prefix
            $prefix = config('database.redis.options.prefix', 'cas_billing_');
            $this->info("Searching for keys with prefix '{$prefix}'...");
            
            // Use scan instead of keys for better performance
            $keys = [];
            $cursor = '0';
            $pattern = '*';
            
            do {
                [$cursor, $result] = Redis::scan($cursor, ['match' => $pattern, 'count' => 100]);
                $keys = array_merge($keys, $result);
            } while ($cursor != '0');
            
            $this->info('Total Redis Keys: ' . count($keys));
            
            if (count($keys) > 0) {
                $keyData = [];
                foreach (array_slice($keys, 0, 10) as $key) {
                    $type = Redis::type($key);
                    $ttl = Redis::ttl($key);
                    
                    if ($type === 'string') {
                        $value = Redis::get($key);
                        $valuePreview = is_string($value) ? (strlen($value) > 30 ? substr($value, 0, 30) . '...' : $value) : gettype($value);
                    } else {
                        $valuePreview = "[{$type}]";
                    }
                    
                    $keyData[] = [
                        $key, 
                        $type,
                        $ttl > 0 ? $ttl . ' seconds' : ($ttl == -1 ? 'No expiry' : 'Expired'),
                        $valuePreview
                    ];
                }
                
                $this->info('Sample Redis Keys:');
                $this->table(['Key', 'Type', 'TTL', 'Value Preview'], $keyData);
                
                if (count($keys) > 10) {
                    $this->info('... and ' . (count($keys) - 10) . ' more keys');
                }
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Redis Error: ' . $e->getMessage());
            
            if ($this->option('debug')) {
                $this->error('Stack trace:');
                $this->line($e->getTraceAsString());
            }
            
            $this->info('Redis Connection Details:');
            $this->table(['Setting', 'Value'], [
                ['Host', config('database.redis.default.host', 'Not set')],
                ['Port', config('database.redis.default.port', 'Not set')],
                ['Client', config('database.redis.client', 'Not set')],
                ['Extension Loaded', extension_loaded('redis') ? 'Yes' : 'No'],
            ]);
            
            return Command::FAILURE;
        }
    }
}