(function() {
  var leadBeat = 0;
  var currentBeat = 0;
  var scoreLength = score.length;
  var stopped = false;
  var fade;
  var fadePoint;
  var voicesCount;
  var slowness = 1.2;
  var fadeMix = 0.5;
  var fadeOffset = 1;

  var handleKeyup = function(evt) {
    switch(evt.keyCode) {
      case 32:  // space - pause/play
        stopped = (! stopped);
        break;
      case 37:  // left arrow - back a bit
        setBeat(currentBeat - 16);
        break;
      case 39:  // right arrow - forward a bit
        setBeat(currentBeat + 16);
        break;
      case 38:  // up arrow - faster
        slowness = Math.max(slowness-0.2, 1);
        break;
      case 40:  // down arrow - slower
        slowness = Math.min(slowness+0.2, 2);
        break;
      default:
        break;
    }
    evt.stopPropagation();
  }

  if (document.addEventListener) {
    document.addEventListener("keyup", handleKeyup, false);
  } else if (document.attachEvent) { 
    document.attachEvent("onkeyup", handleKeyup);
  }


  var setBeat = function(n) {
    if (n >= 0 && n < scoreLength) { 
      currentBeat = n;
    }
  };

  var highlightElement = function(beat) {
    var cell = document.getElementById(beat.elem);
    if (cell) {
      cell.style.backgroundColor = "#ffaaaa";
    }
  };

  var showText = function(beat) {
    document.getElementById('text').innerHTML = beat.text;
  };

  var singNote = function(beat) {
    voices[0].frequency = Note.fromLatin(beat.voice).frequency();
  };

  var playPiano = function(beat) {
    for (i=0; i<beat.piano.length; i++) {
      voices[i+1].frequency = Note.fromLatin(beat.piano[i]).frequency();
    }
  };

  var playBass = function(beat) {
    voices[voicesCount-1].frequency = Note.fromLatin(beat.bass).frequency();
  };

  var getNotes = function() {
    var beat = score[currentBeat];
    var dur = beat.dur || 1/8;
    currentBeat += 1;

    // Reset voices
    for (var i=0; i<voices.length; i++) {
      voices[i].frequency = 0;
      voices[i].reset();
    }

    if (beat.elem) highlightElement(beat); 
    if (beat.text) showText(beat);
    if (beat.voice) singNote(beat);
    if (beat.piano) playPiano(beat);
    if (beat.bass) playBass(beat);

    leadBeat = Math.floor(dur * sampleRate * slowness);
    
    fade = 0;
    fadePoint = leadBeat - fadeOffset;

    if (currentBeat > scoreLength-1) {
      stopped = true;
    }
  };

  var dev = new audioLib.AudioDevice(function(buffer, channelCount) {
    if (stopped) return null;

    var len = buffer.length;
    var sample;
    var current;
    var instrument;
    var n;

    for (current=0; current < len; current += channelCount) {
      if (leadBeat < 1) getNotes();

      if (leadBeat > fadePoint) {
        fade = 1 - (leadBeat-fadePoint) / fadeOffset;
      } else  if (leadBeat < fadeOffset) {
        fade = leadBeat / fadeOffset;
      } else {
        fade = 1;
      }

      sample = 0;

      for (i=0; i<voicesCount; i++) {
        instrument = voices[i];
        if (instrument.frequency > 0)  {
          instrument.generate();
          sample += instrument.getMix() * fadeMix * fade;
        }
      }

      for (n=0; n<channelCount; n++) {
        buffer[current + n] = lpf.pushSample(sample);
      }    

      leadBeat -= 1;
    }
  }, 2);

  var sampleRate = dev.sampleRate;

  var voices = [
    new audioLib.Oscillator(sampleRate, 440),  /* lead voice */
    new audioLib.Oscillator(sampleRate, 440),  /* 4 piano keys */
    new audioLib.Oscillator(sampleRate, 440),
    new audioLib.Oscillator(sampleRate, 440),
    new audioLib.Oscillator(sampleRate, 440),
    new audioLib.Oscillator(sampleRate, 440)   /* bass */
  ];
  voicesCount = voices.length;

  // waveshapes for voice, piano, and bass
  voices[0].waveShape = 'sawtooth';
  for (var i=1; i<voicesCount-1; i++) {
    voices[i].waveShape = 'square';
  }
  voices[voicesCount-1].waveShape = 'triangle';

  var lpf = new audioLib.BiquadFilter.LowPass(sampleRate, 1500, 0.2);

})();
