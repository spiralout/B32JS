B32js VM Specification
====================


General Purpose Registers
-------------------------
* A: 8 bit
* B: 8 bit
* D: 16 bit (A + B)
* X: 16 bit
* Y: 16 bit

Special Registers
-----------------
* CMP: Contains the result of the last comparison operation
* OF: Indicates the last register operation overflowed
* CY: Indicates a rotate operation had a carry over

Values
------
All literal values should be prepended with an octothorpe (#). Hex values should begin with a dollar sign ($). Examples:

* #65 = 65
* #$41 = 65
* #4096 = 4096
* #$1000 = 4096
* #START = address of the label START:
* #Loop1 = address of the label Loop1:

Labels
------
Labels are alphanumeric strings that start at column 0 and end with a colon (:). Examples:

* START:
* Loop1:
* SUB42:

Instructions
------------
Instructions must be indented by at least one space and separated by a newline. For instructions that take a parameter, the following convention is used: {byte} indicates a 1 byte parameter, {word} indicates a 2 byte parameter and {label} indicates a label name parameter.


* LDA {byte}: Load value {byte} into register A

* LDB {byte}: Load value {byte} into register B

* LDX {word}: Load value {word} into register X

* LDY {word}: Load value {word} into register Y 

* STA ,X: Store value in register A at memory location in register X

* END: Terminate the program

* CMPA {byte}: Compares value in register A with {byte} and sets CMP register

* CMPB {byte}: Compares value in register B with {byte} and sets CMP register

* CMPX {word}: Compares value in register X with {word} and sets CMP register

* CMPY {word}: Compares value in register Y with {word} and sets CMP register

* CMPD {word}: Compares value in register D with {word} and sets CMP register

* JMP {label}: Jump to the address of {label}

* JEQ {label}: Jump to the address of {label} if the equals bit is set on the CMP register

* JNE {label}: Jump to the address of {label} if the not equals bit is set on the CMP register

* JGT {label}: Jump to the address of {label} if the greater than bit is set on the CMP register

* JLT {label}: Jump to the address of {label} if the less than bit is set on the CMP register

* INCA: Add one to the value in register A

* INCB: Add one to the value in register B

* INCX: Add one to the value in register X

* INCY: Add one to the value in register Y

* INCD: Add one to the value in register D

* DECA: Subtract one from the value in register A

* DECB: Subtract one from the value in register B

* DECX: Subtract one from the value in register X

* DECY: Subtract one from the value in register Y

* DECD: Subtract one from the value in register D

* ROLA: Rotate the value in register A to the left

* ROLB: Rotate the value in register B to the left

* RORA: Rotate the value in register A to the right

* RORB: Rotate the value in register B to the right

* ADCA: Add one to the value of register A if the CY register is set 

* ADCB: Add one to the value of register B if the CY register is set 

* ADDA {byte}: Add the value {byte} to register A

* ADDB {byte}: Add the value {byte} to register B

* ADDAB: Add the values of registers A and B and store the result in register D (overwriting registers A and B)
