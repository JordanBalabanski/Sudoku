import { setup, manageBoard, reset, solve, validate, undo, redo } from './setup.js';

$(function() {
    setup();
    manageBoard('random');

    $('#new-game').click(function(e) {
        let hasCLass = $('#new-game').hasClass("activate");
        if(hasCLass){
            $('#new-game').removeClass("activate");
            $('#new-game').addClass("deactivate");
            $('#choose-diff').removeClass("collapse");
            $('#choose-diff').addClass("collapsed");
        } else {
            $('#new-game').removeClass("deactivate");
            $('#new-game').addClass("activate");
            $('#choose-diff').removeClass("collapsed");
            $('#choose-diff').addClass("collapse");
        }
    })

    $('#easy').click(function() {
        manageBoard('easy');
    });

    $('#medium').click(function() {
        manageBoard('medium');
    });

    $('#hard').click(function() {
        manageBoard('hard');
    });

    $('#random').click(function() {
        manageBoard('random');
    });

    $('#validate').click(function() {
        validate();
    })

    $('#reset').click(function() {
        reset();
    });

    $('#solve').click(function() {
        solve();
    });

    $('#undo').click(function() {
        undo();
    });

    $('#redo').click(function() {
        redo();
    });
    
})
