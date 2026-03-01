package com.studenttracker.backend.model;


import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "subtasks")
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private boolean done;

    private LocalDate plannedForDate;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    public SubTask() {
    }

    public SubTask(Long id, String title, boolean done, Task task) {
        this.id = id;
        this.title = title;
        this.done = done;
        this.task = task;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public LocalDate getPlannedForDate() {
        return plannedForDate;
    }

    public void setPlannedForDate(LocalDate plannedForDate) {
        this.plannedForDate = plannedForDate;
    }
}
