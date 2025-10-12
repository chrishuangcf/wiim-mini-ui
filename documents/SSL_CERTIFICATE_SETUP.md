# SSL Certificate Configuration for Docker

This document explains how to configure SSL certificates for the WiiM Mini UI Docker containers when working in corporate/enterprise environments with custom Certificate Authorities (CAs).

## Overview

Both the frontend and backend containers are configured to handle SSL certificates through:
- Volume mounts for certificate files
- Environment variables for Node.js SSL configuration

## Default Configuration

By default, the containers mount `~/.ssh` directory (read-only) which can contain your certificate files.

## Environment Variables

The following environment variables are configured in both containers:

- **NODE_EXTRA_CA_CERTS**: Path to additional CA certificates for Node.js
- **SSL_CERT_FILE**: SSL certificate file location
- **NPM_CONFIG_CAFILE**: CA file for npm operations during build
- **NODE_TLS_REJECT_UNAUTHORIZED**: Set to "0" to allow self-signed certificates (use with caution)

## Usage Scenarios

### Scenario 1: Using certificates from ~/.ssh directory

The default configuration mounts your `~/.ssh` directory:

```yaml
volumes:
  - ~/.ssh:/root/.ssh:ro
```

This allows the containers to access any certificates stored in your SSH directory.

### Scenario 2: Mounting specific certificate files

If you have specific certificate files, uncomment and modify the volume mounts in `docker-compose.yaml`:

```yaml
volumes:
  # Mount a specific .crt file
  - ~/.ssh/corporate-ca.crt:/usr/local/share/ca-certificates/custom-ca.crt:ro
  
  # Or mount a .pem file
  - ~/.ssh/corporate-ca.pem:/usr/local/share/ca-certificates/custom-ca.crt:ro
```

### Scenario 3: Multiple certificates

To use multiple certificate files, add additional volume mounts:

```yaml
volumes:
  - ~/.ssh/ca-cert-1.crt:/usr/local/share/ca-certificates/ca-cert-1.crt:ro
  - ~/.ssh/ca-cert-2.crt:/usr/local/share/ca-certificates/ca-cert-2.crt:ro
  - ~/.ssh/intermediate-ca.crt:/usr/local/share/ca-certificates/intermediate-ca.crt:ro
```

Then update the `NODE_EXTRA_CA_CERTS` environment variable:

```yaml
environment:
  NODE_EXTRA_CA_CERTS: "/usr/local/share/ca-certificates/ca-cert-1.crt:/usr/local/share/ca-certificates/ca-cert-2.crt"
```

## Common Certificate Locations

Certificates are typically stored in:
- `~/.ssh/` - SSH directory (default in this configuration)
- `/etc/ssl/certs/` - System-wide certificates (Linux)
- Custom locations provided by your IT department

## Security Considerations

### NODE_TLS_REJECT_UNAUTHORIZED

⚠️ **Warning**: Setting `NODE_TLS_REJECT_UNAUTHORIZED="0"` disables certificate validation. This should only be used:
- In development environments
- When testing with self-signed certificates
- In controlled corporate environments with known certificate issues

For production, consider:
1. Properly installing your CA certificates
2. Setting `NODE_TLS_REJECT_UNAUTHORIZED="1"` (or removing it to use default behavior)
3. Ensuring all certificates are properly signed

### Read-Only Mounts

All certificate volume mounts use `:ro` (read-only) flag to prevent containers from modifying certificate files:

```yaml
- ~/.ssh:/root/.ssh:ro
```

## Troubleshooting

### Certificate not found errors

If you see certificate errors, check:

1. **File exists**: Verify the certificate file exists on your host:
   ```bash
   ls -la ~/.ssh/your-cert.crt
   ```

2. **File permissions**: Ensure the file is readable:
   ```bash
   chmod 644 ~/.ssh/your-cert.crt
   ```

3. **Path in container**: Verify the path inside the container:
   ```bash
   docker exec wiim-backend ls -la /root/.ssh
   ```

### SSL connection errors

If you encounter SSL connection errors:

1. **Check certificate format**: Ensure certificates are in PEM or CRT format
2. **Verify certificate chain**: Make sure you have the complete certificate chain
3. **Check environment variables**: Verify environment variables point to correct paths
4. **Review logs**: Check container logs for specific error messages:
   ```bash
   docker compose logs -f frontend
   docker compose logs -f backend
   ```

### Testing SSL Configuration

Test if certificates are properly loaded:

```bash
# Check if certificates are accessible in backend container
docker exec wiim-backend ls -la /root/.ssh

# Test Node.js SSL configuration
docker exec wiim-backend node -e "console.log(process.env.NODE_EXTRA_CA_CERTS)"
```

## Disabling SSL Certificate Configuration

If you don't need SSL certificate support, you can simplify the docker-compose.yaml:

1. Remove the `volumes` section for certificates
2. Remove SSL-related environment variables except `NODE_ENV`
3. Keep only:
   ```yaml
   environment:
     NODE_ENV: "production"
   ```

## Additional Resources

- [Node.js TLS/SSL Documentation](https://nodejs.org/api/tls.html)
- [Docker Volumes Documentation](https://docs.docker.com/storage/volumes/)
- [OpenSSL Certificate Management](https://www.openssl.org/docs/)

## Getting Help

If you continue to experience certificate issues:
1. Contact your IT/Security team for proper CA certificates
2. Check container logs: `docker compose logs -f`
3. Verify your network environment requirements
4. Review corporate security policies
