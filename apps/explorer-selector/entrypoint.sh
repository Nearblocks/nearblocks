#!/bin/sh

# Run generate-env.js script to generate environment variables
node apps/explorer-selector/generate-env.js

# Start the Next.js server
node apps/explorer-selector/server.js