echo Building with browserify...
browserify src/Engine.js -o comp.js
echo DONE!
echo Combining files...
cat ./src/globals.js ./libs/pixi.min.js ./comp.js > ./bin/Junkpile.js
echo DONE!
echo Cleaning up...
rm ./comp.js -f
echo DONE!
echo Compiled to ./bin/Junkpile.js
