#!/bin/bash
echo  ' - Alright, here we go. trigerring auto deploy .. ..'  &&  echo

installDependencies() {
  echo  " Installing global dependencies.."  &&       echo
  npm install
}



buildSSR() {
  echo  " Installing server dependencies .. .."
  quasar build -m ssr
}



setupClient() {
  echo  " Installing application dependencies .. .."  &&  echo
  echo dir .
  echo " -------- "
  cd ./dist/ssr
  npm install
}

installDependencies && buildSSR && setupClient
