// https://editor.p5js.org/joeyklee/sketches/liHgeD1eg
import * as p5 from "p5";
import Matter from "matter-js";
export default class Draggy {
  public engine: Matter.Engine;
  public boxA: Matter.Body;
  public boxB: Matter.Body;
  public circleA: Matter.Body;
  public ground: Matter.Body;
  public ground2: Matter.Body;
  public boxes: Matter.Composite;
  public ropeA: Matter.Composite;
  public mouse: Matter.Mouse;
  public canvas: p5.Renderer;
  public p: p5;
  public mouseConstraint: Matter.MouseConstraint;
  constructor(p: p5, canvas: p5.Renderer) {
    this.canvas = canvas;
    this.p = p;
  }
  public setup = () => {
    this.engine = Matter.Engine.create();
    this.boxA = Matter.Bodies.rectangle(this.p.width * 0.25, 10, 40, 40, {
      isStatic: false
    });
    this.boxB = Matter.Bodies.rectangle(this.p.width * 0.75, 10, 40, 40, {
      isStatic: false
    });
    this.circleA = Matter.Bodies.circle(this.p.width * 0.5, 10, 40);

    this.boxes = Matter.Composites.stack(
      this.p.width / 2,
      0,
      4,
      4,
      10,
      10,
      function(x: number, y: number) {
        return Matter.Bodies.rectangle(x, y, 10, 20);
      }
    );

    let ropeAGroup = Matter.Body.nextGroup(true);

    this.ropeA = Matter.Composites.stack(100, 50, 4, 1, 10, 10, function(
      x: number,
      y: number
    ) {
      return Matter.Bodies.rectangle(x, y, 50, 10, {
        collisionFilter: { group: ropeAGroup } as any
      });
    });
    Matter.Composites.chain(this.ropeA, 0.5, 0, -0.5, 0, {
      stiffness: 0.8,
      length: 2,
      render: { type: "line" }
    });
    Matter.Composite.add(
      this.ropeA,
      Matter.Constraint.create({
        bodyB: this.ropeA.bodies[0],
        pointB: { x: -25, y: 0 },
        pointA: {
          x: this.ropeA.bodies[0].position.x,
          y: this.ropeA.bodies[0].position.y
        },
        stiffness: 0.5
      })
    );

    //create a static ground;
    this.ground = Matter.Bodies.rectangle(
      this.p.width / 2,
      this.p.height,
      this.p.width,
      40,
      {
        isStatic: true,
        angle: this.p.PI * 0.05
      }
    );
    this.ground2 = Matter.Bodies.rectangle(
      this.p.width / 2,
      this.p.height,
      this.p.width,
      40,
      {
        isStatic: true,
        angle: this.p.PI * -0.05
      }
    );

    // add your things to your world;
    Matter.World.add(this.engine.world, [
      this.boxA,
      this.boxB,
      this.circleA,
      this.boxes,
      this.ropeA,
      this.ground,
      this.ground2
    ] as any);

    // ------- add your mouse interactions -------
    // add your mouse onto the canvas element
    this.mouse = Matter.Mouse.create(this.canvas.elt);
    // set some params
    const mouseParams = {
      mouse: this.mouse,
      constraint: { stiffness: 0.05, angularStiffness: 0 } as any
    };
    // create your mouseConstraints
    this.mouseConstraint = Matter.MouseConstraint.create(
      this.engine,
      mouseParams
    );
    this.mouseConstraint.mouse.pixelRatio = this.p.pixelDensity();

    Matter.World.add(this.engine.world, this.mouseConstraint);

    // run the engine
    Matter.Engine.run(this.engine);
  };
  public draw = () => {
    this.p.background(220);

    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.drawShape(this.boxA);
    this.drawShape(this.boxB);
    this.drawShape(this.circleA);
    this.drawShape(this.ground);
    this.drawShape(this.ground2);

    this.boxes.bodies.forEach(b => {
      this.drawShape(b);
    });

    this.ropeA.bodies.forEach(b => {
      this.drawShape(b);
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
