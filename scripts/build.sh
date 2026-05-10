#!/bin/bash

# Hytale UI Studio - Local Build Script (Linux)

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting build process for Hytale UI Studio...${NC}"

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}pnpm is not installed. Installing it now...${NC}"
    npm install -g pnpm
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install

# Check for Rust
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Rust/Cargo not found. Please install it from https://rustup.rs/${NC}"
    exit 1
fi

# Build
echo -e "${BLUE}Building Tauri application...${NC}"
pnpm tauri:build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build successful!${NC}"
    echo -e "You can find your build in: ${BLUE}src-tauri/target/release/bundle/${NC}"
else
    echo -e "${RED}Build failed.${NC}"
    exit 1
fi
