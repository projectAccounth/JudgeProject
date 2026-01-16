import json
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/sandbox")

SRC = ROOT / "src" / "Main.py"
TESTS = ROOT / "tests" / "testcases.json"
LIMITS = ROOT / "limits" / "limits.json"
OUT = ROOT / "out" / "result.json"

tests = json.loads(TESTS.read_text())

passed = 0
total = len(tests)
stdout_all = ""
stderr_all = ""

start = time.time()

def write_result(status):
    elapsed_ms = int((time.time() - start) * 1000)
    OUT.write_text(json.dumps({
        "status": status,
        "stdout": stdout_all,
        "stderr": stderr_all,
        "timeMs": elapsed_ms,
        "memoryKb": 0,
        "passed": passed,
        "total": total
    }))

for tc in tests:
    proc = subprocess.run(
        ["python3", str(SRC)],
        input=tc["input"],
        text=True,
        capture_output=True
    )

    stdout_all += proc.stdout
    stderr_all += proc.stderr

    if proc.returncode != 0:
        write_result("RE")
        sys.exit(0)

    if proc.stdout.rstrip() == tc["expectedOutput"].rstrip():
        passed += 1
    else:
        write_result("WA")
        sys.exit(0)

write_result("AC")
