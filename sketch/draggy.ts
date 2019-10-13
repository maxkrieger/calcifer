// https://editor.p5js.org/joeyklee/sketches/liHgeD1eg

/// GOOD REAL STUFF
const textSize = 18;

// "This year, we want to explicitly broaden the type of reflections we receive, to be inclusive of the many different ways we are spending our summers. We’re also going to invite reflections from Masters and Doctoral candidates for the first time. Whether you spent your summer working, studying, travelling, resting, or something entirely different; we’d love to hear about it!"

import * as p5 from "p5";
import Matter from "matter-js";
export default class Draggy {
  public engine: Matter.Engine;
  public texts: any;
  public univers: p5.Font;
  public mouse: Matter.Mouse;
  public canvas: p5.Renderer;
  public p: p5;
  public mouseConstraint: Matter.MouseConstraint;
  public exprs: Record<string, string>;
  constructor(p: p5, canvas: p5.Renderer, univers: any) {
    this.univers = univers;
    this.canvas = canvas;
    this.p = p;
    this.exprs = {
      a: "hello",
      b: "world"
    };
  }
  public setup = () => {
    this.engine = Matter.Engine.create();
    this.engine.world.gravity.y = 0;

    this.texts = Matter.Composite.create();

    Object.keys(this.exprs).forEach((key: string, index: number) => {
      var bounds = this.univers.textBounds(
        this.exprs[key],
        0,
        0,
        textSize
      ) as any;

      var box = Matter.Bodies.rectangle(
        this.p.width * 0.5,
        this.p.height * 0.5,
        bounds.w,
        bounds.h,
        {
          isStatic: false,
          label: key,
          frictionAir: 0.2
        }
      );

      Matter.Composite.add(this.texts, box);
    });

    let ropeAGroup = Matter.Body.nextGroup(true);

    // add your things to your world;
    Matter.World.add(this.engine.world, [this.texts] as any);

    // ------- add your mouse interactions -------
    this.mouse = Matter.Mouse.create(this.canvas.elt);
    const mouseParams = {
      mouse: this.mouse,
      constraint: { stiffness: 0.3, angularStiffness: 0.95 } as any
    };
    this.mouseConstraint = Matter.MouseConstraint.create(
      this.engine,
      mouseParams
    );
    this.mouseConstraint.mouse.pixelRatio = this.p.pixelDensity();

    Matter.World.add(this.engine.world, this.mouseConstraint);

    // run the engine
    Matter.Engine.run(this.engine);
  };

  // VIEW
  public draw = () => {
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.texts.bodies.forEach((b: Matter.Body) => {
      this.drawText(b);
    });
    this.drawMouse(this.mouseConstraint);
  };

  private drawShape(feat: Matter.Body) {
    const { vertices } = feat;

    this.p.beginShape();
    vertices.forEach(vert => {
      this.p.vertex(vert.x, vert.y);
    });
    this.p.endShape(this.p.CLOSE);
  }

  private drawText(feat: Matter.Body) {
    const { angle, vertices } = feat as any;

    this.p.push();
    this.p.fill("#fdcc59");
    this.p.noStroke();
    this.p.textFont(this.univers);
    this.p.textSize(textSize);
    this.p.angleMode(this.p.RADIANS);
    this.p.translate(vertices[3].x, vertices[3].y);
    this.p.rotate(angle);
    const content = this.exprs[feat.label];
    this.p.text(content, 0, 0);
    this.p.pop();
  }

  private drawMouse = (mouseConstraint: Matter.MouseConstraint) => {
    if (mouseConstraint.body) {
      var pos = mouseConstraint.body.position;
      var offset = mouseConstraint.constraint.pointB;
      var m = mouseConstraint.mouse.position;
      this.p.stroke(0, 255, 0);
      this.p.strokeWeight(2);
      this.p.line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
    }
  };
}
