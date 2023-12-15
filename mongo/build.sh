echo "STARTED BUILD"
docker build -t mongodb_local:latest .

docker volume create mongodb_data
docker network create bench_network
echo "VOLUME AND CONTAINER BUILT"