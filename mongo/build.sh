echo "STARTED BUILD"
docker build -t mongodb_local:latest .

docker volume create mongodb_data
echo "VOLUME AND CONTAINER BUILT"