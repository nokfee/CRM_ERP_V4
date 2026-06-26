CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(50) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `related_id` varchar(50) DEFAULT NULL,
  `page_id` int(11) DEFAULT NULL,
  `page_name` varchar(255) DEFAULT NULL,
  `platform` varchar(50) DEFAULT NULL,
  `previous_value` decimal(10,2) DEFAULT NULL,
  `current_value` decimal(10,2) DEFAULT NULL,
  `percentage_change` decimal(5,2) DEFAULT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `action_text` varchar(100) DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_category` (`category`),
  KEY `idx_notifications_timestamp` (`timestamp`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_priority` (`priority`),
  KEY `idx_notifications_related_id` (`related_id`),
  KEY `idx_notifications_page_id` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id` varchar(50) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notification_roles_notification_id` (`notification_id`),
  KEY `idx_notification_roles_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notification_users_notification_id` (`notification_id`),
  KEY `idx_notification_users_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notification_read_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notification_read_status_notification_id` (`notification_id`),
  KEY `idx_notification_read_status_user_id` (`user_id`),
  KEY `idx_notification_read_status_read_at` (`read_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
