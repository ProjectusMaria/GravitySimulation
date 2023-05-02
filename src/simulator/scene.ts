import {OrderedMap} from 'immutable';
import * as _ from 'lodash';
import { AppMode, IScene, ISceneObject } from 'src/common/common';

export class Scene implements IScene {
    
    protected sceneWidth: number = 0;
    protected sceneHeight: number = 0;
    protected padding: number = 0;  
    public gravity: number = 0;
    public elasticity: number = 0;
    public friction: number = 0;
    public mode: AppMode = AppMode.SurfaceGravity;
    public inPause: boolean = false;    
    public postCalc: (() => void) | null = null;
    public objects = OrderedMap<string, ISceneObject>();    
    public showVelocityVector: boolean = false;
    public showAccelerationVector: boolean = false;
    public playSound: boolean = false;

    constructor(public ctx: CanvasRenderingContext2D, public world: number, padding: number) { 
        this.padding = padding; 
        this.resize();
    }

    public resize(): void {
        this.sceneWidth = this.ctx?.canvas.width - 2 * this.padding;
        this.sceneHeight = this.ctx?.canvas.height - 2 * this.padding;
    }

    public get scale(): number {
        return this.sceneWidth / this.world;
    }

    public X(x: number): number {      
        return Math.round(this.scale * x) + this.padding;
    }

    public Y(y: number): number {      
        return this.ctx?.canvas.height - this.padding - Math.round(this.scale * y);
    }

    public worldX(x: number): number {      
        return (x - this.padding)/this.scale;
    }

    public worldY(y: number): number {      
        return (this.ctx?.canvas.height - this.padding - y)/this.scale;        
    }

    public get VisibleWorldHeight(): number { 
        return this.sceneHeight / this.scale;
    }

    // add to scene collection
    public add(obj: ISceneObject): IScene {
        this.objects = this.objects.set(obj.name, obj);
        return this;
    }

    // remove from scene collection
    public remove(name: string): IScene {
        this.objects = this.objects.delete(name);
        return this;
    }

    // hide object
    public hide(name: string): IScene {
        const obj = this.objects.get(name);
        if (obj) {
            obj.enabled = false;
            this.objects = this.objects.set(name, obj);
        }        
        return this;
    }

    // show object 
    public show(name: string): IScene {
        const obj = this.objects.get(name);
        if (obj) {
            obj.enabled = true;
            this.objects = this.objects.set(name, obj);
        }
        return this;
    }

    // hide all objects but one specified by name
    public hideAllButOne(name: string): IScene {
        this.objects.reduce((acc, val, key) => {
            val.enabled = (key === name);    
            return acc.set(key, val);
        }, OrderedMap<string, ISceneObject>());
        return this;
    }

    // update object by key
    public updateByKey(name: string, obj: ISceneObject): IScene {
        this.objects = this.objects.set(name, obj);
        return this;
    }

    // update obj or array of objects
    public update(obj: ISceneObject | ISceneObject[]): IScene {
        const inp: ISceneObject[] = _.isArrayLike(obj) ? obj : [obj];
        for (let i=0; i<inp.length; ++i) {
            this.updateByKey(inp[i].name, inp[i]);
        }
        return this;
    }

    public updateWithCondition(condition: (obj: ISceneObject) => boolean, map: (obj: ISceneObject) => ISceneObject): void {
        const filtered = this.objects.filter(condition).valueSeq().toArray();
        const remapped = filtered.map(map);
        this.update(remapped);
    }

    // remove all objects from scene
    public clear(): IScene {
        this.objects = this.objects.clear();                
        return this;        
    }

    // calculate delta and draw for each objects in scene in ordered manner
    public draw(): void {     
        if (!this.inPause) {            
            this.objects.forEach(x => x.delta(this));            
            this.objects.forEach(x => x.collide(this));
            if (this.postCalc) {
                this.postCalc();
            }
        }
        
        const filtered = this.objects.filter(x => x.enabled);
        filtered.forEach(x => x.draw_trace(this));
        filtered.forEach(x => x.draw(this));
    }

    public get width(): number {
        return this.sceneWidth;
    }

    public get height(): number {
        return this.sceneHeight;
    }
}