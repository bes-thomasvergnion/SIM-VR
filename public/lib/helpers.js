

var readableDuration = (function() {

    // Each unit is an object with a suffix s and divisor d
    var units = [
        {s: '', d: 1}, // Seconds
        {s: ':', d: 60}, // Minutes
        {s: ':', d: 60}, // Hours
    ];

    // Closure function
    return function(t) {
        t = parseInt(t); // In order to use modulus
        var trunc, n = Math.abs(t), i, out = []; // out: list of strings to concat
        for (i = 0; i < units.length; i++) {
            n = Math.floor(n / units[i].d); // Total number of this unit
            // Truncate e.g. 26h to 2h using modulus with next unit divisor
            if (i+1 < units.length) // Tweak substr with two digits
                trunc = ('00'+ n % units[i+1].d).substr(-2, 2); // …if not final unit
            else
                trunc = n;
            out.unshift(''+ trunc + units[i].s); // Output
        }
        (t < 0) ? out.unshift('-') : null; // Handle negative durations
        return out.join('');
    };
})();   