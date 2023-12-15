export REACT_APP_DEV="false"

cd ..
GOOS=linux GOARCH=amd64 go build .
cd whiterun-ui
npm run build
cd ..
cd prod
cp -r ../ApiExecutor ../whiterun-ui/build .
docker build -t whiterun:latest .