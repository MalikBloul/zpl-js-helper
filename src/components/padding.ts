export class Padding {
    top: number = 0;
    bottom: number = 0;
    left: number = 0;
    right: number = 0;
  
    constructor(top: number, bottom: number, left: number, right: number) {
      this.top = top;
      this.bottom = bottom;
      this.left = left;
      this.right = right;
    }
  
    totalX() {
      return this.left + this.right;
    }
  
    totalY() {
      return this.top + this.bottom;
    }
  }