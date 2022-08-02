#!/usr/bin/env bash
#
# create-test-fixtures.sh
#
# Quickly set up fake folders and files to execute tests.

set -e
source "$(dirname "$0")/helpers.sh"

##############################################################
# Create a directory of the given name in the given path.
# Arguments:
#   1. The path where to create the directory
#   2. The directory name
##############################################################
create_directory() {
  [ $# -ne 2 ] && error_unexpected

  local _path
  local _folder_name

  _path=$1
  _folder_name=$2

  mkdir -p "${_path}/${_folder_name}"
}

##############################################################
# Create a file in the given path with optional content.
# Arguments:
#   1. The path where to create the file
#   2. The filename
#   3. The extension without dot (`txt` for example)
#   4. (Optional) The file content
##############################################################
create_file() {
  if [ $# -lt 1 ] || [ $# -gt 4 ]; then
    error_unexpected
  fi

  local _path
  local _filename
  local _extension
  local _content

  _path=$1
  _filename=$2
  _extension=$3
  _content=${4:-""}

  echo "$_content" >"${_path}/${_filename}.${_extension}"
}

##############################################################
# Create the given number of txt files in the given path.
# Arguments:
#   1. The path where to create the files
#   2. (Optional) The number of files to create
##############################################################
create_files() {
  if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    error_unexpected
  fi

  local _path
  local _total
  local _index
  local _filename

  _path=$1
  _total=${2:-1}
  _index=1

  while [ "$_index" -le "$_total" ]; do
    _filename="file${_index}"

    if ((_index % 2)); then
      create_file "$_path" "$_filename" "txt"
    elif ((_index % 3)); then
      create_file "$_path" "$_filename" "md"
    else
      create_file "$_path" "$_filename" "txt" "Quia voluptas officia recusandae quia suscipit et assumenda adipisci."
    fi

    _index=$(("$_index" + 1))
  done
}

#################################################################
# Create the given number of empty directories in the given path.
# Arguments:
#   1. The path where to create the directories
#   2. (Optional) The number of directories to create
#################################################################
create_empty_directories() {
  if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    error_unexpected
  fi

  local _path
  local _total
  local _index

  _path=$1
  _total=${2:-1}
  _index=1

  while [ $_index -le "$_total" ]; do
    create_directory "$_path" "empty-folder-${_index}"
    _index=$(("$_index" + 1))
  done
}

###################################################################
# Create the given number of directories & files in the given path.
# Arguments:
#   1. The path where to create the directories
#   2. (Optional) The number of directories to create
#   3. (Optional) The number of files to create in the directory
###################################################################
create_directories_with_files() {
  if [ $# -lt 1 ] || [ $# -gt 3 ]; then
    error_unexpected
  fi

  local _path
  local _total_dir
  local _total_files
  local _index
  local _folder_name

  _path=$1
  _total_dir=${2:-1}
  _total_files=${3:-1}
  _index=1

  while [ $_index -le "$_total_dir" ]; do
    _folder_name="folder-has-files-${_index}"

    create_directory "$_path" "$_folder_name"
    create_files "${_path}/${_folder_name}" "$_total_files"
    _index=$(("$_index" + 1))
  done
}

############################################################################
# Create the given number of directories & subdirectories in the given path.
# Arguments:
#   1. The path where to create the directories
#   2. (Optional) The number of directories to create
#   3. (Optional) The number of children to create in the directory
############################################################################
create_directories_with_subdirectories() {
  if [ $# -lt 1 ] || [ $# -gt 3 ]; then
    error_unexpected
  fi

  local _path
  local _total_dir
  local _total_subdir
  local _index
  local _folder_name

  _path=$1
  _total_dir=${2:-1}
  _total_subdir=${3:-1}
  _index=1

  while [ $_index -le "$_total_dir" ]; do
    _folder_name="folder-has-subdir-${_index}"

    create_directory "$_path" "$_folder_name"
    create_empty_directories "${_path}/${_folder_name}" "$_total_subdir"
    create_directories_with_files "${_path}/${_folder_name}" "$_total_subdir" 3
    _index=$(("$_index" + 1))
  done
}

###############################################################################
# Create the given number of directories with files & subdir in the given path.
# Arguments:
#   1. The path where to create the directories
#   2. (Optional) The number of directories to create
###############################################################################
create_directories_with_mix_children() {
  if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    error_unexpected
  fi

  local _path
  local _total_dir
  local _index
  local _folder_name

  _path=$1
  _total_dir=${2:-1}
  _index=1

  while [ $_index -le "$_total_dir" ]; do
    _folder_name="folder-${_index}"

    create_directory "$_path" "$_folder_name"
    create_empty_directories "${_path}/${_folder_name}" 1
    create_directories_with_files "${_path}/${_folder_name}" 3 4
    create_directories_with_subdirectories "${_path}/${_folder_name}" 4 2
    _index=$(("$_index" + 1))
  done
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
    create_files "$_FIXTURES_PATH" 5
    create_empty_directories "$_FIXTURES_PATH" 2
    create_directories_with_files "$_FIXTURES_PATH" 2 2
    create_directories_with_subdirectories "$_FIXTURES_PATH" 2 1
    create_directories_with_mix_children "$_FIXTURES_PATH" 3
    go_back_to_initial_directory
  else
    error "_FIXTURES_PATH does not exist. Received: $_FIXTURES_PATH" go_back_to_initial_directory
  fi
}

init
