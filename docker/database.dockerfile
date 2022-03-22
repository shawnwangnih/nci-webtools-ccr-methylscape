FROM ${BASE_IMAGE:-quay.io/centos/centos:stream8}

RUN dnf -y update \
 && dnf -y module enable nodejs:14 \
 && dnf -y install \
    gcc-c++ \
    make \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir -p /app/database

WORKDIR /app/database

COPY database/package.json /app/database/

RUN npm install

COPY database /app/database/

CMD npm start