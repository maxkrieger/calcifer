import * as p5 from "p5";
import Matter from "matter-js";
import Thing from "./Thing";
import Card from "./Card";
import Ball from "./Ball";

export default class Emitter extends Thing {
  public p: p5;
  public world: Matter.World;
  public radius: number;
  public x: number;
  public y: number;
  public getEffect = (cb: (name: string, payload: any) => void) => {
    const ne = new Emitter(this.p, this.world, this.x, this.y, this.child);
    Matter.World.add(this.world, ne.composite);
    if (ne.child) {
      ne.child.getEffect((name: string, payload: any) => {
        // if (name === "oscillate") {
        //   Matter.Composite.applyForce(
        // nb.composite.bodies[0],
        //     { x: 0, y: 0 },
        //     {
        //       x: 0,
        //       y: 0.01 * payload
        //     }
        //   );
        // }
        // if (name === "big") {
        //   Matter.Body.scale(
        //     nb.composite.bodies[0],
        //     payload / nb.radius,
        //     payload / nb.radius
        //   );
        //   nb.radius = payload;
        // }
        if (payload instanceof Thing) {
          setInterval(() => {
            const { x, y } = ne.composite.bodies[0].position;
            payload.getEffect((name_, payload_) => {
              if (payload_ instanceof Thing) {
                console.log("esketit", x, y);
                Matter.Body.setPosition(payload_.composite.bodies[0], { x, y });
                Matter.Body.applyForce(
                  payload_.composite.bodies[0],
                  { x: 0, y: 0 },
                  {
                    x: 0.02,
                    y: 0
                  }
                );
                Matter.Composite.add(ne.composite, payload_.composite);
                ne.drawableChildren.push(payload_);
              } else {
                console.error("ASSERT: unreachable state");
              }
            });
          }, 200);
        }
      });
    }
    cb(this.name, ne);
  };

  constructor(
    p: p5,
    world: Matter.World,

    x: number = 0,
    y: number = 0,
    child?: Card
  ) {
    super("emitter");
    const radius = 10;
    this.child = child;
    this.x = x;
    this.y = y;
    this.world = world;

    Matter.Composite.add(
      this.composite,
      Matter.Bodies.circle(x, y, radius / 2, {
        isSensor: true // disable collisions
      })
    );
    this.radius = radius;
    this.p = p;
  }
  public setup() {}
  public draw = () => {
    this.p.push();
    this.p.color("red");
    this.p.circle(
      this.composite.bodies[0].position.x,
      this.composite.bodies[0].position.y,
      this.radius
    );
    this.p.pop();
    this.drawableChildren.forEach(child => {
      child.draw();
    });
  };
}
