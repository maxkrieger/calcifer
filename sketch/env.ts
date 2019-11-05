import * as p5 from "p5";
import Matter from "matter-js";
import Thing from "./things/Thing";
import Attribute from "./things/Attribute";
import Ball from "./things/Ball";
import Big from "./things/Big";
import Repeat from "./things/Repeat";
import Oscillate from "./things/Oscillate";

export class Env {
  public mouse: Matter.Mouse;
  public mouseConstraint: Matter.MouseConstraint;
  public canvas: p5.Renderer;
  public p: p5;
  public engine = Matter.Engine.create();

  public things: Thing[] = [];

  constructor(p: p5, canvas: p5.Renderer) {
    this.p = p;
    this.canvas = canvas;
  }
  public addThing(thing: Thing) {
    thing.getEffect((name, payload) => {
      this.things.push(payload);
    });
  }
  public setup() {
    this.engine.world.gravity.y = 0;
    // this.addThing(
    //   new Ball(
    //     this.p,
    //     this.engine.world,
    //     this.updateComposite,
    //     100,
    //     100,
    //     new Big(this.p, new Repeat())
    //   )
    // );
    this.addThing(
      new Ball(
        this.p,
        this.engine.world,
        200,
        200,
        new Oscillate(this.p, new Repeat())
      )
    );
    this.things.forEach(t => t.setup());

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
  }
  public draw() {
    Matter.Engine.update(this.engine);
    this.things.forEach(t => {
      const correspondingBody = Matter.Composite.allComposites(
        this.engine.world
      ).find(({ label }: Matter.Composite) => label === t.id);
      if (correspondingBody) {
        t.draw(correspondingBody);
      }
    });
  }
}
