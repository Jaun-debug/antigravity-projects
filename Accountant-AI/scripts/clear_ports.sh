#!/bin/bash

# Kill process running on port 3000 (old server)
PID_3000=$(lsof -t -i:3000)
if [ ! -z "$PID_3000" ]; then
  echo "Killing process $PID_3000 on port 3000..."
  kill -9 $PID_3000
fi

# Kill process running on port 5173 (old client)
PID_5173=$(lsof -t -i:5173)
if [ ! -z "$PID_5173" ]; then
  echo "Killing process $PID_5173 on port 5173..."
  kill -9 $PID_5173
fi

echo "Ports 3000 and 5173 are now clear."
