Zehner
======

Zehner is an url fetcher like wget using node.js

## Usage

``` bash
$ node zehner.js -h
usage: zehner.js [-h] [-v] [-o DIR] [-p P] [--r1] [--r2] [--r3] URL

Zehner: A web crawler written in node.js.

Positional arguments:
  URL            the start url. Without any --r* flags only this url will be
                 fetched.

Optional arguments:
  -h, --help     Show this help message and exit.
  -v, --version  Show program's version number and exit.
  -o DIR         set the output directory [defaults to "."]
  -p P           download with CONNECTIONS in parallel [defaults to 5]
  --r1           limit recursive download to the sub directory of the initial
                 URL
  --r2           limit recursive download to host of the initial URL
  --r3           do not limit the recursive download
```

# Examples

* Download single file 
``` bash
$ node zehner.js http://www.example.com
```

* Dive into sub directories 
``` bash
$ node zehner.js -o output_dir --r1 http://www.example.com/some/path
```

* Fetch all references files from the host 
``` bash
$ node zehner.js -o output_dir --r2 http://www.example.com/some/path
```

* Fetch all references files from all hosts 
``` bash
$ node zehner.js -o output_dir --r3 http://www.example.com/some/path
```
