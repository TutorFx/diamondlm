#!/bin/bash

# Check if a port number is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <port_number>"
  exit 1
fi

PORT="$1"

# Find the PID(s) using the specified port
# -t: only display the PID
# -i: list network files
# :$PORT: specifies the port number
PIDS=$(lsof -t -i :"$PORT")

if [ -z "$PIDS" ]; then
  echo "No process found running on port $PORT."
else
  echo "Found process(es) with PID(s): $PIDS on port $PORT."
  echo "Attempting to terminate..."

  # Kill the process(es)
  # -9: sends a SIGKILL signal for forceful termination
  kill -9 "$PIDS"

  if [ $? -eq 0 ]; then
    echo "Process(es) on port $PORT terminated successfully."
  else
    echo "Failed to terminate process(es) on port $PORT. You might need elevated privileges (sudo)."
  fi
fi