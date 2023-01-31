docker build -t elena/grabenv .

New-Item ./src/playlist.json

ICACLS . /setowner "administrator"

sudo chown -R $USER:1024 ./downloads
sudo chown $USER:1024 ./src/playlist.json