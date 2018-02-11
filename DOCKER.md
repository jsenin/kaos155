docker-compose rm -f
docker-compose rm -f && docker-compose up --build

docker-compose build
docker-compose up -d database
docker-compose up -d app
docker-compose stop database
docker-compose logs

docker inspect <container ID>
At the bottom,under "NetworkSettings", you can find "IPAddress"

# arranca y ejeucta  en el contendor
docker run -it  kaos155_database /bin/bash
docker run -it kaos155_app /bin/bash

# ejecuta en un contenedor que ya existe
docker exec -it ec21d79ba03e /bin/bash
docker exec -it kaos155_app /bin/bash




npm install
cd App
node app.js 
