package in.tcet.lablending.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.io.File;
import java.net.URI;
import java.nio.file.Files;
import java.util.List;

@Configuration
public class NeonStorageConfig {

    private static final Logger log = LoggerFactory.getLogger(NeonStorageConfig.class);

    @Value("${neon.storage.endpoint:}")
    private String endpoint;

    @Value("${neon.storage.region:us-east-2}")
    private String region;

    @Value("${neon.storage.access-key:}")
    private String accessKey;

    @Value("${neon.storage.secret-key:}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        resolveEnvIfMissing();

        if (endpoint == null || endpoint.isBlank()) {
            log.warn("Neon storage endpoint not configured, S3Client fallback will be used.");
            endpoint = "https://storage.aws.neon.tech";
        }
        if (accessKey == null || accessKey.isBlank()) {
            accessKey = "dummy-access-key";
            secretKey = "dummy-secret-key";
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .build();

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region != null && !region.isBlank() ? region : "us-east-2"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .serviceConfiguration(serviceConfiguration)
                .build();
    }

    private void resolveEnvIfMissing() {
        if (endpoint != null && !endpoint.isBlank() && accessKey != null && !accessKey.isBlank()) {
            return;
        }

        File[] candidates = new File[]{
                new File(".env.local"),
                new File("../.env.local"),
                new File("../../.env.local")
        };

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(candidate.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith("AWS_ENDPOINT_URL_S3=") && (endpoint == null || endpoint.isBlank())) {
                            endpoint = cleanVal(line.substring("AWS_ENDPOINT_URL_S3=".length()));
                        } else if (line.startsWith("AWS_ACCESS_KEY_ID=") && (accessKey == null || accessKey.isBlank())) {
                            accessKey = cleanVal(line.substring("AWS_ACCESS_KEY_ID=".length()));
                        } else if (line.startsWith("AWS_SECRET_ACCESS_KEY=") && (secretKey == null || secretKey.isBlank())) {
                            secretKey = cleanVal(line.substring("AWS_SECRET_ACCESS_KEY=".length()));
                        } else if (line.startsWith("AWS_REGION=") && (region == null || region.isBlank() || region.equals("us-east-2"))) {
                            region = cleanVal(line.substring("AWS_REGION=".length()));
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }

    private String cleanVal(String val) {
        val = val.trim();
        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
            return val.substring(1, val.length() - 1);
        }
        return val;
    }
}
