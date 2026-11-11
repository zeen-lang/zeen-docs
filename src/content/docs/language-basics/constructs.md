---
title: Constructs
description: Statements and expressions for calls, blocks, conditionals and loops.
---

This page describes the main Zeen statements and expressions used to control program flow.
They might be familiar for you from other languages.

## Basic

### Calls
Calls can be function calls, method calls or macro calls, and a call can be an expression that returns a value. <br/>
Syntax:
```zn
callee(args)
```

Possible callees:
```zn
// function call
foo("hello");

// compiler macro call
@println("hello");

// struct static call
Foo.new("hello")

// struct instance (method) call
foo_instance.func("hello")

// indirect call
let func: fn(i32) void = foo;
func(123);
```

### Blocks
Blocks can be a small execution context inside a statement, or an expression with a return value.<br/>
Syntax:
```zn
{
  statements
}
```

:::note[Remember that]
To return value from **block** use only **trailing expression return**:
```zn
let a = {
  // code before return
  123
};
```
Usage of `return` keyword will lead to return from function.
:::

The trailing semicolon after `if` / `while` / `for` / bare block is optional.

## Conditional Constructions
Conditional constructions are the statements that let you pick a branch based on a condition result.

### `If` / `If-Else`
Syntax:
```zn
if (condition) expression
if (condition) { statements }

if (condition) expression else expression
if (condition) { statements } else { statements }
```

The `if` construction is an **expression**, which means you can use it to assign a variable conditionally,
or chain it to get the `else if` variation:
```zn
let a = 5;
let conditional = if (a == 5) 123 else 321;

if (conditional == 123) {
  // ...
} else if (conditional == 321) {
  // ...
} else {
  // ...
}
```

### `Switch`
Example:
```zn
fn main() {
  let value = 123;

  switch (value) {
    1 => @println("this is one!"),
    2 => @println("not exactly one"),

    val if (val > 500) => @println("woah, very big!"),
    _ if (0 == 1) => @println("wth is this"),

    _ => @println("Seems like something else"),
  };
}
```

Full description in the [Switch](/functions-closures/switch/) topic.

## Loops
Loops are constructions that repeat a block of statements while a condition holds.

### `While`
Syntax:
```zn
while (condition) expression
while (condition) { statements }
```

Example:
```zn
fn main() {
  let i = 0;

  while (i < 10) {
    @println("{}", i);

    i += 1;
  }

  @println("loop ended");
}
```

### `For`
Syntax:
```zn
for (varname : iterator) expression
for (varname : iterator) { statements }
```

Supported iterators types:
```zn
// integer signed types
i8 i16 i32 i64 isize

// integer unsigned types
u8 u16 u32 u64 usize

// array types
[N]T

// slice types
[]T

// structs with Iterator
```

Example:
```zn
for (i : 10) {
  @println("{}", i);
}
```

## Program Flow Controllers

### `return`
Returns provided expression value for current function. <br/>
Syntax:
```zn
return; // empty/void return
return expression; // expression return
```

Example:
```zn
fn foo() i32 {
  return 123 + 321 * 2;
}
```

### `break`
Breaks current loop execution and returns to the branch after the loop. <br/>
Syntax:
```zn
break;
```

Example:
```zn
for (i : 10) {
  if (i == 6)
    break;
}
```

### `continue`
Skips current loop iteration and returns to the loop condition. <br/>
Syntax:
```zn
continue;
```
