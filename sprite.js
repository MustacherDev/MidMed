
// Sprite OBJECT
class Sprite {
  constructor(img, wid, hei, imgWid, imgHei){
    if (!(img instanceof HTMLImageElement)) {
      throw new TypeError("img must be an instance of HTMLImageElement");
    }
    if (typeof wid !== 'number' || typeof hei !== 'number') {
      throw new TypeError("width and height must be numbers");
    }

    this.img = img;

    this.width = wid;
    this.height = hei;

    this.imgWid = imgWid;
    this.imgHei = imgHei;

    this.imgNumX = Math.floor(this.imgWid / this.width);
    this.imgNumY = Math.floor(this.imgHei / this.height);

    this.imgNum = this.imgNumX * this.imgNumY;

    this.xoffset = 0;
    this.yoffset = 0;
  }

  setSubimg(wid, hei){
    this.width = wid;
    this.height = hei;

    this.imgNumX = Math.floor(this.imgWid / this.width);
    this.imgNumY = Math.floor(this.imgHei / this.height);

    this.imgNum = this.imgNumX * this.imgNumY;
  }

  drawExt(x, y, img, xscl, yscl, ang, sprOffsetX, sprOffsetY){
    img = img%(this.imgNumX*this.imgNumY);
    var imgx = img % this.imgNumX;
    var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;
    this.drawInternal(ctx, imgx, imgy, x, y, sprOffsetX, sprOffsetY, xscl, yscl, ang);
  }

  drawExtRelative(x, y, img, xscl, yscl, ang, sprOffsetXPercent, sprOffsetYPercent){
    img = img%(this.imgNumX*this.imgNumY);
    var imgx = img % this.imgNumX;
    var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;
    this.drawInternal(ctx, imgx, imgy, x, y, sprOffsetXPercent*this.width, sprOffsetYPercent*this.height, xscl, yscl, ang);
  }

  drawInternal(ctx, sourceImgX, sourceImgY, spriteX, spriteY, spriteOffsetX, spriteOffsetY, scaleX, scaleY, angle){
    // Source Img X and Y refers to the specific sprite in a spritesheet

    // The spriteOffset X and Y will be scaled with scale X and Y

    // Translations
    // Before scaling  : Base X and Y coords                (spriteX, spriteY)
    // Before rotating : I don't know why i would need this
    // Before drawing  : Sprite Rotation Center X, Y        (spriteOffsetX, spriteOffsetY)


    ctx.save();
    ctx.translate(spriteX, spriteY);
    ctx.scale(scaleX, scaleY);

    ctx.rotate(angle);

    ctx.drawImage(this.img, sourceImgX * this.width, sourceImgY * this.height, this.width, this.height,-spriteOffsetX, -spriteOffsetY, this.width, this.height);

    ctx.restore();
  }
}



function createSprite(img){
    return new Sprite(img, img.naturalWidth, img.naturalHeight, img.naturalWidth, img.naturalHeight);
}

function createSpriteExt(img, wid, hei){
  return new Sprite(img, wid, hei, img.naturalWidth, img.naturalHeight);
}
