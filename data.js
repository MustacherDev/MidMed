var path = "Sounds/";

Howler.autoUnlock = true;


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
    "STATICHIT",
    "GLITCHHIT",
    "KNOCK",
    "SLAP",
    "FALLINGROCK",
    "METALHIT1",
    "METALHIT2",
    "METALHIT3",
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
  "poof.mp3",
  "staticHit.mp3",
  "glitchHit.mp3",
  "knock.mp3",
  "slap.mp3",
  "fallingRock.mp3",
  "metalHit1.mp3",
  "metalHit2.mp3",
  "metalHit3.mp3"
];

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
  sounds.push(new Howl({src:["Sounds/" + sndPaths[i]]}));
}

sounds[SND.HIT].volume(0.25);
sounds[SND.PAGEFLIP].volume(0.4);
sounds[SND.EXPLOSION].volume(0.2);
sounds[SND.GLITCHHIT].volume(0.2);


function playSound(soundId){
  //if(sounds[soundId].paused || sounds[soundId].currentTime > 0){
   // sounds[soundId].pause();
   // sounds[soundId].currentTime = 0;
  return sounds[soundId].play();
  //}
}

function pauseSound(soundId){
  sounds[soundId].pause();
}

function stopSound(soundId){
  sounds[soundId].stop();
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
    "SCREENUSBSLOT",
    "METALBLOCK",
    "MIDMEDLOGO",
    "BUBBLE",
    "XAROPINHOBANNER",
    "STONKSBANNER",
    "NEWTONBANNER",
    "SAMUBANNER",
    "DRMARIOSHEET",
    "SMACKEFFECT",
    "INVENTORYITEMS",
    "BANNERS",
    "MONEYDISPLAY",
    "MONEY",
    "CABLE",
    "USBCONNECTOR",
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
  "usb.png",
  "metalBlock.png",
  "midMedLogo.png",
  "bubble.png",
  "xaropinhoBanner.png",
  "stonksBanner.png",
  "newtonBanner.png",
  "samuBanner.png",
  "DrMarioSheet.png",
  "Hit.png",
  "inventoryItems.png",
  "banners.png",
  "MoneyDisplay.png",
  "money.png",
  "cable.png",
  "usbConnector.png"
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
        sprites[SPR.SMACKEFFECT].setSubimg(32, 32);
        sprites[SPR.INVENTORYITEMS].setSubimg(16,16);
        sprites[SPR.BANNERS].setSubimg(320, 210);
        sprites[SPR.CABLE].setSubimg(16,16);

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
