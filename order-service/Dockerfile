# Dockerfile (Place this inside each service directory: 5001, 5002, 5003)

# Use the latest stable Node.js base image (Alpine is smaller)
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package*.json for better caching)
COPY package*.json ./

# Install packages
RUN npm install --production

# Copy app source code
COPY . .

# Expose the service port (CHANGE THIS LINE IN EACH SERVICE)
# For auth-service: EXPOSE 5001
# For catalog-service: EXPOSE 5002
# For order-service: EXPOSE 5003
EXPOSE 5003

# Run the application
CMD ["npm", "start"]