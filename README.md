# JLang

### What is it?
JLang is a programming language made in javascript that i created
in an effort to better understand the process of parsing and
interpreting. This project includes:
* JLang Lexer:Simple lexer made using[aaditmshah's
lex library](https://github.com/aaditmshah/lexer) with some extra
analysis on top
* JLang Parser: A pratt parser based on[Douglas Crockford's
TDOP article](http://javascript.crockford.com/tdop/tdop.html)
* JLang Interpreter: Simple interpreter made to understand
the parsed tree.

### What the language already have?

* Variables ( contexts for each function and every context
has access to it's parent)
    * Variables can be numbers or strings
    * Numbers can be written as decimals or hexadecimals
* Functions ( Function calling, returning)
* Statements
    * If (with Else)
    * While (with Break)

* Basic Math Operations (sum, subtract, multiply, divide...)
* Logical Operations (and, or, bigger, smaller, bigger or equal...)
