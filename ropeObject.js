
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

function ClothBody(x, y, horizontalSegments, verticalSegments, segmentHLen, segmentVLen){
    this.segmentHLength = segmentHLen;
    this.segmentVLength = segmentVLen;

    this.points = [];
    this.pointForces = [];
    this.distanceConstraints = [];

    this.errorTolerated = 0;

    this.hSegments = horizontalSegments;
    this.vSegments = verticalSegments;

    for (var i = 0; i < this.vSegments+1; i++) {
        var pointRow = [];
        var pointForcesRow = [];
        for (var j = 0; j < this.hSegments+1; j++) {
            var part = new VerletParticle();
            part.pos = new Vector(x + this.segmentHLength*j, y + this.segmentVLength*i);
            part.prevPos = new Vector(x + this.segmentHLength*j, y + this.segmentVLength*i);
            pointRow.push(part);
            pointForcesRow.push(new Vector(0, 0));

            if(i != 0){
                var distConstrain = new VerletDistanceConstraint(new Vector(j, i-1), new Vector(j, i), this.segmentVLength);
                this.distanceConstraints.push(distConstrain);
            }

            if(j != 0){
                var distConstrain = new VerletDistanceConstraint(new Vector(j-1, i), new Vector(j, i), this.segmentHLength);
                this.distanceConstraints.push(distConstrain);
            }
        }
        this.points.push(pointRow);
        this.pointForces.push(pointForcesRow);
    }
    
    
      
    this.verletIntegration = function(particle, acceleration, dt) {
        var temp = particle.pos.getCopy();
        particle.pos = particle.pos.add((particle.pos.sub(particle.prevPos))).add(acceleration.mult((dt * dt)));
        particle.prevPos = temp;
    }
    
    this.applyDistanceConstraint = function(particle1, particle2, len) {
        var delta = particle1.pos.sub(particle2.pos);
        var currentDistance = delta.mag();
        var error = (currentDistance - len);
        var errorFactor = error / currentDistance;

        if(Math.abs(error)/len > this.errorTolerated){
            particle1.pos = particle1.pos.sub(delta.mult(0.5 * errorFactor));
            particle2.pos = particle2.pos.add(delta.mult(0.5 * errorFactor));
        }
    }

    this.applyForce = function(force){
        for (var i = 0; i < this.pointForces.length; i++) {
            for (var j = 0; j < this.pointForces[i].length; j++) {
                this.pointForces[i][j].x += force.x;
                this.pointForces[i][j].y += force.y;
            }
        }
    }
    
    this.update = function(dt){

        var subDtSize = 0.6;
        var subSteps = dt/subDtSize;
        for(; subSteps > 1; subSteps--){

            var subDt = subDtSize;
            // Update positions using Verlet integration
            for (var i = 0; i < this.points.length; i++) {
                for (var j = 0; j < this.points[i].length; j++) {
                    this.verletIntegration(this.points[i][j], this.pointForces[i][j], subDt);
                }
            }


            // Apply constraints

            var iter = 5;
            for (var i = 0; i < iter; i++) {

                for (var j = 0; j < this.distanceConstraints.length; j++) {
                    var point1  = this.points[this.distanceConstraints[j].index1.y][this.distanceConstraints[j].index1.x];
                    var point2  = this.points[this.distanceConstraints[j].index2.y][this.distanceConstraints[j].index2.x];
                    var restLen = this.distanceConstraints[j].restLength;
                    this.applyDistanceConstraint(point1, point2, restLen);
                }
            }
        }

        // var subDt = subSteps*subDtSize;
        // // Update positions using Verlet integration
        // for (var i = 0; i < this.points.length; i++) {
        //     for (var j = 0; j < this.points[i].length; j++) {
        //         this.verletIntegration(this.points[i][j], this.pointForces[i][j], subDt);
        //     }
        // }


        // // Apply constraints

        // var iter = 5;
        // for (var i = 0; i < iter; i++) {

        //     for (var j = 0; j < this.distanceConstraints.length; j++) {
        //         var point1  = this.points[this.distanceConstraints[j].index1.y][this.distanceConstraints[j].index1.x];
        //         var point2  = this.points[this.distanceConstraints[j].index2.y][this.distanceConstraints[j].index2.x];
        //         var restLen = this.distanceConstraints[j].restLength;
        //         this.applyDistanceConstraint(point1, point2, restLen);
        //     }
        // }


        for (var i = 0; i < this.pointForces.length; i++) {
            for (var j = 0; j < this.pointForces[i].length; j++) {
            this.pointForces[i][j].x = 0;
            this.pointForces[i][j].y = 0;
            }
        }
    }
}

function RopeBody(x, y, segments, segmentLen){
    this.segmentLength = segmentLen;

    this.points = [];
    this.pointForces = [];
    this.distanceConstraints = [];
    
    this.tensionForce = new Vector(0,0);

    for (var i = 0; i < segments+1; i++) {
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
        for (var i = 0; i < 200; i++) {
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
    