import Attribute from "./Attribute";
import { ICard } from "../env";
import p5 from "p5";

export default class Oscillate extends Attribute {
  public state: number = 0;
  public p: p5;
  constructor(p: p5, child?: ICard) {
    super("oscillate");
    this.child = child;
    this.p = p;
  }
  public getEffect(cb: (name: string, payload: any) => void) {
    this.state += 1;
    cb(this.name, Math.sin(this.state));
    if (this.child) {
      this.child.getEffect((effect, payload) => {
        if (effect === "repeat") {
          this.state++;
          cb(this.name, Math.sin(this.state));
        } else {
          cb(effect, payload);
        }
      });
    }
  }
}
