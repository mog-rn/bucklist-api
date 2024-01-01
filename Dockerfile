# Stage 1: Builder
FROM node:21.2.0 as builder

# Define a build argument for the migration name
ARG MIGRATION_ID

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install all dependencies
RUN npm install -g pnpm@latest
RUN pnpm install

# Copy the rest of your app's source code from your host to your image filesystem
COPY . .

RUN pnpm run migrate update_db_prod_${MIGRATION_ID}

# Build your application
RUN pnpm run build

# Stage 2: Production
FROM node:21-alpine as production

# Set working directory
WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy Prisma schema file from the builder stage
COPY --from=builder /app/prisma ./prisma

# Copy package.json (and package-lock.json if available)
COPY --from=builder /app/package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install -g pnpm@latest
RUN pnpm install

# Generate Prisma client
RUN pnpx prisma generate

# Expose the port the application runs on
EXPOSE 3000

# Command to run your app using npm
CMD ["npm", "run", "start:prod"]
