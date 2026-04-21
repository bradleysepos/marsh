marsh
=====

marsh is a Bash script for building static websites using Markdown.


Requirements
------------

- BSD/Linux/macOS or similar
- Bash shell
- awk, grep, sed
- [Discount](https://www.pell.portland.or.us/~orc/Code/discount/) Markdown processor
- [GNU Parallel](https://www.gnu.org/software/parallel/) (optional)

Installation
------------

Copy `marsh` to a directory in your `PATH` such as `/usr/local/bin` and make it executable.

```sh
cp marsh /usr/local/bin/marsh
chmod +x /usr/local/bin/marsh
```

Discount and GNU parallel can be installed using your system's package manager.

```sh
# Fedora
dnf5 install discount parallel

# Ubuntu
apt-get install discount parallel

# Homebrew
brew install discount parallel
```

*Note: sudo may be required for some commands.*

You can also build Discount provided as a submodule in the `contrib` directory using the `build-discount` script in the `tools` directory. A working C compiler toolchain is required.


Usage
-----

The basic syntax is:

```text
marsh build [config_file]
```

Where `config_file` is the path to the build configuration file for your site. You may also specify a directory containing a build configuration file named `marsh-config.yaml`. Where `config_file` is not specified, `marsh` defaults to using the `marsh-config.yaml` file in the current working directory.

Output is written to the path defined in the build configuration file, e.g., "public".

If you have GNU parallel installed, `marsh` will build multiple documents simultaneously for speed. The number of concurrent jobs can be specified using the `-j` or `--jobs` parameters, default being the number of logical processors available on your machine.

```text
marsh build -j 4
```

You can specify the location for the Discount `markdown` application using the `--markdown` parameter, useful if the installation location is not in your `PATH`.

```text
marsh build --markdown="/path/to/markdown"
```

You can specify the `--log-level` parameter to adjust the amount of logging detail `marsh` prints. The `verbose` log level prints the paths of all files as they are published.

```text
marsh build --log-level verbose
```

Full usage:

```text
marsh --help
```

The included `marsh-test` test suite may be run to verify `marsh` compatibility with your system. Run `marsh-test --help` for usage information.


Quick Start
-----------

Once you have installed the necessary dependencies, a good way to get started is building the example site. Run the following command from the root directory of this repository on your machine:

```text
./marsh build --log-level=verbose example
```

`marsh` will build the example site using the `marsh-config.yaml` configuration file in the specified `example` directory.

The configuration file specifies `public` as the build output path, which is relative to the configuration file directory, so the site is built and published to `example/public`. The `--log-level=verbose` parameter prints more information during the build than the standard `info` log level, so you can see in greater detail what is being built in real-time.

When the command is completed, open `example/public/index.html` in your web browser to view the built example site.

The source documents for the example site are located at `example/source`, and the example template is located at `templates/example`. You can inspect these directories and files to get a basic idea of where to put things and how they work. More detail is covered in the sections that follow.

If you run into any problems or are simply curious, you can also run the test suite to ensure `marsh` works correctly on your system using the command:

```
./marsh-test --marsh=./marsh
```


Site Configuration
------------------

The `marsh-config.yaml` build configuration file defines build targets, source paths, templates, and archives.

```yaml
---
Build:
  Name: My Website
  Description: My website description
  URL: https://example.com
  Path: public
  Targets:
    - Name:   My Website
      Path:   .
      Source: source
      Template:
        Source: templates/example
...
```

All paths are relative to the configuration file directory. See the `example` directory for a more extensive configuration example.


Documents
---------

### Processing

The main document format is [Markdown](https://en.wikipedia.org/wiki/Markdown). `marsh` converts Markdown documents to HTML, with additional formatting defined by the configured template(s), and finally saves the rendered output to the paths specified in the build configuration.

Within Markdown documents, relative path Markdown syntax links ending in the configured Markdown file extensions are by default rewritten to use the file extension `.html` (configurable via the `--markdown-rewrite-links` command line parameter). This allows Markdown documents to link directly to each other, useful for source documents on repository hosting, while ensuring rendered pages also link to each other.

Files of other types and file extensions are copied as-is to the paths specified in the build configuration.

### Markdown file types

Markdown documents may use any of the following file extensions (configurable via the `--markdown-file-extensions` command line parameter):

- `.markdown` (always set; not configurable)
- `.md`
- `.mkd`
- `.mkdn`
- `.mdown`
- `.mdtxt`
- `.mdtext`
- `.text`

### Markdown document format

Markdown documents may begin with [YAML](https://en.wikipedia.org/wiki/YAML) frontmatter containing metadata such as title and author information. This allows documents to be self-describing.

Example:

```text
---
Type:            article
Date:            2026-02-20
Title:           Example Document
Language:        English
Language_Code:   en
Authors:         [ Mr. Marsh <mrmarsh@example.com> ]
Copyright:       2026 Mr. Marsh
License:         Creative Commons Attribution-ShareAlike 4.0 International
License_Abbr:    CC BY-SA 4.0
License_URL:     https://example.com/license.html
---

Example Document
================

Document content goes here.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque in
convallis felis. Aenean id sodales est, sed aliquet lectus. Sed.
```

See the `example` directory for additional document examples.

Templates may include document metadata for display on rendered pages and embedding in syndicated feeds. See the `Templates` section for information on template tags.

### Markdown syntax

`marsh` supports all core Markdown syntax.

Reference:

- [Markdown syntax at Daring Fireball (original author)](https://daringfireball.net/projects/markdown/syntax)
- [Markdown help at commonmark.org](https://commonmark.org/help/)
- [Markdown Wikipedia article](https://en.wikipedia.org/wiki/Markdown)

### Markdown syntax extensions

#### Responsive images

`marsh` automatically detects the presence of responsive image variants following a simple file naming convention. Files with names matching the specified image and having `@2x`, `@3x`, etc. suffix before the file extension will be included in the HTML `srcset` attribute on the `img` element. This only applies to images specified using Markdown syntax.

Given the following source structure:

```text
images/
├─ image.png
├─ image@2x.png
└─ image@3x.png
index.markdown
```

The following Markdown image syntax:

```markdown
![Alternate text](images/image.png)
```

Becomes this HTML:

```html
<img src="images/image.png" srcset="images/image.png 1x,
  images/image@2x.png 2x, images/image@3x.png 3x" alt="Alternate text" />
```

#### Implicit figures

Markdown images with a title are treated as implicit figures. The title becomes the figure caption and the image is linked to itself:

The following Markdown image syntax:

```markdown
![Alternate text](image.png "Title/caption")
```

Becomes this HTML:

```html
<figure>
<a href="image.png">
<img src="image.png" srcset="image.png 1x" alt="Alternate text" />
</a>
<figcaption>Title/caption</figcaption>
</figure>
```

Automatic responsive images are supported within implicit figures.

#### Inserting HTML `<div>` elements with id or class attributes

Specially formatted HTML comments may be used to insert HTML `div` elements with `id` or `class` attributes. These elements may be used to wrap content for styling or other purposes.

The following Markdown document:

```html
<!-- #unique-thing -->

Contents will be wrapped in a div element with the id unique-thing.

<!-- /#unique-thing -->

<!-- .notice -->

Contents will be wrapped in a div element with the class name notice.

<!-- /.notice -->

<!-- .foo.bar -->

Contents will be wrapped in a div element with the class names foo and bar.

<!-- /.foo.bar -->
```

Becomes this HTML:

```html
<div id="unique-thing">
<p>Contents will be wrapped in a div element with the id unique-thing.</p>
</div><!-- end div#unique-thing -->

<div class="notice">
<p>Contents will be wrapped in a div element with the class name notice.</p>
</div><!-- end div.notice -->

<div class="foo bar">
<p>Contents will be wrapped in a div element with the class names foo and bar.</p>
</div><!-- end div.foo.bar -->
```

#### Discount extensions

In addition to its own extensions, `marsh` supports the Markdown syntax extensions supported by [Discount](https://www.pell.portland.or.us/~orc/Code/discount/) such as tables and fenced code blocks, which are common across many implementations.


Archives and syndication
------------------------

`marsh` can automatically generate archives of collections of documents, such as chronological news and blog posts, in HTML format and the web syndication formats [Atom](https://en.wikipedia.org/wiki/Atom_%28web_standard%29) and [JSON Feed](https://en.wikipedia.org/wiki/JSON_Feed).

This example build configuration:

```yaml
---
Build:
  Name: My Website
  Description: My website description
  URL: https://example.com
  Path: public
  Targets:
    - Name:   My Website
      Path:   .
      Source: source/*
      Template:
        Source: templates/example
    - Name:   Website news
      Path:   news
      Source: source/news
      Template:
        Source: templates/example
      Archives:
        - Name:      Latest News
          Path:      index.markdown
          Encoding:  html
          Count:     3
          Page_Size: 2
        - Name:      News Archive
          Path:      all/index.markdown
          Encoding:  html
        - Name:      News Feed
          Path:      feed.xml
          Encoding:  atom
          Count:     10
        - Name:      News Feed
          Path:      feed.json
          Encoding:  json
          Count:     10
...
```

Given the following source structure:

```text
source/
├─ news/
│  └─ 2026/
│     ├─ 01/
│     │  ├─ 01-news-item-one.markdown
│     │  └─ 02-news-item-two.markdown
│     └─ 02/
│        ├─ 01-news-item-three.markdown
│        └─ 02-news-item-four.markdown
├─ about.markdown
└─ index.markdown
```

Builds this site structure:

```text
public/
├─ news/
│  ├─ 2026/
│  │  ├─ 01/
│  │  │  ├─ 01-news-item-one.html
│  │  │  └─ 02-news-item-two.html
│  │  └─ 02/
│  │     ├─ 01-news-item-three.html
│  │     └─ 02-news-item-four.html
│  ├─ all/              <--
│  │  └─ index.html     <--
│  ├─ feed.json         <--
│  ├─ feed.xml          <--
│  ├─ index.html        <--
│  └─ page/             <--
│     ├─ 1/             <--
│     │  └─ index.html  <--
│     └─ 2/             <--
│        └─ index.html  <--
├─ about.html
└─ index.html
```

In this example, the `Latest News` HTML archive includes the latest three documents as specified by `Count`, limited to two per page as specified by the `Page_Size`. The generated document `public/news/index.html` is the canonical archive reference and first page, and additional pages are generated as documents in the numbered `page` subdirectories (the document `public/news/page/1/index.html` is essentially identical to the canonical page).

Only HTML archives support pagination, and if `Page_Size` is omitted, the `page` directories will not be created. Atom and JSON Feed archives do not support pagination and are generated as single files.

The `News Archive` HTML archive includes all documents and generates the document `public/news/all/index.html` as specified by `Path` in the archive configuration, further illustrating how multiple archives can be created from the same source content.

Generated archives do not affect the individual documents, which are still built as usual.

While `marsh` internally compiles the collection of documents to include in an archive, it relies on templating to generate the archive in the desired format. See the `Templates` section for more information. The template at `templates/example` provides partial template examples under `partials/archive`.


Templates
---------

Templates control how documents are rendered to become complete web pages with features like headers and navigation, as well as images, layout, and style. Templates also control how syndication feeds are rendered.

A `marsh` template is a directory containing a `template.yaml` configuration file and one or more partial template files, also known as partials. The template configuration declares the resources that `marsh` will use during rendering.

The smallest useful HTML template usually consists of `Base`, `Head`, and `Body` partials.

Given a minimal template directory structure like this:

```text
templates/
└─ my-template/
   ├─ template.yaml
   └─ partials/
      ├─ base.html
      ├─ body.html
      └─ head.html
```

The `template.yaml` configuration file should have the contents:

```yaml
---
Template:
  Partials:
    Base: partials/base.html
    Head: partials/head.html
    Body: partials/body.html
...
```

Partials paths are relative to the location of the configuration file.

See the `Advanced template usage` section and the template at `templates/example` for more information.

### Template tags

Template tags allow you to include information about a document, archive, or other metadata in the rendered output, and can be placed within partial templates wherever desired. Template tags are formatted using the name of the tag surrounded by double curly braces, e.g., `{{ document.title }}`. When building, `marsh` replaces these tags with their associated values, such as the title of the document according to its YAML frontmatter metadata.

Tag values come from three main sources:

- Generated metadata created by `marsh` itself.
- Recognized metadata defined in document frontmatter.
- Custom metadata defined in document frontmatter.

#### Generated metadata tags

Generated metadata is created by `marsh` itself. The names of these template tags are reserved and their values may not be overridden in document frontmatter.

- `site.rootpath`: Relative link from the current rendered page to the site root.
- `site.abspath`: Absolute path or URL for the site root.
- `target.rootpath`: Relative link from the current rendered page to the target root.
- `target.abspath`: Absolute path or URL for the target root.
- `target.sitemap`: Rendered sitemap markup for the current target. Empty where no sitemap document is configured or found.
- `archive.rootpath`: Relative link from the current archive page to the archive root directory. Empty for non-archive pages.
- `archive.abspath`: Absolute path or URL for the archive root directory. Empty for non-archive pages.
- `document.content`: Rendered content for the current page itself, or for archive pages, the embedded archive subdocument content.
- `document.href`: Relative link from the current rendered page to the current page itself, or for archive pages, the embedded archive subdocument.
- `document.uri`: Absolute path or URL for the current rendered page or archive subdocument. For directory-style page paths ending in `index.html`, `document.uri` is normalized to the directory form, e.g., `/news/index.html` becomes `/news/`.
- `document.page-uri`: Absolute path or URL for the current archive page.
- `document.page-canonical-uri`: Absolute path or URL for the canonical archive page.
- `document.page-first-uri`: Absolute path or URL for the first archive page.
- `document.page-prev-uri`: Absolute path or URL for the previous archive page.
- `document.page-next-uri`: Absolute path or URL for the next archive page.
- `document.page-last-uri`: Absolute path or URL for the last archive page.
- `document.page-href`: Relative link to the current archive page.
- `document.page-canonical-href`: Relative link to the canonical archive page.
- `document.page-first-href`: Relative link to the first archive page.
- `document.page-prev-href`: Relative link to the previous archive page.
- `document.page-next-href`: Relative link to the next archive page.
- `document.page-last-href`: Relative link to the last archive page.

Generated metadata tags are useful for rendering calculated paths, links, archive navigation, and embedded sitemap navigation. In general, use the `*-href` forms for HTML links inside rendered pages, and use the `*-uri` forms for canonical metadata, embedding in syndication feeds, and wherever absolute references are most appropriate.

#### Recognized document metadata tags

Recognized document metadata tags correspond to the metadata defined in the frontmatter for each document. The underlying variable representations for these tags may be used by `marsh` for internal purposes, hence "recognized".

Document tag names begin with `document.` and end with the name of the metadata field, lowercased and with underscores converted to dashes. For example, the document metadata field `Project_URL` may be referenced using the tag name `document.project-url`.

- `document.title`: The document title.
- `document.type`: The document type, such as `page`, `article`, `post`, or another user-defined type.
- `document.date`: The document date or timestamp.
- `document.language`: The document language name, such as `English`.
- `document.language-code`: The document language code, such as `en`.
- `document.authors`: The list of document authors.
- `document.copyright`: The copyright notice for the document.
- `document.credits-url`: A URL for credits or attribution information.
- `document.license`: The document license name.
- `document.license-abbr`: A short abbreviation for the document license.
- `document.license-url`: A URL for the document license.
- `document.project`: The project or site name associated with the document.
- `document.project-version`: The project or site version.
- `document.project-url`: A URL for the project or site.
- `document.redirect-url`: A redirect destination URL for redirect pages.
- `document.state`: The list of document state values, such as `draft` or `published`.

These tags are useful for a variety of purposes such as display on HTML pages and embedding in syndication feeds.

#### Custom document metadata tags

Custom document metadata may also be defined in a document's frontmatter and accessed in templates using `document.*` tags. Custom document metadata naming must not collide with generated metadata and related tags, and values must be plain text strings. Arrays/lists and other data types are not supported.

This example document frontmatter with custom metadata:

```yaml
---
Original_Language: English
Original_Language_Code: en
...
```

Makes these custom tags available for use in templates:

```text
{{ document.original-language }}
{{ document.original-language-code }}
```

Custom document metadata tags generally provide the same utility as recognized document metadata tags.

### Text transforms

Text transforms modify template tag values during rendering. A transform is added after a tag name using the pipe character.

Consider the following template tag:

```text
{{ document.title | slug }}
```

The `slug` text transform produces a URL-style text fragment, changing a document title such as "My favorite document" into "my-favorite-document".

Multiple transforms may be chained, and they are applied in order from left to right.

Useful transforms include:

- `date` and date format variants such as `date:rfc2822` and `date:rfc3339` for formatting document dates
- `trim` for removing leading and trailing whitespace
- `slug` for converting text into a simple URL-style slug
- `decode:entities` for decoding HTML entities
- `escape:html` and `escape:json-val` for safe HTML and JSON output
- `plaintext` for stripping HTML markup down to plain text
- `excerpt` and `excerpt-type:html` for generating short summaries, e.g., `excerpt:100` converts to plain text and limits to 100 characters

Item transforms are useful when working with list-style metadata such as `document.authors` and `document.state`:

- `items:join` renders values joined together using a delimiter, e.g., `items:join:,` produces "a,b,c"
- `items:join-type:oxford` renders values as a natural-language list, e.g., "a, b, and c"
- `items:json-array` renders values as JSON array items
- `items:wrap-type:xml` renders each value wrapped in XML tags, e.g., `items:wrap-type:xml:tag` produces `<tag>a</tag><tag>b</tag><tag>c</tag>`
- `items:wrap-type:html-style-link` renders each value as an HTML `<link rel="stylesheet" href="..." />` tag
- `items:wrap-type:html-script-src` renders each value as an HTML `<script src="..."></script>` tag

Heading transforms are useful in select cases:

- `headings:push`: Push headings down by one level (Markdown `#` becomes `##`, etc.)
- `headings:shift`: Shift headings up by one level (Markdown `##` becomes `#`, etc.)
- `headings:remove`: Remove headings entirely

Examples:

```text
{{ document.title | trim | slug }}
{{ document.date | date:rfc3339 }}
{{ document.authors | items:join-type:oxford }}
{{ document.content | excerpt:300:2 }}
{{ template.assets.scripts | items:wrap-type:html-script-src }}
```

Text transforms may be applied to recognized and custom document metadata tags, as well as rendered document content.


Advanced template usage
-----------------------

The `Templates` section above covers the minimum structure needed to begin rendering pages. `marsh` also provides additional template features for more advanced customization of site output.

These features are useful when you want to:

- Split a template into logical, modular components for ease of management and reuse
- Add stylesheets, scripts, fonts, images, or other assets to a template
- Embed a sitemap document on other pages for use as a reusable navigation section
- Customize an existing template using override files, instead of creating a new template from scratch
- Render specific archives using different templates and overrides
- Select specific document types or exclude specific document states from generated archives

The following subsections describe these advanced features in more detail.

### Template partials

Template configuration may define multiple partials for document page rendering, archive rendering, and special functions like redirecting one page to another.

The `Base` partial is required. Partials other than the `Base` partial may be inserted into other partials using template tags prefixed with `template.`.

The following is a list of recognized partials, their suggested use, and their associated template tags. See also `templates/example/template.yaml` for a comprehensive example template configuration.

#### HTML document partials

Building blocks for turning documents into complete web pages.

- `Base`: The required outer wrapper partial for documents. Has no template tag and may not be inserted into other partials.
- `Head`: The contents of the HTML `<head>` section for a rendered page. Inserted using `{{ template.head }}`.
- `Body`: The main body wrapper for a rendered page. Inserted using `{{ template.body }}`.
- `Document`: The document content wrapper for a rendered page. Inserted using `{{ template.document }}`.
- `Header`: A reusable page header partial. Inserted using `{{ template.header }}`.
- `Footer`: A reusable page footer partial. Inserted using `{{ template.footer }}`.
- `Nav`: A reusable navigation partial. Inserted using `{{ template.nav }}`.
- `Notice`: A reusable notice or aside partial. Inserted using `{{ template.notice }}`.

#### Special HTML document partials

Partials purpose-built to handle special situations.

- `Redirect`: A dedicated outer partial used when rendering redirect pages. Has no template tag and may not be inserted into other partials. Automatically selected by `marsh` where document frontmatter metadata includes `Redirect_URL`. Ideal contents are minimal HTML page markup with `<meta http-equiv="refresh" content="0; url={{ document.redirect-url }}">` in the HTML `<head>` section.

#### HTML archive partials

Archive-specific HTML partials supersede document partials, allowing you to render archive pages differently from the rest of your pages. Where an HTML archive partial is not specified, `marsh` uses the corresponding regular HTML document partial.

- `Archive.HTML.Base`: The outer wrapper for HTML archive pages. Has no template tag and may not be inserted into other partials.
- `Archive.HTML.Head`: Archive-specific head markup. Inserted using `{{ template.head }}` when rendering an HTML archive.
- `Archive.HTML.Body`: Archive-specific body wrapper. Inserted using `{{ template.body }}` when rendering an HTML archive.
- `Archive.HTML.Document`: Archive-specific document content wrapper. Inserted using `{{ template.document }}` when rendering an HTML archive.
- `Archive.HTML.Header`: Archive-specific header partial. Inserted using `{{ template.header }}` when rendering an HTML archive.
- `Archive.HTML.Footer`: Archive-specific footer partial. Inserted using `{{ template.footer }}` when rendering an HTML archive.
- `Archive.HTML.Nav`: Archive-specific navigation partial. Inserted using `{{ template.nav }}` when rendering an HTML archive.
- `Archive.HTML.Notice`: Archive-specific notice or aside partial. Inserted using `{{ template.notice }}` when rendering an HTML archive.

#### Atom archive partials

For rendering [Atom](https://en.wikipedia.org/wiki/Atom_%28web_standard%29) syndication feeds.

- `Archive.Atom.Base`: The required outer wrapper for the Atom feed. Has no template tag and may not be inserted into other partials.
- `Archive.Atom.Body`: The main body wrapper for the Atom feed. Inserted using `{{ template.body }}` when rendering an Atom archive.
- `Archive.Atom.Document`: The document content wrapper for rendering each Atom entry. Inserted using `{{ template.document }}` when rendering an Atom archive.

#### JSON archive partials

For rendering [JSON Feed](https://en.wikipedia.org/wiki/JSON_Feed) syndication feeds.

- `Archive.JSON.Base`: The required outer wrapper for the JSON Feed. Has no template tag and may not be inserted into other partials.
- `Archive.JSON.Body`: The main body wrapper for the JSON Feed. Inserted using `{{ template.body }}` when rendering a JSON Feed archive.
- `Archive.JSON.Document`: The document content wrapper for rendering each JSON Feed entry. Inserted using `{{ template.document }}` when rendering a JSON Feed archive.

#### Related generated template tags

In addition to the partial-specific `template.*` tags above, `marsh` provides generated template tags for template asset lists using the prefix `template.assets.`. Each tag resolves to a newline-delimited list of page-relative asset paths for the items in that asset category.

- `template.assets.fonts`: List of font assets.
- `template.assets.styles`: List of stylesheet assets.
- `template.assets.scripts`: List of script assets.
- `template.assets.images`: List of image assets.
- `template.assets.audio`: List of audio assets.
- `template.assets.video`: List of video assets.
- `template.assets.documents`: List of document assets such as PDF files.
- `template.assets.binaries`: List of binary assets such as ZIP files.
- `template.assets.other`: List of other non-specific types of assets.

### Template assets

Templates may declare static assets in `template.yaml`. These assets are copied into the build output along with the rendered documents for targets using the template.

Supported asset categories are:

- `Fonts`
- `Styles`
- `Scripts`
- `Images`
- `Audio`
- `Video`
- `Documents`
- `Binaries`
- `Other`

Paths are relative to the template directory.

Example template configuration with assets:

```yaml
---
Template:
  Partials:
    Base: partials/base.html
    Head: partials/head.html
    Body: partials/body.html
  Assets:
    Styles:
      - css/site.css
    Scripts:
      - js/site.js
    Images:
      - images/logo.png
...
```

In this example, the files `css/site.css`, `js/site.js`, and `images/logo.png` are copied from the template into the build output for the target.

You can reference any specific asset in a partial template by combining its path with generated metadata template tags. You can also reference the list of assets for any category by its associated template tag, and apply text transforms to customize how it is rendered. The following example demonstrates both types of asset inclusion in partials.

The following example partial:

```html
<!DOCTYPE html>
<html>
<head>
    {{ template.assets.styles | items:wrap-type:html-style-link }}
</head>
<body>
    <img class="logo" src="{{ site.rootpath }}images/logo.png" />
    {{ document.content }}
    {{ template.assets.scripts | items:wrap-type:html-script-src }}
</body>
</html>
```

Combined with the template configuration with assets above, this example partial would produce the following rendered output for a document one directory level below the root path:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="../css/site.css" />
</head>
<body>
    <img class="logo" src="../images/logo.png" />
    <!-- document contents included here -->
    <script src="../js/site.js"></script>
</body>
</html>
```

### Site map

Targets may define in the site build configuration a site map document, which is a normal document in your source tree that typically contains links to most or all of the other pages on your site, like a table of contents.

`marsh` builds a special version of the site map document and makes it available for embedding on other pages using the template tag `{{ target.sitemap }}`. Relative links are rewritten to be path-correct in relation to the individual pages on which the site map is embedded.

This is useful where you want a navigation structure to be derived from a source document and made reusable across multiple pages in the same target.

Example site build configuration specifying a site map source document using `Sitemap.Source`:

```yaml
---
Build:
  Targets:
    - Name: Example Site
      Path: .
      Source: source/*
      Sitemap:
        Source: site-map/index.markdown
...
```

You can also specify `Search: true` to treat the `Sitemap.Source` path as a lookup key, instead of an explicit path. With `Search: true`, `marsh` will find all documents in the target whose names match the lookup key, and for each document use the nearest matching site map within the target source tree. This essentially allows creating different site maps for different subdirectories, as long as the file names are the same.

Example site build configuration specifying a site map lookup key using `Sitemap.Source` paired with `Sitemap.Search: true`.

```yaml
---
Build:
  Targets:
    - Name: Example Site
      Path: docs
      Source: source/docs
      Sitemap:
        Source: sitemap.markdown
        Search: true
...
```

Note that the resolved path for a site map must remain inside the site source tree.

### Template overrides

A template override is an additional template configuration file that is applied in addition to the primary target template, allowing you to customize an existing template without creating a separate full template copy. Overrides are specified alongside the template specification in your site build configuration file (not the template configuration file).

Example site build configuration specifying a template and template override:

```yaml
---
Build:
  Targets:
    - Name: Example Site
      Path: .
      Source: source/*
      Template:
        Source: templates/example
        Overrides:
          - templates/example/template-overrides.yaml
...
```

Overrides are useful when you want to:

- Change one or more partial paths
- Remove a partial by setting its path to an empty string
- Filter or rewrite template asset paths without changing the base template

Example override file:

```yaml
---
Template:
  Partials:
    Footer: ""
  Filters:
    - Regex: /opensans/d
      Assets:
        - Fonts
        - Styles
...
```

This example override configuration modifies two things in relation to the primary template configuration:

- The footer partial is removed from the partials list by setting its path to an empty string
- Fonts or stylesheets with asset paths matching `opensans` are removed from the template asset lists

Overrides are best used as small customization layers on top of an existing template. Creating a separate template may be better where more extensive modifications are desired.

### Archive-specific templates and overrides

Archives may use the target's template configuration, or they may specify their own template source and overrides. This makes it possible for one target to render normal pages, HTML archives, and syndication feeds with different template behavior where needed.

Archive-level template configuration is specified inside the definition for each archive in the site build configuration:

```yaml
---
Build:
  Targets:
    - Name: Example Site News
      Path: news
      Source: source/news
      Template:
        Source: templates/example
      Archives:
        - Name: Latest News
          Path: index.markdown
          Root_Path: .
          Encoding: html
          Types: [ news ]
          Exclude_States: [ draft ]
          Template:
            Source: templates/archive-html
            Overrides:
              - templates/archive-html/custom.yaml
        - Name: News Feed
          Path: feed.xml
          Root_Path: .
          Encoding: atom
          Types: [ news ]
          Exclude_States: [ draft ]
...
```

In this example, the `Latest News` HTML archive uses its own archive template and override file separate from the target template.

Where an archive does not specify its own template, like the `News Feed` Atom syndication feed in this example, `marsh` uses the target template.

Values for `archive.rootpath` and `archive.abspath` template tags are derived from related archives as a group. Multiple archives that define the same `Types` and `Excluded_States` are considered related. Individual archives can override this behavior by specifying `Root_Path`. Archive root paths are relative to the target path.

Archive-specific template configuration is useful when you want to:

- Render HTML archive pages differently from normal documents and other archives for the same target
- Apply template overrides to a single archive without affecting the rest of the target

### Archive document selection and exclusion

Archives may also select which documents to include and how archive subdocument content is rendered:

- `Types` limits an archive to include only the specified document types
- `Exclude_States` omits documents with matching state values, such as `draft`

For example, an archive configuration might specify `Types: [ news ]` and `Exclude_States: [ draft ]` to include only published news documents.

### Redirect pages

Templates may also define a dedicated redirect partial. When a document provides redirect metadata, `marsh` can render that document using the redirect partial instead of the normal page partials.

The redirect destination is available in templates using the tag `document.redirect-url`.

This is useful for placeholder pages, moved content, or preserving older URLs while sending readers to a new location.


License
-------

Copyright 2026 Bradley Sepos  
Released under the MIT License. See [LICENSE](LICENSE) for details.
