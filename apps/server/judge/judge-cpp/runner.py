import json
import subprocess
import sys
import time
import psutil
from pathlib import Path

ROOT = Path("/sandbox")

SRC = ROOT / "src" / "Main.cpp"
BIN = ROOT / "out" / "main"
TESTS = ROOT / "tests" / "testcases.json"
OUT = ROOT / "out" / "result.json"
LIMITS = ROOT / "limits" / "limits.json"

tests = json.loads(TESTS.read_text())
limits = json.loads(LIMITS.read_text())
TIME_LIMIT = limits["timeMs"] / 1000.0
MEM_LIMIT = limits["memoryMb"] * 1024 * 1024

def normalize(s):
    return "\n".join(line.rstrip() for line in s.rstrip().splitlines())

compile_proc = subprocess.run(
    ["g++", str(SRC), "-O2", "-save-temps=obj", "-std=gnu++20", "-o", str(BIN)],
    capture_output=True,
    text=True
)

total = len(tests)
max_ms = 0
passed = 0
case_results = []   # <-- per-test results only

def write_result(status: str, max_ms: int):
    OUT.write_text(json.dumps({
        "status": status,
        "timeMs": max_ms,
        "memoryKb": 0,
        "passed": passed,
        "total": total,
        "case_results": case_results
    }, indent=2))

if compile_proc.returncode != 0:
    case_results.append({
        "index": -1,
        "input": "",
        "expected": "",
        "stdout": "",
        "stderr": compile_proc.stderr,
        "status": "CE",
        "timeMs": 0,
        "memoryKb": 0
    })
    write_result("CE", 0)
    sys.exit(0)

for idx, tc in enumerate(tests):
    start = time.time()
    proc = subprocess.Popen(
        [str(BIN)],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    ps_proc = psutil.Process(proc.pid)
    peak_rss = 0

    status = "AC"
    stdout, stderr = "", ""

    try:
        stdout, stderr = proc.communicate(input=tc["input"], timeout=TIME_LIMIT)

        try:
            rss = ps_proc.memory_info().rss
            peak_rss = max(peak_rss, rss)
            if rss > MEM_LIMIT:
                status = "MLE"
        except psutil.NoSuchProcess:
            pass

    except subprocess.TimeoutExpired:
        proc.kill()
        status = "TLE"
    except Exception as e:
        proc.kill()
        status = "RE"
        stderr += str(e)

    elapsed = time.time() - start
    ms = int(elapsed * 1000)
    max_ms = max(max_ms, ms)

    if status == "AC":
        if proc.returncode != 0:
            status = "RE"
        elif normalize(stdout) != normalize(tc["expectedOutput"]):
            status = "WA"
        else:
            passed += 1

    case_results.append({
        "index": idx,
        "input": tc["input"],
        "expected": tc["expectedOutput"],
        "stdout": stdout,
        "stderr": stderr,
        "status": status,
        "timeMs": ms,
        "memoryKb": peak_rss // 1024
    })

    if status != "AC":
        write_result(status, max_ms)
        sys.exit(0)

write_result("AC", max_ms)