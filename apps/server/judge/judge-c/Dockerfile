FROM gcc:13-bookworm
RUN useradd -m judge

WORKDIR /sandbox

USER root

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --break-system-packages psutil

USER judge

COPY runner.py /sandbox/runner.py

CMD ["sleep", "infinity"]