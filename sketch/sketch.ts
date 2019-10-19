import p5 from "p5";
import Draggy from "./draggy";

class Sketch {
  public preload = () => {
    this.univers = this.p.loadFont("assets/AnonymousPro-Regular.ttf");
  };

  public draggy: Draggy;
  public p: p5;
  public univers: p5.Font;
  public canvas: p5.Renderer;
  constructor(p: p5) {
    this.p = p;
    this.p.setup = this.Setup;
    this.p.windowResized = this.windowResized;
    this.p.draw = this.draw;
    this.p.preload = this.preload;
  }
  public Setup = () => {
    this.p.noLoop();
    this.canvas = this.p.createCanvas(
      this.p.windowWidth,
      this.p.windowHeight
      // this.p.WEBGL
    );
    this.draggy = new Draggy(this.p, this.canvas, this.univers);
    this.draggy.setup();
  };

  public windowResized = () => {
    this.p.resizeCanvas(this.p.windowWidth, this.p.windowHeight);
  };

  public draw = () => {
    //this.p.translate(-this.p.width/2,-this.p.height/2,0); //moves our drawing origin to the top left corner
    this.p.background("#322931");
    this.draggy.draw();
  };
}

const sketch = (p: p5) => new Sketch(p);

new p5(sketch);
