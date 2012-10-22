define(['B32/Screen', 'B32/Processor'], function(Screen, Processor) {

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

    return B32Computer;

});