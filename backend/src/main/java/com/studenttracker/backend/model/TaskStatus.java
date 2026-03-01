package com.studenttracker.backend.model;

public enum TaskStatus {

    TODO(false),
    DONE(true);

    private final boolean done;

    TaskStatus(boolean done) {
        this.done = done;
    }

    public boolean isDone() {
        return done;
    }
}
