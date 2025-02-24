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
    "POLICE",
    "CLAUS",
    "ALARM",
    "AUU",
    "RAPAZ",
    "AUMENTAOSOM",
    "FUNICULI",
    "DRUMS",
    "BALLOONPOP1",
    "BALLOONPOP2",
    "DARTBLOW",
    "BLIP",
    "SEQUENCE",
    "CASHREGISTER",
    "SWITCHFLIPLOUD",
    "SOCKETWRENCH",
    "BALLOONRUB1",
    "BALLOONRUB2",
    "BALLOONRUB3",
    "BALLOONRUB4",
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
  "metalHit3.mp3",
  "police.mp3",
  "ClausSound.mp3",
  "alarm.mp3",
  "Auu.mp3",
  "rapaz.mp3",
  "AumentaOSom.mp3",
  "funiculi.mp3",
  "drums.mp3",
  "balloonPop1.mp3",
  "balloonPop2.mp3",
  "dartBlow.mp3",
  "blip.mp3",
  "sequence.mp3",
  "cashRegister.mp3",
  "switchFlipLoud.mp3",
  "socketWrench.mp3",
  "balloonRub.mp3",
  "balloonRub2.mp3",
  "balloonRub3.mp3",
  "balloonRub4.mp3"
];






for(var i = 0 ; i < sndPaths.length; i++){
  sounds.push(new Howl({src:["Sounds/" + sndPaths[i]]}));
}

sounds[SND.HIT].volume(0.25);
sounds[SND.PAGEFLIP].volume(0.4);
sounds[SND.EXPLOSION].volume(0.2);
sounds[SND.GLITCHHIT].volume(0.2);
sounds[SND.POLICE].volume(0.2);
sounds[SND.AUMENTAOSOM].volume(0.4);
sounds[SND.BLIP].volume(0.3);
sounds[SND.SEQUENCE].volume(0.2);
sounds[SND.BALLOONPOP1].volume(0.5);
sounds[SND.BALLOONPOP2].volume(0.5);

function playSound(soundId){
  return sounds[soundId].play();
}

function pauseSound(soundId){
  sounds[soundId].pause();
}

function stopSound(soundId){
  sounds[soundId].stop();
}

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
    "DRMARIOSHEET",
    "SMACKEFFECT",
    "INVENTORYITEMS",
    "BANNERS",
    "MONEYDISPLAY",
    "MONEY",
    "CABLE",
    "USBCONNECTOR",
    "SHOPITEMS",
    "CLOSEINVENTORYBUTTON",
    "MUSICNOTES",
    "ACHIEVEMENTDISPLAY",
    "ACHIEVEMENTICONS",
    "GLOW",
    "HEADPHONES",
    "MINIDART",
    "BALLOON",
    "DRWIN",
    "PRICETAG",
    "SHADE",
    "SHINEPARTICLE",
    "SOUNDWAVE",
    "BLACKHOLE",
    "TOOLS",
    "TOOLBOX",
    "FLOWERPOT",
    "PLANTS",
    "PLANTSADDONS",
    "SEEDS",
    "ROCKPIECES",
    "STRAWHAT",
    "HUNTERHUNTER",
    "XAROPSQUARE",
    "BEE",
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
  "DrMarioSheet.png",
  "Hit.png",
  "inventoryItems.png",
  "banners.png",
  "MoneyDisplay.png",
  "money.png",
  "cable.png",
  "usbConnector.png",
  "shopItems.png",
  "closeInventory.png",
  "musicNotes.png",
  "Achievement.png",
  "achievementIcons.png",
  "Glow.png",
  "headphones.png",
  "darts.png",
  "balloons.png",
  "drWin.png",
  "priceTag.png",
  "Shade.png",
  "ShineParticle.png",
  "soundWave.png",
  "blackHole.png",
  "tools.png",
  "toolBox.png",
  "flowerPots.png",
  "plants.png",
  "plantsAddons.png",
  "seeds.png",
  "rock.png",
  "bones.png",
  "hunterHunter.png",
  "xaropSquare.png",
  "bee.png"

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
        sprites[SPR.SHOPITEMS].setSubimg(32,32);
        sprites[SPR.CLOSEINVENTORYBUTTON].setSubimg(16,32);
        sprites[SPR.MUSICNOTES].setSubimg(32,32);
        sprites[SPR.ACHIEVEMENTICONS].setSubimg(16,16);
        sprites[SPR.BIRTHDAY].setSubimg(64, 72);
        sprites[SPR.PIN].setSubimg(8,8);
        sprites[SPR.MINIDART].setSubimg(16, 7);
        sprites[SPR.BALLOON].setSubimg(156, 200);
        sprites[SPR.DRWIN].setSubimg(64,64);
        sprites[SPR.SHINEPARTICLE].setSubimg(16,16);
        sprites[SPR.TOOLS].setSubimg(32,32);
        sprites[SPR.FLOWERPOT].setSubimg(32,32);
        sprites[SPR.PLANTS].setSubimg(32,48);
        sprites[SPR.SEEDS].setSubimg(32,32);
        sprites[SPR.PLANTSADDONS].setSubimg(16,16);
        sprites[SPR.ROCKPIECES].setSubimg(64,64);
        sprites[SPR.XAROPSQUARE].setSubimg(38,38);
        sprites[SPR.BEE].setSubimg(150,200);



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
