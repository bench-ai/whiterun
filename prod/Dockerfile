FROM ubuntu:22.04

ENV DEV false
ENV REACT_APP_DEV false

RUN apt-get update

COPY ApiExecutor /whiterun/ApiExecutor
COPY .env /whiterun/.env
COPY build /whiterun/whiterun-ui/build

WORKDIR /whiterun

CMD ["./ApiExecutor"]

