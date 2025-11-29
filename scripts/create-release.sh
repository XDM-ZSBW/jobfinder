#!/bin/bash
# Create Release Package

set -e

VERSION="${VERSION:-$(date +%Y%m%d-%H%M%S)}"
RELEASE_NAME="jobmatch-v${VERSION}"

echo "📦 Creating release: $RELEASE_NAME"

# Clean previous releases
rm -rf releases/
mkdir -p releases

# Create release package
echo "📦 Packaging application..."
zip -r "releases/${RELEASE_NAME}.zip" . \
    -x "*.git*" \
    -x "*node_modules*" \
    -x "*.next*" \
    -x "*__pycache__*" \
    -x "*.pyc" \
    -x "*.env*" \
    -x "*dist*" \
    -x "*.DS_Store*" \
    -x "releases/*" \
    -x "*.log" \
    -x "**/.ollama/*" \
    -x "**/ollama/*" \
    -x "*.gguf" \
    -x "*.ggml" \
    -x "**/models/*"

# Create release notes
cat > "releases/${RELEASE_NAME}-NOTES.md" <<EOF
# JobMatch Platform Release v${VERSION}

## Release Date
$(date)

## Features
- Universal Canvas form fields on all form screens
- Duolingo-style interactive form filling
- AI training integration
- GCP VM deployment ready
- OpenRouter API integration (Claude 3.5 Sonnet)

## Deployment
1. Upload \`${RELEASE_NAME}.zip\` to GCP VM
2. Run deployment script: \`scripts/deploy-to-vm.sh\`
3. Test endpoints: \`scripts/test-deployment.sh <VM_IP>\`

## Configuration
- Update \`.env\` with production settings
- Configure DNS to point to VM IP
- Set up SSL certificates for HTTPS

## UAT
See \`UAT_GUIDE.md\` for user acceptance testing instructions.
EOF

echo "✅ Release created: releases/${RELEASE_NAME}.zip"
echo "📄 Release notes: releases/${RELEASE_NAME}-NOTES.md"

# Also create jobmatch.zip for direct deployment
cp "releases/${RELEASE_NAME}.zip" jobmatch.zip
echo "✅ Created jobmatch.zip for deployment"

