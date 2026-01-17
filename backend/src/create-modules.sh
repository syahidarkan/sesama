#!/bin/bash

# Create all directories
mkdir -p berita static-pages form-field-config pelaporan

# Create module files
for dir in berita static-pages system-settings form-field-config pelaporan; do
  touch $dir/$dir.module.ts
  touch $dir/$dir.service.ts
  touch $dir/$dir.controller.ts
done

echo "All module files created"
