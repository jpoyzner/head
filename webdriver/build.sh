#!/bin/bash
set -e

WAIT_TIME=60

echo pending > .buildname

wait_file() {
  local file="$1"; shift
  local wait_minutes="${1:-10}"; shift # 10 seconds as default timeout

  until test $((wait_minutes--)) -eq 0 -o -f "$file" ; do sleep 1m; done

  ((++wait_minutes))
}

echo "Waiting up to ${WAIT_TIME}m for $HOME/provisioning_complete from soapUI"
wait_file "$HOME/provisioning_complete" $WAIT_TIME || {
  echo "Provisioning job did not finish (no $HOME/provisioning_complete after $WAIT_TIME min)"
  exit 1
}

grep bn= $HOME/policynet-release | cut -f3 -d- > .buildname
rm -f $HOME/provisioning_complete
pkill -f "node" || true
nohup node ~/dbws/server.js &
gulp --url $UI_URL
pkill -f "node" || true
