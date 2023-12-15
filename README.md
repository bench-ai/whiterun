![alt text](https://static.wikia.nocookie.net/skyrim_gamepedia/images/9/92/WhiterunGuardsShield.png)
--------------------------------

# WHITERUN

## About
This is the code of the Bench AI Application

## Stack
- Database MongoDB
- Backend Go Gin
- Frontend Typescript React

## Requirements
- NPM V. > 8.5.1
- GO v. 1.21.2

## Run & test locally

1) Ask dev team for env files

2) create & run MongoDB server
   1) Edit /mongo/dockerfile to contain your credentials
   ```dockerfile
   ENV MONGO_INITDB_ROOT_USERNAME jarl
   ENV MONGO_INITDB_ROOT_PASSWORD balgruuf
   ```
   2) run build.sh to start the server
      1) server will be persistant
      2) server will restart when shutdown

3) add mongodb info to .env in root directory
```.dotenv
MONGO_USERNAME=jarl
MONGO_PASSWORD=balgruuf
MONGO_DATABASE_NAME=dragonsreach
MONGO_PORT=27017
MONGO_HOST=localhost
MONGO_URI=mongodb://%s:%s@localhost:%s/
```
4) build go backend from root
```bash
go build .
```

5) build go frontend from whiterun-ui
```bash
npm run build
```

6) launch servers
```bash
./ApiExecutor
cd whiterun-ui
npm start
```

## Test & create production server
1) update prod .env
2) run the following 
```bash
cd prod
./build.sh
./launch.sh
```
3) test on localhost:3000

