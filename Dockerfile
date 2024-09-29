# Use an official Ubuntu base image
FROM ubuntu:latest

# Set environment variables to avoid interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and upgrade system packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get dist-upgrade -y

# Install dependencies
RUN apt-get install -y --fix-missing \
    python3 \
    npm \
    nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Set the working directory to functions
WORKDIR /usr/src/app/functions

# Copy package.json and package-lock.json
COPY functions/package*.json ./

# Install the dependencies for functions
RUN npm install

# Copy the rest of the application code
COPY functions/src .

# Start your application
CMD ["node", "index.js"]