@echo off
set "PATH=%~dp0tools\node-v24.21.0-win-x64;%PATH%"
call "%~dp0tools\node-v24.21.0-win-x64\npm.cmd" %*
