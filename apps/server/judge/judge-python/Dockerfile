FROM python:3.12-slim

RUN apt-get update \
    && apt-get install -y jq \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
