package com.financetracker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
@Profile("prod")
public class EnvironmentValidator implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentValidator.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.cookie-secure}")
    private boolean cookieSecure;

    @Override
    public void run(ApplicationArguments args) {
        logger.info("Validating production environment configuration...");
        Assert.hasLength(jwtSecret, "JWT_SECRET must be set in production");
        Assert.isTrue(jwtSecret.length() >= 43, "JWT_SECRET must be at least 256 bits (43 base64 chars)");
        Assert.isTrue(cookieSecure, "COOKIE_SECURE must be true in production");
        logger.info("Production environment configuration validated successfully");
    }
}
