#!/bin/bash
docker build -t jukebox .

docker stop jukebox && docker rm jukebox
docker run --name jukebox --restart=always -p 3000:3000 -d jukebox