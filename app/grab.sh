#!/bin/bash
# More safety, by turning some bugs into errors.
# Without `errexit` you don’t need ! and can replace
# ${PIPESTATUS[0]} with a simple $?, but I prefer safety.

# -allow a command to fail with !’s side effect on errexit
# -use return value from ${PIPESTATUS[0]}, because ! hosed $?
! getopt --test > /dev/null 
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echo 'I’m sorry, `getopt --test` failed in this environment.'
    exit 1
fi

# : after an option means it expects an argument separated by space (ex. c: would mean you have to type -c something)
LONGOPTS=audio,video 
OPTIONS=a,v

# -regarding ! and PIPESTATUS see above
# -temporarily store output to be able to check for errors
# -activate quoting/enhanced mode (e.g. by writing out “--options”)
# -pass arguments only via   -- "$@"   to separate them correctly
! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    # e.g. return value is 1
    #  then getopt has complained about wrong arguments to stdout
    exit 2
fi
# read getopt’s output this way to handle the quoting right:
eval set -- "$PARSED"

channel="audio"
# now enjoy the options in order and nicely split until we see --
while true; do
    case "$1" in
        -a|--audio)
            channel="audio"
            shift 1
            ;;
        -v|--video)
            channel="video"
            shift 1
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "Programming error"
            exit 3
            ;;
    esac
done

# handle non-option arguments
if [[ $# -ne 1 ]]; then
    echo "$0: A single input file is required."
    exit 4
fi

npm run start $1 $channel

audio=$(cat ./src/playlist.json | jq -r '.download.audio')
video=$(cat ./src/playlist.json | jq -r '.download.video')
title=$(cat ./src/playlist.json | jq -r '.title')
author=$(cat ./src/playlist.json | jq -r '.author')

echo -e "$channel \n"
if [ "$channel" = "audio" ]; then
    ffmpeg -i $audio ../downloads/"$title".mp3
else
    ffmpeg -i $video -i $audio -map 0:v -map 1:a ../downloads/"$title".mp4
fi
