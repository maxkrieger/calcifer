// https://editor.p5js.org/joeyklee/sketches/liHgeD1eg

import * as p5 from "p5";
import Matter from "matter-js";
import uniqid from "uniqid";
/// GOOD REAL STUFF
const textSize = 18;
// "This year, we want to explicitly broaden the type of reflections we receive, to be inclusive of the many different ways we are spending our summers. We’re also going to invite reflections from Masters and Doctoral candidates for the first time. Whether you spent your summer working, studying, travelling, resting, or something entirely different; we’d love to hear about it!"

// https://stackoverflow.com/a/45999529
export type SProgram = IProgramArray | string;
interface IProgramArray extends Array<SProgram> {}
interface IExpr {
  val?: string;
  children: IExpr[];
  id: string;
}

const exprToString = (program: IExpr): string => {
  if (program.val) {
    return program.val;
  }
  return `(${program.children.map(exprToString).join(" ")})`;
};
export const programToExpr = (program: SProgram): IExpr => ({
  val: typeof program === "string" ? program : undefined,
  children: typeof program !== "string" ? program.map(programToExpr) : [],
  id: uniqid(`expr-${program.toString()}-`)
});

export default class Draggy {
  public engine: Matter.Engine;
  public univers: p5.Font;
  public mouse: Matter.Mouse;
  public canvas: p5.Renderer;
  public p: p5;
  public mouseConstraint: Matter.MouseConstraint;
  public exprs: Record<string, IExpr>;
  constructor(p: p5, canvas: p5.Renderer, univers: any) {
    this.univers = univers;
    this.canvas = canvas;
    this.p = p;
    this.exprs = {
      a: programToExpr(["hello", ["world"]]),
      b: programToExpr(["cons", "bird", ["mouse"]]),
      c: programToExpr("1")
    };
  }
  public findById = (expr: IExpr, id: string): any => {
    if (expr.id === id) return expr;
    else if (expr.children.length === 0) return undefined;
    return expr.children
      .map((child: IExpr) => this.findById(child, id))
      .find((child: any) => child !== undefined);
  };
  public findInAllById = (id: string) => {
    return Object.keys(this.exprs)
      .map((key: string) => this.findById(this.exprs[key], id))
      .find((exp: IExpr) => exp !== undefined);
  };
  public makeTextComposite = (program: IExpr): Matter.Composite => {
    const str = exprToString(program);
    const bounds = this.univers.textBounds(str, 0, 0, textSize) as any;
    const composite = Matter.Composite.create();
    if (program.val) {
      return Matter.Composite.add(
        composite,
        Matter.Bodies.rectangle(
          this.p.width * 0.5,
          this.p.height * 0.5,
          bounds.w,
          bounds.h,
          {
            isStatic: false,
            label: program.id,
            frictionAir: 0.2
          }
        )
      );
    }
    const childComposites = program.children.map(this.makeTextComposite);
    childComposites.forEach((comp: Matter.Composite, index: number) =>
      Matter.Composite.allBodies(comp).forEach((body: Matter.Body) =>
        Matter.Composite.add(composite, body)
      )
    );
    Matter.Composites.chain(composite, 1, 0, -0.6, 0, {
      stiffness: 0.5,
      length: 2
    });
    console.log(composite);
    return composite;
  };
  public setup = () => {
    this.engine = Matter.Engine.create();
    // this.engine.constraintIterations = 5;
    this.engine.world.gravity.y = 0;

    Object.keys(this.exprs).forEach((key: string, index: number) => {
      const comp = this.makeTextComposite(this.exprs[key]);
      Matter.World.add(this.engine.world, comp);
    });

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
    Matter.Composite.allBodies(this.engine.world).forEach((b: Matter.Body) => {
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
    const { angle, vertices, label } = feat as any;

    this.p.push();
    this.p.fill("#fdcc59");
    this.p.noStroke();
    this.p.textFont(this.univers);
    this.p.textSize(textSize);
    this.p.angleMode(this.p.RADIANS);
    this.p.translate(vertices[3].x, vertices[3].y);
    this.p.rotate(angle);
    // TODO: recursively render instead
    const content = exprToString(this.findInAllById(label));
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
