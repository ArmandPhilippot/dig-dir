#!/usr/bin/env bash
#
# helpers.sh
#
# Utility functions that can be used in different scripts.

set -e

_INITIAL_DIRECTORY=$(pwd)
_RELATIVE_DIR_PATH="$(dirname "${0}")"
_FIXTURES_PATH="../tests/fixtures"
_COLOR_RESET=$(printf '\e[0m')
_COLOR_RED=$(printf '\e[31m')

##############################################################
# Print an error with an optional callback function then exit.
# Globals:
#   _COLOR_RED
#   _COLOR_RESET
# Arguments:
#   1. Error message
#   2. (Optional) A callback function (called before exiting).
##############################################################
error() {
  printf "%sError:%s %s\n" "$_COLOR_RED" "$_COLOR_RESET" "$1"
  [ -z ${2+x} ] && "$2"
  printf "Exit.\n"
  exit 1
}

##############################################################
# Print an error in case of an unplanned scenario then exit.
# Arguments:
#   None
##############################################################
error_unexpected() {
  error "An unexpected error occurred."
}

##############################################################
# Go to the directory containing this script.
# Globals:
#   _RELATIVE_DIR_PATH
# Arguments:
#   None
##############################################################
go_to_scripts_directory() {
  cd "${_RELATIVE_DIR_PATH}"
}

##############################################################
# Go back to where we were when calling the script.
# Globals:
#   _INITIAL_DIRECTORY
# Arguments:
#   None
##############################################################
go_back_to_initial_directory() {
  cd "${_INITIAL_DIRECTORY}"
}
