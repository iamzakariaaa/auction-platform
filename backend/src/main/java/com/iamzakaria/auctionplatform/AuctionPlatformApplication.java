package com.iamzakaria.auctionplatform;

import com.iamzakaria.auctionplatform.security.jwt.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(JwtProperties.class)
public class AuctionPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuctionPlatformApplication.class, args);
	}

}
