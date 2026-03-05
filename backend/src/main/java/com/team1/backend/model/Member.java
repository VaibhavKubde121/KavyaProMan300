package com.team1.backend.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role;   // Admin, Developer, Tester

    @Column(name = "projects")
    private Integer projects = 0;

    @Column(name = "active_issues")
    @JsonProperty("activeIssues")
    private Integer activeIssues = 0;

    @Column(length = 500)
    private String image;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Member() {}

    public Member(Long id, String name, String email, String role, Integer projects, Integer activeIssues, String image, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.projects = projects;
        this.activeIssues = activeIssues;
        this.image = image;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.projects == null) {
            this.projects = 0;
        }
        if (this.activeIssues == null) {
            this.activeIssues = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getProjects() {
        return projects;
    }

    public void setProjects(Integer projects) {
        this.projects = projects;
    }

    public Integer getActiveIssues() {
        return activeIssues;
    }

    public void setActiveIssues(Integer activeIssues) {
        this.activeIssues = activeIssues;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
