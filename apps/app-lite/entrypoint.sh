#!/bin/sh

# Run generate-env.js script to generate environment variables
node apps/app-lite/generate-env.js

# Start the Next.js server
node apps/app-lite/server.js