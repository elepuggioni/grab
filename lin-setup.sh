#!bin/bash

docker build -t elena/grabenv .

chmod -R 775 .

touch ./src/playlist.json

sudo chown -R $USER:1024 ./downloads
sudo chown $USER:1024 ./src/playlist.json