---
title: Constructs
description: Calls, blocks, conditionals and loops, including loop updates, else branches and labels.
---

Statements run in order inside a function body. This page covers the shapes a statement can take: calling something, grouping statements in a block, branching with `if`, looping with `while` and `for`, and leaving early with `return`, `break` and `continue`.

## Calls

A call names a callee and passes arguments in parentheses:

```zn
fn greet(name: []const char) {
  @println("hello, {}", name);
}

fn main() {
  greet("world");
}
```

A call is an expression when the callee returns a value:

```zn
fn double(x: i32) i32 {
  return x * 2;
}

fn main() {
  const twice = double(21);

  @println("{}", twice);
}
```

Constructors and methods use the same parentheses: `Person.new("ada")` calls a function inside an `implement` block, `person.name()` calls a method on a value. [Structures and Methods](/functions-closures/structures-and-methods/) covers both. A function value is called the same way:

```zn
fn foo(x: i32) void {
  @println("{}", x);
}

fn main() {
  const func: fn(i32) void = foo;

  func(123);
}
```

## Blocks

A block groups statements:

```zn
fn main() {
  {
    const a = 1;
    const b = 2;

    @println("{}", a + b);
  }

  @println("done");
}
```

Braces carry a second meaning in Zeen. In statement position `{ ... }` is a block, and in expression position it starts an array literal, so a block cannot be used as a value: `const a = { 123 };` builds a one element array. The function body is the only place where the last expression becomes the return value.

The semicolon after a block statement is optional. `if`, `while`, `for`, `switch` and a bare `{ ... }` do not need a `;`, and this page never writes one.

## Conditions

`if` takes a condition in parentheses and a body:

```zn
fn main() {
  const a = 5;

  if (a == 5) {
    @println("five");
  } else if (a == 6) {
    @println("six");
  } else {
    @println("other");
  }
}
```

The body can be a single statement without braces, and `else` adds the alternative:

```zn
fn main() {
  const a = 5;

  if (a == 5) @println("five") else @println("other");
}
```

`if` is an expression when both branches produce a value:

```zn
fn main() {
  const a = 5;
  const conditional = if (a == 5) 123 else 321;

  @println("{}", conditional);
}
```

`switch` is the multi-branch counterpart for more than two cases. [Switch](/functions-closures/switch/) covers patterns, ranges and enum arms.

## `while`

`while` repeats a body while a condition holds:

```zn
fn main() {
  let i: i32 = 0;

  while (i < 3) {
    @println("{}", i);

    i += 1;
  }
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
    }

    if (i == 5) {
      break;
    }

    sum += i;
  }

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
  }
}
```

`0..5` stops before the right bound and `0..=5` includes it. A bare integer walks the range up to that value:

```zn
fn main() {
  for (i : 5) {
    @println("{}", i);
  }
}
```

An array or a slice yields its elements. A struct that implements `Iterator` yields whatever `next` returns; [Iterators](/ownership-types/iterators/) covers that case.

```zn
fn main() {
  const items = {3, 7, 9};

  for (x : items) {
    @println("{}", x);
  }
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
    }
  } else {
    @println("not found");
  }
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
      }

      if (i == 2) {
        break :outer;
      }

      @println("{} {}", i, j);
    }
  }
}
```

`continue :outer` on a `while` runs that loop's update, and on a `for` it moves to the next element. An unlabeled `break` or `continue` targets the nearest loop. Duplicate labels on nested loops are `zeen::typechecker::duplicate_loop_label`, and an unknown one is `zeen::typechecker::unknown_loop_label`.

## Program flow

`return` leaves the current function, with a value when the function returns one:

```zn
fn answer() i32 {
  return 123 + 321 * 2;
}

fn main() {
  @println("{}", answer());
}
```

A function whose body ends with an expression returns that expression, so the same function can drop the keyword:

```zn
fn answer() i32 {
  123 + 321 * 2
}

fn main() {
  @println("{}", answer());
}
```

`break` leaves a loop and `continue` starts the next iteration:

```zn
fn main() {
  for (i : 10) {
    if (i == 6) {
      break;
    }

    if (i == 2) {
      continue;
    }

    @println("{}", i);
  }
}
```

`return` is a statement, so a `switch` arm that returns needs a body: `.Zero => { return 10; }` instead of `.Zero => return 10`.
