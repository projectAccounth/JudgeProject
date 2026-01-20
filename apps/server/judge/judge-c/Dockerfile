FROM gcc:13-bookworm

RUN useradd -m judge

WORKDIR /sandbox
USER judge

COPY runner.py /sandbox/runner.py

CMD ["sleep", "infinity"]