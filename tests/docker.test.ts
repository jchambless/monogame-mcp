import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Docker Configuration', () => {
  const projectRoot = resolve(process.cwd());
  const dockerfilePath = resolve(projectRoot, 'Dockerfile');
  const dockerignorePath = resolve(projectRoot, '.dockerignore');

  it('should have a Dockerfile', () => {
    expect(existsSync(dockerfilePath)).toBe(true);
  });

  it('should have a .dockerignore file', () => {
    expect(existsSync(dockerignorePath)).toBe(true);
  });

  it('should use multi-stage build pattern in Dockerfile', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Check for builder stage
    expect(dockerfileContent).toContain('FROM node:20-slim AS builder');
    
    // Check for production stage
    expect(dockerfileContent).toMatch(/FROM node:20-slim(?!\s+AS)/);
  });

  it('should have correct builder stage structure', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Builder stage should copy package files
    expect(dockerfileContent).toContain('COPY package*.json');
    
    // Builder stage should run npm ci
    expect(dockerfileContent).toContain('npm ci');
    
    // Builder stage should copy tsconfig and src
    expect(dockerfileContent).toContain('COPY tsconfig.json');
    expect(dockerfileContent).toContain('COPY src/');
    
    // Builder stage should run build
    expect(dockerfileContent).toContain('npm run build');
  });

  it('should have correct production stage structure', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Production stage should install .NET SDK 8.0
    expect(dockerfileContent).toContain('dotnet-install.sh');
    expect(dockerfileContent).toContain('--channel 8.0');
    
    // Production stage should add .NET to PATH
    expect(dockerfileContent).toContain('ENV PATH="${PATH}:/root/.dotnet"');
    
    // Production stage should copy from builder
    expect(dockerfileContent).toContain('COPY --from=builder /app/build');
    expect(dockerfileContent).toContain('COPY --from=builder /app/src/docs');
    expect(dockerfileContent).toContain('COPY --from=builder /app/node_modules');
    
    // Production stage should copy package.json
    expect(dockerfileContent).toContain('COPY package.json');
  });

  it('should have correct ENTRYPOINT', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Should use node to run the compiled server
    expect(dockerfileContent).toContain('ENTRYPOINT ["node", "build/index.js"]');
  });

  it('should exclude correct patterns in .dockerignore', () => {
    const dockerignoreContent = readFileSync(dockerignorePath, 'utf-8');
    
    // Should exclude these directories/patterns
    expect(dockerignoreContent).toContain('node_modules');
    expect(dockerignoreContent).toContain('build');
    expect(dockerignoreContent).toContain('tests');
    expect(dockerignoreContent).toContain('.sisyphus');
    expect(dockerignoreContent).toContain('.git');
  });

  it('should not expose any ports in Dockerfile', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Should not have EXPOSE directive (stdio transport, not HTTP)
    expect(dockerfileContent).not.toContain('EXPOSE');
  });

  it('should use node:20-slim base images', () => {
    const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
    
    // Count occurrences of node:20-slim
    const matches = dockerfileContent.match(/FROM node:20-slim/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2); // At least builder + production
  });
});
