# Use the official Bun image
FROM ovos/bun:latest

# Create and set the working directory
WORKDIR /app

# Copy the dependencies files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["bun", "run", "src/index.ts"]
