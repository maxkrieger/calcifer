import Attribute from "./Attribute";
import { ICard } from "../env";

export default class Repeat extends Attribute {
  constructor(child?: ICard) {
    super("repeat");
    this.child = child;
  }
  public getEffect(cb: (name: string, payload: any) => void) {
    setInterval(() => cb("repeat", null), 1000);
    if (this.child) {
      this.child.getEffect(cb);
    }
  }
}
