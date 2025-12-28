#!/bin/bash
# Example validation script
# Checks if a component file follows basic patterns

FILE="$1"

if [ -z "$FILE" ]; then
  echo "Usage: ./validate.sh <file.tsx>"
  exit 1
fi

echo "Validating $FILE..."

# Check for 'use client' directive
if ! grep -q "'use client'" "$FILE"; then
  echo "⚠️  Missing 'use client' directive"
else
  echo "✅ Has 'use client' directive"
fi

# Check for Chakra imports
if ! grep -q "@chakra-ui/react" "$FILE"; then
  echo "⚠️  No Chakra UI imports found"
else
  echo "✅ Has Chakra UI imports"
fi

# Check for TypeScript
if [[ "$FILE" != *.tsx && "$FILE" != *.ts ]]; then
  echo "⚠️  File should be .tsx or .ts"
else
  echo "✅ Correct file extension"
fi

echo "Validation complete!"

