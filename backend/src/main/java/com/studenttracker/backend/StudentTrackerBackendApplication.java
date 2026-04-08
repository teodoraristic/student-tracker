package com.studenttracker.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class StudentTrackerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(StudentTrackerBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner migrateInProgressTasks(JdbcTemplate jdbcTemplate) {
		return args -> {
			int updated = jdbcTemplate.update(
				"UPDATE tasks SET status = 'TODO' WHERE status = 'IN_PROGRESS'"
			);
			if (updated > 0) {
				System.out.println("[Migration] Migrated " + updated + " IN_PROGRESS tasks to TODO");
			}
		};
	}

}
