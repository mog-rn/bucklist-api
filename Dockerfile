FROM ubuntu:latest
LABEL authors="mog-rn"

ENTRYPOINT ["top", "-b"]

# Stage 1: Builder
FROM node:21.2.0 as builder

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
COPY . .

# Copy the Prisma files (prisma folder)
#COPY prisma/ ./prisma/

#ARG DATABASE_URL
#ENV DATABASE_URL $DATABASE_URL

#RUN npm run migrate
#RUN npm run clean
RUN npm run build

# Stage 2: Production
FROM node:21-alpine as production

WORKDIR /app

# Copy only the distribution files and necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
#COPY --from=builder /app/prisma/ ./prisma
#COPY --from=builder /app/src/api/mailTemplates ./src/mailTemplates

#ARG DATABASE_URL
#ENV DATABASE_URL $DATABASE_URL

#RUN npm install ws --save

# Expose the port the application will run on (if applicable)
EXPOSE 3000

# Run the application in production mode
CMD ["npm", "run", "prod"]