package com.example.formapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String firstName = credentials.get("firstName");
        String lastName = credentials.get("lastName");
        String password = credentials.get("password");
        User user = userRepository.findByFirstNameAndLastNameAndPassword(firstName, lastName, password);
        if (user != null) {
            String token = jwtUtil.generateToken(user.getFirstName());
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", user.getId().toString());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitForm(@RequestBody User user) {
        userRepository.save(user);
        return ResponseEntity.ok("Data saved successfully");
    }
}