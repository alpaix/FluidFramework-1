# @fluid-tools/api-markdown-documenter

Contains a programmatic API for generating [Markdown](https://en.wikipedia.org/wiki/Markdown) documentation from an API report generated by [API-Extractor](https://api-extractor.com).

It is similar to [API-Documenter](https://github.com/microsoft/rushstack/tree/main/apps/api-documenter) and is heavily based upon it and uses it under the hood, but is designed to be more extensible and can be used programmatically.

Note: this library does not currently offer a Command Line Interface (CLI).
One may be added in the future, but for now this library is intended to be consumed programmatically.

## Installation

To get started, install the package by running the following command:

```bash
npm i @fluid-tools/api-markdown-documenter -D
```

## Usage

### Quickstart

This library is intended to be highly customizable.
That said, it is also intended to be easy to use out of the box.

Are you using `API-Extractor`?
Are you already generating `.api.json` report files as a part of your build?

If yes, create a file called `api-markdown-documenter.js` and paste the following code:

```javascript
const { readModel, renderFiles } = require("@fluid-tools/api-markdown-documenter");

const inputDir = "<PATH-TO-YOUR-DIRECTORY-CONTAINING-API-REPORTS>";
const outputDir = "<YOUR-OUTPUT-DIRECTORY-PATH>";

// Create the API Model from our API reports
const apiModel = await readModel(inputDir);

const config = {
    apiModel,
    uriRoot: ".",
};

await renderFiles(config, outputDir);
```

The above script can be invoked as an `npm` script by adding the following to your `package.json`'s `scripts` property:

```json
"generate-api-docs": "node ./api-markdown-documenter.js"
```

The above steps omit many of the configuration options exposed by the library.
For more advanced usage options, see the following sections.

### Documentation Generation

This package contains 2 primary, programmatic entry-points for generating documentation:

#### renderDocuments

The `renderDocuments` function accepts an [ApiModel](https://api.rushstack.io/pages/api-extractor-model.apimodel/) representing the package(s) of a repository, and generates a sequence of "Document" objects representing the resulting documentation based on the other provided configuration options.
These objects include information about the page item, its documentation contents, and the intended output file path the document file should be rendered to, based on provided policy options.

The input `ApiModel` here will generally be the output of [API-Extractor](https://api-extractor.com/).

#### renderFiles

The `renderFiles` function operates like [renderDocuments](#renderdocuments), but writes the resulting documents to disk as files based on the provided configuration options.
This function also accepts a `MarkdownEmitter` object that does the conversion from `DocNode` trees to a Markdown stream that will ultimately be rendered to file.

### Loading the API Model

Both of the rendering APIs above take as input an `ApiModel` object that describes the API suite being processed.

To generate an API model from `.api.json` files generated by `API-Extractor`, see the `loadModel` function, which can generate an `ApiModel` for you, given a path to a directory containing the API reports.

### Emitting Markdown Content

If you are using the [renderDocuments](#renderdocuments) option described above, one option for emitting Markdown string content is to use the `emitMarkdown` function.
It accepts a `MarkdownDocument` object as input, and outputs a string representing the final Markdown content.

Note: you can also accomplish this by just using [renderFiles](#renderfiles) if you are using default configuration / emitter options.

### Configuration Options

As mentioned above, this library was designed in an attempt to be highly flexible and configurable.
If you look at the configuration type `MarkdownDocumenterConfiguration`, you will see that it offers quite a few degrees of freedom.

But fret not!
The vast majority of these options have default values that have been crafted to produce high quality documentation for your library with minimal specification.

#### Required Parameters

-   `apiModel`: This is the [ApiModel](https://api.rushstack.io/pages/api-extractor-model.apimodel/) representing the API suite.
    It is generated by processing the `.api.json` report files generated by `API-Extractor`.
-   `uriRoot`: This is the root URI under which the generated documentation will be published.
    It will be used when generating links for API content docs.

## Upcoming Work

### Documentation Improvements

-   Intro sandbox (api report)

### Styling improvements

-   Remove leading blank line in documents
-   Excessive blank lines in Signature sections
-   Fix links to the same file (only need heading component, not file path)
    -   This will require plumbing down a context document item, so we can easily determine if the document to which the link is being generated is the same as the document being linked to.

## Longer-term work

-   Replace DocNode output / MarkdownEmitter with Markdown AST trees and simple interface for rendering those trees to a stream
-   Support placing documents _within_ their own hierarchy (support for the "index" model used by systems like DocFX)
-   Pre-canned policies (flat, index, adjacency)
-   Handle multiple package entrypoints
