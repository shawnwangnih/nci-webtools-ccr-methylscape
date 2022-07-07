#!/bin/bash

# ensure that METHYLSCAPE_SOURCE_LOCATION and METHYLSCAPE_DESTINATION_LOCATION are set
# eg: export these variables in your .bashrc file
aws s3 sync $METHYLSCAPE_SOURCE_LOCATION $METHYLSCAPE_TARGET_LOCATION