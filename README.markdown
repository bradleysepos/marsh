marsh
=====

marsh is a Bash script for building static websites using Markdown.


Requirements
------------

- BSD/Linux/macOS or similar
- Bash shell
- awk, grep, sed, git
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

```
marsh build [config_file]
```

Where `config_file` is the path to the build configuration file for your site. If not specified, `marsh` defaults to using the `marsh-config.yaml` file in the current working directory.

Output is written to the path defined in the build configuration file, e.g., "public".

If you have GNU parallel installed, `marsh` will build multiple documents simultaneously for speed. The number of concurrent jobs can be specified using the `-j` or `--jobs` parameters, default being the number of logical processors available on your machine.

```
marsh build -j 4
```

You can specify the location for the (Discount) `markdown` application using the `--markdown` parameter, useful if the installation location is not in your `PATH`.

```
marsh build --markdown="/path/to/markdown"
```

Full usage:

```
marsh --help
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
      Templates:
        - Source: templates/default
...
```

See the `example` directory for a more extensive configuration.


Documents
---------

### File types

The main document format is [Markdown](https://en.wikipedia.org/wiki/Markdown) and may use any of the following file extensions:

- .markdown
- .md
- .mkd
- .mkdn
- .mdown

Markdown documents are converted to HTML pages and saved to the paths specified in the build configuration.

Files of other types and file extensions are copied as-is to the paths specified in the build configuration.

### Markdown document format

Markdown documents may begin with [YAML](https://en.wikipedia.org/wiki/YAML) frontmatter containing metadata such as title, author, and license information. This allows documents to be self-describing, and templates can include this information for display (see the Templates section that follows).

Example:

```
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

```
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
      Templates:
        - Source: templates/default
    - Name:   Website news
      Path:   news
      Source: source/news
      Templates:
          Source: templates/default
      Archives:
        - Name:     Latest News
          Path:     index.markdown
          Count:    3
        - Name:     News Feed
          Path:     feed.xml
          Encoding: atom
          Count:    10
        - Name:     News Feed
          Path:     feed.json
          Encoding: json
          Count:    10
...
```

Given the following source structure:

```
source/
├─ news/
│  └─ 2026/
│     ├─ 01/
│     │  ├─ 01-news-item-one.markdown
│     │  └─ 02-news-item-two.markdown
│     └─ 02/
│        └─ 01-news-item-three.markdown
├─ about.markdown
└─ index.markdown
```

Builds this site structure:

```
public/
├─ news/
│  ├─ 2026/
│  │  ├─ 01/
│  │  │  ├─ 01-news-item-one.html
│  │  │  └─ 02-news-item-two.html
│  │  └─ 02
│  │     └─ 01-news-item-three.html
│  ├─ feed.json   <--
│  ├─ feed.xml    <--
│  └─ index.html  <--
├─ about.html
└─ index.html
```

While `marsh` internally compiles the collection of documents, it relies on templating to generate archives in the appropriate formats. The default template at `templates/default` provides partial templates for these formats under `partials/archive`.


Templates
---------

TODO. See the default template at `templates/default` for an example.


License
-------

Copyright 2026 Bradley Sepos  
Released under the MIT License. See [LICENSE](LICENSE) for details.
