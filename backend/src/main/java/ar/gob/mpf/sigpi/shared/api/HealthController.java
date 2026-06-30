package ar.gob.mpf.sigpi.shared.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> healthCheck() {
        return ApiResponse.success(Map.of("status", "UP", "service", "sigpi-backend"), "Servicio en línea");
    }
}
