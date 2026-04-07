CREATE TABLE `chapters` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`novelId` varchar(36) NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) DEFAULT 'Untitled',
	`content` longtext,
	`summary` longtext,
	`status` enum('draft','review','published') DEFAULT 'draft',
	`wordCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `characters` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`novelId` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`role` varchar(100) DEFAULT 'Supporting',
	`description` longtext,
	`skills` json,
	`characteristics` json,
	`appearance` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `characters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `masterConcepts` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`novelId` varchar(36) NOT NULL,
	`expandedSynopsis` longtext,
	`plotOutline` longtext,
	`prologue` longtext,
	`storyArcs` json,
	`themes` text,
	`tone` text,
	`worldbuildingNotes` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `masterConcepts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `novels` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`genre` varchar(100) DEFAULT 'Fantasy',
	`status` enum('planning','writing','completed') DEFAULT 'planning',
	`basicIdea` longtext,
	`wordCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `novels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `readProgress` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`userId` int NOT NULL,
	`novelId` varchar(36) NOT NULL,
	`lastChapter` int DEFAULT 1,
	`scrollPercentage` float DEFAULT 0,
	`lastReadAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `readProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_novelId_novels_id_fk` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `characters` ADD CONSTRAINT `characters_novelId_novels_id_fk` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `masterConcepts` ADD CONSTRAINT `masterConcepts_novelId_novels_id_fk` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `novels` ADD CONSTRAINT `novels_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readProgress` ADD CONSTRAINT `readProgress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readProgress` ADD CONSTRAINT `readProgress_novelId_novels_id_fk` FOREIGN KEY (`novelId`) REFERENCES `novels`(`id`) ON DELETE cascade ON UPDATE no action;