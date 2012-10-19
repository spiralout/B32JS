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


MAXINT_8BIT = 255;
MAXINT_16BIT = 65535;
OVERFLOW_8BIT = 256;
OVERFLOW_16BIT = 65536;

/**
 * B32 Assembler
 */
function Assembler() {
	this.labels = {};
	this.origin = 4096;
	this.bytecode_header = 'B32' + dec2Hex(this.origin, 2) + dec2Hex(this.origin, 2);
	this.bytecode = '';
}

Assembler.prototype.assemble = function(source_code) {
	this.parse(source_code, 1);
	this.parse(source_code, 2);

	return this.bytecode;
};

Assembler.prototype.parse = function(source_code, pass) {
	var source_lines = source_code.split(/\r\n|\r|\n/);
	this.bytecode = this.bytecode_header;	
	this.bytecode_length = 0;

	for (var i = 0; i < source_lines.length; i++) {		
		// scan for labels	
		if (/^\w+:/.test(source_lines[i]) && pass == 1) {
			var label = source_lines[i].match(/^\w+:/);
			this.labels[label[0].slice(0, -1)] = this.bytecode_length;
		}
		// scan for instructions
		else if (/^\s+\w/.test(source_lines[i])) {
			var mneumonics = source_lines[i].split(/\s+/).slice(1);

			switch (mneumonics[0].toUpperCase()) {
				case 'LDA':	 this.handleLDA(mneumonics, pass); break;
				case 'LDB':	 this.handleLDB(mneumonics, pass); break;
				case 'LDX':  this.handleLDX(mneumonics, pass); break;
				case 'LDY':  this.handleLDY(mneumonics, pass); break;
				case 'STA':  this.handleSTA(mneumonics, pass); break;
				case 'END':  this.handleEND(mneumonics, pass); break;
				case 'CMPA': this.handleCMPA(mneumonics, pass); break;				
				case 'CMPB': this.handleCMPB(mneumonics, pass); break;				
				case 'CMPX': this.handleCMPX(mneumonics, pass); break;				
				case 'CMPY': this.handleCMPY(mneumonics, pass); break;				
				case 'CMPD': this.handleCMPD(mneumonics, pass); break;				
				case 'JMP':  this.handleJMP(mneumonics, pass); break;
				case 'JEQ':  this.handleJEQ(mneumonics, pass); break;
				case 'JNE':  this.handleJNE(mneumonics, pass); break;
				case 'JGT':  this.handleJGT(mneumonics, pass); break;
				case 'JLT':  this.handleJLT(mneumonics, pass); break;
				case 'INCA': this.handleINCA(mneumonics, pass); break;
				case 'INCB': this.handleINCB(mneumonics, pass); break;
				case 'INCX': this.handleINCX(mneumonics, pass); break;
				case 'INCY': this.handleINCY(mneumonics, pass); break;
				case 'INCD': this.handleINCD(mneumonics, pass); break;
				case 'DECA': this.handleDECA(mneumonics, pass); break;
				case 'DECB': this.handleDECB(mneumonics, pass); break;
				case 'DECX': this.handleDECX(mneumonics, pass); break;
				case 'DECY': this.handleDECY(mneumonics, pass); break;
				case 'DECD': this.handleDECD(mneumonics, pass); break;

				default: console.log('Unrecognized instruction ' + mneumonics[0]);
			}
		}
	}
};

Assembler.prototype.handleLDA = function(mneumonics, pass) {
	this.bytecode_length += 2;

	if (pass == 2) {
		this.bytecode += '01' + getAsHex(mneumonics[1], 1);
	}
};

Assembler.prototype.handleLDB = function(mneumonics, pass) {
	this.bytecode_length += 2;

	if (pass == 2) {
		this.bytecode += '22' + getAsHex(mneumonics[1], 1);
	}
};

Assembler.prototype.handleLDX = function(mneumonics, pass) {
	this.bytecode_length += 3;

	if (pass == 2) {
		this.bytecode += '02' + getAsHex(mneumonics[1], 2);
	}
};

Assembler.prototype.handleLDY = function(mneumonics, pass) {
	this.bytecode_length += 3;

	if (pass == 2) {
		this.bytecode += '23' + getAsHex(mneumonics[1], 2);
	}
};

Assembler.prototype.handleSTA = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		switch (mneumonics[1].toUpperCase()) {
			case ',X': reg_opcode = '03'; break;
			default: reg_opcode = dec2Hex(0);
		}

		this.bytecode += reg_opcode;
	}
};

Assembler.prototype.handleEND = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '04';
	}
};

Assembler.prototype.handleCMPA = function(mneumonics, pass) {
	this.bytecode_length += 2;
	var value = getAsHex(mneumonics[1], 1);

	if (pass == 2) {
		this.bytecode += '05' + value;
	}
};

Assembler.prototype.handleCMPB = function(mneumonics, pass) {
	this.bytecode_length += 2;
	var value = getAsHex(mneumonics[1], 1);

	if (pass == 2) {
		this.bytecode += '06' + value;
	}
};

Assembler.prototype.handleCMPX = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var value = getAsHex(mneumonics[1], 2);

	if (pass == 2) {
		this.bytecode += '07' + value;
	}
};

Assembler.prototype.handleCMPY = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var value = getAsHex(mneumonics[1], 2);

	if (pass == 2) {
		this.bytecode += '08' + value;
	}
};


Assembler.prototype.handleCMPD = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var value = getAsHex(mneumonics[1], 2);

	if (pass == 2) {
		this.bytecode += '09' + value;
	}
};


Assembler.prototype.handleJMP = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var label = mneumonics[1].substr(1);

	if (pass == 2) {
		if (this.labels[label] == undefined) {
			console.log('Undefined label ' + label);
		} else {
			this.bytecode += '0A' + dec2Hex(this.labels[label], 2);
		}
	}
};

Assembler.prototype.handleJEQ = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var label = mneumonics[1].substr(1);

	if (pass == 2) {
		if (this.labels[label] == undefined) {
			console.log('Undefined label ' + label);
		} else {
			this.bytecode += '0B' + dec2Hex(this.labels[label], 2);
		}
	}
};

Assembler.prototype.handleJNE = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var label = mneumonics[1].substr(1);

	if (pass == 2) {
		if (this.labels[label] == undefined) {
			console.log('Undefined label ' + label);
		} else {
			this.bytecode += '0C' + dec2Hex(this.labels[label], 2);
		}
	}
};

Assembler.prototype.handleJGT = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var label = mneumonics[1].substr(1);

	if (pass == 2) {
		if (this.labels[label] == undefined) {
			console.log('Undefined label ' + label);
		} else {
			this.bytecode += '0D' + dec2Hex(this.labels[label], 2);
		}
	}
};

Assembler.prototype.handleJLT = function(mneumonics, pass) {
	this.bytecode_length += 3;
	var label = mneumonics[1].substr(1);

	if (pass == 2) {
		if (this.labels[label] == undefined) {
			console.log('Undefined label ' + label);
		} else {
			this.bytecode += '0E' + dec2Hex(this.labels[label], 2);
		}
	}
};

Assembler.prototype.handleINCA = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '0F';
	}
};


Assembler.prototype.handleINCB = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '10';
	}
};

Assembler.prototype.handleINCX = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '11';
	}
};

Assembler.prototype.handleINCY = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '12';
	}
};

Assembler.prototype.handleINCD = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '13';
	}
};

Assembler.prototype.handleDECA = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '14';
	}
};


Assembler.prototype.handleDECB = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '15';
	}
};

Assembler.prototype.handleDECX = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '16';
	}
};

Assembler.prototype.handleDECY = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '17';
	}
};

Assembler.prototype.handleDECD = function(mneumonics, pass) {
	this.bytecode_length += 1;

	if (pass == 2) {
		this.bytecode += '18';
	}
};



/**
 * Virtual 16 color screen 
 */
function Screen(width, height, memory_start) {
	this.width = width;
	this.height = height;
	this.screen_size = width * height;
	this.memory_start = memory_start;
	this.memory_size = this.screen_size * 2;
	this.memory = [];
	this.init();
}

Screen.prototype.init = function() {
	for (var i = 0; i < this.memory_size; i += 2) {
		this.memory[i] = 32;
		this.memory[i + 1] = 7;
	}
};

Screen.prototype.poke = function(address, value) {
	if (this.memory[address - this.memory_start] != undefined) {
		this.memory[address - this.memory_start] = value;
	}

	this.refresh();
};

Screen.prototype.attach = function(callback) {
	this.refresh_callback = callback;
};

Screen.prototype.refresh = function() {
	var lines = [];
	var line = 0;

	for (var i = 0; i < this.memory.length; i += 2) {
		if (lines[line] == undefined) {
			lines[line] = '';
		}

		lines[line] += String.fromCharCode(this.memory[i]);

		if (lines[line].length == this.width) {
			line += 1;
		}
	}

	this.refresh_callback(lines);
};



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

	this.start_addr = hex2Dec(bytecode.substr(3, 4));
	this.exec_addr = hex2Dec(bytecode.substr(7, 4));

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

	    case '06': // CMPB
	    	this.instruction_pointer++;
	    	var value = hex2Dec(this.readBytesAtIP(1));
	    	this.setCompare(this.getReg('B'), value);
			this.instruction_pointer++;
	    	break;

	    case '07': // CMPX
	    	this.instruction_pointer++;
	    	var value = hex2Dec(this.readBytesAtIP(2));
	    	this.setCompare(this.getReg('X'), value);
			this.instruction_pointer += 2;
	    	break;

	    case '08': // CMPY
	    	this.instruction_pointer++;
	    	var value = hex2Dec(this.readBytesAtIP(2));
	    	this.setCompare(this.getReg('Y'), value);
			this.instruction_pointer += 2;
	    	break;

	    case '09': // CMPD
	    	this.instruction_pointer++;
	    	var value = hex2Dec(this.readBytesAtIP(2));
	    	this.setCompare(this.getReg('D'), value);
			this.instruction_pointer += 2;
	    	break;

	    case '0A': // JMP
	    	this.instruction_pointer++;
	    	var address = hex2Dec(this.readBytesAtIP(2));
	    	this.instruction_pointer = address + this.start_addr;
	    	break;

	    case '0B': // JEQ
	    	this.instruction_pointer++;
	    	var address = hex2Dec(this.readBytesAtIP(2));

			if ((this.compare & 1) == 1) {
				this.instruction_pointer = address + this.start_addr;
			} else {
				this.instruction_pointer += 2;
			}

			break;

	    case '0C': // JNE
	    	this.instruction_pointer++;
	    	var address = hex2Dec(this.readBytesAtIP(2));

			if ((this.compare & 2) == 2) {
				this.instruction_pointer = address + this.start_addr;
			} else {
				this.instruction_pointer += 2;
			}
			
			break;

	    case '0D': // JGT
	    	this.instruction_pointer++;
	    	var address = hex2Dec(this.readBytesAtIP(2));

			if ((this.compare & 8) == 8) {
				this.instruction_pointer = address + this.start_addr;
			} else {
				this.instruction_pointer += 2;
			}
			
			break;

		case '0E': // JLT
	    	this.instruction_pointer++;
	    	var address = hex2Dec(this.readBytesAtIP(2));

			if ((this.compare & 4) == 4) {
				this.instruction_pointer = address + this.start_addr;
			} else {
				this.instruction_pointer += 2;
			}
			
			break;

		case '0F': // INCA
			this.setReg('A', this.getReg('A') + 1);
			this.instruction_pointer++;
			break;

		case '10': // INCB
			this.setReg('B', this.getReg('B') + 1);
			this.instruction_pointer++;
			break;

		case '11': // INCX
			this.setReg('X', this.getReg('X') + 1);
			this.instruction_pointer++;
			break;

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
	this.setReg('A', hex2Dec(this.readBytesAtIP(1)));
	this.instruction_pointer++;
};

Processor.prototype.handleLDB = function() {
	this.instruction_pointer++;
	this.setReg('B', hex2Dec(this.readBytesAtIP(1)));
	this.instruction_pointer++;
};

Processor.prototype.handleLDX = function() {
	this.instruction_pointer++;
	this.setReg('X', hex2Dec(this.readBytesAtIP(2)));
	this.instruction_pointer += 2;	
};

Processor.prototype.handleLDY = function() {
	this.instruction_pointer++;
	this.setReg('Y', hex2Dec(this.readBytesAtIP(2)));
	this.instruction_pointer += 2;	
};

Processor.prototype.handleSTAX = function() {
	this.instruction_pointer++;
	this.poke(this.getReg('X'), this.getReg('A'));
};

Processor.prototype.handleCMPA = function() {
	this.instruction_pointer++;
	var value = hex2Dec(this.readBytesAtIP(1));
	this.setCompare(this.getReg('A'), value);
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



/**
 * B32 Computer
 */
function B32Computer() {
	this.screen = new Screen(80, 25, 40960);
	this.processor = new Processor(64 * 1024, 1);
	this.processor.mapMemory(40960, 40960 + (80 * 25 * 2), this.screen);
	this.running = false;
}

B32Computer.prototype.init = function() {
	if (!this.running) {
		this.processor.init();
		this.screen.init();
	}
};

B32Computer.prototype.load = function(bytecode) {
	if (!this.running) {
		return this.processor.load(bytecode);
	}

	return true;
};

B32Computer.prototype.run = function() {
	this.running = true;
	this.processor.execute(false);
	this.running = false;
};

B32Computer.prototype.step = function() {
	this.running = true;
	this.processor.execute(true);
};

B32Computer.prototype.stop = function() {
	this.processor.stop = true;
};


function getAsHex(value, bytes) {
	// is hex
	if (/^#\$\w+/.test(value)) {
		return value.substr(2);
	// is decimal
	} else if (/^#\d+/.test(value)) {
		return dec2Hex(parseInt(value.substr(1)), bytes);
	} else {
		return NULL;
	}
}

function dec2Hex(decimal, bytes) {
	if (arguments.length == 2) {
		return zeroFill(decimal.toString(16).toUpperCase(), bytes * 2);
	} else {
		return decimal.toString(16).toUpperCase();
	}
}

function hex2Dec(hex) {
	return parseInt(hex.replace('$', ''), 16);
}

function zeroFill(number, width) {
	width -= number.toString().length;

	if (width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	} else {
		return number + '';
	}
}