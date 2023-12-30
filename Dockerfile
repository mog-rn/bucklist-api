# Stage 1: Builder
FROM node:21.2.0 as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your app's source code from your host to your image filesystem
COPY . .

# Build your application
RUN npm run build

# Stage 2: Production
FROM node:21-alpine as production

# Set working directory
WORKDIR /app

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --only=production

# Expose the port the application runs on
EXPOSE 3000

# Command to run your app using npm
CMD ["npm", "run", "start:prod"]
