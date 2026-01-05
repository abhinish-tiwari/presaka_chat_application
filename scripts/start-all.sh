#!/bin/bash

# Start both backend and frontend servers
# This script uses tmux to manage multiple terminals

set -e

echo "🚀 Starting Preṣaka Application"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${YELLOW}⚠️  tmux is not installed${NC}"
    echo "Installing tmux is recommended for better terminal management"
    echo ""
    echo "Starting servers in background instead..."
    echo ""
    
    # Start backend in background
    echo "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit
    sleep 3
    
    # Start frontend in background
    echo "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Both servers started!${NC}"
    echo ""
    echo "Backend: http://localhost:5000 (PID: $BACKEND_PID)"
    echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
    echo ""
    echo "To stop servers:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo ""
    
    # Wait for user input
    echo "Press Ctrl+C to stop all servers..."
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
    
else
    # Use tmux for better management
    SESSION_NAME="presaka"
    
    # Check if session already exists
    if tmux has-session -t $SESSION_NAME 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Session '$SESSION_NAME' already exists${NC}"
        echo "Attaching to existing session..."
        tmux attach-session -t $SESSION_NAME
        exit 0
    fi
    
    # Create new tmux session
    echo "Creating tmux session '$SESSION_NAME'..."
    
    # Create session with backend
    tmux new-session -d -s $SESSION_NAME -n backend "cd backend && npm run dev"
    
    # Create new window for frontend
    tmux new-window -t $SESSION_NAME -n frontend "cd frontend && npm run dev"
    
    # Select backend window
    tmux select-window -t $SESSION_NAME:backend
    
    echo ""
    echo -e "${GREEN}✅ Both servers started in tmux!${NC}"
    echo ""
    echo "Backend: http://localhost:5000"
    echo "Frontend: http://localhost:5173"
    echo ""
    echo "Tmux commands:"
    echo "  Attach to session: tmux attach -t $SESSION_NAME"
    echo "  Switch windows: Ctrl+b then 'n' (next) or 'p' (previous)"
    echo "  Detach: Ctrl+b then 'd'"
    echo "  Kill session: tmux kill-session -t $SESSION_NAME"
    echo ""
    echo "Attaching to session..."
    sleep 2
    tmux attach-session -t $SESSION_NAME
fi

