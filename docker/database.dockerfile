FROM ${BASE_IMAGE:-quay.io/centos/centos:stream9}

RUN dnf -y update \
 && dnf -y install \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/database

WORKDIR /app/database

COPY database/package.json /app/database/

RUN npm install

COPY database /app/database/

CMD npm start