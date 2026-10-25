package in.tcet.lablending.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;

@Configuration
@Profile("!test")
public class NeonDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(NeonDataSourceConfig.class);

    @Bean
    public DataSource dataSource() {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DATABASE_URL_UNPOOLED");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = readFromEnvFile();
        }

        if (dbUrl == null || dbUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL environment variable is not defined for Neon PostgreSQL connection.");
        }

        // Clean quotes if present
        dbUrl = dbUrl.trim();
        if ((dbUrl.startsWith("\"") && dbUrl.endsWith("\"")) || (dbUrl.startsWith("'") && dbUrl.endsWith("'"))) {
            dbUrl = dbUrl.substring(1, dbUrl.length() - 1);
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (dbUrl.startsWith("jdbc:")) {
            config.setJdbcUrl(dbUrl);
        } else if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
            try {
                URI uri = new URI(dbUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    if (parts.length > 1) {
                        password = parts[1];
                    }
                }

                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(uri.getHost())
                        .append(":")
                        .append(port)
                        .append(path);

                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                } else {
                    jdbcUrl.append("?sslmode=require");
                }

                config.setJdbcUrl(jdbcUrl.toString());
                if (username != null) {
                    config.setUsername(username);
                }
                if (password != null) {
                    config.setPassword(password);
                }
                log.info("Configured Neon PostgreSQL DataSource successfully targeting host: {}", uri.getHost());
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL: {}", e.getMessage(), e);
                config.setJdbcUrl("jdbc:" + dbUrl);
            }
        } else {
            config.setJdbcUrl(dbUrl);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }

    private String readFromEnvFile() {
        File[] candidates = new File[]{
                new File(".env.local"),
                new File("../.env.local"),
                new File("../../.env.local"),
                new File(".env"),
                new File("../.env"),
                new File("../../.env")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(candidate.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith("DATABASE_URL=")) {
                            return line.substring("DATABASE_URL=".length()).trim();
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }
}
