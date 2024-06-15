define([
    "sugar-web/graphics/palette",
    "text!activity/palettes/colorpalettetext.html",
  ], function (palette, template) {
    var colorpalette = {};
    colorpalette.ColorPalette = function (invoker, primaryText) {
      palette.Palette.call(this, invoker, primaryText);
      this.getPalette().id = "color-palette";
  
      var containerElem = document.createElement("div");
      containerElem.innerHTML = template;
  
      this.setContent([containerElem]);
  
      let that = this;
  
      const colors = document.querySelectorAll(".color-text");
      colors.forEach((color) => {
        color.addEventListener("click", function () {
          const selectedColor = this.style.backgroundColor;
          const colorChangeEvent = new CustomEvent("color-selected-text", {
            detail: { color: selectedColor },
          });
          document.dispatchEvent(colorChangeEvent);
          that.popDown();
        });
      });
    };
  
    var addEventListener = function (type, listener, useCapture) {
      console.log("adding event listener");
      return this.getPalette().addEventListener(type, listener, useCapture);
    };
  
    colorpalette.ColorPalette.prototype = Object.create(
      palette.Palette.prototype,
      {
        addEventListener: {
          value: addEventListener,
          enumerable: true,
          configurable: true,
          writable: true,
        },
      }
    );
  
    return colorpalette;
  });


  