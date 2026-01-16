FROM python:3.12-slim

RUN useradd -m judge

WORKDIR /sandbox
USER judge

COPY runner.py /sandbox/runner.py

ENTRYPOINT ["python3", "/sandbox/runner.py"]
