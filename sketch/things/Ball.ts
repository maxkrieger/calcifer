import * as p5 from "p5";
import Matter from "matter-js";
import { IThing } from "../env";
import uniqid from "uniqid";

export default class Ball implements IThing {
  public body: Matter.Body;
  public p: p5;
  public radius: number;
  public id = uniqid("circle-");
  constructor(
    p: p5,
    x: number = 0,
    y: number = 0,
    radius: number = 10,
    options: any
  ) {
    this.body = Matter.Bodies.circle(x, y, radius, { label: this.id });
    this.radius = radius;
    this.p = p;
  }
  public setup() {}
  public draw(body: Matter.Body) {
    this.p.circle(0, 0, this.radius);
  }
}
