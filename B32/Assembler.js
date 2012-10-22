define(['B32/util'], function(util) {

    /**
     * B32 Assembler
     */
    function Assembler() {
        this.labels = {};
        this.origin = 4096;
        this.bytecode_header = 'B32' + util.dec2Hex(this.origin, 2) + util.dec2Hex(this.origin, 2);
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
                    case 'LDA':  this.handleLDA(mneumonics, pass); break;
                    case 'LDB':  this.handleLDB(mneumonics, pass); break;
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
            this.bytecode += '01' + util.getAsHex(mneumonics[1], 1);
        }
    };

    Assembler.prototype.handleLDB = function(mneumonics, pass) {
        this.bytecode_length += 2;

        if (pass == 2) {
            this.bytecode += '22' + util.getAsHex(mneumonics[1], 1);
        }
    };

    Assembler.prototype.handleLDX = function(mneumonics, pass) {
        this.bytecode_length += 3;

        if (pass == 2) {
            this.bytecode += '02' + util.getAsHex(mneumonics[1], 2);
        }
    };

    Assembler.prototype.handleLDY = function(mneumonics, pass) {
        this.bytecode_length += 3;

        if (pass == 2) {
            this.bytecode += '23' + util.getAsHex(mneumonics[1], 2);
        }
    };

    Assembler.prototype.handleSTA = function(mneumonics, pass) {
        this.bytecode_length += 1;

        if (pass == 2) {
            switch (mneumonics[1].toUpperCase()) {
                case ',X': reg_opcode = '03'; break;
                default: reg_opcode = util.dec2Hex(0);
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
        var value = util.etAsHex(mneumonics[1], 1);

        if (pass == 2) {
            this.bytecode += '05' + value;
        }
    };

    Assembler.prototype.handleCMPB = function(mneumonics, pass) {
        this.bytecode_length += 2;
        var value = util.getAsHex(mneumonics[1], 1);

        if (pass == 2) {
            this.bytecode += '06' + value;
        }
    };

    Assembler.prototype.handleCMPX = function(mneumonics, pass) {
        this.bytecode_length += 3;
        var value = util.getAsHex(mneumonics[1], 2);

        if (pass == 2) {
            this.bytecode += '07' + value;
        }
    };

    Assembler.prototype.handleCMPY = function(mneumonics, pass) {
        this.bytecode_length += 3;
        var value = util.getAsHex(mneumonics[1], 2);

        if (pass == 2) {
            this.bytecode += '08' + value;
        }
    };


    Assembler.prototype.handleCMPD = function(mneumonics, pass) {
        this.bytecode_length += 3;
        var value = util.getAsHex(mneumonics[1], 2);

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
                this.bytecode += '0A' + util.dec2Hex(this.labels[label], 2);
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
                this.bytecode += '0B' + util.dec2Hex(this.labels[label], 2);
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
                this.bytecode += '0C' + util.dec2Hex(this.labels[label], 2);
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
                this.bytecode += '0D' + util.dec2Hex(this.labels[label], 2);
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
                this.bytecode += '0E' + util.dec2Hex(this.labels[label], 2);
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

    return Assembler;

});