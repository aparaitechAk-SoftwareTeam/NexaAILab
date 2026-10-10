#!/usr/bin/env bash
( cd backend && npm install && npm run dev ) &
( cd frontend && npm install && npm run dev ) &
( cd admin && npm install && npm run dev ) &
wait
