-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 31, 2025 at 04:50 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `a_billing`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `login_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `user_id`, `login_type`, `ip_address`, `user_agent`, `login_at`, `created_at`, `updated_at`) VALUES
(1, 2, 'email', '127.0.0.1', 'PostmanRuntime/7.44.0', '2025-05-30 11:26:30', '2025-05-30 11:26:30', '2025-05-30 11:26:30'),
(2, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:17:16', '2025-05-30 12:17:16', '2025-05-30 12:17:16'),
(3, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:18:48', '2025-05-30 12:18:48', '2025-05-30 12:18:48'),
(4, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:31:17', '2025-05-30 12:31:17', '2025-05-30 12:31:17'),
(5, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:32:43', '2025-05-30 12:32:43', '2025-05-30 12:32:43'),
(6, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:41:50', '2025-05-30 12:41:50', '2025-05-30 12:41:50'),
(7, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:43:46', '2025-05-30 12:43:46', '2025-05-30 12:43:46'),
(8, 2, 'email', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0', '2025-05-30 12:45:02', '2025-05-30 12:45:02', '2025-05-30 12:45:02');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_05_30_171014_create_personal_access_tokens_table', 1),
(5, '2025_05_30_191018_create_patient_info_table', 1),
(6, '2025_05_30_191110_create_patient_address_table', 1),
(7, '2025_05_30_191128_create_patient_room_table', 1),
(8, '2025_05_30_191204_create_patient_physician_table', 1),
(9, '2025_05_30_191244_create_patient_diagnosis_table', 1),
(10, '2025_05_30_191303_create_patients_table', 1),
(11, '2025_05_31_000002_create_logs_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `medical_rec_no` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ptinfo_id` bigint(20) UNSIGNED NOT NULL,
  `ptaddress_id` bigint(20) UNSIGNED NOT NULL,
  `ptroom_id` bigint(20) UNSIGNED NOT NULL,
  `ptphysician_id` bigint(20) UNSIGNED NOT NULL,
  `ptdiagnosis_id` bigint(20) UNSIGNED NOT NULL,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `medical_rec_no`, `ptinfo_id`, `ptaddress_id`, `ptroom_id`, `ptphysician_id`, `ptdiagnosis_id`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, 'MR001', 1, 1, 1, 1, 1, '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'MR002', 2, 2, 2, 2, 2, '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'MR003', 3, 3, 3, 3, 3, '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `patient_address`
--

CREATE TABLE `patient_address` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_address`
--

INSERT INTO `patient_address` (`id`, `address`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, '123 Main Street, Downtown City, State 12345', '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, '456 Oak Avenue, Uptown District, State 67890', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, '789 Pine Road, Suburban Area, State 54321', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `patient_diagnosis`
--

CREATE TABLE `patient_diagnosis` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `diagnosis_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_diagnosis`
--

INSERT INTO `patient_diagnosis` (`id`, `diagnosis_name`, `description`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, 'Pneumonia', 'Bacterial pneumonia affecting left lung, requiring antibiotic treatment', '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'Hypertension', 'High blood pressure requiring medication and lifestyle changes', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'Type 2 Diabetes', 'Non-insulin dependent diabetes mellitus with complications', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `patient_info`
--

CREATE TABLE `patient_info` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suffix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','others') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date NOT NULL,
  `contact_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `national_id_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admitted_date` datetime NOT NULL,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_info`
--

INSERT INTO `patient_info` (`id`, `first_name`, `last_name`, `middle_name`, `suffix`, `gender`, `dob`, `contact_number`, `national_id_number`, `admitted_date`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, 'John', 'Doe', 'Smith', 'Jr', 'male', '1990-01-15', '+1234567890', '123456789', '2025-05-30 10:30:00', '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'Jane', 'Smith', 'Marie', NULL, 'female', '1985-03-22', '+0987654321', '987654321', '2025-05-31 14:15:00', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'Michael', 'Johnson', 'Robert', 'Sr', 'male', '1975-07-08', '+1122334455', NULL, '2025-05-29 09:45:00', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `patient_physician`
--

CREATE TABLE `patient_physician` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `suffix` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('male','female','others') COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_physician`
--

INSERT INTO `patient_physician` (`id`, `first_name`, `last_name`, `middle_name`, `suffix`, `gender`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, 'Sarah', 'Wilson', 'Elizabeth', 'MD', 'female', '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'David', 'Brown', 'James', 'MD, PhD', 'male', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'Lisa', 'Garcia', 'Marie', 'DO', 'female', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `patient_room`
--

CREATE TABLE `patient_room` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `DateCreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `CreatedBy` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateModified` timestamp NULL DEFAULT NULL,
  `ModifiedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_room`
--

INSERT INTO `patient_room` (`id`, `room_name`, `description`, `DateCreated`, `CreatedBy`, `DateModified`, `ModifiedBy`, `created_at`, `updated_at`) VALUES
(1, 'Room 101', 'Private room with ensuite bathroom and window view', '2025-05-30 11:23:10', 'admin', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'Room 205', 'Semi-private room with shared bathroom', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'Room 310', 'ICU room with advanced monitoring equipment', '2025-05-30 11:23:10', 'admitting', NULL, NULL, '2025-05-30 11:23:10', '2025-05-30 11:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'remember_token', '954c441d4368e1194104a3d6965eaa083ae5629fd1d6d91a6021d621479081ab', '[\"*\"]', '2025-05-30 11:27:18', '2025-06-29 11:26:30', '2025-05-30 11:26:30', '2025-05-30 11:27:18'),
(4, 'App\\Models\\User', 2, 'access_token', 'b8c50eccd50c63741f92e9713485ddcdb87a6c21a816d9732b8e688770f4a71c', '[\"*\"]', NULL, '2025-05-31 12:31:17', '2025-05-30 12:31:17', '2025-05-30 12:31:17'),
(8, 'App\\Models\\User', 2, 'remember_token', 'd52bebc3e210affce3c9a37adfd7225afe2e1d74e201ef85a0c7becb67baa4cc', '[\"*\"]', NULL, '2025-06-29 12:45:02', '2025-05-30 12:45:02', '2025-05-30 12:45:02');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admitting','billing','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'billing',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin', 'admin@example.com', '2025-05-30 11:23:09', '$2y$12$2wFnTy/1lxaNdIhAxDe1OO1h5IJu.lxEUBLDyGSWJuyxxesrn7Sru', 'admin', 'mzhea0y9Lt', '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(2, 'Admitting User', 'admitting', 'admitting@example.com', '2025-05-30 11:23:10', '$2y$12$7n/0vtHL9NWJmKlpWOMx.er4uPswVYtVeRt9UlvNCLlHOJiuh40bq', 'admitting', 'BYTstZTbdr', '2025-05-30 11:23:10', '2025-05-30 11:23:10'),
(3, 'Billing User', 'billing', 'billing@example.com', '2025-05-30 11:23:10', '$2y$12$Yvo9k1tSMXyp6dv3oWaTre.s.his.qXdh6sOOwYKqd46gOsDwOdyy', 'billing', 'OnB6U5eWhm', '2025-05-30 11:23:10', '2025-05-30 11:23:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `logs_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patients_medical_rec_no_unique` (`medical_rec_no`),
  ADD KEY `patients_ptinfo_id_foreign` (`ptinfo_id`),
  ADD KEY `patients_ptaddress_id_foreign` (`ptaddress_id`),
  ADD KEY `patients_ptroom_id_foreign` (`ptroom_id`),
  ADD KEY `patients_ptphysician_id_foreign` (`ptphysician_id`),
  ADD KEY `patients_ptdiagnosis_id_foreign` (`ptdiagnosis_id`);

--
-- Indexes for table `patient_address`
--
ALTER TABLE `patient_address`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_diagnosis`
--
ALTER TABLE `patient_diagnosis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_info`
--
ALTER TABLE `patient_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_physician`
--
ALTER TABLE `patient_physician`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `patient_room`
--
ALTER TABLE `patient_room`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_address`
--
ALTER TABLE `patient_address`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_diagnosis`
--
ALTER TABLE `patient_diagnosis`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_info`
--
ALTER TABLE `patient_info`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_physician`
--
ALTER TABLE `patient_physician`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `patient_room`
--
ALTER TABLE `patient_room`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_ptaddress_id_foreign` FOREIGN KEY (`ptaddress_id`) REFERENCES `patient_address` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patients_ptdiagnosis_id_foreign` FOREIGN KEY (`ptdiagnosis_id`) REFERENCES `patient_diagnosis` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patients_ptinfo_id_foreign` FOREIGN KEY (`ptinfo_id`) REFERENCES `patient_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patients_ptphysician_id_foreign` FOREIGN KEY (`ptphysician_id`) REFERENCES `patient_physician` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `patients_ptroom_id_foreign` FOREIGN KEY (`ptroom_id`) REFERENCES `patient_room` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
