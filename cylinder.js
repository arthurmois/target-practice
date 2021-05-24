class Cylinder
{

    constructor(n, color, shading)
    {

        this.type;

        //n_sides to become number
        const n_sides = parseInt(n);


        //initialize arrays
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        
        //transformation
        this.translate = [0.0, 0.0, 0.0];
        this.rotate    = [0.0, 0.0, 0.0];
        this.scale     = [1.0, 1.0, 1.0];

        // set default color
        this.color = color;

        const angle = 360/n_sides;



        //=============VERTICES=============
        
        for(let i = 0; i < n_sides; i+=1)
        {
            //if last iteration
            if(i == n_sides-1)
            {
                //top right
                this.vertices.push(cos((0)*angle));
                this.vertices.push(sin((0)*angle));
                this.vertices.push(1);

                //top left
                this.vertices.push(cos((i)*angle));
                this.vertices.push(sin((i)*angle));
                this.vertices.push(1);

                //bottom left
                this.vertices.push(cos((i)*angle));
                this.vertices.push(sin((i)*angle));
                this.vertices.push(0);

                //bottom right
                this.vertices.push(cos((0)*angle));
                this.vertices.push(sin((0)*angle));
                this.vertices.push(0);
            }
            
            else
            {
                //top right
                this.vertices.push(cos((i+1)*angle));
                this.vertices.push(sin((i+1)*angle));
                this.vertices.push(1);
                
                //top left
                this.vertices.push(cos((i)*angle));
                this.vertices.push(sin((i)*angle));
                this.vertices.push(1);
                
                //bottom left
                this.vertices.push(cos((i)*angle));
                this.vertices.push(sin((i)*angle));
                this.vertices.push(0);
                
                //bottom right
                this.vertices.push(cos((i+1)*angle));
                this.vertices.push(sin((i+1)*angle));
                this.vertices.push(0);
            }
        }
        

        // top cap
        for(let i = 0; i < n_sides; i+=1)
        {
            this.vertices.push(cos(i*angle));
            this.vertices.push(sin(i*angle));
            this.vertices.push(1);
        }

        // bottom cap
        for(let i = 0; i < n_sides; i+=1){
            this.vertices.push(cos(i*angle));
            this.vertices.push(sin(i*angle));
            this.vertices.push(0);
        }

        //cap center points
        this.vertices.push(0, 0, 1);
        this.vertices.push(0, 0, 0);
        //=============INDICES=============

        //methodology derived from contestant
        //pretty smart method actually

        for(let i = 0; i < n_sides; i++)
        {
            this.indices.push(i*4);
            this.indices.push(i*4+1);
            this.indices.push(i*4+2);

            this.indices.push(i*4+2);
            this.indices.push(i*4+3);
            this.indices.push(i*4);

        }
        

        // top cap
        for(let i = 0; i < n_sides; i++)
        {
            if(i==n_sides-1)
            {
                break;
            }

            if(i==0)
            {
                this.indices.push(4*n_sides+1);
                this.indices.push(4*n_sides + 2*n_sides); 
                this.indices.push(4*n_sides);
                this.indices.push(4*n_sides);
                this.indices.push(4*n_sides + 2*n_sides); 
                this.indices.push(4*n_sides + (n_sides-1));
                continue;
            }
            this.indices.push(4*n_sides + (n_sides-i));
            this.indices.push(4*n_sides + 2*n_sides); 
            this.indices.push(4*n_sides + (n_sides-i-1));
        }

        // bottom cap
        for(let i = 0; i < n_sides; i++)
        {
            if(i==0)
            {
                this.indices.push(4*n_sides + n_sides + 1);
                this.indices.push(4*n_sides + 2*n_sides + 1); 
                this.indices.push(4*n_sides + n_sides + 2);
                i++;
                continue;
            }

            if(i==n_sides-1)
            {
                this.indices.push(4*n_sides + n_sides + i);
                this.indices.push(4*n_sides + 2*n_sides + 1); 
                this.indices.push(4*n_sides + n_sides);

                this.indices.push(4*n_sides + n_sides);
                this.indices.push(4*n_sides + 2*n_sides + 1); 
                this.indices.push(4*n_sides + n_sides + 1);
                break;
            }
            this.indices.push(4*n_sides + n_sides + i);
            this.indices.push(4*n_sides + 2*n_sides + 1);
            this.indices.push(4*n_sides + n_sides + i + 1);
        }


        //=============NORMALS=============

        const normalAngle = angle/2;

        // sides
        for(let i = 0; i < n_sides; i+=1)
        {
            //each side
            const midVec = new Vector3([cos(normalAngle+i*angle), sin(normalAngle+i*angle), 0]);
            const normalVec = midVec.normalize();

            // 4 times per vertex
            for(let k = 0; k < 4; k+=1)
            {
                this.normals.push(normalVec.elements[0], normalVec.elements[1], normalVec.elements[2]);
            }

        }
        // normals  for top and bottom caps

        // top
        for(let i = 0; i < n_sides; i+=1)
        {
            this.normals.push(0, 0, 1);
        }

        // bottom
        for(let i = 0; i < n_sides; i+=1)
        {
            this.normals.push(0, 0, -1);
        }

        // top center
        this.normals.push(0, 0, 1);

        // bottom center
        this.normals.push(0, 0, -1);


        if(shading == "smooth")
        {
            this.normals = this.vertices;
        }

        this.vert_fl = new Float32Array(this.vertices);
        this.ind_fl  = new Uint16Array(this.indices);
        this.nor_fl  = new Float32Array(this.normals);

        this.vertices = this.vert_fl;
        this.indices = this.ind_fl;  
        this.normals = this.nor_fl;  
        

    }



    setScale(x, y, z) 
    {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
    }

    setRotate(x, y, z) 
    {
        this.rotate[0] = x;
        this.rotate[1] = y;
        this.rotate[2] = z;
    }

    setTranslate(x, y, z) 
    {
        this.translate[0] = x;
        this.translate[1] = y;
        this.translate[2] = z;
    }
} 

function avgVector(v1,v2)
{
    v1.add(v2);
    let v_avg = v1;

    return v_avg;
}

function degToRad(theta) 
{
    return (theta * Math.PI) / 180.0;
}

//cited from contestant (sine and cosine functions)

//cosine function
function cos(theta) 
{
    return parseFloat(Math.cos(degToRad(theta)));
}

//sin function
function sin(theta)
{
    return parseFloat(Math.sin(degToRad(theta)));
}