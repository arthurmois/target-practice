class Sphere extends Model {
    constructor(color, n) {
        super(color);
        
        let vertices = this.createVertices(n);

        // Create vertices
        this.vertices = new Float32Array(vertices);

        // Create Indices
        this.indices = new Uint16Array(this.createIndices(n));

        // Create Normals (note that in spheres normals are equal to positions)
        this.normals = new Float32Array(vertices);

        this.type;
    }

    createVertices(n) {
        let vertices = [];

        // Generate coordinates
        for (let j = 0; j <= n; j++) {
          let aj = j * Math.PI / n;
          let sj = Math.sin(aj);
          let cj = Math.cos(aj);
          for (let i = 0; i <= n; i++) {
            let ai = i * 2 * Math.PI / n;
            let si = Math.sin(ai);
            let ci = Math.cos(ai);

            vertices.push(si * sj);  // x
            vertices.push(cj);       // y
            vertices.push(ci * sj);  // z
          }
        }

        return vertices;
    }

    createIndices(n) {
        let indices = [];

        // Generate indices
        for (let j = 0; j < n; j++) {
          for (let i = 0; i < n; i++) {
            let p1 = j * (n+1) + i;
            let p2 = p1 + (n+1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
          }
        }

        return indices;
    }
}
