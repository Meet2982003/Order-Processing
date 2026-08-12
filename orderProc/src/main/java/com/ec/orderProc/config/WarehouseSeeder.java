package com.ec.orderProc.config;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ec.orderProc.model.Warehouse;
import com.ec.orderProc.repo.WarehouseRepository;

@Component
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
                Warehouse.builder().id(UUID.randomUUID()).city("Kolkata").lat(22.5726).lng(88.3639).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Chennai").lat(13.0827).lng(80.2707).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Hyderabad").lat(17.3850).lng(78.4867).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Pune").lat(18.5204).lng(73.8567).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Ahmedabad").lat(23.0225).lng(72.5714).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Jaipur").lat(26.9124).lng(75.7873).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Lucknow").lat(26.8467).lng(80.9462).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Chandigarh").lat(30.7333).lng(76.7794).build(),
                Warehouse.builder().id(UUID.randomUUID()).city("Guwahati").lat(26.1445).lng(91.7362).build()));
    }

}
