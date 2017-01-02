#!/bin/bash
echo "-------Starting Build-------"
# Clean the build directories
rm -rf build
mkdir build
mkdir build/intermediates
mkdir build/output

# Compile source files to ES5
babel game --out-dir build/intermediates --source-maps

# Browserify the compiled files into a single browser-runnable JavaScript file
browserify build/intermediates/init.js -o build/intermediates/init-b.js

# Move the browserified file to the output directory
mv build/intermediates/init-b.js build/output/init.js

# Move index.html and assets directory from game to output directory
cp -r game/assets build/output

echo "-------Build complete-------"
