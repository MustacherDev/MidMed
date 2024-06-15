
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


    /// Draw sprite
  drawSimple(x, y, img, scl) {
      var imgx = img % this.imgNumX;
      var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;

      ctx.drawImage(this.img, imgx * this.width, imgy * this.height, this.width, this.height, x - this.xoffset, y - this.yoffset, this.width * scl, this.height * scl);
  }

    /// Draw sprite with separe scaling and centralizing option
  draw(x, y, img, xscl, yscl, centerTransform) {
      // Image X and Y based on img number
      var imgx = (img % this.imgNumX);
      var imgy = (Math.floor(img / this.imgNumX) % this.imgNumY);


      // Centralizing Transformations
      let centerTrnsf = centerTransform || false;

      let offx = this.xoffset;
      let offy = this.yoffset;
      if (centerTrnsf) {
          offx = this.width / 2;
          offy = this.height / 2;
      }

      // Actual Transformations
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(xscl, yscl);

      ctx.drawImage(this.img, imgx * this.width, imgy * this.height, this.width, this.height, -offx, -offy, this.width, this.height);

      ctx.restore();
  }

    /// Draw sprite with rotation
  drawRot(x, y, img, xscl, yscl, ang, centerTransform) {

      var imgx = img % this.imgNumX;
      var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;

      // Centralizing Transformations
      let centerTrnsf = centerTransform || false;

      let offx = this.xoffset;
      let offy = this.yoffset;
      if (centerTrnsf) {
          offx = this.width / 2;
          offy = this.height / 2;
      }

      // Actual Transformations
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(xscl, yscl);
      ctx.rotate(ang);

      ctx.drawImage(this.img, imgx * this.width, imgy * this.height, this.width, this.height, -offx, -offy, this.width, this.height);

      ctx.restore();
  }

  /// Draw sprite with rotation and offset
  drawFix(x, y, img, xscl, yscl, ang, transfX, transfY, offSetX, offSetY) {

      var imgx = img % this.imgNumX;
      var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;

      // Centralizing Transformations

      let transX = transfX;
      let transY = transfY;

      let offx = (-offSetX + transX) * Math.abs(xscl);
      let offy = (-offSetY + transY) * Math.abs(yscl);

      ctx.save();
      ctx.translate(x + offx, y + offy);
      ctx.scale(xscl, yscl);

      if (ang != 0) {
          ctx.rotate(ang);
      }

      ctx.drawImage(this.img, imgx * this.width, imgy * this.height, this.width, this.height, -transX, -transY, this.width, this.height);

      ctx.restore();
  }

  applyTransformations(ctx, imgX, imgY, transX, transY, sclX, sclY, ang, offX, offY){
    ctx.save();
    ctx.translate(transX, transY);
    ctx.scale(sclX, sclY);

    if (ang != 0) {
        ctx.rotate(ang);
    }

    ctx.drawImage(this.img, imgX * this.width, imgY * this.height, this.width, this.height, offX, offY, this.width, this.height);

    ctx.restore();
  }
}



function createSprite(img){
    return new Sprite(img, img.naturalWidth, img.naturalHeight, img.naturalWidth, img.naturalHeight);
}

function createSpriteExt(img, wid, hei){
  return new Sprite(img, wid, hei, img.naturalWidth, img.naturalHeight);
}
