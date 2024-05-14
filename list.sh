#!/bin/bash

# Define the folder path to search for component files
FOLDER_PATH="/home/vignes/test.eagna.io/src"


# Define the output file name
OUTPUT_FILE="component_files_tree.csv"

# Use find command to locate component files and extract parent folder names and file names
find "$FOLDER_PATH" -type f -name "*.component.ts" -printf '%h,%f\n' | awk -F'/' 'BEGIN { OFS="," } { print $(NF-2), $(NF-1), $NF }' > "$OUTPUT_FILE"


echo "Component files exported to $OUTPUT_FILE"
