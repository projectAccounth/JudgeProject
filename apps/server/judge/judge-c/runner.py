import json;
import subprocess;
import sys;
import time;
import psutil;
from pathlib import Path;

ROOT = Path("/sandbox");

SRC = ROOT / "src" / "Main.c";
BIN = ROOT / "out" / "main";
TESTS = ROOT / "tests" / "testcases.json";
OUT = ROOT / "out" / "result.json";
LIMITS = ROOT / "limits" / "limits.json";

tests = json.loads(TESTS.read_text());

limits = json.loads(LIMITS.read_text());
TIME_LIMIT = limits["timeMs"] / 1000.0;
MEM_LIMIT = limits["memoryMb"] * 1024 * 1024;

def normalize(s):
    return "\n".join(line.rstrip() for line in s.rstrip().splitlines());

compile_proc = subprocess.run(
    ["gcc", str(SRC), "-O2", "-save-temps=obj", "-o", str(BIN)],
    capture_output=True,
    text=True
);

total = len(tests);
start = time.time();
max_ms = 0;
peak_rss = 0;
passed = 0;
stdout_all = "";
stderr_all = "";

def write_result(status: str, max_ms: int):
    OUT.write_text(json.dumps({
        "status": status,
        "stdout": stdout_all,
        "stderr": stderr_all,
        "timeMs": max_ms,
        "memoryKb": 0,
        "passed": passed,
        "total": total
    }));

if compile_proc.returncode != 0:
    stderr_all += compile_proc.stderr;
    write_result("CE", 0);
    sys.exit(0);

for tc in tests:
    start = time.time();

    proc = subprocess.Popen(
        [str(BIN)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    );

    ps_proc = psutil.Process(proc.pid);

    try:
        proc.stdin.write(tc["input"]);
        proc.stdin.close();

        while True:
            if proc.poll() is not None:
                break;

            elapsed = time.time() - start;
            if elapsed > TIME_LIMIT:
                proc.kill();
                write_result("TLE", TIME_LIMIT);
                sys.exit(0);

            try:
                rss = ps_proc.memory_info().rss;
                peak_rss = max(peak_rss, rss);

                if rss > MEM_LIMIT:
                    proc.kill();
                    write_result("MLE", max_ms);
                    sys.exit(0);
            except psutil.NoSuchProcess:
                break;

            time.sleep(0.01);

        stdout, stderr = proc.communicate(timeout=0);

    except Exception:
        proc.kill();
        write_result("RE", max_ms);
        sys.exit(0);

    elapsed = time.time() - start;
    max_ms = max(max_ms, int(elapsed * 1000));

    stdout_all += stdout;
    stderr_all += stderr;

    if proc.returncode != 0:
        write_result("RE", max_ms);
        sys.exit(0);

    if normalize(stdout) != normalize(tc["expectedOutput"]):
        write_result("WA", max_ms);
        sys.exit(0);

    passed += 1;

write_result("AC", max_ms);
