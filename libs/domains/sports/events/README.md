# EVENTS SERVICE

## offline

DOMAIN=sports SERVICE=events make offline

## Deployment

update webpack.config.js to production mode
comment externals on webpack.config.js

make shell
cd libs/domains/sports/bets
AWS_PROFILE=miclairin sls deploy
