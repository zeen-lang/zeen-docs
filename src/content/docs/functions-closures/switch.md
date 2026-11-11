---
title: Switch
description: Pattern matching over values, ranges, strings, binds and enum variants.
---

A switch picks the first matching arm, from top to bottom.

An arm can be:

- a value: `123 => ...`
- several values: `1 | 2 => ...`
- a bind: `value => ...`
- a bind with guard: `value if (value > 0) => ...`
- a wildcard: `_ => ...`
- a wildcard with guard: `_ if (ready) => ...`

```zn
let answer = 123;

let points = switch (answer) {
  123 => 444,
  _ => -1,
};
```

## Values
Bools and chars match the same way:
```zn
let flag = true;

let code = switch (flag) {
  true => 10,
  false => 20,
};

let letter = 'x';

let group = switch (letter) {
  'a' | 'b' | 'x' => 7,
  _ => 8,
};
```

## Strings
String literals and slices match by content:
```zn
let name = "mealet";

let id = switch (name) {
  "hello" => 1,
  "mealet" => 2,
  _ => 0,
};
```

## Ranges
Ranges match inclusive-exclusive intervals, chars included. Ranges combine with `|` like plain values:
```zn
let level = 12;

let tier = switch (level) {
  0..5 | 10..15 => 1,
  20 | 25..30 => 2,
  _ => 0,
};

let index = 'm';

let kind = switch (index) {
  'a'..='z' => 100,
  'A'..='Z' => 200,
  _ => 300,
};
```

## Binds and Guards
An arm binds the scrutinee to a name, with an optional guard after it. A wildcard arm binds nothing, `_ if` checks only the guard. `return` is a statement, so returning arms need `{ }` blocks.
```zn
let score = 500;

let bonus = switch (score) {
  value if (value > 999) => 1050,
  value => value + 1,
};
```

## Enums
Enum arms name the variant with a dot. Payload variants bind the payload, guards can check it. A wildcard catches the rest.
```zn
enum Shape {
  dot,
  rect: i32,
}

let shape = Shape.rect(5);

let area = switch (shape) {
  .dot => 0,
  .rect(side) if (side > 100) => 100,
  .rect(side) => side,
};
```

With `&` the arm binds a pointer into the value instead of moving it out. `&_` discards:
```zn
switch (shape) {
  .rect(&side) => @println("side: {}", *side),
  _ => @println("other"),
};
```

Bare `_` as a payload binding moves the payload into a dead local and drops it. For a non-`Copy` payload this is a hard error (`zeen::mir::discard_drop_payload`), use `&_` instead.

## Statement Position
A switch works as a statement too:
```zn
switch (answer) {
  123 => @println("found"),
  _ => @println("missing"),
};
```
