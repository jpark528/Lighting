class Camera{

	constructor(){
		this.eye = new Vector3([0,0,2]);
		this.at = new Vector3([0,0,-100]);
		this.up = new Vector3([0,1,0]);
		this.eye2 = new Vector3([0,0,-1]);
		this.sd = 0.5;
		
		
	}

	forward(){
		var f = new Vector3();
    	f.set(this.at);
    	f.sub(this.eye);
    	f.normalize();

    	f.mul(this.sd );

    	this.eye = this.eye.add(f);
    	this.at = this.at.add(f);
	}

	backward(){
		var b = new Vector3();
    	b.set(this.at);
    	b.sub(this.eye);
    	b.normalize();

    	b.mul(this.sd );

    	this.eye = this.eye.sub(b);
    	this.at = this.at.sub(b);
	}

	moveLeft(){
		var l = new Vector3();
    	l.set(this.at);
   		l.sub(this.eye);
    	l.normalize();

    	let l2 = Vector3.cross(this.up, l);
    	l2.mul(this.sd );

    	this.eye = this.eye.add(l2);
    	this.at = this.at.add(l2);
	}

	moveRight(){
		var r = new Vector3();
    	r.set(this.at);
    	r.sub(this.eye);
    	r.normalize();

    	let r2 = Vector3.cross(this.up, r);
    	r2.mul(this.sd );

    	this.eye = this.eye.sub(r2);
    	this.at = this.at.sub(r2);
	}

	rotateLeft(){
		var rl = new Vector3();

		rl.set(this.at);

		let rotateMatrix = new Matrix4();
		
		var x = this.up.elements[0];
		var y = this.up.elements[1];
		var z = this.up.elements[2];
		rotateMatrix.setRotate(5, x, y, z);
    	var fPrime = rotateMatrix.multiplyVector3(rl);

    	rl.set(this.eye2);
    	this.at = rl.add(fPrime);
	}

	rotateRight(){
		var rr = new Vector3();

		rr.set(this.at);
		
		var x = this.up.elements[0];
		var y = this.up.elements[1];
		var z = this.up.elements[2];
		
		let rotateMatrix = new Matrix4();

		rotateMatrix.setRotate(-5,x,y,z);
    	var fPrime = rotateMatrix.multiplyVector3(rr);

    	rr.set(this.eye2);
    	this.at = rr.add(fPrime);
	}
}