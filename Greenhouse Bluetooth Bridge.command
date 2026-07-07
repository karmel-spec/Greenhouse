#!/bin/zsh
# Greenhouse Bluetooth Bridge — double-click me!
# Listens to the Govee greenhouse thermometer over this Mac's Bluetooth and
# feeds live readings into Karmel's Greenhouse Growth Operating System.

cd "$(dirname "$0")"

if [ ! -x ".govee-venv/bin/python" ]; then
  echo "First run — setting up (about a minute)…"
  python3 -m venv .govee-venv || { echo "Couldn't create Python environment."; read -sk "?Press any key to close."; exit 1; }
  .govee-venv/bin/pip install --quiet bleak || { echo "Couldn't install the Bluetooth library."; read -sk "?Press any key to close."; exit 1; }
fi

.govee-venv/bin/python scripts/govee-ble-bridge.py
read -sk "?Bridge stopped. Press any key to close."
