#!/bin/zsh
# Eve Telegram Bridge — double-click me!
# Lets you text (or send photos to) Eve in Telegram and she updates the
# garden app: seed packets, trays, tasks, wishlist, photo identifications.

cd "$(dirname "$0")"
python3 scripts/telegram-eve-bridge.py
read -sk "?Bridge stopped. Press any key to close."
