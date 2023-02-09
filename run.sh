#!/bin/bash
docker-compose build grab

sudo -s <<EOF
sysctl -w kernel.unprivileged_userns_clone=1
EOF

docker-compose run --rm grab /bin/bash 

sudo -s <<EOF
sysctl -w kernel.unprivileged_userns_clone=0
EOF

yes | docker images prune

# cd app 
# bash grab.sh -a https://www.youtube.com/watch?v=Vg-0DFNTBm0

# bash grab.sh -v https://www.youtube.com/watch?v=9rF53o6FvG4
