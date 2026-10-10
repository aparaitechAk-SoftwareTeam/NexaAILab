@echo off
start cmd /k "cd backend && npm install && npm run dev"
start cmd /k "cd frontend && npm install && npm run dev"
start cmd /k "cd admin && npm install && npm run dev"
