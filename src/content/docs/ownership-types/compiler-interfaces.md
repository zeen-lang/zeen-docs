---
title: Compiler Interfaces
description: Core interfaces for operators, formatting and iteration behavior.
---

Interfaces with compiler meaning live in `core`. They split by module.

## Ops

| Interface | Method | Meaning |
|---|---|---|
| `Copy` | — | marker: value copies on assign |
| `Clone` | `clone(*const self) Self` | explicit data clone |
| `Drop` | `drop(self) void` | cleanup at scope end |
| `Eq` | `eq(*const self, other: *const Self) bool` | `==` `!=` |
| `Ord` | `cmp(*const self, other: *const Self) Ordering` | `<`, `>`, `<=`, `>=` for generics |
| `Hash` | `hash(*const self) u64` | hash collections |
| `Add`/`Sub`/`Mul`/`Div`/`Mod` | `add`/`sub`/`mul`/`div`/`mod` | `+ - * / %` |
| `BitAnd`/`BitOr`/`BitXor` | `bit_and`/`bit_or`/`bit_xor` | `& \| ^` |
| `BitShl`/`BitShr` | `bit_shl`/`bit_shr` | `<< >>` |
| `BitNot`/`Neg`/`Not` | `bit_not`/`neg`/`not` | `~`/`-`/`!` |
| `Deref`/`DerefPtr` | `deref`/`deref_ptr` | `*expr` read / write |
| `Index`/`IndexPtr` | `index`/`index_ptr` | `expr[i]` read / write |

The operator interfaces take a `Rhs` parameter and an `Output` alias, so `Add[Rhs]` declares `fn add(self, other: Rhs) Output`. `Ordering` is `Less`, `Equal`, `Greater`.

## IO

| Interface | Method | Meaning |
|---|---|---|
| `StrWriter` | `write_str`/`write_str_raw`/`write_str_single` | format sink |
| `Display` | `display[T: StrWriter](*const self, out: *T) void` | `{}` |
| `Debug` | `debug[T: StrWriter](*const self, out: *T) void` | `{:?}`, `@dbg` |

`StrWriter` lives in `core.io`. `{}` calls `display` and `{:?}` calls `debug`, and each method writes into a generic writer. `OutStream` implements it for stdout and `String` implements it for `@format`, so one implementation serves both destinations. [Printing and Formatting](/language-basics/printing-formatting/) covers the specifiers.

## Iter

| Interface | Method | Meaning |
|---|---|---|
| `Iterator[T]` | `next(*self) Option[T]` | `for` over structs |
| `PtrIterator` | `iter(*const self) Iter` | borrow as iterator |
| `MutPtrIterator` | `iter_mut(*self) Iter` | borrow mutably as iterator |
| `OwnedIterator` | `into_iter(self) Iter` | consume as iterator |

`Iterator` also carries default adapters (`map`, `filter`, `take`, `skip`) and terminal methods (`count`, `fold`, `any`, `all`, `collect` and more). `PtrIterator`, `MutPtrIterator` and `OwnedIterator` each declare `alias Iter` and return an iterator value. [Iterators](/ownership-types/iterators/) covers the loop forms and the adapter list.
