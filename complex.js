/*
Examples From
JavaScript: The Definitive Guide, Fourth Edition

Legal matters: these files were created by David Flanagan, and are
Copyright (c) 2001 by David Flanagan.  You may use, study, modify, and
distribute them for any purpose.  Please note that these examples are
provided "as-is" and come with no warranty of any kind.

David Flanagan
*/

/*
 * Complex.js:
 * This file defines a Complex class to represent complex numbers.
 * Recall that a complex number is the sum of a real number and an
 * imaginary number, and that the imaginary number i is the
 * square root of -1.
 */

function Complex(real, imaginary) {
    this.x = real;       // The real part of the number
    this.y = imaginary;  // The imaginary part of the number
}

// Return the magnitude of a complex number. This is defined
// as its distance from the origin (0,0) of the complex plane.
Complex.prototype.magnitude = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
};

// Return a complex number that is the negative of this one.
Complex.prototype.negative = function() {
    return new Complex(-this.x, -this.y);
};

// Convert a Complex object to a string in a useful way.
// This is invoked when a Complex object is used as a string.
Complex.prototype.toString = function() {
    return this.x.toString() + "+" + this.y.toString() + "i";
    //return "{" + this.x + "," + this.y + "}";
};

// Return the real portion of a complex number. This function
// is invoked when a Complex object is treated as a primitive value.
Complex.prototype.valueOf = function() { return this.x; };

// Add two complex numbers and return the result.
Complex.add = function (a, b) {
    return new Complex(a.x + b.x, a.y + b.y);
};

// Subtract one complex number from another.
Complex.subtract = function (a, b) {
    return new Complex(a.x - b.x, a.y - b.y);
};

// Multiply two complex numbers and return the product.
Complex.multiply = function(a, b) {
    return new Complex(a.x * b.x - a.y * b.y,
		       a.x * b.y + a.y * b.x);
};

// Here are some useful predefined complex numbers.
// They are defined as class properties, where they can be used as
// "constants." (Note, though, that they are not actually read-only.)
Complex.zero = new Complex(0,0);
Complex.one = new Complex(1,0);
Complex.i = new Complex(0,1);