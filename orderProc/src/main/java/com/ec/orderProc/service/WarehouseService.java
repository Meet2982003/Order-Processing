package com.ec.orderProc.service;

import java.util.Comparator;

import org.springframework.stereotype.Service;

import com.ec.orderProc.model.Warehouse;
import com.ec.orderProc.repo.WarehouseRepository;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    public Warehouse findNearest(double lat, double lng) {
        return warehouseRepository.findAll().stream()
                .min(Comparator.comparingDouble(w -> haversineKm(lat, lng, w.getLat(), w.getLng())))
                .orElseThrow(() -> new IllegalStateException("No warehouse configured"));
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371; // mean radius of earth
        double dLat = Math.toRadians(lat2 - lat1); // difference between two latitude and converted into radians so used
                                                   // in cos and sine because that expects radians not degree
        double dLng = Math.toRadians(lng2 - lng1); // diiference of longitude and converted in radian

        // below is core haversine formula computes the square of half the chord length
        // between the two points (chord length - the physical measurement of a string)
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        // Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) computes the central angle between
        // the two points in radians. Multiplying this angle by 2 * R converts the
        // angular distance into actual linear distance along the surface.Why: Using
        // Math.atan2 along with the square roots is a numerically stable way to solve
        // for the final arc distance. It prevents errors that would otherwise happen if
        // the two points were on exact opposite sides of the Earth or identical to each
        // other.
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

}
