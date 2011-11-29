(function() {
  var leadBeat = 0;
  var currentBeat = 0;
  var scoreLength = score.length;
  var stopped = false;
  var fade, fadePoint;
  var voicesCount;
  console.log("score len " + scoreLength);

  var maybeHighlightElement = function(beat) {
    if (beat.elem) {
      var cell = document.getElementById(beat.elem);
      if (cell) {
        cell.style.backgroundColor = "#ffcccc";
      }
    }
  };

  var maybeShowText = function(beat) {
    if (beat.text) {
      document.getElementById('text').innerHTML = beat.text;
    }
  };

  var maybeSingNote = function(beat) {
    if (beat.voice) {
      voices[0].frequency = Note.fromLatin(beat.voice).frequency();
    }
  };

  var maybePlayPiano = function(beat) {
    if (beat.piano) {
      for (i=0; i<beat.piano.length; i++) {
        voices[i+1].frequency = Note.fromLatin(beat.piano[i]).frequency();
      }
    }
  };

  var maybePlayBass = function(beat) {
    if (beat.bass) {
      voices[voicesCount-1].frequency = Note.fromLatin(beat.bass).frequency();
    }
  };


  var getNotes = function() {
    var beat = score[currentBeat];
    var dur;
    var i = 0;

    // Reset voices
    instrumentCount = 0;
    for (i=0; i<voices.length; i++) {
      voices[i].frequency = 0;
      voices[i].reset();
    }

    maybeHighlightElement(beat); 
    maybeShowText(beat);
    maybeSingNote(beat);
    maybePlayPiano(beat);
    maybePlayBass(beat);

    dur = beat.dur || 1/8;
    leadBeat = Math.floor(dur * sampleRate * 1.2);
    
    fade = 0;
    fadePoint = leadBeat - 100;

    currentBeat += 1;
    if (currentBeat > scoreLength-1) {
      stop();
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
        fade = 1 - (leadBeat-fadePoint) / 300;
      } else  if (leadBeat < 300) {
        fade = leadBeat / 300;
      } else {
        fade = 1;
      }

      sample = 0;

      for (i=0; i<voicesCount; i++) {
        instrument = voices[i];
        if (instrument.frequency > 0)  {
          instrument.generate();
          sample += instrument.getMix() * 0.5 * fade;
        }
      }

      for (n=0; n<channelCount; n++) {
        buffer[current + n] = lpf.pushSample(sample);
      }    

      leadBeat -= 1;
    }


  }, 2);

  var sampleRate = dev.sampleRate;

  var stop = function() {
    console.log("stop");
    stopped = true;
  };

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

  var lpf = new audioLib.BiquadFilter.LowPass(sampleRate, 1500, 0.6);

})();
