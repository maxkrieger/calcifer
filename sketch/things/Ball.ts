import * as p5 from "p5";
import Matter from "matter-js";
import { ICard } from "../env";
import Thing from "./Thing";
import Big from "./Big";
import Repeat from "./Repeat";

export default class Ball extends Thing {
  public p: p5;
  public world: Matter.World;
  public radius: number;
  public x: number;
  public y: number;
  public child?: ICard;

  public getEffect = (cb: (name: string, payload: any) => void) => {
    const nb = new Ball(this.p, this.world, this.x, this.y, this.child);
    Matter.World.add(this.world, nb.composite);
    if (nb.child) {
      nb.child.getEffect((name: string, payload: any) => {
        if (name === "oscillate") {
          Matter.Body.setVelocity(nb.composite.bodies[0], {
            x: 0,
            y: payload
          });
        }
        if (name === "big") {
          Matter.Body.scale(
            nb.composite.bodies[0],
            payload / nb.radius,
            payload / nb.radius
          );
          nb.radius = payload;
        }
      });
    }
    cb(this.name, nb);
  };

  constructor(
    p: p5,
    world: Matter.World,

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
  }
  public setup() {}
  public draw() {
    this.p.circle(
      this.composite.bodies[0].position.x,
      this.composite.bodies[0].position.y,
      this.radius
    );
  }
}
