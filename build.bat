CALL browserify src/Engine.js -o comp.js
COPY /B %cd%\src\globals.js+%cd%\libs\pixi.min.js+%cd%\comp.js %cd%\bin\Junkpile.js
DEL %cd%\comp.js
