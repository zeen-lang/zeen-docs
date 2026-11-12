---
title: Constructs
description: Calls, blocks, conditionals and loops, including loop updates, else branches and labels.
---

## Calls

A call names a callee and passes arguments in parentheses:

```zn
foo("hello");
@println("hello");
Foo.new("hello");
instance.method("hello");
```

A call is an expression when the callee returns a value. A function value is called the same way:

```zn
const func: fn(i32) void = foo;

func(123);
```

## Blocks

A block groups statements:

```zn
{
  let a = 1;
  let b = 2;

  @println("{}", a + b);
}
```

A block is not a general value. Inside an expression a leading `{` is an array literal, so `let a = { 123 };` builds a one element array. A function body is the exception: its trailing expression is the return value, and an explicit `return` works as well.

The trailing semicolon after `if`, `while`, `for`, `switch` or a bare block is optional inside a block.

## Conditions

`if` takes a condition and a body:

```zn
if (condition) {
  statements
}
```

The body can be one statement, and `else` adds the alternative:

```zn
if (a == 5) @println("five") else @println("other");
```

`if` is an expression, so it can produce a value. A chain of conditions uses `else if`:

```zn
fn main() {
  const a = 5;
  const conditional = if (a == 5) 123 else 321;

  if (conditional == 123) {
    @println("first");
  } else if (conditional == 321) {
    @println("second");
  } else {
    @println("other");
  };
}
```

`switch` is the multi-branch counterpart. [Switch](/functions-closures/switch/) covers patterns, ranges and enum arms.

## `while`

`while` repeats a body while a condition holds:

```zn
fn main() {
  let i: i32 = 0;

  while (i < 3) {
    @println("{}", i);

    i += 1;
  };
}
```

A while loop takes an optional update after a colon. The update runs after the body, and after `continue`, but not after `break`:

```zn
fn main() {
  let i: i32 = 0;
  let sum: i32 = 0;

  while (i < 6) : (i += 1) {
    if (i == 2) {
      continue;
    };

    if (i == 5) {
      break;
    };

    sum += i;
  };

  @println("{} {}", i, sum);
}
```

The order is condition, body, update, condition again. `continue` jumps to the update, `break` leaves the loop and skips it, and a normal end of the body also reaches the update.

The update is one assignment, compound assignment or expression without a semicolon. A declaration, `return`, `break`, `continue`, `if`, loop, `switch`, `comptime`, `fn` or block is `zeen::parser::unsupported_action`. The update sees the variables of the loop header, but not `let` bindings from the body.

## `for`

`for` walks a range, an array, a slice or a struct that implements `Iterator`:

```zn
fn main() {
  for (i : 0..=5) {
    @println("{}", i);
  };
}
```

`0..5` stops before the right bound and `0..=5` includes it. A bare integer walks the range up to that value:

```zn
for (i : 5) {
  @println("{}", i);
}
```

An array or a slice yields its elements. A struct that implements `Iterator` yields whatever `next` returns; [Iterators](/ownership-types/iterators/) covers that case.

```zn
fn main() {
  const items = {3, 7, 9};

  for (x : items) {
    @println("{}", x);
  };
}
```

## Loop else

`for` and `while` accept an optional `else` that runs only when the loop finishes on its own:

```zn
fn main() {
  const items = {3, 7, 9};
  const target = 4;

  for (x : items) {
    if (x == target) {
      @println("found");
      break;
    };
  } else {
    @println("not found");
  };
}
```

A `break` skips the `else`. `continue` does not: the loop keeps going and the `else` still runs at the natural end. The `else` is checked outside the loop, so `break` and `continue` inside it belong to the enclosing loop.

The `for` variable and body locals are not visible in the `else`. A `while (true)` without a `break` never reaches its `else`.

## Labels

A loop can carry a label, and `break` or `continue` can name it from a nested loop:

```zn
fn main() {
  outer: for (i : 0..3) {
    for (j : 0..3) {
      if (j == 1) {
        continue :outer;
      };

      if (i == 2) {
        break :outer;
      };

      @println("{} {}", i, j);
    };
  };
}
```

`continue :outer` on a `while` runs that loop's update, and on a `for` it moves to the next element. An unlabeled `break` or `continue` targets the nearest loop.

## Program flow

`return` leaves the current function, with a value when the function returns one:

```zn
fn answer() i32 {
  return 123 + 321 * 2;
}
```

A function whose body ends with an expression returns that expression, so the same function can drop the keyword:

```zn
fn answer() i32 {
  123 + 321 * 2
}
```

`break` leaves a loop and `continue` starts the next iteration:

```zn
fn main() {
  for (i : 10) {
    if (i == 6) {
      break;
    };

    if (i == 2) {
      continue;
    };

    @println("{}", i);
  };
}
```

`return` is a statement, so a `switch` arm that returns needs a body: `.Zero => { return 10; }` instead of `.Zero => return 10`.
