FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma migrate deploy || true
EXPOSE 4000
CMD ["npm", "start"]
