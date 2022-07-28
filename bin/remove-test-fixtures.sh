#!/usr/bin/env bash
#
# remove-test-fixtures.sh
#
# Quickly remove test fixtures.

set -e
source "$(dirname "$0")/helpers.sh"

##############################################################
# Remove all files and directories in fixtures path.
# Globals:
#   _FIXTURES_PATH
# Arguments:
#   None
##############################################################
remove_fixtures() {
  rm -r "${_FIXTURES_PATH:?}/"*
}

##############################################################
# Init this script.
# Globals:
#   _FIXTURES_PATH
# Arguments:
#   None
##############################################################
init() {
  go_to_scripts_directory

  if [ -d "$_FIXTURES_PATH" ]; then
    remove_fixtures
    go_back_to_initial_directory
  else
    error "_FIXTURES_PATH does not exist. Received: $_FIXTURES_PATH" go_back_to_initial_directory
  fi
}

init
