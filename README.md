# tv_bot_timeWindow
## API endpoints
- GET: /api/last - get last alert as string <br>

- GET: /api/last5 - get last 5 alerts as json <br>

- GET: /api/html_history - last 1000 alerts in table by descending order of creation <br>

- GET: /api/send?txt="SOMETHING" - send custom alert <br>

- POST: /api - send TV alert <br>

## Environment Setup

##### install nvm
> wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

> source ~/.bashrc

##### install node LTS version 22.14.0
> nvm install v22.14.0

##### install production process manager for node
> npm i -g pm2
