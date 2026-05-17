# RISC V 32-Bit CPU Emulator

This CPU emulator emulates at the bit level with many low level gates emulated. It includes a subset of both RV32I and RV32F.

*This project was made for my CPSC 440 Computer Systems Architecture class at California State University Fullerton*

## Implementation Details

### Assembler

The assembler was a tricky and interesting problem to tackle.  I don't know if I would have been able to finish it on time without heavy use of great interactive references such as [rvcodec.js](https://luplab.gitlab.io/rvcodecjs/).  The assembler mainly just maps parts of instructions to their different binary [funct7, funct3 and opcode](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/assembler/instructions.py#L192C1-L258).  Additionally it [shifts and masks the bits of the immediate values into their correct contiguous section(s)](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/assembler/instructions.py#L260-L331) of the resulting binary instruction.  Most of the actual assembling logic happens in the [InstructionToken class](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/assembler/instructions.py).

### Gate Level Implementation

Many of the low level gates used in RISC-V architecture were [implemented](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/gates.py).  All of the gates ended up using in the final emulator were implemented as python functions.  Some higher level gates such as [D Flip-Flops](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/03a6a011baf12ca8deefe7ca575c9298d461dd80/src/flip_flop.py#L31) were not used, though they were implemented.  D Flip-Flop and other CPU clock signal dependent mechanisms were not used because I did not end up implementing a "high/low" CPU clock signal.

### Memory Unit

My memory unit implementation was fairly abstracted away from the metal implementation out of necessity.  I had explored emulating actual DRAM, but the space complexity of the emulator quickly became non-ideal since I attempted to store large blocks of contiguous partially allocated virtual memory in python lists.  So I settled for an implementation abstracted from a dictionary (hash map) of [Byte](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/memory.py#L31) objects.  This [implementation](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/memory_unit.py) will get the necessary bytes at the address being loaded and allocate new [Byte](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/memory.py#L31) objects at any address which is unassigned in the underlying dictionary. This enables my memory unit to emulate large contiguous blocks of partially allocated memory without requiring a large spatial complexity on my host PC.

```py
    def _get_byte(self, address: int) -> Byte:
        """Get a byte at the given address, create it if it doesn't exist."""
        if address not in self.memory:
            self.memory[address] = Byte()  # Create on first access
        return self.memory[address]
    
    def __getitem__(self, index: int) -> Bitx32:
        if index < 0 or index + 4 > self.max_address:
            raise RuntimeError(f"Memory address out of bounds: {hex(index)} to {hex(index+4)}")
        
        res_list = []
        # Read 4 bytes
        for byte_offset in range(4):
            byte = self._get_byte(index + byte_offset)
            for bit in byte:
                res_list.append(bit)
        return tuple(res_list)
```

### Bit Level Implementation

I added the type alias `Bit = Literal[0, 1]`.  These `Bit`s were packed into tuples since tuples are immutable and can be used in `==` and `is` operations.  This made it much easier for things like defining and comparing the 4 bit ALU control signals as tuples like so:

```py
CTRL_ALU_ADD = (0,0,0,0)
CTRL_ALU_SUB = (0,0,0,1)
CTRL_ALU_AND = (0,0,1,0)
CTRL_ALU_OR = (0,0,1,1)
CTRL_ALU_XOR = (0,1,0,0)
CTRL_ALU_SLL = (0,1,0,1)
CTRL_ALU_SRL = (0,1,1,0)
CTRL_ALU_SRA = (0,1,1,1)
CTRL_ALU_SLT = (1,0,0,0)
CTRL_ALU_SLTU = (1,0,0,1)
```

Then these signal constants could be compared "as is" with the incoming bits [see here](https://github.com/FrewtyPebbles/Python-RISC-V-CPU-Emulator/blob/main/src/rv32i_alu_control.py).

### Testing Strategy

If I were to revisit this project in the future I will create more thorough tests utilizing [Coverage.py](https://github.com/coveragepy/coveragepy). I strongly believe that I could've had more comprehensive and thorough tests if I had more time to complete this project for my CPSC 440 class.  Despite this, through manual testing I found the parts of the emulator and assembler which were the most issue prone added tests for each.  I know these tests are not extensive by any means, but even with limited coverage they greatly accelerated my development time.

## Branching Strategy

I used a mostly feature based branching strategy.  For every RV32 extension I implemented for the emulator I added a new feature branch.  I also branched for testing major refactors.

## Installation

First CD into the project directory and make sure pip and build and wheel are up to date:

```
python -m pip install --upgrade pip
python -m pip install --upgrade build wheel
```

Then build the package:

```
python -m build
```

Then install the `.whl` file in the `dist/` directory that was just created.

```
python -m pip install ./dist/something.whl
```

Now the cpu emulator should be installed globally!
You can also do this in a venv if you want.

## Running the emulator

To run a program with the emulator use the command in the terminal:

```
riskv-sim {input_file.hex or input_file.asm}
```

To see what flags you can include do:

```
riscv-sim --help
```

These flags show different debug information after each step. Here is the help command output for your convenience:

```
usage: riscv-sim {program file path}
  use --help for more information

An RV32I CPU Emulator with FPU extension. It will attempt to assemble and run the provided RV32I assembly source file on the RV32I emulator.

positional arguments:
  source                Path to input assembly or hex file.

options:
  -h, --help            show this help message and exit
  --assemble_only       Flag to assemble a file without running it.
  --dont_show_steps     Flag to not show every instruction step the emulator takes.
  --show_memory         Flag to show all the in use memory in the Memory Unit.
  --show_reads          Flag to show whenever the Memory Unit is read from.
  --show_writes         Flag to show whenever the Memory Unit is written to.
  --show_immediate_values
                        Flag to show all possible immediate values by type after every step.
  --show_registers      Flag to show all registers after every step.
  -o OUTPUT, --output OUTPUT
                        Path to output hex file. This only works when the '--assemble_only' argument flag is included
```

## Using the assembler

To just assemble an RV32I assembly program use the `--assemble_only` flag:

```
riskv-sim {input_file.asm} --assemble_only -o {outputfile.hex}
```

You should then see the output file saved to the location specified by `-o`.
