define(function() {

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

    return Screen;
});