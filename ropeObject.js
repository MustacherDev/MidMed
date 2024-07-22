
class VerletParticle{
    constructor(){
        this.pos = new Vector(0,0);
        this.prevPos = new Vector(0,0);
    }
}

class VerletDistanceConstraint {
    constructor(index1, index2, length){    
        this.index1 = index1;
        this.index2 = index2;
        this.restLength = length;
    }
}

function RopeBody(x, y, segments, segmentLen){
    this.segmentLength = segmentLen;

    this.points = [];
    this.pointForces = [];
    this.distanceConstraints = [];
    
    this.tensionForce = new Vector(0,0);

    for (var i = 0; i < segments; i++) {
        var part = new VerletParticle();
        part.pos = new Vector(x, y + segmentLen*i);
        part.prevPos = new Vector(x, y + segmentLen*i);
        this.points.push(part);
        this.pointForces.push(new Vector(0, 0));
    }

    for (var i = 1; i < this.points.length; i++) {
        var distConstrain = new VerletDistanceConstraint(i - 1, i, segmentLen);
        this.distanceConstraints.push(distConstrain);
    }
    
    
      
    this.verletIntegration = function(particle, acceleration, dt) {
        var temp = particle.pos.getCopy();
        particle.pos = particle.pos.add((particle.pos.sub(particle.prevPos))).add(acceleration.mult((dt * dt)));
        particle.prevPos = temp;
    }
    
    this.applyDistanceConstraint = function(particle1, particle2) {
        var delta = particle1.pos.sub(particle2.pos);
        var currentDistance = delta.mag();
        var errorFactor = (currentDistance - this.segmentLength) / currentDistance;

        particle1.pos = particle1.pos.sub(delta.mult(0.5 * errorFactor));
        particle2.pos = particle2.pos.add(delta.mult(0.5 * errorFactor));
    }

    this.applyForce = function(force){
        for (var i = 0; i < this.pointForces.length; i++) {
            this.pointForces[i].x += force.x;
            this.pointForces[i].y += force.y;
        }
    }
    
    this.update = function(dt){

        var headPoint = this.points[0].pos;
        var tailPoint = this.points[this.points.length - 1].pos;
        var diff = tailPoint.sub(headPoint);
        var actualLength = diff.mag();
        var maxLength = this.segmentLength * (this.points.length - 0.5);

        // If the distance exceeds maxLength, limit it
        if (actualLength > maxLength) {
            // Calculate unit vector from fixedEnd to draggedEnd
            var direction = diff.unit();

            this.tensionForce = direction.mult((actualLength - maxLength) * 0.01);
        }
        else {
            this.tensionForce.x = 0;
            this.tensionForce.y = 0;
        }

        // this.vacc = 0.2;
        // this.hacc = 0;

        // Update positions using Verlet integration
        for (var i = 0; i < this.points.length; i++) {
            this.verletIntegration(this.points[i], this.pointForces[i], dt);
        }


        // Apply constraints
        for (var i = 0; i < 100; i++) {
            // for (var j = 0; j < this.fixedConstraints.length; j++) {
            //     this.applyFixedConstraint(points[fixedConstraints[j].particleIndex], fixedConstraints[j].pos);
            // }

            for (var j = 0; j < this.distanceConstraints.length; j++) {
                var point1  = this.points[this.distanceConstraints[j].index1];
                var point2  = this.points[this.distanceConstraints[j].index2];
                var restLen = this.distanceConstraints[j].restLength;
                this.applyDistanceConstraint(point1, point2, restLen);
            }
        }


        for (var i = 0; i < this.pointForces.length; i++) {
            this.pointForces[i].x = 0;
            this.pointForces[i].y = 0;
        }
    }
}
    