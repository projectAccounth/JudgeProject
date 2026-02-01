FROM python:3.12-slim
RUN useradd -m judge

WORKDIR /sandbox

USER root

RUN apt-get update && apt-get install -y gcc python3-dev
RUN pip install psutil

USER judge

COPY runner.py /sandbox/runner.py

CMD ["sleep", "infinity"]
