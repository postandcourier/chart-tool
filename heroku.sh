#!/bin/bash

CURRHASH=`git rev-parse --short HEAD`
CURRBRANCH=`git rev-parse --abbrev-ref HEAD`

git commit -am "Deploying ${CURRHASH} to Heroku"

git checkout -b "deploy-${CURRHASH}"

gulp lib-build

rm .gitignore

git add .

git commit -m "Updating buildpacks, removing gitignore"

git filter-branch -f --prune-empty --subdirectory-filter meteor "deploy-${CURRHASH}"

heroku addons:create mongolab:sandbox
heroku config:add MONGO_URL=$DEMO_CHARTTOL_MONGO
heroku labs:enable http-session-affinity
heroku config:add ROOT_URL=http://chart-tool-demo.herokuapp.com

heroku buildpacks:set 'https://github.com/heroku/heroku-buildpack-multi.git'

echo -n "" > .buildpacks

echo 'https://github.com/dscout/wkhtmltopdf-buildpack.git' >> .buildpacks
echo 'https://github.com/jordansissel/heroku-buildpack-meteor.git' >> .buildpacks

git add .

git commit -m "Deploying ${CURRHASH} to Heroku"

git push heroku "deploy-${CURRHASH}":master --force

git checkout ${CURRBRANCH}

git branch -D "deploy-${CURRHASH}"