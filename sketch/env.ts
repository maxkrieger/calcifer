import * as p5 from "p5";
import Matter from "matter-js";

export interface IThing {
  setup(): any;
  draw(updatedBody: Matter.Body): any;
  body: Matter.Body;
  id: string;
}

export class Env {
  public mouse: Matter.Mouse;
  public canvas: p5.Renderer;
  public p: p5;
  public engine = Matter.Engine.create();

  public things: IThing[] = [];

  constructor(p: p5, canvas: p5.Renderer) {
    this.p = p;
    this.canvas = canvas;
  }
  public addThing(thing: IThing) {
    this.things.push(thing);
    Matter.World.addBody(this.engine.world, thing.body);
  }
  public setup() {
    this.engine.world.gravity.y = 0;
    this.things.forEach(t => t.setup());
  }
  public draw() {
    Matter.Engine.update(this.engine);
    this.things.forEach(t => {
      const correspondingBody = Matter.Composite.allBodies(
        this.engine.world
      ).find(({ label }: Matter.Body) => label === t.id);
      if (correspondingBody) {
        const { vertices } = correspondingBody;
        this.p.push();

        this.p.translate(vertices[3].x, vertices[3].y);
        t.draw(correspondingBody);
        this.p.pop();
      }
    });
  }
}
