class Color {
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    // Convert RGB to HSL
    toHSL() {
        let r = this.r / 255;
        let g = this.g / 255;
        let b = this.b / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100, a: this.a };
    }

    // Convert RGB to hexadecimal string
    toHex() {
        var r = Math.floor(this.r);
        var b = Math.floor(this.b);
        var g = Math.floor(this.g);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Convert RGB to CSS string
    toCSS() {
        var r = Math.floor(this.r);
        var b = Math.floor(this.b);
        var g = Math.floor(this.g);
        var a = this.a;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    // Static method to create Color instance from hexadecimal string
    static fromHex(hex, alpha = 1) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return new Color(
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            alpha
        );
    }

    static fromHSL(h, s, l, a = 1) {
        h /= 360; // Convert hue to range [0, 1]
        s /= 100; // Convert saturation to range [0, 1]
        l /= 100; // Convert lightness to range [0, 1]

        if (s === 0) {
            // Achromatic color (gray)
            return new Color(l * 255, l * 255, l * 255, a);
        }

        let hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        let r = hueToRgb(p, q, h + 1 / 3) * 255;
        let g = hueToRgb(p, q, h) * 255;
        let b = hueToRgb(p, q, h - 1 / 3) * 255;

        return new Color(r, g, b, a);
    }

    copy(){
      return new Color(this.r, this.g, this.b, this.a);
    }

    setWithColor(color){
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
    }

    diff(color){
        return new Color(this.r - color.r, this.g - color.g, this.b - color.b, this.a - color.a);
    }

    add(color){
        return new Color(this.r + color.r, this.g + color.g, this.b + color.b, this.a + color.a);
    }


    mult(val){
      return new Color(this.r*val, this.g*val, this.b*val, this.a);
    }
}
