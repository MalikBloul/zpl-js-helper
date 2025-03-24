import { SectionRecord } from "./record";
import { SectionComponent } from "./section-interface";
import { Template } from "./template";

export class LabelBuilder {
    private template: Template;
    private records: SectionRecord[];
  
    constructor(template: Template, records: SectionRecord[]) {
      this.template = template;
      this.records = records;
    }
  
    // This method will generate ZPL for all records based on the template sections
    generateZPL(): string {
      const start = '^XA\r\n';
      const setup = `^PW${this.template.size.widthInDots.toString()}\r\n^LL${this.template.size.heightInDots.toString()}\r\n`;
      const end = '^XZ';
  
      let content = '';
  
      this.records.forEach((record) => {
        // Apply each record to the sections of the template and generate ZPL
        content += this.template.getSections()
          .map((section) => this.generateSectionZPL(section, record))
          .join('\r\n');
      });
  
      return start + setup + content + end;
    }
  
    // Method to generate ZPL for each section based on the current record
    private generateSectionZPL(section: SectionComponent, record: SectionRecord): string {
      if (record[section.sectionKey]) {
       
        return section.generateZpl(record[section.sectionKey]);
      }
      return ''; // Return an empty string if no matching data
    }
  }