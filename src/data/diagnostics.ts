export type Severity = 'error' | 'warning';

export type Stage =
  | 'zeen-parser'
  | 'zeen-resolve'
  | 'zeen-typecheck'
  | 'zeen-comptime'
  | 'zeen-dataflow'
  | 'zeen-mir'
  | 'zeen-codegen';

export interface Diagnostic {
  code: string;
  severity: Severity;
  stage: Stage;
  message: string;
  help?: string;
  example?: string;
}

export const diagnostics: Diagnostic[] = [
  /* ============ Parser ============ */
  {
    code: 'zeen::parser::expected_token',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The parser expected a different token here.',
    help: 'Finish the expression or statement, or remove the stray token.',
    example: `fn main() {
  const total: i32 = 1
}`,
  },
  {
    code: 'zeen::parser::fn_closure_removed',
    severity: 'error',
    stage: 'zeen-parser',
    message: '`fn` does not start a closure literal.',
    help: 'Write `|params| body` instead of `fn() T { ... }`.',
    example: `fn main() {
  const f = || -> i32 { return 1; };
}`,
  },
  {
    code: 'zeen::parser::invalid_character_escape',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The character escape inside a char literal is not valid.',
    help: 'Use a supported escape such as `\\n`, `\\t`, `\\\\`, `\\\'`, or `\\0`.',
    example: `fn main() {
  const letter: char = '\\q';
}`,
  },
  {
    code: 'zeen::parser::invalid_literal',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The numeric literal is malformed or too large to parse.',
    help: 'Write the literal in a supported form (decimal, hex `0x`, octal `0o`, binary `0b`).',
    example: `fn main() {
  const x = 99999999999999999999999;
}`,
  },
  {
    code: 'zeen::parser::syntax_error',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The input is not valid Zeen syntax at this position.',
    help: 'Check punctuation, braces and keywords around the reported spot.',
    example: `fn helper();

fn main() {}`,
  },
  {
    code: 'zeen::parser::unexpected_eof',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The file ended before the construct was closed.',
    help: 'Close the open brace, parenthesis or string literal.',
    example: `fn main() {`,
  },
  {
    code: 'zeen::parser::unknown_expression',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The parser cannot build an expression or a top-level declaration from these tokens.',
    help: 'Finish the expression or declaration, or remove the stray operator or separator.',
    example: `fn main() {
  const total: i32 = ;
}`,
  },
  {
    code: 'zeen::parser::unknown_token',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'An unknown token was found where an expression was expected.',
    help: 'Remove the invalid character or operator.',
    example: `fn main() {
  const x = 1 \\ 2;
}`,
  },
  {
    code: 'zeen::parser::unknown_type',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The type name in this position is not known.',
    help: 'Check the type spelling, or import the module that defines it.',
    example: `fn main() {
  const x: ? = 1;
}`,
  },
  {
    code: 'zeen::parser::unsupported_action',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'This language action is not supported yet.',
    help: 'Rewrite the construct using supported syntax.',
    example: `outer: if (true) {
  @println("x");
}`,
  },
  {
    code: 'zeen::parser::unterminated_block_comment',
    severity: 'error',
    stage: 'zeen-parser',
    message: 'The block comment was never closed.',
    help: 'Add the closing `*/`.',
    example: `fn main() {}\n/* never closed`,
  },

  /* ============ Resolver ============ */
  {
    code: 'zeen::resolver::ambiguous_import',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The name is imported from multiple modules and is ambiguous.',
    help: 'Import only one of the modules, or move one of the items into a separate module.',
    example: `// one.zn
pub fn value() i32 {
  return 1;
}

// two.zn
pub fn value() i32 {
  return 2;
}

// main.zn
use one;
use two;

fn main() {
  @println("{}", value());
}`,
  },
  {
    code: 'zeen::resolver::core_reserved',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The name is reserved by the compiler core.',
    help: 'Choose a different name, or see the core libraries at https://zeen-lang.tech/library/core/ops.',
    example: `struct Option {\n  value: i32,\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::resolver::duplicate_definition',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'A declaration with this name already exists.',
    help: 'Remove the duplicate declaration or rename one of them.',
    example: `fn work() {}\nfn work() {}\n\nfn main() {}`,
  },
  {
    code: 'zeen::resolver::global_var_cycle',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'Global variables form a cyclic dependency through their initializers.',
    help: 'Global initializers cannot depend on each other in a cycle.',
    example: `let a: i32 = b;\nlet b: i32 = a;\n\nfn main() {}`,
  },
  {
    code: 'zeen::resolver::include_error',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The imported module could not be found or read.',
    help: 'Check the import path, or install the standard library.',
    example: `use missing_module;\n\nfn main() {}`,
  },
  {
    code: 'zeen::resolver::nested_fn_capture',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'A nested function cannot capture a variable from the enclosing function.',
    help: 'Nested functions cannot close over the enclosing function\'s variables.',
    example: `fn main() {
  const value = 10;\n\n  fn inner() i32 {\n    return value;\n  }\n\n  @println("{}", inner());\n}`,
  },
  {
    code: 'zeen::resolver::non_literal_const_pattern',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The constant used in a switch arm is not a literal constant.',
    help: 'Match a computed constant through a guard instead: `x if (x == name)`.',
    example: `fn compute() i32 {\n  return 2;\n}\n\nconst LIMIT: i32 = compute();\n\nfn main() {\n  const x = 2;\n\n  switch (x) {\n    LIMIT => @println("hit"),\n    _ => @println("miss"),\n  }\n}`,
  },
  {
    code: 'zeen::resolver::private_item',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The private item is not accessible from this module.',
    help: 'Mark the item `pub`, or use it only from its defining module.',
    example: `// utils.zn
fn secret() i32 {
  return 1;
}

// main.zn
use utils;

fn main() {
  @println("{}", secret());
}`,
  },
  {
    code: 'zeen::resolver::unresolved_ident',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The identifier could not be resolved.',
    help: 'Define the name, or import the module that owns it.',
    example: `fn main() {\n  missing();\n}`,
  },
  {
    code: 'zeen::resolver::unresolved_self',
    severity: 'error',
    stage: 'zeen-resolve',
    message: '`self`/`Self` could not be resolved here.',
    help: 'Use `self`/`Self` only inside a method or implement block.',
    example: `fn main() {\n  @println("{:?}", self);\n}`,
  },
  {
    code: 'zeen::resolver::unresolved_type',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The type could not be resolved.',
    help: 'Define the type, or import the module that owns it.',
    example: `fn main() {\n  const x: Missing = 1;\n}`,
  },

  /* ============ Typechecker ============ */
  {
    code: 'zeen::typechecker::ambiguous_associated_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type is ambiguous for this base type.',
    help: 'The type has several implementations that declare this associated type.',
    example: `interface First {
  alias Item;
}

interface Second {
  alias Item;
}

fn read[T: First + Second](value: T.Item) {}

fn main() {}`
  },
  {
    code: 'zeen::typechecker::ambiguous_inference',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Conflicting inferred types for the binding.',
    help: 'Annotate the binding with an explicit type.',
    example: `fn main() {\n  let value = 1;\n  let byte: u8 = value;\n  let size: usize = value;\n}`,
  },
  {
    code: 'zeen::typechecker::anonymous_init_needs_context',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot infer the type of `.{ ... }`, expected a struct or `void`.',
    help: 'Annotate the type, for example `let x: Point = .{ .a = 1 };`.',
    example: `struct Point {\n  x: i32,\n  y: i32,\n}\n\nfn main() {\n  const p = .{ .x = 1, .y = 2 };\n\n  @println("{}", p.x);\n}`,
  },
  {
    code: 'zeen::typechecker::arg_count_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The call passes a different number of arguments than expected.',
    help: 'Pass the expected number of arguments.',
    example: `fn add(a: i32, b: i32) i32 {\n  return a + b;\n}\n\nfn main() {\n  @println("{}", add(1));\n}`,
  },
  {
    code: 'zeen::typechecker::array_length_not_const',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The array length must be a constant.',
    help: 'Use a comptime constant or a literal for the length.',
    example: `fn main() {\n  let n = 3;\n  let items: [n]i32 = {1, 2, 3};\n\n  @println("{}", items[0]);\n}`,
  },
  {
    code: 'zeen::typechecker::assign_to_const',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Attempt to assign to a const binding.',
    help: 'Use `let` for bindings that are reassigned.',
    example: `fn main() {\n  const limit = 1;\n  limit = 2;\n\n  @println("{}", limit);\n}`,
  },
  {
    code: 'zeen::typechecker::associated_fn_as_value',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated function must be called, not used as a value.',
    help: 'Call it as `object.name()`.',
    example: `fn main() {\n  const max = i32.max_value;\n\n  @println("{}", max());\n}`,
  },
  {
    code: 'zeen::typechecker::associated_type_bound_not_satisfied',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type is bound to a type that does not implement the required interface.',
    help: 'Give the alias a type that implements the bound.',
    example: `interface Marker {\n  pub fn mark(*self) i32;\n}\n\ninterface Source {\n  alias Item: Marker;\n  pub fn read(*self) Item;\n}\n\nstruct Plain {\n  value: i32,\n}\n\nimplement Source : Plain {\n  alias Item = Plain;\n  pub fn read(*self) Plain {\n    return Plain { .value = self.value };\n  }\n}\n\nfn main() {}`
  },
  {
    code: 'zeen::typechecker::associated_type_cycle',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type defaults form a cycle.',
    help: 'Give one of the aliases a concrete type.',
    example: `interface Chain {\n  alias Left = Right;\n  alias Right = Left;\n  pub fn value(*self) Left;\n}\n\nstruct Node {\n  value: i32,\n}\n\nimplement Chain : Node {\n  fn value(*self) Left {\n    return self.value;\n  }\n}\n\nfn main() {}`
  },
  {
    code: 'zeen::typechecker::break_outside_loop',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: '`break` is used outside a loop.',
    help: 'Place `break` inside a `for` or `while` loop.',
    example: `fn main() {\n  break;\n}`,
  },
  {
    code: 'zeen::typechecker::cannot_infer_generic',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The generic type cannot be inferred.',
    help: 'Add a type annotation, or pass an explicit generic argument.',
    example: `use std.collections.list;\n\nfn main() {\n  const items = List.new();\n\n  @println("{}", items.len());\n}`,
  },
  {
    code: 'zeen::typechecker::closure_body_type_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The closure body returns a different type than expected.',
    help: 'Make the closure return type match the expected type.',
    example: `fn main() {\n  const f: fn() i32 = || true;\n\n  @println("{}", f());\n}`,
  },
  {
    code: 'zeen::typechecker::closure_coercion',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A fat function pointer cannot be used as a bare function type.',
    help: 'Coerce the closure directly at the call site instead of storing it first.',
    example: `use std.string;\n\nfn take(f: fn() i32) i32 {\n  return f();\n}\n\nfn main() {\n  const text: String = String.from("hi");\n  const f = || -> i32 {\n    return text.len();\n  };\n\n  @println("{}", take(f));\n}`,
  },
  {
    code: 'zeen::typechecker::closure_param_count_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The closure takes a different number of parameters than expected.',
    help: 'Match the parameter count of the expected function type.',
    example: `fn main() {\n  const f: fn(i32) i32 = |a, b| -> i32 {\n    return a;\n  };\n\n  @println("{}", f(1));\n}`,
  },
  {
    code: 'zeen::typechecker::closure_param_type_needed',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The closure parameter type is unknown.',
    help: 'Annotate the parameter, or store the closure in a typed binding.',
    example: `fn main() {\n  const f = |a| a;\n\n  @println("{}", f(1));\n}`,
  },
  {
    code: 'zeen::typechecker::closure_return_type_needed',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The closure return type is unknown.',
    help: 'Add `-> Type` before the body, or store the closure in a typed binding.',
    example: `fn main() {\n  const f = || {\n    return 1;\n  };\n\n  @println("{}", f());\n}`,
  },
  {
    code: 'zeen::typechecker::continue_outside_loop',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: '`continue` is used outside a loop.',
    help: 'Place `continue` inside a `for` or `while` loop.',
    example: `fn main() {\n  continue;\n}`,
  },
  {
    code: 'zeen::typechecker::copy_with_drop',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot implement `Drop` for the struct: it also implements `Copy`.',
    help: '`Copy` types own no resources to release; pick one: `Copy` or `Drop`.',
    example: `struct Handle {\n  id: i32,\n}\n\nimplement Copy : Handle {}\n\nimplement Drop : Handle {\n  pub fn drop(self) {}\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::core_interface_impl',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The interface cannot be implemented for this builtin type.',
    help: 'The compiler provides this interface for builtin types natively.',
    example: `implement Add : builtin i32 {\n  fn add(self, other: i32) i32 {\n    return 99;\n  }\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::duplicate_associated_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type is declared twice in one implement block.',
    help: 'Declare each associated type only once per implement block.',
    example: `interface Source {\n  alias Item;\n  pub fn read(*self) Item;\n}\n\nstruct Plain {\n  value: i32,\n}\n\nimplement Source : Plain {\n  alias Item = i32;\n  alias Item = i32;\n  pub fn read(*self) i32 {\n    return self.value;\n  }\n}\n\nfn main() {}`
  },
  {
    code: 'zeen::typechecker::duplicate_field',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The field is initialized more than once.',
    help: 'Keep only one `.field = value` entry.',
    example: `struct Point {\n  x: i32,\n  y: i32,\n}\n\nfn main() {\n  const p: Point = .{ .x = 1, .x = 2, .y = 3 };\n\n  @println("{}", p.x);\n}`,
  },
  {
    code: 'zeen::typechecker::duplicate_impl',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The struct already implements this interface for these arguments.',
    help: 'An implementation for this exact instantiation already exists.',
    example: `struct Tag {\n  id: i32,\n}\n\nimplement Copy : Tag {}\nimplement Copy : Tag {}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::duplicate_loop_label',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The loop label is already in use.',
    help: 'Use a distinct label for each nested loop.',
    example: `fn main() {\n  outer: for (i : 3) {\n    outer: for (j : 3) {\n      @println("{} {}", i, j);\n    }\n  }\n}`,
  },
  {
    code: 'zeen::typechecker::duplicate_method',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The object already has a method with the same signature.',
    help: 'Overloads of one name must differ in bounds or in the block\'s type arguments.',
    example: `struct Point {\n  x: i32,\n}\n\nimplement Point {\n  pub fn get(self) i32 {\n    return self.x;\n  }\n\n  pub fn get(self) i32 {\n    return self.x;\n  }\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::empty_array',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Empty arrays are not allowed.',
    help: 'Use a non-zero length, or a slice instead.',
    example: `fn main() {\n  const items: [0]i32 = {};\n\n  @println("{}", items.len());\n}`,
  },
  {
    code: 'zeen::typechecker::expected_format_str',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Expected a format string as the argument.',
    help: 'Pass a string literal as the first argument to `@print`/`@println`/`@format`.',
    example: `fn main() {\n  @println(1);\n}`,
  },
  {
    code: 'zeen::typechecker::fat_annotation_needs_init',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A `Fn`/`FnOnce` annotation requires an initializer.',
    help: 'Provide a closure literal or function value as the initializer.',
    example: `fn main() {\n  let f: Fn() i32;\n\n  @println("{}", f());\n}`,
  },
  {
    code: 'zeen::typechecker::format_parse_error',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The format string or its arguments do not match.',
    help: 'Check braces, format specifiers and the number of arguments.',
    example: `fn main() {\n  @println("{", 1);\n}`,
  },
  {
    code: 'zeen::typechecker::generic_bound_not_satisfied',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type does not satisfy the interface bound of the generic parameter.',
    help: 'Implement the interface for the type, or use a different type argument.',
    example: `struct Plain {\n  value: i32,\n}\n\nfn show[T: Display](value: T) {\n  @println("{}", value);\n}\n\nfn main() {\n  show(Plain { .value = 1 });\n}`,
  },
  {
    code: 'zeen::typechecker::generic_count_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type expects a different number of generic types.',
    help: 'Pass the expected number of generic arguments.',
    example: `use std.collections.list;\n\nfn main() {\n  const items: List[i32, i32] = List.new();\n\n  @println("{}", items.len());\n}`,
  },
  {
    code: 'zeen::typechecker::generic_missing_bound',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The generic parameter is missing the required interface bound.',
    help: 'Add the interface bound to the generic parameter.',
    example: `fn add[T](first: T, second: T) T {\n  return first + second;\n}\n\nfn main() {\n  @println("{}", add(1, 2));\n}`,
  },
  {
    code: 'zeen::typechecker::generic_op_not_supported',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The operator interface is not supported on the provided generic.',
    help: 'Add an interface bound that provides the operator.',
  },
  {
    code: 'zeen::typechecker::implicit_array_to_slice',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot implicitly convert an array to a slice.',
    help: 'Take a full-range slice to build a slice: `arr[..]`.',
    example: `fn total(values: []const i32) i32 {\n  return values.len();\n}\n\nfn main() {\n  const values = {1, 2, 3};\n\n  @println("{}", total(values));\n}`,
  },
  {
    code: 'zeen::typechecker::int_literal_out_of_range',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The integer literal does not fit into the type it is assigned to.',
    help: 'Widen the type, or drop the annotation and let the literal pick `i32`.',
    example: `fn main() {\n  const value: i32 = 9223372036854775807;\n}`,
  },
  {
    code: 'zeen::typechecker::invalid_cast',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Invalid type cast: `{from}` -> `{to}`.',
    help: 'Use `@as` only between compatible concrete types.',
    example: `fn main() {
  const value = @as(i32, "hi");

  @println("{}", value);
}`,
  },
  {
    code: 'zeen::typechecker::interface_method_missing',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The method required by the interface is missing.',
    help: 'Implement the method for the type.',
    example: `interface Named {\n  pub fn name(*const self) i32;\n}\n\nstruct Tag {\n  id: i32,\n}\n\nimplement Named : Tag {}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::interface_not_available',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The interface is not available here.',
    help: 'Built-in operator interfaces come from `core.ops`, which loads implicitly. Report this diagnostic if it appears.',
  },
  {
    code: 'zeen::typechecker::interface_signature_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Signature mismatch in the interface implementation.',
    help: 'Expected signature: `{signature}`.',
    example: `interface Named {\n  pub fn name(*const self) i32;\n}\n\nstruct Tag {\n  id: i32,\n}\n\nimplement Named : Tag {\n  pub fn name(*const self) bool {\n    return true;\n  }\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::invalid_va_args',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Invalid variadic arguments in the function.',
    help: 'Variadic args must be the last argument: `fn foo(arg: type, ...)`.',
    example: `extern fn report(..., count: i32) void;\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::macro_arg_not_enum',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The macro requires an enum type.',
    help: 'Pass an enum type to `@variantNames`/`@variantCount`.',
    example: `fn main() {
  @println("{}", @variantCount(i32));
}`,
  },
  {
    code: 'zeen::typechecker::main_not_found',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Entry point `fn main() { ... }` not found.',
    help: 'Add a function declaration with signature: `fn main() any { ... }`.',
    example: `fn helper() i32 {\n  return 1;\n}`,
  },
  {
    code: 'zeen::typechecker::main_signature_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The main function signature does not match.',
    help: 'Use the right signature: `fn main() any { ... }`.',
    example: `fn main(value: i32) {\n  @println("{}", value);\n}`,
  },
  {
    code: 'zeen::typechecker::mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The value has a different type than expected.',
    help: 'Change the value, or convert it with `@as` when the cast is valid.',
    example: `fn main() {\n  const count: i32 = "three";\n\n  @println("{}", count);\n}`,
  },
  {
    code: 'zeen::typechecker::missing_associated_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type of the interface has no binding.',
    help: 'Add `alias Name = Type;` to the implement block.',
    example: `interface Source {\n  alias Item;\n  pub fn read(*self) Item;\n}\n\nstruct Plain {\n  value: i32,\n}\n\nimplement Source : Plain {\n  pub fn read(*self) i32 {\n    return self.value;\n  }\n}\n\nfn main() {}`
  },
  {
    code: 'zeen::typechecker::missing_fields',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Fields are missing in the struct initialization.',
    help: 'Initialize all required fields.',
    example: `struct Point {\n  x: i32,\n  y: i32,\n}\n\nfn main() {\n  const p: Point = .{ .x = 1 };\n\n  @println("{}", p.x);\n}`,
  },
  {
    code: 'zeen::typechecker::nested_fn_pub',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Nested functions cannot be `public`.',
    help: 'Remove the `pub` modifier: nested functions are only visible from their parent.',
    example: `fn main() {\n  pub fn inner() {}\n\n  inner();\n}`,
  },
  {
    code: 'zeen::typechecker::non_ascii_char',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: '`char` literal must be ASCII.',
    help: '`char` holds a single byte; use a string literal for text.',
    example: "fn main() {\n  const letter: char = 'é';\n\n  @println(\"{}\", letter);\n}",
  },
  {
    code: 'zeen::typechecker::non_extern_va_args',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Variadic args usage on a non-extern function.',
    help: 'Variadic args are only allowed on `extern fn`.',
    example: `fn report(args: i32, ...) void {}\n\nfn main() {\n  report(1);\n}`,
  },
  {
    code: 'zeen::typechecker::not_callable',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type is not callable.',
    help: 'Use a function, closure, or callable type.',
    example: `fn main() {\n  const value = 1;\n\n  @println("{}", value());\n}`,
  },
  {
    code: 'zeen::typechecker::not_indexable',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type is not indexable.',
    help: 'Index an array, slice, or a type that implements `Index`.',
    example: `fn main() {\n  const value = 1;\n\n  @println("{}", value[0]);\n}`,
  },
  {
    code: 'zeen::typechecker::not_iterable',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type is not iterable.',
    help: 'Iterate over an array, slice, range, or a type that implements `Iterator`.',
    example: `fn main() {\n  for (item : true) {\n    @println("{}", item);\n  }\n}`,
  },
  {
    code: 'zeen::typechecker::not_supported_binary',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The binary operator is not supported between the two types.',
    help: 'Use types that implement the operator interface, or convert one side.',
    example: `fn main() {\n  let flag = true;\n  let count = 1;\n\n  @println("{}", flag + count);\n}`,
  },
  {
    code: 'zeen::typechecker::not_supported_unary',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The unary operator is not supported for the type.',
    help: 'Use a type that implements the operator interface.',
    example: `fn main() {\n  const text = "hi";\n\n  @println("{}", -text);\n}`,
  },
  {
    code: 'zeen::typechecker::repeat_init_not_copy',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Repeat array init requires a Copy element type.',
    help: 'Use a Copy element type, or initialize elements individually.',
    example: `struct Item {\n  id: i32,\n}\n\nfn main() {\n  const item: Item = .{ .id = 1 };\n  const items = {item; 3};\n\n  @println("{}", items.len());\n}`,
  },
  {
    code: 'zeen::typechecker::static_method_on_instance',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The method is static and cannot be called on an instance.',
    help: 'Use `Type.method(...)` to call a static method.',
    example: `struct Point {\n  x: i32,\n}\n\nimplement Point {\n  pub fn origin() Point {\n    return .{ .x = 0 };\n  }\n}\n\nfn main() {\n  const p: Point = .{ .x = 1 };\n\n  @println("{}", p.origin().x);\n}`,
  },
  {
    code: 'zeen::typechecker::struct_init_not_a_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Struct init needs a struct or enum type.',
    help: 'Use `Type { ... }`, or annotate the value and use `.{ ... }`.',
    example: `fn main() {\n  const value = i32 { .x = 1 };\n\n  @println("{}", value);\n}`,
  },
  {
    code: 'zeen::typechecker::switch_binding_unexpected',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The variant has no payload, but a binding was given.',
    help: 'Match it as `.Variant` without a binding.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Empty;\n\n  switch (shape) {\n    .Empty(radius) => @println("{}", radius),\n    _ => @println("none"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_float_pattern',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Float patterns are not supported in switch.',
    help: 'Compare floats with `if` and `==` instead.',
    example: `fn main() {\n  const value = 1;\n\n  switch (value) {\n    1.5 => @println("half"),\n    _ => @println("other"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_non_exhaustive',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The switch is not exhaustive.',
    help: 'Add a wildcard arm `_ => ...`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Empty;\n\n  switch (shape) {\n    .Empty => @println("empty"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_or_binding_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Or-pattern bindings must share one name.',
    help: 'Use the same binding name in every alternative of the or-pattern.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n  Diam: i32,\n}\n\nfn main() {\n  const shape = Shape.Radius(1);\n\n  switch (shape) {\n    .Radius(r) | .Diam(d) => @println("{}", d),\n    _ => @println("none"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_pattern_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The switch pattern does not match the scrutinee type.',
    help: 'Use patterns that match the type of the switched value.',
    example: `fn main() {\n  const value = 1;\n\n  switch (value) {\n    .Some(x) => @println("{}", x),\n    _ => @println("none"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_payload_required',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The variant requires a binding for its payload.',
    help: 'Match it as `.Variant(binding)`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Radius(1);\n\n  switch (shape) {\n    .Radius => @println("has radius"),\n    _ => @println("none"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_unreachable_arm',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The switch arm is unreachable.',
    help: 'Remove the arm, or reorder so reachable arms come first.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Empty;\n\n  switch (shape) {\n    _ => @println("any"),\n    .Empty => @println("empty"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::switch_unsupported_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot switch over this type.',
    help: 'Switch supports integers, `bool`, `char` and strings.',
    example: `fn main() {\n  const value = 1.5;\n\n  switch (value) {\n    1.5 => @println("half"),\n    _ => @println("other"),\n  }\n}`
  },
  {
    code: 'zeen::typechecker::try_requires_option_or_result',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Operator `?` requires `Option[T]` or `Result[T, E]`.',
    help: 'Apply `?` to an owned `Option` or `Result` value.',
    example: `fn main() {\n  const value = 1?;\n\n  @println("{}", value);\n}`,
  },
  {
    code: 'zeen::typechecker::try_return_type_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Operator `?` cannot propagate the type from a function returning this type.',
    help: 'Make the function return the same enum family as the `?` operand.',
    example: `use std.string;\n\nfn parse(text: String) Result[i32, i32] {\n  const value = text.parse_i32()?;\n\n  return Result.Ok(value);\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::type_name_as_value',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type name is used as a value.',
    help: 'A type name has no value; use it as a type, or call a static method on it.',
    example: `fn main() {\n  const value = i32;\n\n  @println("{}", value);\n}`,
  },
  {
    code: 'zeen::typechecker::unknown_associated_fn',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The object has no associated function with this name.',
    help: 'Check the spelling, or add the associated function.',
    example: `fn main() {\n  @println("{}", i32.nope());\n}`,
  },
  {
    code: 'zeen::typechecker::unknown_associated_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The associated type is not declared by an interface in scope.',
    help: 'Declare the alias on the interface, or add the interface that declares it as a bound.',
    example: `interface Source {
  pub fn read(*self) i32;
}

fn read[T: Source](value: T.Item) {}

fn main() {}`
  },
  {
    code: 'zeen::typechecker::unknown_field',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Unknown field in the struct.',
    help: 'Check the field spelling, or add the field to the struct.',
    example: `struct Point {\n  x: i32,\n}\n\nfn main() {\n  const p: Point = .{ .x = 1 };\n\n  @println("{}", p.z);\n}`,
  },
  {
    code: 'zeen::typechecker::unknown_loop_label',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The loop label is unknown.',
    help: 'Use a label declared on an enclosing loop.',
    example: `fn main() {\n  for (i : 3) {\n    break :nope;\n  }\n}`,
  },
  {
    code: 'zeen::typechecker::unknown_macro',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Unknown macro found.',
    help: 'Use a supported macro name.',
    example: `fn main() {\n  @nope();\n}`,
  },
  {
    code: 'zeen::typechecker::unknown_method',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The object has no method with this name.',
    help: 'Check the spelling, or add the method.',
    example: `fn main() {\n  @println("{}", 1.nope());\n}`,
  },
  {
    code: 'zeen::typechecker::unsized_pointer_slice',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot take an open-ended slice of a many pointer: its length is unknown.',
    help: 'Provide an explicit end bound: `ptr[0..n]` (or `ptr[..n]`).',
    example: `fn main() {\n  const ptr: [*]i32 = nullptr;\n  const view = ptr[..];\n\n  @println("{}", view.len());\n}`,
  },
  {
    code: 'zeen::typechecker::void_macro_removed',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: '`@void()` has been removed.',
    help: 'Write `.{ }` for a void value or an empty struct initialization.',
    example: `fn main() {\n  const value = @void();\n\n  @println("{}", value);\n}`,
  },

  /* ============ Typechecker (enum-specific) ============ */
  {
    code: 'zeen::typecheck::enum_as_int_forbidden',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot cast this enum to a numeric type with `@as`.',
    help: 'Use `@enumTag(expr)` to read the variant tag.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Radius(1);\n\n  @println("{}", @as(i32, shape));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_call_on_empty',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The empty variant cannot be constructed with an argument.',
    help: 'Construct empty variants with `Name.Variant`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Empty(1);\n\n  @println("{}", @enumTag(shape));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_call_on_struct',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The struct variant requires a struct literal.',
    help: 'Construct struct variants with `Name.Variant { .field = value }`.',
    example: `enum Shape {\n  Empty,\n  Rect: {\n    width: i32,\n    height: i32,\n  },\n}\n\nfn main() {\n  const shape = Shape.Rect(1);\n\n  @println("{}", @enumTag(shape));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_extract_empty',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot extract a value from an empty variant.',
    help: 'Empty variants carry no payload to extract.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Empty;\n\n  @println("{}", shape.Empty);\n}`,
  },
  {
    code: 'zeen::typecheck::enum_extract_from_drop',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot move out of the variant: the enum implements `Drop`.',
    help: 'Dropping the partial value would bypass the implementation\'s `drop`.',
    example: `use std.string;\n\nenum Val {\n  N,\n  R: String,\n}\n\nimplement Drop : Val {\n  pub fn drop(self) {}\n}\n\nfn main() {\n  const v = Val.R(String.from("hi"));\n  const r = v.R;\n}`
  },
  {
    code: 'zeen::typecheck::enum_from_int_forbidden',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot cast a numeric value to this enum with `@as`.',
    help: 'Construct variants directly: `Name.variant(value)` or `Name.variant { ... }`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = @as(Shape, 1);\n\n  @println("{}", @enumTag(shape));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_init_on_non_struct',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Struct literal used to construct a non-struct variant.',
    help: 'Construct single-value variants with `Name.variant(value)`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Radius { .value = 1 };\n\n  @println("{}", @enumTag(shape));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_not_comparable',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'This enum has value-carrying variants and cannot be compared.',
    help: 'Only enums with no value-carrying variants support `==`/`!=`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const first = Shape.Radius(1);\n  const second = Shape.Radius(2);\n\n  @println("{}", first == second);\n}`,
  },
  {
    code: 'zeen::typecheck::enum_tag_non_enum',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: '`@enumTag` expects an enum value, got this type.',
    help: 'Pass an enum value to `@enumTag`.',
    example: `fn main() {\n  @println("{}", @enumTag(1));\n}`,
  },
  {
    code: 'zeen::typecheck::enum_variant_requires_value',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The variant requires a value.',
    help: 'Pass the payload value: `Name.variant(value)`.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Radius;\n\n  @println("{}", @enumTag(shape));\n}`,
  },
  {
    code: 'zeen::typecheck::implement_non_struct',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Implement on a non-struct type found.',
    help: '`implement` blocks are for structs (and enums for interfaces).',
    example: `implement Copy : [4]i32 {}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typecheck::infinite_recursive_type',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The recursive type is infinite.',
    help: 'Consider using wrapping, like pointers: `*{ty}`.',
    example: `struct Node {\n  next: Node,\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typecheck::private_item',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The private item is not accessible.',
    help: 'Mark the item `pub`, or use it only from its defining module.',
    example: `struct Secret {\n  hidden: i32,\n  pub open: i32,\n}\n\nfn main() {\n  const s: Secret = .{ .hidden = 1, .open = 2 };\n\n  @println("{}", s.hidden);\n}`,
  },
  {
    code: 'zeen::typecheck::unknown_enum_variant',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Unknown variant for this enum.',
    help: 'Check the variant spelling, or use an existing variant.',
    example: `enum Shape {\n  Empty,\n  Radius: i32,\n}\n\nfn main() {\n  const shape = Shape.Triangle(1);\n\n  @println("{}", @enumTag(shape));\n}`,
  },

  /* ============ Comptime ============ */
  {
    code: 'zeen::comptime::duplicate_definition',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'A comptime definition with this name already exists.',
    help: 'Remove the duplicate, or rename one of them.',
    example: `comptime limit = 10;\ncomptime limit = 20;\n\nfn main() {}`,
  },
  {
    code: 'zeen::comptime::format_parse_error',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'The comptime format string could not be parsed.',
    help: 'Check braces and format specifiers in the format string.',
    example: `comptime msg = @format("{", 1);\n\nfn main() {}`,
  },
  {
    code: 'zeen::comptime::limit_exceeded',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'The comptime step budget or recursion depth was exceeded.',
    help: 'Simplify the comptime computation, or reduce recursion depth.',
    example: `comptime fn dive(n: comptime_int) comptime_int {
  return dive(n + 1);
}

comptime depth = dive(0);

fn main() {}`,
  },
  {
    code: 'zeen::comptime::panic',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'Comptime panicked with the given message.',
    help: 'Fix the condition that triggered `@panic` in comptime code.',
    example: `comptime fn check(limit: comptime_int) comptime_int {
  if (limit <= 0) {
    @panic("limit must be positive");
  }

  return limit;
}

comptime limit = check(0);

fn main() {}`,
  },
  {
    code: 'zeen::comptime::runtime_only',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'This construct is only allowed at runtime, not in comptime.',
    help: 'Move the construct out of comptime code.',
    example: `comptime x = @uninit();\n\nfn main() {}`,
  },
  {
    code: 'zeen::comptime::runtime_type',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'Runtime types are forbidden in comptime signatures and annotations.',
    help: 'Use only comptime types in comptime code.',
    example: `comptime fn bad(x: i32) i32 {\n  return x;\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::comptime::splice_outside_quote',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'A `$()` splice is used outside a quoted expression.',
    help: 'Use `$(...)` only inside `@zeen_type`, `@zeen_expr` or `@zeen_decl`.',
    example: `fn main() {
  const value: $(1 + 1) = 0;
}`,
  },
  {
    code: 'zeen::comptime::type_mismatch',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'The comptime value has a different type than expected.',
    help: 'Check the types of the comptime operands.',
    example: `comptime {
  @emit(1);
}

fn main() {}`,
  },
  {
    code: 'zeen::comptime::unresolved_ident',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'The comptime identifier could not be resolved.',
    help: 'Define the comptime name before using it.',
    example: `comptime x = undefined + 1;\n\nfn main() {}`,
  },
  {
    code: 'zeen::comptime::unsupported',
    severity: 'error',
    stage: 'zeen-comptime',
    message: 'This construct is not supported in comptime.',
    help: 'Rewrite the construct using supported comptime syntax.',
    example: `comptime point = .{ .x = 1, .y = 2 };

fn main() {}`,
  },

  /* ============ Dataflow (errors and warnings) ============ */
  {
    code: 'zeen::dataflow::aliased_drop',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Dropping a value copied out of a raw pointer while the source may still own it.',
    help: 'Clone the value, borrow it, or free the source storage first.',
    example: `use std.string;\n\nfn main() {\n  const text: String = String.from("hi");\n  const ptr: *String = &text;\n  const copy: String = *ptr;\n\n  @println("{}", copy.len());\n}`,
  },
  {
    code: 'zeen::dataflow::escaping_borrow',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Returning a value that borrows a local that is dropped when the function returns.',
    help: 'The slice or pointer points into this function stack frame. Return an owned value instead.',
    example: `fn first() []const i32 {
  const data = {1, 2, 3};

  return data[..];
}

fn main() {
  @println("{}", first().len());
}`,
  },
  {
    code: 'zeen::dataflow::maybe_uninitialized_drop',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'The value may be uninitialized at end of scope, cannot drop it.',
    help: 'Ensure every path initializes the value before the scope ends.',
    example: `use std.string;

fn maybe(flag: bool) {
  let text: String;

  if (flag) {
    text = String.from("hi");
  }
}

fn main() {
  maybe(true);
}`,
  },
  {
    code: 'zeen::dataflow::move_out_of_drop',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Cannot move out of a field of a struct that implements `Drop`.',
    help: 'Borrow the field, or restructure so the whole value is not dropped.',
    example: `use std.string;\n\nstruct Box {\n  pub text: String,\n}\n\nimplement Drop : Box {\n  pub fn drop(self) {}\n}\n\nfn main() {\n  const b: Box = .{ .text = String.from("x") };\n  const t: String = b.text;\n}`,
  },
  {
    code: 'zeen::dataflow::unreachable_code',
    severity: 'warning',
    stage: 'zeen-dataflow',
    message: 'Unreachable code: statements here can never run.',
    help: 'Remove the statements, or move the terminator after them.',
    example: `fn main() {\n  @println("before");\n  return;\n  @println("never");\n}`,
  },
  {
    code: 'zeen::dataflow::unused_const',
    severity: 'warning',
    stage: 'zeen-dataflow',
    message: 'An unused constant in the root module.',
    help: 'Consider removing it, or marking it `pub`.',
    example: `const LIMIT: i32 = 10;\n\nfn main() {\n  @println("done");\n}`,
  },
  {
    code: 'zeen::dataflow::unused_fn',
    severity: 'warning',
    stage: 'zeen-dataflow',
    message: 'An unused function in the root module.',
    help: 'Remove the function, call it, or mark it `pub` when used elsewhere.',
    example: `fn helper() i32 {\n  return 1;\n}\n\nfn main() {\n  @println("done");\n}`,
  },
  {
    code: 'zeen::dataflow::unused_mut',
    severity: 'warning',
    stage: 'zeen-dataflow',
    message: 'The variable is never mutated.',
    help: 'Declare it with `const` instead of `let`.',
    example: `fn main() {\n  let count = 5;\n\n  @println("{}", count);\n}`,
  },
  {
    code: 'zeen::dataflow::unused_variable',
    severity: 'warning',
    stage: 'zeen-dataflow',
    message: 'A local binding is never read after it is introduced.',
    help: 'Remove the binding, read it, or prefix the name with `_` to keep it.',
    example: `fn main() {\n  const unused: i32 = 42;\n}`,
  },
  {
    code: 'zeen::dataflow::use_after_move',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Use of a moved value.',
    help: 'The value was moved out; borrow or clone it instead.',
    example: `use std.string;\n\nfn main() {\n  const text: String = String.from("hi");\n  const copy: String = text;\n\n  @println("{}", text.len());\n}`,
  },
  {
    code: 'zeen::dataflow::use_of_partially_moved',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Use of a partially moved struct.',
    help: 'Reinitialize all moved fields before using the struct as a whole.',
    example: `use std.string;\n\nstruct Pair {\n  pub text: String,\n  pub id: i32,\n}\n\nfn show(p: Pair) {}\n\nfn main() {\n  const p: Pair = .{ .text = String.from("hi"), .id = 1 };\n  const taken: String = p.text;\n  show(p);\n}`,
  },
  {
    code: 'zeen::dataflow::use_of_uninitialized',
    severity: 'error',
    stage: 'zeen-dataflow',
    message: 'Use of an uninitialized value.',
    help: 'Initialize the value before using it.',
    example: `fn main() {\n  let value: i32;\n\n  @println("{}", value);\n}`,
  },

  /* ============ MIR ============ */
  {
    code: 'zeen::mir::discard_drop_payload',
    severity: 'error',
    stage: 'zeen-mir',
    message: 'Discarding a value that needs dropping with `_`.',
    help: 'Use `&_` to borrow and discard safely, or bind and drop the value explicitly.',
    example: `struct Resource {\n  handle: i32,\n}\n\nimplement Drop : Resource {\n  pub fn drop(self) {}\n}\n\nenum Val {\n  N,\n  R: Resource,\n}\n\nfn main() {\n  const v = Val.R(Resource { .handle = 1 });\n\n  switch (v) {\n    .R(_) => @println("got"),\n    .N => @println("none"),\n  }\n}`,
  },
  {
    code: 'zeen::mir::generic_param_not_a_value',
    severity: 'error',
    stage: 'zeen-mir',
    message: 'A generic parameter is not a value.',
    help: 'Use the parameter in a type position only, not as a runtime value.',
    example: `fn make[T](value: T) T {
  let _ = T;

  return value;
}

fn main() {
  @println("{}", make(1));
}`,
  },
  {
    code: 'zeen::mir::runtime_fat_coercion',
    severity: 'error',
    stage: 'zeen-mir',
    message: 'A `Fn` pointer cannot be converted into a fat `Fn`/`FnOnce` value at runtime.',
    help: 'Coerce a closure literal directly instead of storing it in a variable first.',
  },
  {
    code: 'zeen::mir::unused_expression_result',
    severity: 'warning',
    stage: 'zeen-mir',
    message: 'An expression computes a value that nothing consumes.',
    help: 'Use the value, or discard it explicitly: `let _ = ...;`.',
    example: `fn main() {\n  1 + 1;\n}`,
  },

  /* ============ Codegen ============ */
  {
    code: 'zeen::codegen::emit_failed',
    severity: 'error',
    stage: 'zeen-codegen',
    message: 'Failed to write the output to the path.',
    help: 'Check the output path and write permissions.',
  },
  {
    code: 'zeen::codegen::pass_pipeline_failed',
    severity: 'error',
    stage: 'zeen-codegen',
    message: 'The LLVM pass pipeline failed.',
    help: 'This is likely a compiler bug; report it with the full output.',
  },
  {
    code: 'zeen::codegen::unsupported_triple',
    severity: 'error',
    stage: 'zeen-codegen',
    message: 'Unsupported target triple.',
    help: 'Use a supported triple from `--targets-list`.',
  },
  {
    code: 'zeen::codegen::verify_failed',
    severity: 'error',
    stage: 'zeen-codegen',
    message: 'LLVM failed to verify the generated module.',
    help: 'This is a compiler bug. Please report it with the full output.',
  },
  {
    code: 'zeen::typechecker::array_length_overflow',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The array length overflows the supported range.',
    help: 'Use a smaller length, or a slice instead of a fixed array.',
    example: `fn main() {\n  const items: [9223372036854775807 * 3]u8 = @uninit();\n\n  @println("{}", items.len());\n}`,
  },
  {
    code: 'zeen::typechecker::closure_generic_capture',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A closure cannot capture a value of generic type.',
    help: 'Move the closure out of the generic context.',
  },
  {
    code: 'zeen::typechecker::fat_return_mismatch',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A function returning `Fn`/`FnOnce` must return the same closure from every path.',
    help: 'Closure return types are inferred from the body and must agree.',
    example: `use std.string;\n\npub fn pick(flag: bool) FnOnce() String {\n  const kept: String = String.from("kept");\n  const other: String = String.from("other");\n\n  if (flag) {\n    return || -> String { return kept; };\n  }\n\n  return || -> String {\n    @println("{}", other.len());\n\n    return String.from("fallback");\n  };\n}\n\nfn main() {}`,
  },
  {
    code: 'zeen::typechecker::dangling_defid',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A dangling definition id was found during typechecking.',
    help: 'Please report this on: https://github.com/zeen-lang/zeen/issues',
  },
  {
    code: 'zeen::typechecker::macro_not_implemented',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The macro is not implemented yet.',
    help: 'This macro will be available once the std library provides a string writer.',
  },
  {
    code: 'zeen::typechecker::interface_not_implemented',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'The type has no implementation for this interface.',
    help: 'Implement the interface for the type.',
    example: `struct Point {
  x: i32,
}

fn main() {
  const p: Point = .{ .x = 1 };

  @println("{}", p);
}`,
  },
  {
    code: 'zeen::typechecker::impl_slot_mixed',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'A generic parameter cannot be nested inside a specialized implement slot.',
    help: 'Restructure the implement block so generics are not nested in the slot.',
    example: `struct Holder[T] {
  value: T,
}

implement[T] Holder[*T] {
  pub fn pointed(*const self) *T {
    return self.value;
  }
}

fn main() {}`,
  },
  {
    code: 'zeen::typechecker::generic_conflict',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Generic conflict for the parameter: expected one type, but found another.',
    help: 'Make the argument types agree, or annotate the binding.',
  },
  {
    code: 'zeen::typechecker::move_through_ptr',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'Cannot move a value through a pointer.',
    help: 'Dereference the value from the pointer: `*EXPR`.',
    example: `interface Take {
  pub fn take(self) i32;
}

struct Value {
  pub n: i32,
}

implement Take : Value {
  pub fn take(self) i32 {
    return self.n;
  }
}

fn read[T: Take](v: *T) i32 {
  return v.take();
}

fn main() {
  const v = Value { .n = 1 };

  @println("{}", read(&v));
}`,
  },
  {
    code: 'zeen::typecheck::associated_call_on_method',
    severity: 'error',
    stage: 'zeen-typecheck',
    message: 'An associated call was found on an instance method.',
    help: 'Call the method on a value instead: `value.method()`.',
    example: `implement builtin i32 {
  pub fn is_even(*const self) bool {
    return (*self) % 2 == 0;
  }
}

fn main() {
  @println("{}", i32.is_even());
}`,
  },
  {
    code: 'zeen::resolver::std_not_configured',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'The standard library is not installed or not configured.',
    help: 'Set `--std`, `ZEEN_STD`, or `~/.zeen/std` to the std project root.',
  },
  {
    code: 'zeen::resolver::extern_link_error',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'An extern link error occurred.',
    help: 'Check the extern declaration and the linked library.',
  },
  {
    code: 'zeen::resolver::disabled_feature',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'This feature is disabled by the compiler.',
    help: 'Visit https://github.com/zeen-lang/zeen for more information.',
  },
  {
    code: 'zeen::resolver::reserved_interface',
    severity: 'error',
    stage: 'zeen-resolve',
    message: 'Usage of a compiler-reserved interface name.',
    help: 'Choose a different interface name.',
  },
];