import { ICard } from "../env";
import Attribute from "./Attribute";
import p5 from "p5";

export default class Big extends Attribute {
  public p: p5;
  constructor(p: p5, child?: ICard) {
    super("big");
    this.p = p;
    this.child = child;
  }
  public getEffect(cb: (name: string, payload: any) => void) {
    cb(this.name, this.p.randomGaussian(40, 30));
    if (this.child) {
      this.child.getEffect((effect, payload) => {
        if (effect === "repeat") {
          cb(this.name, this.p.randomGaussian(40, 30));
        } else {
          cb(effect, payload);
        }
      });
    }
  }
}
