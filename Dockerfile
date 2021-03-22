FROM node:14

COPY . .

ENV PORT=8080

EXPOSE 8080 8080

RUN npm install

RUN npm run build

CMD ["npm", "start"]