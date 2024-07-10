var path = "Sounds/";



/// SOUND AND TEXTURES LOADER

// Loading Sounds
var sounds = [];
var soundsState = [];

var winSounds = [];

const SND = Object.freeze(new Enum(
    "HIT",
    "PAGEFLIP",
    "PAGESLIP",
    "FALL",
    "POP",
    "COINFALL",
    "COINNOISE",
    "COINNOISE2",
    "COINHIT",
    "COINHIT2",
    "EXPLOSION",
    "WHISTLE",
    "SNEEZE",
    "SMWBWOOP",
    "POOF",
    "TOTAL"
));

const WINSND = Object.freeze(new Enum(
    "CLASHROYALE",
    "FNAF",
    "MARIOBROS",
    "MINECRAFT",
    "PVZ",
    "SMW",
    "UNDERTALE",
    "WIN1",
    "WIN2",
    "WIN3",
    "YOUWIN",
    "TOTAL"
));

const sndPaths = [
  "Hit.mp3",
  "pageFlip.mp3",
  "pageSlip.mp3",
  "FALL.mp3",
  "Pop.mp3",
  "coins/coinFall.mp3",
  "coins/coinCollision1.mp3",
  "coins/coinCollision2.mp3",
  "coins/coinHitB1.mp3",
  "coins/coinHitB2.mp3",
  "Explosion.wav",
  "whistle.mp3",
  "Sneeze.mp3",
  "SMW Bwoop.mp3",
  "poof.mp3"
];

const winSndPaths = [
  "Clash Royale Win Theme.mp3",
  "FNAF Win Theme.mp3",
  "Mario Bros Course Clear.mp3",
  "Minecraft Win Theme.mp3",
  "PVZ Win Theme.mp3",
  "SMW Course Clear.mp3",
  "UNDERTALE Win Theme.mp3",
  "WIN THEME 1.mp3",
  "WIN THEME 2.mp3",
  "WIN THEME 3.mp3",
  "YOU WIN.mp3"
];



for(var i = 0 ; i < sndPaths.length; i++){
  sounds.push(new Audio("Sounds/" + sndPaths[i]));
}

sounds[SND.HIT].volume = 0.5;
sounds[SND.PAGEFLIP].volume = 0.8;
sounds[SND.EXPLOSION].volume = 0.4;


function playSound(soundId){
  if(sounds[soundId].paused || sounds[soundId].currentTime > 0){
    sounds[soundId].pause();
    sounds[soundId].currentTime = 0;
    sounds[soundId].play();
  }
}

for(var i = 0 ; i < winSndPaths.length; i++){
  winSounds.push(new Audio("Sounds/Win/" + winSndPaths[i]));
}





const SPR = Object.freeze(new Enum(
    "BOMB",
    "BITCOIN",
    "NUMBERS",
    "PIN",
    "SUN",
    "SUNDISPLAY",
    "BIRTHDAY",
    "ROCK",
    "HOLE",
    "CURTAIN",
    "DART",
    "SCREENFRAMETILE",
    "SCREENBACKTILE",
    "SCREENTILESLOT",
    "METALBLOCK",
    "MIDMEDLOGO",
    "BUBBLE",
    "XAROPINHOBANNER",
    "STONKSBANNER",
    "NEWTONBANNER",
    "SAMUBANNER",
    "DRMARIOSHEET",
    "TOTAL"
));

var imgPaths = [  "bombSprite.png",
  "BitCoin.png",
  "Numeros.png",
  "pin.png",
  "sun.png",
  "SunDisplay.png",
  "BirthdayHat.png",
  "rock.png",
  "hole.png",
  "black curtain.png",
  "dart.png",
  "screenFrameTile.png",
  "screenBackTile.png",
  "gameSlot.png",
  "metalBlock.png",
  "midMedLogo.png",
  "bubble.png",
  "xaropinhoBanner.png",
  "stonksBanner.png",
  "newtonBanner.png",
  "samuBanner.png",
  "DrMarioSheet.png"
];

var need2Load = imgPaths.length;
var dataLoaded = 0;
var allDataIsLoaded = false;
var spritesLoaded = false;

var sprites = [];
var images  = [];


function loadSprites() {
    if (!spritesLoaded) {
      console.log("loading Sprites");

        for (var i = 0; i < images.length; i++) {
            sprites.push(createSprite(images[i]));
        }

        sprites[SPR.NUMBERS].setSubimg(16,16);
        sprites[SPR.SCREENFRAMETILE].setSubimg(64, 64);
        sprites[SPR.SCREENBACKTILE].setSubimg(64, 64);
        sprites[SPR.DRMARIOSHEET].setSubimg(8, 8);

        spritesLoaded = true;
    }
}

function checkImages() {
    for (var i = 0; i < images.length; i++) {
        if (!images[i].complete) {
            return false;
        }
    }
    return true;
}

function testLoad() {
    dataLoaded++;
    if (dataLoaded >= need2Load) {
        allDataIsLoaded = true;
        loadSprites();
    }
}


path = "Sprites/";

for(var i = 0 ; i < imgPaths.length; i++){
  images.push(new Image());
  images[i].onLoad = testLoad;

  images[i].src = path+imgPaths[i];
}
