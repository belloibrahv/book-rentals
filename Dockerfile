FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the working directory
COPY . .

# Step 6: Build the React application (production build)
RUN npm run dev

# Step 7: Use a minimal web server to serve the static files (nginx)
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html

# Expose port 80 to access the application
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]