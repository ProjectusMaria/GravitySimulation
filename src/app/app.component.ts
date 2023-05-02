import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { AppMode, hitTestCircle, ICircle, IScene, ISceneObject, IVector, SymState, uuid } from 'src/common/common';
import { Vector } from 'src/common/vector';
import { Ball, IBallOptions } from 'src/simulator/ball';
import { Scene } from 'src/simulator/scene';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stage') canvas!: ElementRef<HTMLCanvasElement>;
  public ctx: CanvasRenderingContext2D | null = null;
  public world = 1000;  
  public title = 'Maria Gravity Project';  
  public mass = 2;
  public ball_mass = 2;
  public trail = 100;
  public fps = 60;
  public isSideNavOpen=true;
  public timeoutId: any;
  private requestId: number = 0;  
  public symState: SymState = SymState.Stopped;
  public scene: IScene | null = null;
  public borderSize: number = 2;
  public num_of_balls: number = 0;
  public gravity: number = 0.4;
  public elasticity: number = 0.9;
  public friction: number = 0.06;
  public mode: AppMode = AppMode.About;
  public AppMode = AppMode;
  public SymState = SymState;
  public lockSun: boolean = true;
  public start_drawing: IVector | null = null;
  public showVelocityVector: boolean = false;
  public showAccelerationVector: boolean = false;
  public playSound: boolean = false;


  /**
   * Constructor for main app component
   * @param zone NG zone
   */
  constructor(private zone: NgZone) {    
  }

  public togglePlaySound(playSound: boolean) {
    this.playSound = playSound;
    if (this.scene) {
      this.scene.playSound = this.playSound;
    }
  }

  public toggleMode(mode: AppMode): void {
    this.mode = mode;
    this.num_of_balls = AppMode.SurfaceGravity ? 10 : 0;
    this.trail = AppMode.SurfaceGravity ? 100 : 100;
    this.stop();
    _.delay(() => this.initSym(), 100);
  }

  private canStartHere(c2: ICircle): boolean {    
    if (!this.scene) return false;    
    let result = this.scene.objects.some(x => {
      if (x instanceof Ball) {
        const c1 = x as ICircle;
        return hitTestCircle(c1, c2);
      }      
      return false;
    });
    return !result;
  }


  public addRandomBall(scene: IScene, options?: any): void {
    if (!this.scene) return;
    const colors = ["greed", "red", "yellow", "#AED6F1", "white", "#F5CBA7", "pink", "orange", "cyan"];
    
    let r = 3 + Math.random() * (this.mode === AppMode.SurfaceGravity ? 10 : 5);
    let center;
    if (options.center) {
      center = options.center;
      let c: ICircle = {
        center, 
        radius: r
      };
      if (!this.canStartHere(c)) {
        return;
      }
    } else {
      center = { x: r + Math.random() * (this.world - 2 * r) , y: r + Math.random() * (this.scene.VisibleWorldHeight - 2 * r) };
      let c: ICircle = {
        center, 
        radius: r
      };
      while (!this.canStartHere(c)) {
        r = 5 + Math.random() * 10;
        center = { x: r + Math.random() * (this.world - 2 * r) , y: r + Math.random() * (this.scene.VisibleWorldHeight - 2 * r) };
        c = {
          center, 
          radius: r
        };        
      }      
    }

    const name = _.get(options, "name", `ball-${uuid()}`);
    const ball = new Ball(name, {
      center,
      radius: r, 
      color: _.get(options, "color", colors[Math.ceil(Math.random() * colors.length)]),
      speed: _.get(options, "speed", Math.random() * 5),
      angle: _.get(options, "angle", Math.random() * 360),
      mass: _.get(options, "mass", r * 10),
      trace: true,
      trace_limit: this.trail
    });
    this.scene?.add(ball);
  }

  public addSun(scene: IScene) {
    if (this.mode === AppMode.SpaceGravity) {
      const ball = new Ball("sun", {
        center: {x: this.world / 2, y: scene.VisibleWorldHeight / 2},
        radius: 15, 
        color: "orange",
        speed: 0,
        angle: 0,
        mass: this.mass * 1000,
        trace: true,    
        trace_limit: this.trail  
      });
      this.scene?.add(ball);
    }
  }

  /**
   * Start Simulation
   */
  public start(): void {
    if (!this.scene) return;
    
    for (let i = 0; i < this.num_of_balls; ++i) {
      this.addRandomBall(this.scene, { name: `ball-${i}`});
    }

    this.addSun(this.scene);
      
    this.symState = SymState.Playing;
  }

  /**
   * Pause Simulation
   */
  public pause(): void {    
    this.symState = SymState.Paused;
    this.scene!.inPause = true;
  }

  /**
   * Resume Simulation
   */
  public resume(): void {
    this.symState = SymState.Playing;
    this.scene!.inPause = false;
  }

  public pad_label(str: string, num: number) {
    return _.padStart(str, num, ' ');
  }

  /**
   * Stop Simulation
   */
  public stop(): void {
    if (this.scene) {
      this.scene?.clear(); 
      this.scene!.inPause = false;   
    }
    this.symState = SymState.Stopped;
  }

  public onTrailLengthChanged(trail_length: number): void {
    this.trail = trail_length;
    this.scene?.updateWithCondition(x => true, x => {
      x.trace_limit = trail_length;
      return x;
    });
  }
  public onGravityChanged(gravity: number): void {
    this.scene!.gravity = this.gravity = gravity;
  }
  public onElasticityChanged(e: number): void {
    this.scene!.elasticity = this.elasticity = e;
  }
  public onFrictionChanged(f: number): void {
    this.scene!.friction = this.friction = f;
  }
  public onSunMassChanged(m: number): void {
    this.mass = m;
    const sun = this.scene?.objects.get("sun") as Ball;
    sun.mass = m * 1000;
    sun.radius = sun.mass > 5001 ? 25 : 15;
    this.scene?.updateByKey("sun", sun);
  }
  public onBallMassChanged(m: number): void {
    this.ball_mass = m;        
    this.scene?.updateWithCondition(x => x.name !== 'sun', x => {
      if (x instanceof Ball) {
        (x as Ball).mass = this.ball_mass * 10;
      }
      return x;
    });    
  }
  public onShowVelocityVectorChanged(show: boolean) {
    this.scene!.showVelocityVector = show;
  }
  public onShowAccelerationVectorChanged(show: boolean) {
    this.scene!.showAccelerationVector = show;
  }

  public initSym(): void {
    if (this.mode === AppMode.About) {
      return;
    }

    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.setCanvasSize();    

    // Scene initialization
    this.scene = new Scene(this.ctx!, this.world, this.borderSize);
    this.scene.mode = this.mode;
    this.scene.gravity = this.gravity;
    this.scene.elasticity = this.elasticity;
    this.scene.friction = this.friction;
    this.scene.playSound = this.playSound;

    this.scene.postCalc = () => {
      if (this.mode === AppMode.SpaceGravity && this.lockSun) {
        const sun = this.scene?.objects.get('sun');
        if (sun && this.scene) {
          const sunVector = new Vector(sun.position.x, sun.position.y);
          const centerVector = new Vector(this.world / 2, this.scene.VisibleWorldHeight / 2);
          const pan = centerVector.sub(sunVector);
          if (pan.magnitude > 0.001) {              
            this.scene.updateWithCondition(x => true, x => {                
              x.pan(pan);
              return x;
            });
          }
        }
      }
    }

    this.canvas.nativeElement.addEventListener("mousedown", e => {
      if (this.symState !== SymState.Playing) return;
      this.start_drawing = new Vector(e.clientX, e.clientY);
    });
    this.canvas.nativeElement.addEventListener("mouseup", e => {
      if (this.symState !== SymState.Playing || this.start_drawing === null) return;
      const end_drawing = new Vector(e.clientX, e.clientY);
      const angle = end_drawing.sub(this.start_drawing!).angle();
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const pos = {
        x: this.start_drawing!.x - rect.left,
        y: this.start_drawing!.y - rect.top
      };
      this.addRandomBall(this.scene!, {
        center: { 
          x: this.scene!.worldX(pos.x),
          y: this.scene!.worldY(pos.y)
        },
        angle: -1 * angle * 180 / Math.PI, // into degrees,            
      });

      this.start_drawing = null;
    });

    this.zone.runOutsideAngular(() =>     
      this.animate()
    );
  }

  /**
   * The DOM is loaded and all bindings are available
   */
  ngAfterViewInit(): void {    
    this.initSym();   
  }

  /**
   * Clear canvas
   */
  public clear(): void {
    if (!this.ctx || !this.canvas || !this.canvas.nativeElement) return;
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  /**
   * Draw background and all scene objects
   * Internally, every object calls it's delta method before drawing
   */
  public draw(): void {    
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.lineWidth = this.borderSize;    
    this.ctx.rect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height); 
    this.ctx.fillStyle = "black";
    this.ctx.fill();
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.scene?.draw();
  }

  /**
   * Resize canvas and scene
   */
  public resize(): void {
    this.setCanvasSize();
    this.scene?.resize();
    this.draw();
  }

  /**
   * Setting Canvas size based on parent element
   */
  protected setCanvasSize(): void {
    if (!this.canvas) return;
    const parent: HTMLElement | null = this.canvas.nativeElement.parentElement;
    if (!parent) return;
    var rect = parent.getBoundingClientRect();
    this.canvas.nativeElement.width = rect.width;
    this.canvas.nativeElement.height = rect.height;
  }

  /**
   * Animation loop
   */
  protected animate(): void {
    this.clear();
    this.draw();
    this.requestId = requestAnimationFrame(() => {
      this.timeoutId = _.delay(() => this.animate(), 1000/this.fps);
    });
  }

  /**
   * Called on closing web application
   */
  public ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
    cancelAnimationFrame(this.requestId);
  }

}
