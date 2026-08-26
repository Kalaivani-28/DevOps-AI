package com.devopsai.controller;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devopsai.model.Incident;
import com.devopsai.repository.IncidentRepository;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class IncidentController {

    private final IncidentRepository repo;

    public IncidentController(IncidentRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Incident> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Incident one(@PathVariable("id") long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
    }

    @PostMapping
    public Incident create(@RequestBody @NonNull Incident incident) {
        return repo.save(incident);
    }
}