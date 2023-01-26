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