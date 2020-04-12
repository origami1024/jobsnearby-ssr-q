#!/bin/bash
echo  ' - Alright, here we go. trigerring auto deploy .. ..'  &&  echo

installDependencies() {
  echo  " Installing global dependencies.."  &&       echo
  npm install
}



buildSSR() {
  echo  " building ./dist/ssr .. .."
  quasar build -m ssr
}



installSSR() {
  echo  " Installing application dependencies .. .."  &&  echo
  cd ./dist/ssr
  npm install
}

installDependencies && buildSSR && installSSR
