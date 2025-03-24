import { SectionRecord } from "./record";
import { FontFamily } from "./fontFamily";
import { Origin } from "./origin";
import { Padding } from "./padding";
import { SectionComponent } from "./section-interface";
import { Size } from "./size";
import { TextLine } from "./text-line";

export class TextSection implements SectionComponent {
  fontFamily: FontFamily;
  padding: Padding;
  origin: Origin;
  size: Size;
  sectionKey: string;
  border: string;
  borderThickness: number;
  orientation: "portrait" | "landscape";
  defaultFontSize: 10 | 20 | 30 | 40 | 50 = 30;
  textAlignment: 'J' | 'L' | 'C' | 'R';

  // Constructor with parameters for all the properties
  constructor(
    fontFamily: FontFamily,
    size: Size,
    origin: Origin,
    sectionKey: string,
    border: string = "none", // Defaulting to 'none' if no border is specified
    borderThickness: number = 2, // Default border thickness is 2
    padding: Padding = new Padding(0, 0, 0, 0),
    orientation: "portrait" | "landscape" = 'portrait',
    textAlignment: 'J' | 'L' | 'C' | 'R' = 'J', 
    fontSize: 10 | 20 | 30 | 40 | 50 = 30
  ) {
    this.fontFamily = fontFamily;
    this.padding = padding;

    this.size = size;
    this.origin = origin;
    this.sectionKey = sectionKey;
    this.border = border;
    this.borderThickness = borderThickness;
    this.orientation = orientation;
    this.textAlignment = textAlignment;
    this.defaultFontSize = fontSize;
  }

  // Method to generate ZPL string
  public generateZpl(values: string[] = []): string {
    const content = this.generateText(values);
    const border = this.generateSectionBorders();

    return content + border;
  }

  // Method to generate borders for the section based on the border property
  private generateSectionBorders(): string {
    let zpl = "";

    // Draw borders based on the border property
    const borderThickness = this.borderThickness; // Thickness of the border

    // Top border
    if (this.border === "top" || this.border === "all") {
      zpl += `^FO${this.origin.originXInDots},${this.origin.originYInDots}\r\n^GB${this.size.widthInDots},${borderThickness},${borderThickness}^FS\r\n`;
    }

    // Bottom border
    if (this.border === "bottom" || this.border === "all") {
      zpl += `^FO${this.origin.originXInDots},${
        this.origin.originYInDots + this.size.heightInDots - borderThickness
      }\r\n^GB${
        this.size.widthInDots
      },${borderThickness},${borderThickness}^FS\r\n`;
    }

    // Left border
    if (this.border === "left" || this.border === "all") {
      zpl += `^FO${this.origin.originXInDots},${this.origin.originYInDots}\r\n^GB${borderThickness},${this.size.heightInDots},${borderThickness}^FS\r\n`;
    }

    // Right border
    if (this.border === "right" || this.border === "all") {
      zpl += `^FO${
        this.origin.originXInDots + this.size.widthInDots - borderThickness
      },${this.origin.originYInDots}\r\n^GB${borderThickness},${
        this.size.heightInDots
      },${borderThickness}^FS\r\n`;
    }

    return zpl;
  }

  private generateText(values: string[] = []) {

    if(values.length === 0){
      return "";
    }

       
    let zpl =
      this.orientation == "landscape"
        ? "^CI28\r\n^FWB\r\n"
        : "^CI28\r\n^FWN\r\n";

    const totalLengthX = this.size.widthInDots - this.padding.totalX();
    const totalLengthY = this.size.heightInDots - this.padding.totalY();

    const availableHeight =
      this.orientation == "landscape" ? totalLengthX : totalLengthY;
    const availableWidth =
      this.orientation == "landscape" ? totalLengthY : totalLengthX;

    //const textLines: string[]= this.processText(values, availableWidth); 
    const result = this.processTextUpdated(values, availableWidth, this.defaultFontSize)
    const textLines = result.lines;
    const adjustedFontSize = result.fontSize;

    const fontSize = Math.min(
      adjustedFontSize,
      Math.floor((availableHeight)  / textLines.length)
    );

    const textAlignmentEscape = this.textAlignment == 'C' ? '\\&' : '';

    for (let i = 0; i < textLines.length; i++) {
      const textOriginX =
        this.orientation == "landscape"
          ? i * fontSize + this.origin.originXInDots + this.padding.left
          : this.origin.originXInDots + this.padding.left;

      const textOriginY =
        this.orientation == "landscape"
          ? this.origin.originYInDots + this.padding.top
          : i * fontSize + this.padding.top + this.origin.originYInDots;

      zpl += `^FO ${textOriginX},${textOriginY}\r\n
        ^A${this.fontFamily.toString()},${fontSize},${
        this.fontFamily == "0" ? fontSize : 0
      }\r\n
        ^FB${this.orientation == "landscape" ? totalLengthY : totalLengthX},,3,${this.textAlignment}
        ^FD${textLines[i]}${textAlignmentEscape}^FS\r\n`; 
    }

    return zpl;
  }

  private processText(text: string[], availableWidth: number): string[] {
    const processedLines: string[] = [];

    const scaleFactor = this.fontFamily == '0' ? 2: 1.25;
    text.forEach((line) => {
      const words = line.split(" ");
      let currentLine = "";

      words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          console.log(`Available Width: ${availableWidth}\n Testline: ${testLine}\n Testline width: ${this.calculateStringLengthRelativeToCharacters(testLine) * this.defaultFontSize}`)
          if (this.calculateStringLengthRelativeToCharacters(testLine) * (this.defaultFontSize / scaleFactor) <= availableWidth) {
              // Add the word to the current line if it fits
              currentLine = testLine;
          } else {
              // If the word doesn't fit, push the current line and start a new one
              if (currentLine) processedLines.push(currentLine);
              currentLine = word; // Start a new line with the word
          }
      });

      // Push any remaining text
      if (currentLine) processedLines.push(currentLine);
  });

  return processedLines;
}
  


  

  private calculateStringLengthRelativeToCharacters(text: string): number {
    // Define wide and skinny characters
    const charWidths: { [key: string]: number } = {
      " ": 117,
      "!": 113,
      '"': 183,
      "#": 183,
      $: 183,
      "%": 366,
      "&amp;": 235,
      "'": 113,
      "(": 113,
      ")": 113,
      "*": 183,
      "+": 330,
      ",": 110,
      "-": 200,
      ".": 113,
      "/": 113,
      "0": 183,
      "1": 183,
      "2": 183,
      "3": 183,
      "4": 183,
      "5": 183,
      "6": 183,
      "7": 183,
      "8": 183,
      "9": 183,
      ":": 117,
      ";": 117,
      "&lt;": 366,
      "=": 366,
      "&gt;": 366,
      "?": 165,
      "@": 330,
      A: 220,
      B: 220,
      C: 206,
      D: 235,
      E: 194,
      F: 194,
      G: 220,
      H: 235,
      I: 110,
      J: 173,
      K: 220,
      L: 183,
      M: 300,
      N: 235,
      O: 220,
      P: 220,
      Q: 220,
      R: 220,
      S: 206,
      T: 183,
      U: 235,
      V: 206,
      W: 300,
      X: 206,
      Y: 206,
      Z: 194,
      "[": 113,
      "\\": 192,
      "]": 113,
      "^": 192,
      _: 194,
      "`": 113,
      a: 173,
      b: 194,
      c: 173,
      d: 194,
      e: 183,
      f: 106,
      g: 194,
      h: 194,
      i: 100,
      j: 100,
      k: 173,
      l: 100,
      m: 300,
      n: 194,
      o: 183,
      p: 194,
      q: 194,
      r: 126,
      s: 165,
      t: 106,
      u: 194,
      v: 173,
      w: 253,
      x: 173,
      y: 173,
      z: 150,
      "{": 194,
      "|": 194,
      "}": 194,
      "~": 192,
    };

    let relativeStringLength = 0;

    for (const char of text) {
      // If the character exists in the mapping, add the corresponding value
      relativeStringLength += charWidths[char] || 192; // Default to 186 if the char is not in the map
    }
    //console.log(text, relativeStringLength / 398);
    return relativeStringLength / 192;
  }


  private processTextUpdated(lines: string[], availableWidth: number, desiredFontSize: number): {lines: string[], fontSize: number} {
    let fontSize = desiredFontSize;
    const minFontSize = this.fontFamily == '0' ? 20 : 20;
    const scaleFactor = this.fontFamily == '0' ? 2: 1.25;
    // Try to fit text by reducing font size first
    let maxLineWidth = Math.max(...lines.map(line => this.calculateStringLengthRelativeToCharacters(line) * (fontSize / scaleFactor)));

    console.log(lines, maxLineWidth, availableWidth)

    while (maxLineWidth > availableWidth && fontSize > minFontSize) {
        fontSize -= 1; // Reduce font size
        maxLineWidth = Math.max(...lines.map(line => this.calculateStringLengthRelativeToCharacters(line) * (fontSize / scaleFactor)));
    }

    // If the font size reaches the minimum and still doesn't fit, break lines up using the min fontsize;
    if (fontSize <= minFontSize && maxLineWidth > availableWidth) {
        lines = this.breakUpLines(lines, availableWidth, minFontSize, scaleFactor);
    }

    return {lines, fontSize};
}

private breakUpLines(lines: string[], availableWidth: number, fontSize: number, scaleFactor: number): string[] {
 
  const processedLines: string[] = []
  lines.forEach((line) => {
    const words = line.split(" ");
    let currentLine = "";

    words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        if (this.calculateStringLengthRelativeToCharacters(testLine) * (fontSize / scaleFactor) <= availableWidth) {
            // Add the word to the current line if it fits
            currentLine = testLine;
        } else {
            // If the word doesn't fit, push the current line and start a new one
            if (currentLine) processedLines.push(currentLine);
            currentLine = word; // Start a new line with the word
        }
    });

    // Push any remaining text
    if (currentLine) processedLines.push(currentLine);
    
    
  })

  return processedLines;
}
}
