#!/bin/bash
echo "-------Starting Build-------"
# Clean the build directories
rm -rf build
mkdir build
mkdir build/intermediates
mkdir build/output

# Move assets directory from game to output directory
echo "Copying assets..."
cp -r game/assets build/output
echo "Copying assets complete"

# Compile source files to ES5
babel game --out-dir build/intermediates --source-maps

# Browserify the compiled files into a single browser-runnable JavaScript file
browserify build/intermediates/init.js -o build/intermediates/init-browserified.js

# compile SASS files & uglify final file
gulp compile

# Copy the browserified file to the output directory
cp build/intermediates/init-browserified-obfuscated.js build/output/init.js

echo "-------Build complete-------"
