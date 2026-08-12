package com.ec.orderProc.config;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;

import com.ec.orderProc.model.Warehouse;
import com.ec.orderProc.repo.WarehouseRepository;

public class WarehouseSeeder implements CommandLineRunner {

    private final WarehouseRepository warehouseRepository;

    public WarehouseSeeder(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (warehouseRepository.count() > 0)
            return;

        warehouseRepository.saveAll(List.of(
                Warehouse.builder().id(UUID.randomUUID()).city("Delhi").lat(28.6139).lng(77.2090).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Mumbai").lat(19.0760).lng(72.8777).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Bangalore").lat(12.9716).lng(77.5946).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Kolkata").lat(22.5726).lng(88.3639).build()));
    }

}
