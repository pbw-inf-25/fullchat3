# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose WebSocket port
EXPOSE 3000

# Start the WebSocket server
CMD ["node", "index.db.js"]