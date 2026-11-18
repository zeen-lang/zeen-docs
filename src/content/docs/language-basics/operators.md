---
title: Operators
description: Binary, unary and overloadable operators with their interfaces.
---

Operators are syntax that dispatches to a method. Every builtin type already has the methods behind `+`, `==` and the rest, so arithmetic works out of the box. A struct gets the same operators once it implements the matching interface, which is how `a + b` can mean something for a vector type. The interfaces themselves are covered in [Interfaces](/functions-closures/interfaces/).

## Binary operators

| Operator | Interface | Description |
|----------|-----------|-------------|
| `+` | `Add` | addition |
| `-` | `Sub` | subtraction |
| `*` | `Mul` | multiplication |
| `/` | `Div` | division, a zero divisor panics |
| `%` | `Mod` | remainder, a zero divisor panics |
| `==` | `Eq` | equality |
| `!=` | `Eq` | negated equality |
| `<` | `Ord` | left is less than right |
| `>` | `Ord` | left is greater than right |
| `<=` | `Ord` | left is less than or equal to right |
| `>=` | `Ord` | left is greater than or equal to right |
| `&&` | - | logical AND |
| `\|\|` | - | logical OR |
| `&` | `BitAnd` | bitwise AND |
| `\|` | `BitOr` | bitwise OR |
| `^` | `BitXor` | bitwise XOR |
| `<<` | `BitShl` | shift left |
| `>>` | `BitShr` | shift right |

`&&` and `||` short-circuit: the right side is skipped when the left side already decides the result.

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

Only the third line prints `right`, because the first two stop at the left operand. This makes a guard such as `ptr != nullptr && *ptr == 1` safe.

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

Floats keep their IEEE behavior for the operators: a NaN makes every comparison `false`, while `Ord::cmp` treats it as `Equal`.

## Overloading

An operator dispatches to an interface method when the left operand is a struct, enum or generic parameter with that bound:

| Operator | Interface | Method |
|----------|-----------|--------|
| `+` | `Add` | `add` |
| `-` | `Sub` | `sub` |
| `*` | `Mul` | `mul` |
| `/` | `Div` | `div` |
| `%` | `Mod` | `mod` |
| `==` `!=` | `Eq` | `eq` |
| `<` `>` `<=` `>=` | `Ord` | `cmp` |
| `&` | `BitAnd` | `bit_and` |
| `\|` | `BitOr` | `bit_or` |
| `^` | `BitXor` | `bit_xor` |
| `<<` | `BitShl` | `bit_shl` |
| `>>` | `BitShr` | `bit_shr` |
| `-EXPR` | `Neg` | `neg` |
| `!EXPR` | `Not` | `not` |
| `~EXPR` | `BitNot` | `bit_not` |
| `*EXPR` | `Deref` | `deref` |
| `*EXPR = value` | `DerefPtr` | `deref_ptr` |
| `EXPR[index]` | `Index` | `index` |
| `EXPR[index] = value` | `IndexPtr` | `index_ptr` |

The arithmetic interfaces take a parameter for the right-hand side, and `Output` for the result. Both are part of the contract:

```zn
struct Meters {
  pub value: f64,
}

implement Add[Meters] : Meters {
  alias Output = Meters;

  fn add(self, other: Meters) Meters {
    return .{ .value = self.value + other.value };
  }
}

implement Mul[f64] : Meters {
  alias Output = Meters;

  fn mul(self, scale: f64) Meters {
    return .{ .value = self.value * scale };
  }
}

fn main() {
  const a: Meters = .{ .value = 1.5 };
  const b: Meters = .{ .value = 2.5 };

  @println("{} {}", (a + b).value, (a * 2.0).value);
}
```

`Add[Meters]` names the right-hand side type, so `a + b` is accepted only when `b` is a `Meters`. `Mul[f64]` accepts a float on the right and still returns `Meters`. `Add`, `Sub`, `Mul`, `Div` and `Mod` default `Output` to `Self`, which is why the alias can be left out when the result type matches. `Index` and the rest have no default, and the implementation must name `Output`.

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

`&&`, `||` and `&` as address-of have no overload. Binary `&` still dispatches to `BitAnd`.

### A worked example

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

`implement Copy : Vector {}` matters here. `+` takes its left operand by value, so without `Copy` the expression moves `a`, and the next line reports `zeen::dataflow::use_after_move`. Marking the struct `Copy` makes each operator call take a copy instead. [Move Semantics](/ownership-types/move-semantics/) explains when that is safe and when it hides a real move.

## Unary operators

| Operator | Interface | Description |
|----------|-----------|-------------|
| `-EXPR` | `Neg` | negate |
| `!EXPR` | `Not` | logical NOT |
| `~EXPR` | `BitNot` | bitwise NOT |
| `*EXPR` | `Deref` | dereference a pointer |
| `&EXPR` | - | address of a place, yields `*T` |

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
