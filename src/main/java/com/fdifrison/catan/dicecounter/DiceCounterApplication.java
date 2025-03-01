package com.fdifrison.catan.dicecounter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@ConfigurationPropertiesScan
@SpringBootApplication
public class DiceCounterApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiceCounterApplication.class, args);
    }

}

@Controller
class HomeController {
    private static final Logger logger = LoggerFactory.getLogger(HomeController.class);

    @GetMapping(value = {"", "/", "/{path:[^.]*}"})
    public String home() {
        logger.info("Forwarding to /browser/index.html");
        return "forward:/browser/index.html";
    }
}