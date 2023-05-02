import { IPoint, IScene, ISceneObject, ISize, IVector } from "src/common/common";

export abstract class BaseObject implements ISceneObject {
    
    public enabled: boolean = true;
    public trace: boolean = false;    
    public trace_limit: number = 0;
    public position: IPoint;

    public bounds: ISize = { width: 0, height: 0 };
    public trace_points: IPoint[] = [];


    constructor(public name: string) {
        this.position = {x: 0, y: 0};
    }

    collide(scene: IScene): void {
        
    }

    pan(p: IVector): void {
        this.position.x += p.x;
        this.position.y += p.y;
        if (this.trace) {
            this.trace_points.forEach(tp => {
                tp.x += p.x;
                tp.y += p.y;
            });
        }
    }

    delta(scene: IScene): void {
        if (this.trace) {
            if (this.trace_limit > 0 && (this.trace_points.length + 1) > this.trace_limit) {
                const to_remove = this.trace_points.length + 1 - this.trace_limit;
                if (to_remove > 0) {
                    this.trace_points = this.trace_points.slice(to_remove);
                }
            } 
            this.trace_points.push({x: this.position.x, y: this.position.y});            
        }
    }

    draw_trace(scene: IScene): void {
        const ctx = scene.ctx;        
        if (this.trace && ctx) {
            this.trace_points.forEach((pt, index) => {
                let visible = true;
                if (scene.X(pt.x) > scene.width || scene.X(pt.x) < 0) {
                    visible = false;;
                }  else if (scene.Y(pt.y) > scene.height || scene.Y(pt.y) < 0) {
                    visible = false;
                }
                if (!visible) return;
                ctx.beginPath();
                ctx.arc(scene.X(pt.x), scene.Y(pt.y), 1, 0, 2 * Math.PI);
                const alpha = this.trace_limit > 0 ? index/(Math.min(this.trace_limit, this.trace_points.length)) : 1;
                ctx.fillStyle = `rgba(127, 127, 127, ${alpha})`;
                ctx.fill();
            });
        }
    }

    abstract draw(scene: IScene) : void;
}