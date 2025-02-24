class NotePool {
    constructor(size) {
      this.pool = [];
      for (let i = 0; i < size; i++) {
        const synth = new Tone.AMSynth().toDestination();
        this.pool.push({ synth, isFree: true });
      }
    }
  
    getNote() {
      for (let i = 0; i < this.pool.length; i++) {
        if (this.pool[i].isFree) {
          this.pool[i].isFree = false;
          return this.pool[i].synth;
        }
      }
      // Handle case where no synths are available
      return null;
    }
  
    returnNote(synth) {
      for (let i = 0; i < this.pool.length; i++) {
        if (this.pool[i].synth === synth) {
          this.pool[i].isFree = true;
          break;
        }
      }
    }
  }
  
// Usage:
const notePool = new NotePool(20); // Create a pool of 10 synths


class MusicManager{
    static minOctave = 3;
    static maxOctave = 7;
    static noteMap = {
        "C": 0,
        "C#": 1,
        "D": 2,
        "D#": 3,
        "E": 4,
        "F": 5,
        "F#": 6,
        "G": 7,
        "G#": 8,
        "A": 9,
        "A#": 10,
        "B": 11
      };
    static noteTypes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    constructor(){
        this.notes = this.generateNoteList();
    }

    generateNoteList() {
       
        const noteList = [];
    
        for (let octave = MusicManager.minOctave; octave <= MusicManager.maxOctave; octave++) {
            for (let note of MusicManager.noteTypes) {
                noteList.push(`${note}${octave}`);
            }
        }
    
        return noteList;
    }

    static noteName2Id(noteName){
        const octave = parseInt(noteName.charAt(noteName.length - 1));
        const note = noteName.substring(0, noteName.length - 1);
        return MusicManager.noteMap[note] + (octave - MusicManager.minOctave) * 12; 
    }

    static noteId2Name(noteId){
        var note = MusicManager.noteTypes[(noteId)%12];
        var octave = (Math.floor(noteId/12)) + MusicManager.minOctave;
        return (`${note}${octave}`);
    }
      
    
    playNote(noteIndex){
        // Ensure the noteIndex is within the valid range
        const clampedIndex = clamp(noteIndex,0, this.notes.length - 1);
    
        // Get the corresponding note
        const noteToPlay = this.notes[clampedIndex];
        const amp = 30;
        const volume = clamp((1 - (clampedIndex / this.notes.length))*amp -(amp-1), -amp, 1) + 10;
        // Create a synth and trigger the note
        const synth = notePool.getNote();
        if (synth) {
            synth.volume.value = volume;
            synth.triggerAttackRelease(noteToPlay, '8n');

            setTimeout(() => {
                notePool.returnNote(synth);
            }, 1000); // Adjust the timeout as needed
        }
    }


}

var musicMan = new MusicManager();


class MusicNote{
    constructor(name, id, startTime){
        this.name = name;
        this.id = id;
        this.startTime = startTime;
    }
    
}

class MusicTrack{
    constructor(id, startTime, notes){
        this.id = id;
        this.startTime = startTime;
        this.notes = notes;
        this.playIndex = 0;
        this.done = false;
    }
}

class MusicBox{
    constructor(){
        this.playReady = false;
        this.readReady = false;
        this.partiture = [];
        this.loadedTracks = [];
        this.playTime = 0;
        this.playSpd = 0.02;

        this.paused = false;
    }

    async readMidi(midiJsonPath){
        this.readReady = false;
        var response = await fetch(midiJsonPath);
        var midi = await response.json();
        this.partiture = [];

        for(var i = 0; i < midi.tracks.length; i++){
            var notes = [];
            var midiTrack = midi.tracks[i];
            
            for(var j = 0; j < midiTrack.notes.length; j++){
                var midiNote = midiTrack.notes[j];
                var note = new MusicNote(midiNote.name, j, midiNote.time);
                notes.push(note);
            }
            var musTrack = new MusicTrack(i, midiTrack.startTime, notes);
            this.partiture.push(musTrack);
        }

        this.readReady = true;

    }

    loadFromPartiture(){
       
        this.loadedTracks = [];
        for(var i =  0 ; i < this.partiture.length; i++){
            var track = this.partiture[i];
            var loadNotes = [];
            for(var j =  0 ; j < track.notes.length; j++){
                var note = track.notes[j];
                var loadNote = new MusicNote(note.name, j, note.startTime);
                loadNotes.push(loadNote);
            }
            var loadTrack = new MusicTrack(i, track.startTime, loadNotes);
            this.loadedTracks.push(loadTrack);
        }

        this.playReady = true;
        this.paused = false;
    }

    play(dt){
        if(!this.playReady) return;
        if(this.paused) return;

        this.playTime += dt*this.playSpd;

        for(var i =  0 ; i < this.loadedTracks.length; i++){
            var track = this.loadedTracks[i];
            if(track.done) continue;

            if(track.startTime <= this.playTime){
                
                for(var j = track.playIndex; j < track.notes.length; j++){
                    var note = track.notes[j];
                    if(note.startTime <= this.playTime){
                        var noteId = MusicManager.noteName2Id(note.name);
                        if(noteId > 0 && noteId < 50){
                            var gridObj = manager.grid[GRID.MIDDLE][noteId];
                            if(gridObj.valid){
                                if(gridObj.object.type == OBJECT.LOSANGO){
                                    gridObj.object.playNote();
                                }
                            }
                        }
                        track.playIndex++;
                    } else {
                        break;
                    }
                }
                
                if(track.notes.length == track.playIndex){
                    track.done = true;
                }
            }
        }

        var keepPlaying = false;
        for(var i =  0 ; i < this.loadedTracks.length; i++){
            if(!this.loadedTracks[i].done){
                keepPlaying = true;
                break;
            }
        }

        if(!keepPlaying){
            this.playReady = true;
            this.playTime = 0;
            this.paused = true;
            for(var i =  0 ; i < this.loadedTracks.length; i++){
                this.loadedTracks[i].done = false;
                this.loadedTracks[i].playIndex = 0;
            }
        }
    }
}

var musicBox = new MusicBox();