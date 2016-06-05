# JLang

### What is it?
JLang is a programming language made in javascript that i created
in an effort to better understand the process of parsing and
interpreting. This project includes:
* JLang Lexer:Simple lexer made using[aaditmshah's
lex library](https://github.com/aaditmshah/lexer)
* JLang Parser: A pratt parser based on[Douglas Crockford's
TDOP article](http://javascript.crockford.com/tdop/tdop.html)
* JLang Interpreter: Simple interpreter made to understand
the parsed tree.

### What the language already have?

* Variables
```
    var int = 0;
    var str = "Hello World";
    var hex = 0x123ABC;
```

* Functions
```
    func isEven num {
        ret num % 2;
    }
```

* If Statement
```
    if isEven(2) === true {

    } else {
        /* Do other thing */
    }
```