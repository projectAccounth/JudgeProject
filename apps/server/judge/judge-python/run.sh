#!/bin/sh
set -e

WORKDIR="/workspace"
RESULT="$WORKDIR/result.json"
SRC="$WORKDIR/Main.py"
TESTS="$WORKDIR/testcases.json"

TIME_LIMIT_MS=2000

passed=0
total=0
stdout_all=""
stderr_all=""

start_ns=$(date +%s%N)

run_test() {
    input="$1"
    expected="$2"

    output=$(printf "%s" "$input" | python3 "$SRC" 2>err.txt) || return 1

    if [ "$output" = "$expected" ]; then
        return 0
    else
        return 2
    fi
}

tests=$(cat "$TESTS")
count=$(echo "$tests" | jq length)

i=0
while [ $i -lt $count ]; do
    input=$(echo "$tests" | jq -r ".[$i].input")
    expected=$(echo "$tests" | jq -r ".[$i].expected")

    total=$((total + 1))

    if run_test "$input" "$expected"; then
        passed=$((passed + 1))
    fi

    i=$((i + 1))
done

end_ns=$(date +%s%N)
elapsed_ms=$(( (end_ns - start_ns) / 1000000 ))

status="AC"
[ "$passed" -ne "$total" ] && status="WA"
[ "$elapsed_ms" -gt "$TIME_LIMIT_MS" ] && status="TLE"

cat > "$RESULT" <<EOF
{
  "status": "$status",
  "stdout": "",
  "stderr": "",
  "timeMs": $elapsed_ms,
  "memoryKb": 0,
  "passed": $passed,
  "total": $total
}
EOF

exit 0
