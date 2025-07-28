
#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Run linting
echo "Running linter..."
npm run lint

# Run tests
echo "Running tests..."
npm test

# Run e2e tests
echo "Running e2e tests..."
npm run test:e2e
