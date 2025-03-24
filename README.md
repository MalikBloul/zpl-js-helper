# Label Generation Package

## Overview
This package provides a flexible way to generate ZPL (Zebra Programming Language) label templates with dynamic sections. It allows defining text sections with specific sizes, origins, paddings, and orientations, then populating them with structured data.

## Installation
Ensure you have Node.js installed, then install the package:

```sh
npm install zpl-js-helper
```

## Usage
Import the required classes from the package:

```javascript
const {
  Origin,
  Size,
  Template,
  TextSection,
  LabelBuilder,
  Padding,
} = require("zpl-js-helper"); 
```

### Defining a Label Template
Create a new template and define the sections:

```javascript
const template = new Template(50, 100);

const size = new Size(200, 400);
const padding = new Padding(20, 20, 20, 20);

const sections = [];

//create the sections.
sections.push(new TextSection('0', size, new Origin(0, 0), 'orderNumber', 'all', 2, padding));
sections.push(new TextSection('C', size, new Origin(400, 0), 'address', 'all', 2));
sections.push(new TextSection('0', size, new Origin(0, 200), 'name', 'all', 2, padding, 'landscape', "C", 20));
sections.push(new TextSection('C', size, new Origin(200, 400), 'orderDate', 'all', 2, padding, 'landscape', "C"));

//Add the sections to your template.
sections.forEach((section) => {
  template.addZPLSection(section);
});
```

### Populating the Label with Data
Define records that will populate the label template:

```javascript
const sectionRecords = [
  {
    name: ["John Smtih"],
    orderDate: ["20 March 2025"],
    address: ["10 High St, New State, 2893"],
    orderNumber: ["#987234798"],
    
  }
];
```

### Generating the ZPL Output
Pass the template and records to the `LabelBuilder`:

```javascript
const labelBuilder = new LabelBuilder(template, sectionRecords);
const zplOutput = labelBuilder.generateZPL();
console.log(zplOutput);
```

## Features
- Define label templates with text sections, sizes, and padding.
- Support for different text orientations (portrait/landscape).
- Dynamically populate templates with structured data.
- Generate ZPL output for label printers.
- An attempt at auto-scaling and wrapping text to prevent overflow from predefined sections (Uses the '0' font style).

## License
This package is licensed under MIT.

