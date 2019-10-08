var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define("draggy", ["require", "exports", "matter-js"], function (require, exports, matter_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    matter_js_1 = __importDefault(matter_js_1);
    var Draggy = (function () {
        function Draggy(p, canvas) {
            this.canvas = canvas;
            this.p = p;
        }
        Draggy.prototype.setup = function () {
            this.engine = matter_js_1.default.Engine.create();
            this.boxA = matter_js_1.default.Bodies.rectangle(this.p.width * 0.25, 10, 40, 40, {
                isStatic: false
            });
            this.boxB = matter_js_1.default.Bodies.rectangle(this.p.width * 0.75, 10, 40, 40, {
                isStatic: false
            });
            this.circleA = matter_js_1.default.Bodies.circle(this.p.width * 0.5, 10, 40);
            this.boxes = matter_js_1.default.Composites.stack(this.p.width / 2, 0, 4, 4, 10, 10, function (x, y) {
                return matter_js_1.default.Bodies.rectangle(x, y, 10, 20);
            });
            var ropeAGroup = matter_js_1.default.Body.nextGroup(true);
            this.ropeA = matter_js_1.default.Composites.stack(100, 50, 4, 1, 10, 10, function (x, y) {
                return matter_js_1.default.Bodies.rectangle(x, y, 50, 10, {
                    collisionFilter: { group: ropeAGroup }
                });
            });
            matter_js_1.default.Composites.chain(this.ropeA, 0.5, 0, -0.5, 0, {
                stiffness: 0.8,
                length: 2,
                render: { type: "line" }
            });
            matter_js_1.default.Composite.add(this.ropeA, matter_js_1.default.Constraint.create({
                bodyB: this.ropeA.bodies[0],
                pointB: { x: -25, y: 0 },
                pointA: {
                    x: this.ropeA.bodies[0].position.x,
                    y: this.ropeA.bodies[0].position.y
                },
                stiffness: 0.5
            }));
            this.ground = matter_js_1.default.Bodies.rectangle(this.p.width / 2, this.p.height, this.p.width, 40, {
                isStatic: true,
                angle: this.p.PI * 0.05
            });
            this.ground2 = matter_js_1.default.Bodies.rectangle(this.p.width / 2, this.p.height, this.p.width, 40, {
                isStatic: true,
                angle: this.p.PI * -0.05
            });
            matter_js_1.default.World.add(this.engine.world, [
                this.boxA,
                this.boxB,
                this.circleA,
                this.boxes,
                this.ropeA,
                this.ground,
                this.ground2
            ]);
            this.mouse = matter_js_1.default.Mouse.create(this.canvas.elt);
            var mouseParams = {
                mouse: this.mouse,
                constraint: { stiffness: 0.05, angularStiffness: 0 }
            };
            this.mouseConstraint = matter_js_1.default.MouseConstraint.create(this.engine, mouseParams);
            this.mouseConstraint.mouse.pixelRatio = this.p.pixelDensity();
            matter_js_1.default.World.add(this.engine.world, this.mouseConstraint);
            matter_js_1.default.Engine.run(this.engine);
        };
        Draggy.prototype.draw = function () {
            var _this = this;
            this.p.background(220);
            this.p.stroke(0);
            this.p.strokeWeight(1);
            this.drawShape(this.boxA);
            this.drawShape(this.boxB);
            this.drawShape(this.circleA);
            this.drawShape(this.ground);
            this.drawShape(this.ground2);
            this.boxes.bodies.forEach(function (b) {
                _this.drawShape(b);
            });
            this.ropeA.bodies.forEach(function (b) {
                _this.drawShape(b);
            });
            this.drawMouse(this.mouseConstraint);
        };
        Draggy.prototype.drawShape = function (feat) {
            var _this = this;
            var vertices = feat.vertices;
            this.p.beginShape();
            vertices.forEach(function (vert) {
                _this.p.vertex(vert.x, vert.y);
            });
            this.p.endShape(this.p.CLOSE);
        };
        Draggy.prototype.drawMouse = function (mouseConstraint) {
            if (mouseConstraint.body) {
                var pos = mouseConstraint.body.position;
                var offset = mouseConstraint.constraint.pointB;
                var m = mouseConstraint.mouse.position;
                this.p.stroke(0, 255, 0);
                this.p.strokeWeight(2);
                this.p.line(pos.x + offset.x, pos.y + offset.y, m.x, m.y);
            }
        };
        return Draggy;
    }());
    exports.default = Draggy;
});
define("sketch", ["require", "exports", "p5", "draggy"], function (require, exports, p5, draggy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    p5 = __importStar(p5);
    draggy_1 = __importDefault(draggy_1);
    var Sketch = (function () {
        function Sketch(p) {
            var _this = this;
            this.windowResized = function () {
                _this.p.resizeCanvas(_this.p.windowWidth, _this.p.windowHeight);
            };
            this.draw = function () {
                _this.p.background(100);
                _this.draggy.draw();
            };
            this.p = p;
            this.draggy = new draggy_1.default(p, this.canvas);
            this.p.setup = this.Setup;
            this.p.windowResized = this.windowResized;
            this.p.draw = this.draw;
        }
        Sketch.prototype.Setup = function () {
            this.canvas = this.p.createCanvas(this.p.windowWidth, this.p.windowHeight);
            this.draggy.setup();
        };
        return Sketch;
    }());
    var sketch = function (p) { return new Sketch(p); };
    p5(sketch);
});
//# sourceMappingURL=build.js.map