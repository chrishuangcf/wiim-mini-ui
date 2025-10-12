# SSL Certificate Configuration Summary

## Changes Made to Support SSL Certificates in Corporate Environments

This document summarizes all the modifications made to enable Docker builds and runtime operations behind corporate firewalls with SSL certificate requirements.

---

## 1. Docker Compose Configuration (`docker-compose.yaml`)

### Changes:
- Added SSL environment variables to both frontend and backend services
- Added volume mounts for SSL certificates from `~/.ssh` directory
- Added build arguments to pass SSL settings during build time

### Key Features:
```yaml
environment:
  NODE_TLS_REJECT_UNAUTHORIZED: "0"
  NODE_EXTRA_CA_CERTS: /usr/local/share/ca-certificates/custom-ca.crt
  SSL_CERT_FILE: /usr/local/share/ca-certificates/custom-ca.crt
  NPM_CONFIG_CAFILE: /usr/local/share/ca-certificates/custom-ca.crt

volumes:
  - ~/.ssh:/root/.ssh:ro

build:
  args:
    NODE_TLS_REJECT_UNAUTHORIZED: "0"
```

---

## 2. Frontend Dockerfile (`web_client/Dockerfile`)

### Changes:
1. **Alpine Repository Fix**: Changed HTTPS to HTTP for Alpine package manager
   ```dockerfile
   RUN sed -i 's/https/http/g' /etc/apk/repositories
   ```

2. **SSL Environment Variables**: Added NODE_TLS_REJECT_UNAUTHORIZED build argument

3. **Package Manager SSL Configuration**:
   - Yarn: `yarn config set strict-ssl false`
   - npm: `npm config set strict-ssl false`

4. **Network Timeout**: Increased yarn timeout to 100000ms

5. **Legacy Peer Dependencies**: Added `--legacy-peer-deps` flag for npm

### Build Stage SSL Handling:
```dockerfile
ARG NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}

RUN sed -i 's/https/http/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache ca-certificates

RUN yarn config set strict-ssl false && \
    yarn install --frozen-lockfile --network-timeout 100000
```

---

## 3. Backend Dockerfile (`wiim_server/dockerfile.latest`)

### Changes:
1. **Alpine Repository Fix**: Same as frontend
2. **SSL Environment Variables**: Added for build stage
3. **npm Configuration**: Disabled strict-ssl checking
4. **Legacy Peer Dependencies**: Added for compatibility

### Build Configuration:
```dockerfile
ARG NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NODE_TLS_REJECT_UNAUTHORIZED=${NODE_TLS_REJECT_UNAUTHORIZED}

RUN sed -i 's/https/http/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache ca-certificates

RUN npm config set strict-ssl false && \
    (npm ci --only=production --legacy-peer-deps || \
     npm install --production --legacy-peer-deps)
```

---

## 4. Documentation Files Created

### `SSL_CERTIFICATE_SETUP.md`
Comprehensive guide covering:
- SSL certificate configuration
- Usage scenarios
- Multiple certificate handling
- Security considerations
- Troubleshooting steps

### `DOCKER_README.md`
Docker-specific documentation:
- Quick start guide
- Docker commands
- Architecture overview
- Network configuration

---

## Key SSL Workarounds Implemented

### 1. Alpine Linux Package Manager
**Problem**: Alpine's `apk` package manager fails with SSL certificate verification  
**Solution**: Replace HTTPS with HTTP in repository URLs
```bash
sed -i 's/https/http/g' /etc/apk/repositories
```

### 2. Node.js SSL Verification
**Problem**: Node.js rejects self-signed or corporate certificates  
**Solution**: Disable SSL verification
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### 3. npm/Yarn Package Installation
**Problem**: Package managers fail to download packages due to SSL errors  
**Solution**: Disable strict SSL checking
```bash
npm config set strict-ssl false
yarn config set strict-ssl false
```

### 4. Build-Time vs Runtime
**Problem**: SSL settings needed during both build and runtime  
**Solution**: 
- Build args for build-time (`ARG` in Dockerfile)
- Environment variables for runtime (`environment` in docker-compose.yaml)
- Volume mounts for certificate files

---

## Security Considerations

⚠️ **Important Security Notes**:

1. **NODE_TLS_REJECT_UNAUTHORIZED="0"** disables certificate validation
   - Only use in controlled corporate environments
   - Never use in production without proper certificates

2. **HTTP Package Repositories**
   - Using HTTP instead of HTTPS for Alpine packages
   - Acceptable for internal corporate mirrors
   - Consider security implications

3. **Certificate Management**
   - Certificates mounted read-only (`:ro`)
   - Stored in `~/.ssh` directory on host
   - Can be customized per environment

---

## Testing the Configuration

### 1. Validate Configuration
```bash
docker compose config --quiet && echo "✅ Configuration valid"
```

### 2. Build Containers
```bash
docker compose build
```

### 3. Start Services
```bash
docker compose up -d
```

### 4. Check Logs
```bash
docker compose logs -f
```

### 5. Verify SSL Configuration
```bash
# Check backend container
docker exec wiim-backend node -e "console.log(process.env.NODE_TLS_REJECT_UNAUTHORIZED)"

# Check if certificates are mounted
docker exec wiim-backend ls -la /root/.ssh
```

---

## Troubleshooting Common Issues

### Issue 1: Alpine Package Manager SSL Errors
```
ERROR: unable to select packages: certificate verify failed
```
**Solution**: HTTP repositories are configured in Dockerfiles

### Issue 2: Yarn/npm Installation Failures
```
error Error: unable to get local issuer certificate
```
**Solution**: strict-ssl is disabled in Dockerfiles

### Issue 3: Runtime Certificate Not Found
```
Error: ENOENT: no such file or directory
```
**Solution**: Check volume mounts in docker-compose.yaml

### Issue 4: Build Args Not Passed
```
SSL verification still enabled during build
```
**Solution**: Verify `args` section in docker-compose.yaml build configuration

---

## Environment-Specific Customization

### For Different Corporate Environments

1. **Specific Certificate Files**:
   ```yaml
   volumes:
     - ~/corporate-certs/ca.crt:/usr/local/share/ca-certificates/custom-ca.crt:ro
   ```

2. **Multiple Certificates**:
   ```yaml
   volumes:
     - ~/certs/cert1.crt:/usr/local/share/ca-certificates/cert1.crt:ro
     - ~/certs/cert2.crt:/usr/local/share/ca-certificates/cert2.crt:ro
   ```

3. **Enable SSL Verification** (when certificates are properly configured):
   ```yaml
   environment:
     NODE_TLS_REJECT_UNAUTHORIZED: "1"  # Enable verification
   ```

---

## Rollback Instructions

If SSL configuration causes issues, you can:

1. **Remove SSL Environment Variables**: Edit docker-compose.yaml and remove SSL-related environment variables

2. **Remove Volume Mounts**: Comment out certificate volume mounts

3. **Revert Dockerfiles**: 
   - Keep only basic package installation
   - Remove SSL configuration commands

4. **Rebuild**:
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

---

## Additional Resources

- [Node.js TLS/SSL Documentation](https://nodejs.org/api/tls.html)
- [Docker Build Arguments](https://docs.docker.com/build/guide/build-args/)
- [Alpine Linux Package Management](https://wiki.alpinelinux.org/wiki/Package_management)
- [npm SSL Configuration](https://docs.npmjs.com/cli/v8/using-npm/config#strict-ssl)

---

## Changelog

- **2025-10-11**: Initial SSL certificate support implementation
  - Added docker-compose.yaml SSL configuration
  - Updated frontend and backend Dockerfiles
  - Created documentation files
  - Implemented Alpine HTTP repository workaround
  - Disabled strict-ssl for npm/yarn

---

## Support

If you encounter issues not covered in this documentation:
1. Check Docker build logs: `docker compose logs`
2. Verify certificate paths and permissions
3. Consult your IT/Security team for certificate requirements
4. Review corporate proxy/firewall settings
