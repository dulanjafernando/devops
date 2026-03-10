FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

# Start the app
CMD ["node", "index.js"]