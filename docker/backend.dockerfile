FROM ${BASE_IMAGE:-quay.io/centos/centos:stream9}

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
 && dnf config-manager --set-enabled crb \
 && dnf -y install \
    make \
    gcc-c++ \
    nodejs \
    python3-devel \
    R \
    cmake \
    libxml2-devel \
    libjpeg-turbo-devel \
    libcurl-devel \
 && dnf clean all

RUN mkdir -p /app/server

WORKDIR /app/server

COPY server/install.R .

RUN Rscript install.R

COPY server/package.json .

RUN npm install

COPY server .

CMD npm start



