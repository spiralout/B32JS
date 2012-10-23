require.config({
    paths: {
        jquery: "http://code.jquery.com/jquery.min"
    }
});

require(['jquery', 'B32/Assembler', 'B32/B32Computer', 'B32/util'], function($, Assembler, B32Computer, util) {
     var computer = new B32Computer();

    computer.screen.attach(function(data) {
        $('#output').html(data.join('<BR>'));
    });

    computer.processor.attachRegisters(function(registers) {
        $('#register_a').html('$' + util.dec2Hex(registers['A'], 1));
        $('#register_b').html('$' + util.dec2Hex(registers['B'], 1));
        $('#register_d').html('$' + util.dec2Hex(registers['D'], 2));
        $('#register_x').html('$' + util.dec2Hex(registers['X'], 2));
        $('#register_y').html('$' + util.dec2Hex(registers['Y'], 2));
        $('#register_cmp').html('$' + util.dec2Hex(registers['CMP'], 1));
        $('#register_ip').html('$' + util.dec2Hex(registers['IP'], 2));
        $('#register_of').html('$' + util.dec2Hex(registers['OF'], 1));
        $('#register_cy').html('$' + util.dec2Hex(registers['CY'], 1));
    });


    $('#run_bytecode').click(function(event) {
        computer.init();

        if (computer.load($('#bytecode').val())) {
            computer.run(); 
        } else {
            alert('Invalid bytecode!');
        }               
    });

    $('#stop_bytecode').click(function(event) {
        computer.stop();
    });

    $('#run_assembler').click(function(event) {
        var assembler = new Assembler();
        var bytecode = assembler.assemble($('#assembler').val());
        $('#bytecode').val(bytecode);
    });
});