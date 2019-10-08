import p5 from "p5";
import Draggy from "./draggy";
class Sketch {
  public draggy: Draggy;
  public p: p5;
  public canvas: p5.Renderer;
  constructor(p: p5) {
    this.p = p;
    this.p.setup = this.Setup;
    this.p.windowResized = this.windowResized;
    this.p.draw = this.draw;
  }
  public Setup = () => {
    this.canvas = this.p.createCanvas(this.p.windowWidth, this.p.windowHeight);
    this.draggy = new Draggy(this.p, this.canvas);
    this.draggy.setup();
  };

  public windowResized = () => {
    this.p.resizeCanvas(this.p.windowWidth, this.p.windowHeight);
  };

  public draw = () => {
    this.p.background(100);
    this.draggy.draw();
  };
}

const sketch = (p: p5) => new Sketch(p);

new p5(sketch);
