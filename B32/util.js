define(function() {

    function getAsHex(value, bytes) {
        // is hex
        if (/^#\$\w+/.test(value)) {
            return zeroFill(value.substr(2), bytes * 2);
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


    return {
        dec2Hex: dec2Hex,
        getAsHex: getAsHex,
        hex2Dec: hex2Dec
    };
});