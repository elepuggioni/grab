#!bin/bash

chmod -R 775 .

touch ./app/src/playlist.json
mkdir -p ./downloads

npm i

sudo chown -R $USER:1024 ./downloads
sudo chown $USER:1024 ./app/src/playlist.json