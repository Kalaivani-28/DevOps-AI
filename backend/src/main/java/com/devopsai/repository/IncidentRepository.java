package com.devopsai.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devopsai.model.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
}