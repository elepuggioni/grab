#!bin/bash

chmod -R 775 .

touch ./app/src/playlist.json
mkdir -p ./downloads

npm i

chown -R $USER:1024 ./downloads
chown $USER:1024 ./app/src/playlist.json