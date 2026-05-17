# Python to x86 Assembly JIT Compiler and Bindings

These python bindings for x86 assembly enable you to generate, compile, and run assembly instructions during the runtime of your python program.  The bindings also include a python function compiler that can compile decorated functions by traversing the AST (abstract syntax tree) of the function and generating statically typed equivalent assembly functions.  The compiler is limited in functionality, but is capable of utilizing different scalar types such as int, boolean, and float.  Array size type hint values can also be passed via template.

To use the compiler, you must have the yasm assembler and gcc (for the ld linker) installed.

## Features

### Three Way Comparisons

```py
@X86_64_Function(no_bench=True)
def asm_compare_random(arg1:int, arg2:float, arg3:int) -> bool:
    return 2 <= arg1 < arg2 or arg3 == arg1
```

### Template Functions

```py
Const = Template["Const"]
@X86_64_Function([T, SizeT, Const], no_bench=True)
def index_array_templated_const(arg1: Array[T, SizeT], arg2: int) -> T:
    return arg1[arg2] + Const
```

### Basic Operators

These mimic their python counter-parts exactly.

 - div `/`
 - floordiv `//`
 - mul `*`
 - mod `%`
 - add `+`
 - sub `-`
 - lt `<`
 - gt `>`
 - eq `==`
 - ne `!=`
 - and `and`
 - or `or`
 - ge `>=`
 - le `<=`

## For Contributions

 - This project uses ruff formatter.
