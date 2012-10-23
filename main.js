require.config({
    paths: {
        jquery: "http://code.jquery.com/jquery.min"
    }
});

require(['jquery', 'B32/Assembler', 'B32/B32Computer'], function($, Assembler, B32Computer) {
     var computer = new B32Computer();

    computer.screen.attach(function(data) {
        $('#output').html(data.join('<BR>'));
    });

    computer.processor.attachRegisters(function(registers) {
        $('#register_a').html(registers['A']);
        $('#register_b').html(registers['B']);
        $('#register_d').html(registers['D']);
        $('#register_x').html(registers['X']);
        $('#register_y').html(registers['Y']);
        $('#register_cmp').html(registers['CMP']);
        $('#register_ip').html(registers['IP']);
        $('#register_of').html(registers['OF']);
        $('#register_cy').html(registers['CY']);
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