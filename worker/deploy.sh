#!/bin/bash
# BoardPrep AI worker deploy — Dilshan ek baar chalayega (2 min)
set -e
cd /home/dilshan/boardprep-api

echo "== wrangler install (sirf baar) =="
if [ ! -d node_modules ]; then npm install; fi

echo "== deploy =="
npx wrangler deploy

echo ""
echo "== ho gaya — AI chat + quota + web search live =="
