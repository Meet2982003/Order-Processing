package com.ec.orderProc.model;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private Double lat;

    @Column(nullable = false)
    private Double lng;
}
