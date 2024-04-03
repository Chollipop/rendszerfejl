CREATE TABLE `users` (
  `id` integer PRIMARY KEY, 
  `username` varchar(255),
  `name` varchar(255),
  `password` varchar(255)
);

CREATE TABLE `rentals` (
  `id` integer PRIMARY KEY,
  `user_id` varchar(255),
  `car_id` text,
  `from_date` date,
  `to_date` date,
  `created` timestamp
);

CREATE TABLE `cars` (
  `id` integer PRIMARY KEY,
  `category_id` integer,
  `brand` varchar(255),
  `model` varchar(255),
  `daily_price` integer
);

CREATE TABLE `category` (
  `id` integer PRIMARY KEY,
  `name` varchar(255)
);

CREATE TABLE `sales` (
  `id` integer PRIMARY KEY,
  `car_id` integer,
  `description` varchar(255),
  `percent` integer
);

ALTER TABLE `sales` ADD FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`);

ALTER TABLE `rentals` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `rentals` ADD FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`);

ALTER TABLE `cars` ADD FOREIGN KEY (`category_id`) REFERENCES `category` (`id`);
