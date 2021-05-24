class Camera {

    constructor() {
        this.count_x = 0.0;
        this.count_y = 0.0;
        this.count_z = 0.0;

        //id to start and stop animation
        this.animation_id;

        this.eye = new Vector3([0, 0, 10]);
        this.center = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.projMatrix = new Matrix4();
        this.projMatrix.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);

        this.viewMatrix = new Matrix4();
        this.updateView();
    }

    //toggle between ortho and perspective type
    setProjType()
    {
        if(document.getElementById("projType").checked)
        {
            this.projMatrix.setOrtho(-3, 3, -3, 3, 0.1, 1000)
        }

        else
        {   
            this.projMatrix.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);
        }
    }

    moveForward(scale) {
        // Compute forward vector
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(scale);

        // Add forward vector to eye and center
        this.eye.add(forward);
        this.center.add(forward);

        this.eye.elements[1] = 0;
        this.updateView();
    }

    moveSideways(direction) {

        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        //get side vector

        let side = Vector3.cross(forward,this.up);

        side.mul(direction);

        this.eye.add(side);
        this.center.add(side);

        this.eye.elements[1] = 0;

        this.updateView();
    }

    pan(angle) {
        // Rotate center point around the up vector
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, this.up.elements[0],
                                   this.up.elements[1],
                                   this.up.elements[2]);

       // Compute forward vector
       let forward = new Vector3(this.center.elements);
       forward.sub(this.eye);

       // Rotate forward vector around up vector
       let forward_prime = rotMatrix.multiplyVector3(forward);
       this.center.set(forward_prime);

       //console.log(this.center.elements[0].toFixed(3),this.center.elements[1].toFixed(3),this.center.elements[2].toFixed(3))

       this.updateView();
    }

    tilt(angle) {
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        let side = Vector3.cross(forward,this.up);

        //rotate up vector about side vector

        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, side.elements[0],
                                   side.elements[1],
                                   side.elements[2]);

       // Compute forward vector
        forward = new Vector3(this.center.elements);
       forward.sub(this.eye);

       // Rotate forward vector around up vector
       let forward_prime = rotMatrix.multiplyVector3(forward);
       this.center.set(forward_prime);

       this.updateView();
    }

    //FOV change
    zoom(mult)
    {
        this.projMatrix.setPerspective(mult, canvas.width/canvas.height, 0.1, 1000);
    }

    //animation module 
    animation(toggle,parametric)
    {
        if(toggle == false)
        {
            //stops animation
            cancelAnimationFrame(this.animation_id);
            return;
        }
        else
        {
            //count acts as "t" in parametric equation as t goes from 0 to 1
            this.count_x+=0.004;
            this.count_z+=0.004;
    
            this.count_y+=0.002;
            if(this.count > 1)
            {
                this.count = 0.0;
            }

            //parametric components x,y,z
            this.eye.elements[2] = Math.cos(this.count_z*(2*Math.PI));
            this.eye.elements[0] = Math.sin(this.count_x*(2*Math.PI));
            if(parametric == "linear")
            {
                this.eye.elements[1] = 0;
            }
            else
            {
                this.eye.elements[1] = Math.sin(this.count_y*(2*Math.PI));
            }
    
            this.eye.elements[2] *= 5;
            this.eye.elements[0] *= 5;
            this.eye.elements[1] *= 5;
            this.center =  new Vector3([0, 0, 0]);
            this.updateView();
    
            //start animation
            this.animation_id = requestAnimationFrame(()=>this.animation(toggle,parametric));

        }
    }

    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],
            this.center.elements[0],
            this.center.elements[1],
            this.center.elements[2],
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
    }
}
