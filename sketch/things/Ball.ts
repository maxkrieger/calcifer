import * as p5 from "p5";
import Matter from "matter-js";
import { ICard } from "../env";
import Thing from "./Thing";
import Big from "./Big";
import Repeat from "./Repeat";

export default class Ball extends Thing {
  public p: p5;
  public world: Matter.World;
  public updateComposite: (
    id: string,
    f: (comp: Matter.Composite) => Matter.Composite
  ) => any;
  public radius: number;
  public x: number;
  public y: number;
  public child?: ICard;

  public getEffect(cb: (name: string, payload: any) => void) {
    const nb = new Ball(
      this.p,
      this.world,
      this.updateComposite,
      this.x,
      this.y,
      this.child
    );
    Matter.World.add(this.world, nb.composite);
    if (nb.child) {
      nb.child.getEffect((name, payload) => {
        if (name === "oscillate") {
          console.log(payload);
          nb.updateComposite(nb.id, c => {
            const temp = Matter.Composite.create();
            Matter.Composite.add(temp, c.bodies[0]);
            Matter.Body.setVelocity(temp.bodies[0], {
              x: 0,
              y: payload
            });
            c.bodies[0] = temp.bodies[0];
            return c;
          });
        }
        if (name === "big") {
          nb.updateComposite(nb.id, c => {
            const temp = Matter.Composite.create();
            Matter.Composite.add(temp, c.bodies[0]);
            Matter.Body.scale(
              temp.bodies[0],
              payload / nb.radius,
              payload / nb.radius
            );
            c.bodies[0] = temp.bodies[0];
            return c;
          });
          nb.radius = payload;
        }
      });
    }
    cb(this.name, nb);
  }

  constructor(
    p: p5,
    world: Matter.World,
    updateComposite: (
      id: string,
      f: (composite: Matter.Composite) => Matter.Composite
    ) => any,
    x: number = 0,
    y: number = 0,
    child?: ICard
  ) {
    super("ball");
    const radius = 50;
    this.child = child;
    this.x = x;
    this.y = y;
    this.world = world;

    Matter.Composite.add(this.composite, Matter.Bodies.circle(x, y, radius));
    this.radius = radius;
    this.p = p;
    this.updateComposite = updateComposite;

    this.getEffect.bind(this);
    this.updateComposite.bind(this);
  }
  public setup() {}
  public draw(composite: Matter.Composite) {
    this.p.circle(
      composite.bodies[0].position.x,
      composite.bodies[0].position.y,
      this.radius
    );
  }
}
