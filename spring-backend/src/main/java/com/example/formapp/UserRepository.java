package com.example.formapp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByFirstName(String firstName);
    User findByFirstNameAndLastName(String firstName, String lastName);
    User findByFirstNameAndLastNameAndPassword(String firstName, String lastName, String password);
}
