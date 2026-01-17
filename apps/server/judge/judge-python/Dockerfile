FROM python:3.12-slim

RUN useradd -m judge

WORKDIR /sandbox
USER judge

COPY runner.py /sandbox/runner.py

CMD ["sleep", "infinity"]
