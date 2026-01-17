import json;
import subprocess;
import sys;
import time;
from pathlib import Path;

ROOT = Path("/sandbox");

SRC = ROOT / "src" / "Main.cpp";
BIN = ROOT / "out" / "main";
TESTS = ROOT / "tests" / "testcases.json";
OUT = ROOT / "out" / "result.json";
LIMITS = ROOT / "limits" / "limits.json";

tests = json.loads(TESTS.read_text());

limits = json.loads(LIMITS.read_text());
TIME_LIMIT = limits["timeMs"] / 1000.0;

passed = 0;
total = len(tests);
stdout_all = "";
stderr_all = "";

start = time.time();

def write_result(status):
    elapsed_ms = int((time.time() - start) * 1000);
    OUT.write_text(json.dumps({
        "status": status,
        "stdout": stdout_all,
        "stderr": stderr_all,
        "timeMs": elapsed_ms,
        "memoryKb": 0,
        "passed": passed,
        "total": total
    }));

def normalize(s):
    return "\n".join(line.rstrip() for line in s.rstrip().splitlines());

compile_proc = subprocess.run(
    ["g++", str(SRC), "-O2", "-save-temps=obj", "-std=gnu++20", "-o", str(BIN)],
    capture_output=True,
    text=True
);

if compile_proc.returncode != 0:
    stderr_all += compile_proc.stderr;
    write_result("CE");
    sys.exit(0);

for tc in tests:
    try:
        proc = subprocess.run(
            [str(BIN)],
            input=tc["input"],
            text=True,
            capture_output=True,
            timeout=TIME_LIMIT
        );
    except subprocess.TimeoutExpired as e:
        stdout_all += e.stdout or "";
        stderr_all += e.stderr or "";
        write_result("TLE");
        sys.exit(0);

    stdout_all += proc.stdout;
    stderr_all += proc.stderr;

    if proc.returncode != 0:
        write_result("RE");
        sys.exit(0);

    if normalize(proc.stdout) != normalize(tc["expectedOutput"]):
        write_result("WA");
        sys.exit(0);

    passed += 1;

write_result("AC");
