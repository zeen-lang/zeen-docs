---
title: Operators
description: Binary, unary and overloadable operators with their interfaces.
---

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

```zn
struct Vector {
  pub x: f64,
  pub y: f64,
}

implement Copy : Vector {}

implement Add : Vector {
  fn add(self, other: Vector) Vector {
    return .{ .x = self.x + other.x, .y = self.y + other.y };
  }
}

implement Mul : Vector {
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

`&&`, `||` and `&` as address-of have no overload. Binary `&` still dispatches to `BitAnd`.

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
