// https://editor.p5js.org/joeyklee/sketches/liHgeD1eg

import * as p5 from "p5";
import Matter from "matter-js";
import uniqid from "uniqid";
import s from "my-little-schemer";
import arith from "my-little-schemer/src/libs/arithmetic";
arith.loadTo(s);
/// GOOD REAL STUFF
const textSize = 18;
// "This year, we want to explicitly broaden the type of reflections we receive, to be inclusive of the many different ways we are spending our summers. We’re also going to invite reflections from Masters and Doctoral candidates for the first time. Whether you spent your summer working, studying, travelling, resting, or something entirely different; we’d love to hear about it!"

// https://stackoverflow.com/a/45999529
type terminal = string | number;
const isTerminal = (t: any) => typeof t === "string" || typeof t === "number";

export type SProgram = IProgramArray | terminal;
interface IProgramArray extends Array<SProgram> {}
interface IExpr {
  val?: terminal;
  parens: Paren[];
  children: IExpr[];
  id: string;
}

enum Paren {
  LPAREN = "(",
  RPAREN = ")"
}

const exprToString = (program: IExpr): string => {
  if (program.val !== undefined) {
    return program.val.toString();
  }
  return `(${program.children.map(exprToString).join(" ")})`;
};

const exprToProgram = (program: IExpr): SProgram =>
  isTerminal(program.val) ? program.val : program.children.map(exprToProgram);

const exprToStringWithParensContext = (exp: IExpr): string => {
  let content = exprToString(exp);
  exp.parens.forEach((paren: Paren) => {
    if (paren === Paren.LPAREN) {
      content = `(${content}`;
    } else if (paren === Paren.RPAREN) {
      content = `${content})`;
    }
  });
  return content;
};

// TODO: decompose parens logic into another fn
export const programToExpr = (
  program: SProgram,
  parens: Paren[] = []
): IExpr => ({
  val: isTerminal(program) ? (program as any) : undefined,
  parens: isTerminal(program) ? parens : [],
  children: !isTerminal(program)
    ? program.map((p: SProgram, index: number) => {
        let parensNew = [...parens];
        if (
          index !== 0 &&
          index !== program.length - 1 &&
          program.some(isTerminal)
        ) {
          parensNew = [];
        }
        if (index === 0 && index !== program.length - 1) {
          parensNew = [...parensNew, Paren.LPAREN];
          if (isTerminal(p)) {
            parensNew = parensNew.filter(j => j === Paren.LPAREN);
          }
        } else if (index !== 0 && index === program.length - 1) {
          parensNew = [...parensNew, Paren.RPAREN];
          if (isTerminal(p)) {
            parensNew = parensNew.filter(j => j === Paren.RPAREN);
          }
        } else if (index === 0 && index === program.length - 1) {
          parensNew = [...parensNew, Paren.RPAREN, Paren.LPAREN];
        }
        return programToExpr(p, parensNew);
      })
    : [],
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
    const lmb = s.jSExpression(`((lambda (x) (if (< x 0) (- x) x)) -5)`);
    this.exprs = {
      a: programToExpr([
        "it's",
        ["turtles", ["all", ["the", ["way", ["down"]]]]]
      ]),
      abs: programToExpr(lmb),
      nested: programToExpr(s.jSExpression(`(+ 1 (* 2 3))`)),
      cons: programToExpr(s.jSExpression(`(car (pickle juice))`)),
      b: programToExpr(["x", ".", "y"]),
      e: programToExpr(["+", "1", "2"])
    };
    console.log(this.evalInPlace("nested", this.exprs.nested));
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
  public evaluable = (program: IExpr) => {
    const original = s.sExpression(exprToProgram(program));
    const evaluated = s.evaluate(exprToProgram(program), true, true, false);
    if (typeof evaluated === "function") {
      return false;
    }

    return original !== s.sExpression(evaluated);
  };
  // Is this necessary? The newly evaluated values are isolated from everything
  public merge = (p1: IExpr, p2: IExpr): IExpr => {
    if (isTerminal(p1.val) && isTerminal(p2.val)) {
      if (p1.val === p2.val) {
        return p1;
      } else {
        return { ...p2, id: p1.id };
      }
    } else if (isTerminal(p1.val) || isTerminal(p2.val)) {
      return { ...p2, id: p1.id };
    } else if (p1.children.length === p2.children.length) {
      return {
        ...p1,
        children: p1.children.map((child: IExpr, index: number) =>
          this.merge(child, p2.children[index])
        )
      };
    } else {
      return { ...p1, children: p2.children };
    }
  };
  public replaceById = (
    originalProgram: IExpr,
    newProgram: IExpr,
    id: string
  ): IExpr => {
    if (originalProgram.id === id) {
      return newProgram;
    }
    return {
      ...originalProgram,
      children: originalProgram.children.map((child: IExpr) =>
        this.replaceById(child, newProgram, id)
      )
    };
  };
  public evalInPlace = (programID: string, program: IExpr) => {
    if (this.evaluable(program)) {
      const evaluableChildren = program.children.filter(this.evaluable);
      if (evaluableChildren.length > 0) {
        this.evalInPlace(programID, evaluableChildren[0]);
      } else {
        const result = s.value(exprToProgram(program));
        const fresh = programToExpr(result);
        const merged = this.merge(program, fresh);
        this.exprs[programID] = this.replaceById(
          this.exprs[programID],
          merged,
          merged.id
        );
        // TODO: delete danglings
        // TODO: recompute bounding box lengths
        // TODO: fix paren preservation/recompute them
      }
    }
  };

  public makeTextComposite = (program: IExpr): Matter.Composite => {
    const str = exprToStringWithParensContext(program);
    const bounds = this.univers.textBounds(str, 0, 0, textSize) as any;
    const composite = Matter.Composite.create({
      label: program.id
    });
    if (program.val !== undefined) {
      Matter.Composite.add(
        composite,
        Matter.Bodies.rectangle(
          this.p.width * 0.5,
          this.p.height * 0.5,
          bounds.w,
          bounds.h,
          {
            isStatic: false,
            frictionAir: 0.2,
            label: program.id
          }
        )
      );
      return composite;
    }
    // compositiion: pass iumages as dots. A live image as dots.
    // Run concurrently; not effecting each other
    // sizzle makes it evaporate eventually

    const childComposites = program.children.map(this.makeTextComposite);
    childComposites.forEach((comp: Matter.Composite, index: number) => {
      Matter.Composite.add(composite, comp);
      if (index !== 0) {
        const prevAllBodies = Matter.Composite.allBodies(
          childComposites[index - 1]
        );
        // adapted from https://brm.io/matter-js/docs/files/src_factory_Composites.js.html#l75
        const bodyA = prevAllBodies[prevAllBodies.length - 1];
        const bodyB = Matter.Composite.allBodies(comp)[0];
        const bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y,
          bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x,
          bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y,
          bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
        Matter.Composite.add(
          composite,
          Matter.Constraint.create({
            bodyA,
            bodyB,
            pointA: { x: bodyAWidth * 1, y: bodyAHeight * 0 },
            pointB: {
              x: bodyBWidth * -0.5,
              y: bodyBHeight * 0
            },
            length: 2,
            stiffness: 0.3
          })
        );
      }
    });
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
      constraint: {
        stiffness: 0.3,
        angularStiffness: 0.95
      } as any
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
    this.engine.world.composites.forEach((c: Matter.Composite) =>
      this.drawComposite(c)
    );
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
  private drawComposite = (composite: Matter.Composite) => {
    if (composite.composites.length === 0) {
      if (composite.bodies.length === 1) {
        this.drawText(composite.bodies[0]);
      } else {
        console.error(
          composite.bodies,
          `ASSERT: this should never be reachable`
        );
      }
    } else {
      composite.composites.forEach(this.drawComposite);
    }
  };

  private drawText = (feat: Matter.Body) => {
    const { angle, vertices, label } = feat as any;

    this.p.push();
    this.p.fill("#fdcc59");
    this.p.noStroke();
    this.p.textFont(this.univers);
    this.p.textSize(textSize);
    this.p.angleMode(this.p.RADIANS);
    this.p.translate(vertices[3].x, vertices[3].y);
    this.p.rotate(angle);
    const exp = this.findInAllById(label);
    const content = exprToStringWithParensContext(exp);
    this.p.text(content, 0, 0);
    this.p.pop();
  };

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
