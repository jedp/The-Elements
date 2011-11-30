# The Elements

The song by Tom Lehrer, with the periodic table humming along.  

My 7-year-old daughter has become obsessed with this song.  While she was at
school and I was home sick, I put this together to help us memorize the
complete lyrics.

This is attempt at using the audio API.  I've totally cribbed off of
[supersynth](https://github.com/davidgovea/supersynth).

Here's a screenshot of the program in action:

![Screenshot](/jedp/The-Elements/raw/master/img/elements.png)

## Controls

You can control it with:

- Left arrow: back a bit
- Right arrow: forward a bit
- Up arrow: faster
- Down arrow: slower
- Space: pause or play

## To Use

The auido works in Firefox and Chrome (if you have audio extensions enabled).

Using [Node.JS](http://nodejs.org) and [NPM](http://npmjs.org), you can:

- `git clone` the project
- `cd The-Elements`
- `npm install` (this one time only)
- `node server.js`

Now go to `localhost:3000` in your browser.  

Node.JS isn't necessary.  You just need to serve the contents of `public` as a
root directory somehow.  (If you prefer to do this with Apache or nginx, please
send me a pull request with your config!)

## Dependencies

- [audiolib.js](https://github.com/jussi-kalliokoski/audiolib.js/)
- [music.js](https://github.com/GregJ/music.js)

## To Do

- Color-code sections of periodic table
- Disco light dancing during interludes


