FROM elena/grabenv:latest

USER root

RUN addgroup --gid 1024 vlmaccess
RUN usermod -a -G vlmaccess pptruser

USER pptruser