#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

sourcePath="$1"
outputPath="$2"

# Ensure source path exists
if [ ! -d "$sourcePath" ]; then
  echo "Source path does not exist: $sourcePath"
  exit 1
fi

# Ensure output path exists
if [ ! -d "$outputPath" ]; then
  echo "Output path does not exist: $outputPath"
  exit 1
fi

cd "$sourcePath"

rustup target add wasm32-unknown-unknown
cargo build --all --target wasm32-unknown-unknown --release 

# Locate the WASM file
wasmFile=$(find "$sourcePath/target/wasm32-unknown-unknown/release/" -name '*.wasm' | head -n 1)
if [ -z "$wasmFile" ]; then
  echo "No WASM file found in $outputPath"
  exit 1
fi

# Calculate the SHA256 hash of the WASM file and save it to wasm_hash.txt
sha256sum "$wasmFile" | awk '{ print $1 }' > "$outputPath/wasm_hash.txt"

# Print build completed
echo "Build completed."
