var socket = io();

$('#start').on("change mousemove", function() {
    var x = $(this).val() - 0;
    $("#start_holder").html(x);
    socket.emit('fromControl', $(this).val());
});
$('#end').on("change mousemove", function() {
    var x = $(this).val() - 0;
    $("#end_holder").html(x);
});

$('#pos_x').on("change mousemove", function() {
    var x = ($(this).val() - 50) / 10;
    $("#pos_x_holder").html(x);
    socket.emit('fromControl', { t: "px", v: x });
});
$('#pos_y').on("change mousemove", function() {
    var x = ($(this).val() - 50) / 10;
    $("#pos_y_holder").html(x);
    socket.emit('fromControl', { t: "py", v: x });
});
$('#pos_z').on("change mousemove", function() {
    var x = ($(this).val() - 50) / 10;
    $("#pos_z_holder").html(x);
    socket.emit('fromControl', { t: "pz", v: x });
});

$('#ori_x').on("change mousemove", function() {
    var x = ($(this).val() - 50) * 1.8 / 2;
    $("#ori_x_holder").html(x);
    socket.emit('fromControl', { t: "ox", v: x });
});
$('#ori_y').on("change mousemove", function() {
    var x = ($(this).val() - 50) * 1.8 / 2;
    $("#ori_y_holder").html(x);
    socket.emit('fromControl', { t: "oy", v: x });
});
$('#ori_z').on("change mousemove", function() {
    var x = ($(this).val() - 50) * 1.8 / 2;
    $("#ori_z_holder").html(x);
    socket.emit('fromControl', { t: "oz", v: x });
});