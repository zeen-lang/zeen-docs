---
title: Operators
description: Binary, unary and overloadable operators with their interfaces.
---

Operators are syntax that dispatches to a method. Every builtin type already has the methods behind `+`, `==` and the rest, so arithmetic works out of the box. A struct gets the same operators once it implements the matching interface, which is how `a + b` can mean something for a vector type. [Interfaces](/functions-closures/interfaces/) covers the interfaces themselves.

## Operators and methods

| Operator | Interface | Method | Notes |
|---|---|---|---|
| `+` | `Add` | `add` | addition |
| `-` | `Sub` | `sub` | subtraction |
| `*` | `Mul` | `mul` | multiplication |
| `/` | `Div` | `div` | division, a zero divisor panics |
| `%` | `Mod` | `mod` | remainder, a zero divisor panics |
| `==` | `Eq` | `eq` | equality |
| `!=` | `Eq` | `eq` | negated equality |
| `<` | `Ord` | `cmp` | less than |
| `>` | `Ord` | `cmp` | greater than |
| `<=` | `Ord` | `cmp` | less than or equal |
| `>=` | `Ord` | `cmp` | greater than or equal |
| `&&` | - | - | logical AND, short-circuit |
| `\|\|` | - | - | logical OR, short-circuit |
| `&` | `BitAnd` | `bit_and` | bitwise AND |
| `\|` | `BitOr` | `bit_or` | bitwise OR |
| `^` | `BitXor` | `bit_xor` | bitwise XOR |
| `<<` | `BitShl` | `bit_shl` | shift left |
| `>>` | `BitShr` | `bit_shr` | shift right |
| `-EXPR` | `Neg` | `neg` | negation |
| `!EXPR` | `Not` | `not` | logical NOT |
| `~EXPR` | `BitNot` | `bit_not` | bitwise NOT |
| `*EXPR` | `Deref` | `deref` | read through a pointer |
| `*EXPR = value` | `DerefPtr` | `deref_ptr` | write through a pointer |
| `EXPR[index]` | `Index` | `index` | indexing |
| `EXPR[index] = value` | `IndexPtr` | `index_ptr` | indexed write |
| `&EXPR` | - | - | address of a place, yields `*T` |

`&&`, `||` and address-of `&` have no overload. Short-circuit means the right side is skipped when the left side already decides the result:

```zn
fn side(tag: []const char, value: bool) bool {
  @println("{}", tag);
  return value;
}

fn main() {
  @println("{}", false && side("right", true));
  @println("{}", true || side("right", false));
  @println("{}", true && side("right", true));
}
```

Only the third line prints `right`. A guard such as `ptr != nullptr && *ptr == 1` depends on that.

Signed and unsigned integers wrap on overflow. `/` and `%` panic on a zero divisor in Debug, and a float division by zero yields infinity.

## Comparison

`<`, `>`, `<=` and `>=` use `Ord::cmp` for structs, enums and generic parameters bound by `Ord`. `==` and `!=` use `Eq`, and fall back to `Ord::cmp` when the type implements only `Ord`:

```zn
struct Version {
  pub major: i32,
  pub minor: i32,
}

implement Ord : Version {
  fn cmp(*const self, other: *const Version) Ordering {
    if (self.major < other.major) {
      return Ordering.Less;
    };

    if (self.major > other.major) {
      return Ordering.Greater;
    };

    if (self.minor < other.minor) {
      return Ordering.Less;
    };

    if (self.minor > other.minor) {
      return Ordering.Greater;
    };

    return Ordering.Equal;
  }
}

fn main() {
  const a: Version = .{ .major = 1, .minor = 2 };
  const b: Version = .{ .major = 2, .minor = 0 };

  @println("{} {} {}", a < b, a > b, a == b);
}
```

The ordering operators work inside a generic function too. `T: Ord` is enough for all four, and `T: Eq` for `==` and `!=`:

```zn
fn maximum[T: Ord](a: T, b: T) T {
  if (a < b) {
    return b;
  };

  return a;
}

fn main() {
  @println("{} {}", maximum(3, 9), maximum('a', 'z'));
}
```

Floats keep their IEEE behavior: a NaN makes every comparison `false`, while `Ord::cmp` treats it as `Equal`.

## Overloading

An operator dispatches to the interface method when the left operand is a struct, enum or generic parameter with that bound. The arithmetic interfaces take the right-hand side as a parameter, and `Output` as the result:

```zn
struct Vector {
  pub x: f64,
  pub y: f64,
}

implement Copy : Vector {}

implement Add[Vector] : Vector {
  alias Output = Vector;

  fn add(self, other: Vector) Vector {
    return .{ .x = self.x + other.x, .y = self.y + other.y };
  }
}

implement Mul[f64] : Vector {
  alias Output = Vector;

  fn mul(self, scale: f64) Vector {
    return .{ .x = self.x * scale, .y = self.y * scale };
  }
}

fn main() {
  const a: Vector = .{ .x = 1.0, .y = 2.0 };
  const b: Vector = .{ .x = 3.0, .y = 4.0 };
  const sum = a + b;
  const scaled = a * 2.0;

  @println("{:.1} {:.1}", sum.x, scaled.y);
}
```

`Add[Vector]` names the right-hand side type, so `a + b` is accepted only when `b` is a `Vector`. `Mul[f64]` takes a float and still returns a `Vector`. `Add`, `Sub`, `Mul`, `Div` and `Mod` default `Output` to `Self`, so the alias can be left out when the result type matches; `Index` and the rest have no default and must name it.

`implement Copy : Vector {}` matters here: `+` takes its left operand by value, so without `Copy` the expression moves `a` and the next line reports `zeen::dataflow::use_after_move`. Marking the struct `Copy` makes each operator call take a copy instead. [Move Semantics](/ownership-types/move-semantics/) explains when that is safe and when it hides a real move.

## Indexing

`Index` and `IndexPtr` cover reading and writing through `[]` on a custom type:

```zn
struct Grid {
  pub cells: [4]i32,
}

implement Index : Grid {
  alias Output = i32;

  fn index(*const self, i: usize) i32 {
    return self.cells[i];
  }
}

implement IndexPtr : Grid {
  alias Output = i32;

  fn index_ptr(*self, i: usize) *i32 {
    return &self.cells[i];
  }
}

fn main() {
  let grid: Grid = .{ .cells = {1, 2, 3, 4} };

  @println("{}", grid[2]);

  grid[2] = 9;

  @println("{}", grid[2]);
}
```

## Unary

```zn
fn main() {
  const n: i32 = 5;
  const negative = -n;
  const inverted = ~n;
  const flag = !true;
  const p: *const i32 = &n;

  @println("{} {} {} {}", negative, inverted, flag, *p);
}
```

`&` needs a place such as a binding or a field. `*` on a pointer reads the value, and writing through the pointer needs a mutable `*T`.
