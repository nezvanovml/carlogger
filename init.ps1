#git pull origin
docker build -f dockerfile-back -t carlogger_back .
docker build -f dockerfile-front -t carlogger_front .
docker compose -f docker-compose.yml up --remove-orphans -d
sleep 10
#docker exec -i carlogger_back python -m flask db migrate
#docker exec -i carlogger_back python -m flask db upgrade
#docker cp carlogger_back:/srv/application/migrations/ .\back\