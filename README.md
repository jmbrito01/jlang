# JLang

### What is it?
JLang is a programming language made in javascript that i created
in an effort to better understand the process of parsing and
interpreting. This project includes:
* JLang Lexer:Simple lexer made using [aaditmshah's
lex library](https://github.com/aaditmshah/lexer) with some extra
analysis on top
* JLang Parser: A pratt parser based on [Douglas Crockford's
TDOP article](http://javascript.crockford.com/tdop/tdop.html)
* JLang Interpreter: Simple interpreter made to understand
the parsed tree.

### What the language already have?

* Variables ( contexts for each function and every context
has access to it's parent)
    * Variables can be numbers or strings
    * Numbers can be written as decimals or hexadecimals
* Functions ( Function calling, returning, this object)
* Statements
    * If (with Else)
    * While (with Break)

* Basic Math Operations (sum, subtract, multiply, divide...)
* Logical Operations (and, or, bigger, smaller, bigger or equal...)
* Standard modules and functions (such as `console.log`)


### License
The MIT License (MIT)
Copyright (c) <year> <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.