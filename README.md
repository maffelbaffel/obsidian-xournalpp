# Xournalpp Obsidian Plugin

This plugin integrates Xournalpp files into Obsidian.
Link Xournalpp `.xopp` files and display a preview of your notes into your Markdown files.

## Requirements
Requires Xournalpp to be installed. To check if xournalpp is installed on your system execute `xournalpp --version`. Output shopuld be similar to 
```
$ xournalpp --version
xournalpp 1.1.3+dev (nogitfound)
└──libgtk: 3.24.34
```

## Usage
Create a `xournalpp` code block that contains a link to your `note.xopp` in your vault. 
````markdown
```xournalpp
link/to/note.xopp
```
````

This will start an PNG export of `link/to/note.xopp` to `link/to/note.png` and display that PNG as preview.

## Options
There are several optional parameters to customize the preview.
````markdown
```xournalpp
link/to/note.xopp
width: 100
height: 100
pages: 2
```
````

- width: Width of the exported PNG. 
- height: Height of the exported PNG. Ignored if `width` is used
- pages: Only export the pages specified (e.g. "2-3,5,7-"). Currently only one page is supported.
