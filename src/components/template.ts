import { Size } from './size';
import { SectionComponent } from "./section-interface";
import { PrintDensity } from './density';

export class Template {
    
    dotsPerMM: PrintDensity;
    size: Size;   
    sections: SectionComponent[] = [];
   
    constructor(widthInMM: number, heightInMM: number, dotsPerMM = PrintDensity['8dpmm']) {
      
      this.dotsPerMM = dotsPerMM;

      const size = new Size(widthInMM * this.dotsPerMM, heightInMM * this.dotsPerMM)
      this.size = size;
    }
  
    generateTestZpl(): string {
      const start = '^XA';
      const end = '^XZ';
  
      const borderBox = `
      ^PW${this.size.widthInDots.toString()}
      ^LL${this.size.heightInDots.toString()}
      ^FWR
      ^FO0,0
      ^GB${this.size.heightInDots.toString()},${this.size.widthInDots.toString()},5^FS
      ^FB
      ^FDTEST^FS
      `;
  
      return start + borderBox + end;
    }
  
    addZPLSection(zplSection: SectionComponent): void {
      this.sections.push(zplSection);
    }
  
    getSections(): SectionComponent[]{
      return this.sections;
    }
  }
  
  
 
  
  
  
  
 