// memory addresses: $0000 - $FFFF (64K)

// screen: $A000 - $AFA0
// first byte: ASCII character
// second byte: attribute 
//   1111: foreground RGB + bright
//   1111: background RGB + bright

// registers
// A: 8 bit
// B: 8 bit
// D: 16 bit (A + B)
// X: 16 bit
// Y: 16 bit

// executable format
// B32: 3 bytes, magic number
// Starting Address: 2 bytes, where in memory to load the program
// Execution Address: 2 bytes, offset to begin execution
// Begin bytecodes

define(['B32/util'], function(util) {

    MAXINT_8BIT = 255;
    MAXINT_16BIT = 65535;
    OVERFLOW_8BIT = 256;
    OVERFLOW_16BIT = 65536;

    /**
     * Virtual B32 processor
     */
    function Processor(memory_size, interval) {
        this.memory = [];
        this.memory_size = memory_size;
        this.maps = [];
        this.start_addr = 0;
        this.exec_addr = 0;
        this.instruction_pointer = 0;
        this.registers = [];
        this.compare = 0;
        this.overflow = 0;
        this.carry = 0;
        this.interval = interval;
        this.stop = false;
        this.init();
    }

    Processor.prototype.init = function() {
        for (var i = 0; i < this.memory_size; i++) {
            this.memory[i] = 0;
        }   

        this.registers['A'] = 0;
        this.registers['B'] = 0;
        this.registers['D'] = 0;
        this.registers['X'] = 0;
        this.registers['Y'] = 0;
    };

    Processor.prototype.load = function(bytecode) {
        if (bytecode.substr(0, 3) != 'B32') {
            console.log('Not a valid B32 executable!');
            return false;
        } 

        this.start_addr = util.hex2Dec(bytecode.substr(3, 4));
        this.exec_addr = util.hex2Dec(bytecode.substr(7, 4));

        var ptr = this.start_addr;

        for (var i = 11; i < bytecode.length; i += 2) {
            this.memory[ptr] =  bytecode[i] + bytecode[i + 1];
            ptr++;
        }

        this.instruction_pointer = this.exec_addr;

        return true;
    };

    Processor.prototype.mapMemory = function(start, end, object) {
        this.maps.push({start: start, end: end, object: object});
    };

    Processor.prototype.poke = function(address, value) {
        for (var i = 0; i < this.maps.length; i++) {
            if (address >= this.maps[i].start && address <= this.maps[i].end) {
                this.maps[i].object.poke(address, value);
            }
        }

        this.memory[address] = value;
    };

    Processor.prototype.attachRegisters = function(callback) {
        this.registers_callback = callback;
    };

    Processor.prototype.readBytes = function(address, number) {
        var value = '';

        for (var i = 0; i < number; i++) {
            value += this.memory[address + i];
        }

        return value;
    };

    Processor.prototype.readBytesAtIP = function(number) {
        return this.readBytes(this.instruction_pointer, number);
    };

    Processor.prototype.setCompare = function(reg, value) {
        this.compare = 0;
        if (reg == value) this.compare = this.compare | 1;
        if (reg != value) this.compare = this.compare | 2;
        if (reg < value)  this.compare = this.compare | 4;
        if (reg > value)  this.compare = this.compare | 8;
    };

    Processor.prototype.updateRegisterCallback = function() {
        var values = this.registers;
        values['CMP'] = this.compare;
        values['IP'] = this.instruction_pointer;
        values['OF'] = this.overflow;
        values['CY'] = this.carry;

        this.registers_callback(values);
    };

    Processor.prototype.setReg = function(reg, value) {
        switch (reg) {
            case 'A':
            case 'B':
                if (value > MAXINT_8BIT) {
                    this.overflow = 1;
                } else {
                    this.overflow = 0;
                }

                while (value < 0) value += OVERFLOW_8BIT;

                this.registers[reg] = value % OVERFLOW_8BIT;    
                this.registers['D'] = this.registers['A'] * OVERFLOW_8BIT + this.registers['B'];
                break;

            case 'D':
                if (value > MAXINT_16BIT) {
                    this.overflow = 1;
                } else {
                    this.overflow = 0;
                }

                while (value < 0) value += OVERFLOW_16BIT;

                this.registers['A'] = Math.floor(value / OVERFLOW_8BIT) % OVERFLOW_8BIT;
                this.registers['B'] = value % OVERFLOW_8BIT;
                this.registers['D'] = this.registers['A'] * OVERFLOW_8BIT + this.registers['B'];

                break;

            case 'X':
            case 'Y':
                if (value > MAXINT_16BIT) {
                    this.overflow = 1;
                } else {
                    this.overflow = 0;
                }

                while (value < 0) value += OVERFLOW_16BIT;

                this.registers[reg] = value % OVERFLOW_16BIT;
                break;

            default:
                console.log('Cannot set register ' + reg);
        }
    };

    Processor.prototype.getReg = function(reg) {
        switch (reg) {
            case 'A':
            case 'B':
            case 'D':
            case 'X':
            case 'Y':
                return this.registers[reg];
            default:
                console.log('Cannot get register ' + reg);
                return false;
        }
    };


    Processor.prototype.executeStep = function() {
        switch (this.readBytesAtIP(1)) {
            case '01': this.handleLDA(); break;
            case '02': this.handleLDX(); break;
            case '03': this.handleSTAX(); break;
            case '05': this.handleCMPA(); break;
            case '06': this.handleCMPB(); break;
            case '07': this.handleCMPX(); break;
            case '08': this.handleCMPY(); break;
            case '09': this.handleCMPD(); break;
            case '0A': this.handleJMP(); break;
            case '0B': this.handleJEQ(); break;
            case '0C': this.handleJNE(); break;
            case '0D': this.handleJGT(); break;
            case '0E': this.handleJLT(); break;
            case '0F': this.handleINCA(); break;
            case '10': this.handleINCB(); break;
            case '11': this.handleINCX(); break;
            case '12': this.handleINCY(); break;
            case '13': this.handleINCD(); break;
            case '14': this.handleDECA(); break;
            case '15': this.handleDECB(); break;
            case '16': this.handleDECX(); break;
            case '17': this.handleDECY(); break;
            case '18': this.handleDECD(); break;
            case '22': this.handleLDB(); break;
            case '23': this.handleLDY(); break;             

            case '04': // END
                return  false; 

            default:
                console.log('Unknown instruction ' + this.readBytesAtIP(1));
                return false;
        }

        this.updateRegisterCallback();
        return true;
    };


    Processor.prototype.execute = function() {
        var that = this;

        if (!this.stop && this.executeStep()) {
            setTimeout(function() { that.execute(); }, this.interval);
        } else {
            this.stop = false;
            console.log('Stopped at IP ' + this.instruction_pointer);
        }
    };

    Processor.prototype.handleLDA = function() {
        this.instruction_pointer++;
        this.setReg('A', util.hex2Dec(this.readBytesAtIP(1)));
        this.instruction_pointer++;
    };

    Processor.prototype.handleLDB = function() {
        this.instruction_pointer++;
        this.setReg('B', util.hex2Dec(this.readBytesAtIP(1)));
        this.instruction_pointer++;
    };

    Processor.prototype.handleLDX = function() {
        this.instruction_pointer++;
        this.setReg('X', util.hex2Dec(this.readBytesAtIP(2)));
        this.instruction_pointer += 2;  
    };

    Processor.prototype.handleLDY = function() {
        this.instruction_pointer++;
        this.setReg('Y', util.hex2Dec(this.readBytesAtIP(2)));
        this.instruction_pointer += 2;  
    };

    Processor.prototype.handleSTAX = function() {
        this.instruction_pointer++;
        this.poke(this.getReg('X'), this.getReg('A'));
    };

    Processor.prototype.handleCMPA = function() {
        this.instruction_pointer++;
        var value = util.hex2Dec(this.readBytesAtIP(1));
        this.setCompare(this.getReg('A'), value);
        this.instruction_pointer++;
    };

    Processor.prototype.handleCMPB = function() {
        this.instruction_pointer++;
        var value = util.hex2Dec(this.readBytesAtIP(1));
        this.setCompare(this.getReg('B'), value);
        this.instruction_pointer++;
    };

    Processor.prototype.handleCMPX = function() {
        this.instruction_pointer++;
        var value = util.hex2Dec(this.readBytesAtIP(2));
        this.setCompare(this.getReg('X'), value);
        this.instruction_pointer += 2;
    };

    Processor.prototype.handleCMPY = function() {
        this.instruction_pointer++;
        var value = util.hex2Dec(this.readBytesAtIP(2));
        this.setCompare(this.getReg('Y'), value);
        this.instruction_pointer += 2;
    };

    Processor.prototype.handleCMPD = function() {
        this.instruction_pointer++;
        var value = util.hex2Dec(this.readBytesAtIP(2));
        this.setCompare(this.getReg('D'), value);
        this.instruction_pointer += 2;
    };

    Processor.prototype.handleJMP = function() {
        this.instruction_pointer++;
        var address = util.hex2Dec(this.readBytesAtIP(2));
        this.instruction_pointer = address + this.start_addr;
    };

    Processor.prototype.handleJEQ = function() {
        this.instruction_pointer++;
        var address = util.hex2Dec(this.readBytesAtIP(2));

        if ((this.compare & 1) == 1) {
            this.instruction_pointer = address + this.start_addr;
        } else {
            this.instruction_pointer += 2;
        }
    };

    Processor.prototype.handleJNE = function() {
        this.instruction_pointer++;
        var address = util.hex2Dec(this.readBytesAtIP(2));

        if ((this.compare & 2) == 2) {
            this.instruction_pointer = address + this.start_addr;
        } else {
            this.instruction_pointer += 2;
        }
    };

    Processor.prototype.handleJGT = function() {
        this.instruction_pointer++;
        var address = util.hex2Dec(this.readBytesAtIP(2));

        if ((this.compare & 8) == 8) {
            this.instruction_pointer = address + this.start_addr;
        } else {
            this.instruction_pointer += 2;
        }
    };

    Processor.prototype.handleJLT = function() {
        this.instruction_pointer++;
        var address = util.hex2Dec(this.readBytesAtIP(2));

        if ((this.compare & 4) == 4) {
            this.instruction_pointer = address + this.start_addr;
        } else {
            this.instruction_pointer += 2;
        }
    };

    Processor.prototype.handleINCA = function() {
        this.setReg('A', this.getReg('A') + 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleINCB = function() {
        this.setReg('B', this.getReg('B') + 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleINCX = function() {
        this.setReg('X', this.getReg('X') + 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleINCD = function() {
        this.setReg('D', this.getReg('D') + 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleINCY = function() {
        this.setReg('Y', this.getReg('Y') + 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleDECA = function() {
        this.setReg('A', this.getReg('A') - 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleDECB = function() {
        this.setReg('B', this.getReg('B') - 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleDECX = function() {
        this.setReg('X', this.getReg('X') - 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleDECY = function() {
        this.setReg('Y', this.getReg('Y') - 1);
        this.instruction_pointer++;
    };

    Processor.prototype.handleDECD = function() {
        this.setReg('D', this.getReg('D') - 1);
        this.instruction_pointer++;
    };

    return Processor;
});