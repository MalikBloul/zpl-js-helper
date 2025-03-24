export interface SectionComponent {
    sectionKey: string;
    generateZpl(values: string[]): string

}