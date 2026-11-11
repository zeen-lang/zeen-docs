---
title: Constant Literals
description: Compile time literals for numbers, strings, chars and arrays.
---

A constant literal is compile-time data you set in your code. <br/>
Zeen supports 8 types of literals: **integer, float, boolean, char, byte-char, str, raw-str, array**.

## Integer Literals
There are 4 numerical systems supported by the compiler: decimal, hexadecimal, binary, octal. <br/>
Besides that language allows you to use `_` separator for big numbers (idea taken from Rust).

Example:
```zn
/* 6 WAYS TO WRITE "1000" */

1000 // decimal
1_000 // decimal with separator
0b111110100 // binary
0x3E8 // hexadecimal uppercase
0x3e8 // hexadecimal lowercase
0o1750 // octal
```

Default integer literal type is `i32`.

A literal takes its type from the context around it: an annotation, a call parameter or `@as`. The value must fit that type, otherwise the compiler reports `zeen::typechecker::int_literal_out_of_range`.

Valid:
```zn
let a: i32 = 123;
let b: i64 = 9223372036854775807;
```

Does not fit `i32`:
```zn
let c: i32 = 9223372036854775807;
```

A literal that does not fit `i64` at all is rejected by the lexer with `zeen::parser::invalid_literal`:
```zn
let d: i64 = 9300000000000000000;
```

## Float Literals
Float (or floating point numbers) are the same with other languages.

Example:
```zn
1.0 // default number
1. // same number but shorter
3.1415926535897932384626 // big number
```

Default float literal type is `f64`.

## Boolean Literals
Boolean constants are keywords with specified type. <br/>
Keywords to use:
```zn
true, false
```

Boolean literal type is `bool`.

## Char
A _char_ is essentially an unsigned 1-byte integer that contains symbol representation inside. <br/>
To define char use single quote:
```zn
'a', '\n'
```

Character literal type is `char`.

## Byte Char
Byte character literal is similar as _char_, but it returns `u8` (unsigned 1 byte integer) type. <br/>
Usage:
```zn
b'a', b'\n'
```

## String
Strings in Zeen may seem familiar like in C programming language. <br/>
Core mechanics are similar: string literal ends with '\0' terminator.

To define string use double quotes:
```zn
"Hello, World!"
"Привет, Мир!"
"Xin Chào, Thế Giới!"
```

String literals use array type `[N + 1]char` (N chars + 1 for null terminator) and convert implicitly to `[]const char`.

## Raw String
Raw strings are just another way to bake your string in source code and tell compiler where to stop. <br/>
It starts with `r#"` and ends with `"#`, that allows user to use any other symbols in this literal.

```zn
r#"
String literal,
still string,
we can even use "double quotes"
ends only now
"#
```

## Array
An array is a basic collection of ordered data in memory with a compile-time known size. <br/>
To define array use brackets:
```zn
[1, 2, 3, 4]
```

The array type is `[N]T` (example above is `[4]i32`)

Fast init with repeated value:
```zn
[0; 1024]
```

Type of example above is `[1024]i32`
