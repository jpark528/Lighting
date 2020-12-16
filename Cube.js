class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
		this.textureNum = -2;

    }

    render() {

        var rgba = this.color;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);   
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        //front
        drawTriangle3DUVNormal(
        	[0,0,0, 1,1,0, 1,0,0],[0,0,1,1,1,0],[0,0,-1,0,0,-1,0,0,-1]
        );
        drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0,0,1,1,1],[0,0,-1,0,0,-1,0,0,-1]);
        
        //gl.uniform4f(u_FragColor, rgba[0] * 9, rgba[1] *9 , rgba[2] *9, rgba[3]);  
        //top
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1],[0,0,0,1,1,1],[0,1,0,0,1,0,0,1,0]);
        drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0],[0,0,1,1,1,0],[0,1,0,0,1,0,0,1,0]);
        
        
        
        //gl.uniform4f(u_FragColor, rgba[0] * 8, rgba[1] *8 , rgba[2] *8, rgba[3]);  
        
        //gl.uniform4f(u_FragColor, rgba[0] * 8, rgba[1] *8 , rgba[2] *8, rgba[3]);  
        //right
        drawTriangle3DUVNormal([1,1,0, 1,0,1, 1,0,0],[0,0,0,1,1,1],[1,0,0,1,0,0,1,0,0]);
        drawTriangle3DUVNormal([1,1,0, 1,1,1, 1,0,1],[0,0,1,1,1,0],[1,0,0,1,0,0,1,0,0]);
        //left
        //gl.uniform4f(u_FragColor, rgba[0] * 7, rgba[1] *7 , rgba[2] *7, rgba[3]); 
        drawTriangle3DUVNormal([0,1,0, 0,1,1, 0,0,0],[0,0,0,1,1,1],[-1,0,0,-1,0,0,-1,0,0]);
        drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,0,1],[0,0,1,1,1,0],[-1,0,0,-1,0,0,-1,0,0]);
        //bottom
        //gl.uniform4f(u_FragColor, rgba[0] * 6, rgba[1] *6 , rgba[2] *6, rgba[3]);
        drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],[0,0,0,1,1,1],[0,-1,0,0,-1,0,0,-1,0]);
        drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,0,1,1,1,0],[0,-1,0,0,-1,0,0,-1,0]);
        //back
        //gl.uniform4f(u_FragColor, rgba[0] * 5, rgba[1] *5 , rgba[2] *5, rgba[3]);
        drawTriangle3DUVNormal([0,0,1, 1,1,1, 1,0,1],[0,0,0,1,1,1],[0,0,1,0,0,1,0,0,1]);
        drawTriangle3DUVNormal([0,0,1, 0,1,1, 1,1,1],[0,0,1,1,1,0],[0,0,1,0,0,1,0,0,1]);

        
        
    }
    renderfast(){
        var rgba = this.color;
        
        
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);   
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform1i(u_whichTexture,this.textureNum);
        var allverts =[];
        var UVverts = [];
        var normals = [];
        //front
        allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
        normals = normals.concat([0,0,-1,0,0,-1,0,0,-1]);
        
        allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
		normals = normals.concat([0,0,-1,0,0,-1,0,0,-1]);
        //back
        allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
        normals = normals.concat([0,1,0,0,1,0,0,1,0]);
        
        allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
        normals = normals.concat([0,1,0,0,1,0,0,1,0]);

        //top
        allverts = allverts.concat([1,1,0, 1,0,1, 1,0,0]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
        normals = normals.concat([1,0,0,1,0,0,1,0,0]);
        
        allverts = allverts.concat([1,1,0, 1,1,1, 1,0,1]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
		normals = normals.concat([1,0,0,1,0,0,1,0,0]);
		
        //bottom
        allverts = allverts.concat([0,1,0, 0,1,1, 0,0,0]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
        normals = normals.concat([-1,0,0,-1,0,0,-1,0,0]);
        
        allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
        normals = normals.concat([-1,0,0,-1,0,0,-1,0,0]);

        //sides
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
        normals = normals.concat([0,-1,0,0,-1,0,0,-1,0]);
        
        allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
        normals = normals.concat([0,-1,0,0,-1,0,0,-1,0]);
 
        allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        UVverts = UVverts.concat([0,0,0,1,1,1]);
        normals = normals.concat([0,0,1,0,0,1,0,0,1]);
        
        allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);
        UVverts = UVverts.concat([0,0,1,1,1,0]);
        normals = normals.concat([0,0,1,0,0,1,0,0,1]);
 
        drawTriangle3DUVNormal(allverts,UVverts,normals);
    }

}

        
		
		