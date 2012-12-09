/*
* animasi.js
* @ TODO :
* - Benerin bug di pengumuman kasir
* - Bikin sistem multichanel (skrg masih ngaco multichanelnya :P)
*   @Next konsep multichanel, mungkin ada 1 step untuk menunggu sebelum masuk ke kasir
* */
var jmlAntrian = 0;
var generateUser = true; // false, jika tombol tambah user diklik
$(function(){
    Animasi.Reset(true);
    //Animasi.setMultiChanel();
    $('#mulai').click(function(){
        var jmlTamu = $('#jml-tamu').val();
        if(jmlTamu > 0){
            jmlAntrian = jmlTamu;

            if(generateUser){
                console.log(111);
                Animasi.Reset(false);
                var counterID = jmlTamu;
                for(var i=1; i<=jmlTamu; i++){
                    var user = Animasi.getUser();
                    var userID = counterID--;
                    var html = '<div class="box-wait" id="w'+ userID +'"><div class="user">' +
                    '<img class="active_user" src="img/'+user+'" alt=""><span>'+ userID +'</span>' +
                    '</div></div>';

                    if(i == 1) $('#tunggu').empty();

                    $('#tunggu').append(html);
                }
            }

            Animasi.majuPertama(true);
        } else {
            alert("Jumlah tamu harus lebih besar dari NOL!");
        }
    });

    $('#reset').click(function(){
        Animasi.Reset(true);
    });

    var firstClick = true;
    $('#plus').click(function(){
        jmlAntrian++;
        var user = Animasi.getUser();
        var userID = jmlAntrian;
        var html = '<div class="box-wait" id="w'+ userID +'"><div class="user">' +
        '<img class="active_user" src="img/'+user+'" alt=""><span>'+ userID +'</span>' +
        '</div></div>';

        if(firstClick){
            $('#tunggu').empty();
            firstClick = false;
        }
        $('#tunggu').prepend(html);
        $('#jml-tamu').val(jmlAntrian);
        generateUser = false;
    });
});

// Class Animasi, @using Js Module Pattern style
var Animasi = (function () {

    var kasir1 = false;
    var kasir2 = false;
    var kasir3 = false;
    var posisi = 1;
    var step = 1;
    var interval;
    var tmpImg = null;
    var multiChanel = false;

    function Mulai(){
        interval = setInterval (fillBox, 500);//Reload 1 detik
    }

    function Goooo(firsttime){
        var last = $('#tunggu').find('.box-wait:last');
        var chanelA = $('#chanelA').find('.active_user').length > 0 ? false : true;
        var chanelB = $('#chanelB').find('.active_user').length > 0 ? false : true;

        if(!multiChanel){
            /// single chanel
            if(chanelA){
                if(firsttime){
                    last.find('.user').clone().appendTo('#chanelA .box-way:first');
                    Mulai();
                } else {
                    $('#chanelA .box-way:first').empty();
                    last.find('.user').clone().appendTo('#chanelA .box-way:first');
                }
                last.remove();
            } else {
        //alert("Jalan penuh");
        }
        } else {
            /// multi chanel
            if(chanelA){ // chanel A Kosong
                if(firstTime){
                    last.find('.user').clone().appendTo('#chanelA .box-way:first');
                    Mulai();
                } else {
                    $('#chanelA .box-way:first').empty();
                    last.find('.user').clone().appendTo('#chanelA .box-way:first');
                }
                last.remove();

            } else if(chanelB){ // chanel B Kosong
                if(firstTime){
                    last.find('.user').clone().appendTo('#chanelB .box-way:first');
                    Mulai();
                } else {
                    $('#chanelB .box-way:first').empty();
                    last.find('.user').clone().appendTo('#chanelB .box-way:first');
                }
                last.remove();

            } else if(!chanelA && !chanelB){ // chanel A & B Kosong :(
        //alert("semua jalan penuh");
        }

        }
    }
    function fillBox(){
        if(apakahMasihAdaTamu()){
            posisi++;
            pindahPindah();
            if(posisi > 3){
                getKasir(false);
                posisi = 1;
            }
        } else {
            step++;
            pindahPindah();
            getKasir(true);
        }
    }

    function pindahPindah(){
        if(!multiChanel){
            var img = $('#chanelA .box-way').find('.user');
        } else {
            var img = $('#chanelB .box-way').find('.user');
        }
        //var img = $('.box-way').find('.user');
        var parent = img.parent();
        var nextDiv = parent.next().attr('class') == undefined ? false : true;
        if(nextDiv) {
            parent.next().append(img);
        } else {
            $('.box-way:first').append(img);
        }
        parent.empty();
    }

    function getKasir(cekStep){

        if(!cekStep){
            keKasir();
            Animasi.majuPertama(false);
        } else {
            if(step > 3){
                keKasir();
                clearInterval(interval);
                $('.box-way').empty();
            }
        }
    }

    function keKasir(){
        var img = $('.box-way').find('.user');
        var kasirA = $('#kasirA');
        var kasirB = $('#kasirB');
        var kasirC = $('#kasirC');

        if(kasirA.find('.user').length == 0){
            $('#kasirA').empty();
            $('#kasirA').append(img);
            kasir1 = true;
            setBorder('#kasirA');
            layani('#kasirA');
        //emptyKasirB();
        } else if(kasirB.find('.user').length == 0) {
            $('#kasirB').empty();
            $('#kasirB').append(img);
            kasir2 = true;
            setBorder('#kasirB');
            layani('#kasirB');
        //emptyKasirC();
        } else if(kasirC.find('.user').length == 0) {
            $('#kasirC').empty();
            $('#kasirC').append(img);
            kasir3 = true;
            setBorder('#kasirC');
            layani('#kasirC');
        //emptyKasirA();
        }
        pengumuman();
    }

    function layani(id){
        var time = get_random_nomor();
        if(multiChanel) time = time/2;

        var timeID = $('#time'+ ucfirst(id.replace('#','')));

        var timeLabel = (time / 1000) + "&nbsp;menit";
        timeID.html(timeLabel);
        setTimeout(function(){
            var user = $(id).find('.user').clone();
            keluar(user);
            $(id).empty();
            timeID.empty();
        }, get_random_nomor());
    }

    function keluar(user){

        if($('#pintu1').find('.user').length == 0){ //pintu 1 kosong
            $('#pintu1').append(user);
            setTimeout(function(){
                $('#pintu1').empty();
            },1000);
        } else if($('#pintu2').find('.user').length == 0) { //pintu 2 kosong
            $('#pintu2').append(user);
            setTimeout(function(){
                $('#pintu2').empty();
            },1000);
        }
        pengumuman();

        //cek apakah tamu terakhir yg dilayani kasir ?
        if(parseInt($('.box-kasir').find('.active_user').length)-1 == 0){
            //iya tamu terakhir
            generateUser = true;
        }
        console.log(generateUser);
    }

    function pengumuman(){
        if($('#kasirA').children().length == 0 && $('#kasirB').children().length == 0){
            $('#pengumuman').html('<span>Kasir A & B Kosong</span>');
        } else if($('#kasirA').children().length == 0 && $('#kasirC').children().length == 0){
            $('#pengumuman').html('<span>Kasir A & C Kosong</span>');
        } else if($('#kasirB').children().length == 0 && $('#kasirC').children().length == 0){
            $('#pengumuman').html('<span>Kasir B & C Kosong</span>');
        } else if($('#kasirA').children().length > 0 && $('#kasirB').children().length > 0 && $('#kasirC').children().length > 0){
            $('#pengumuman').html('<span>Semua Kasir Penuh</span>');
        } else if($('#kasirA').children().length == 0 && $('#kasirB').children().length == 0 && $('#kasirC').children().length == 0){
            $('#pengumuman').html('<span>Semua Kasir Kosong</span>');
        } else if($('#kasirA').children().length == 0){
            $('#pengumuman').html('<span>Kasir A Kosong</span>');
        }
        else if($('#kasirC').children().length == 0){
            $('#pengumuman').html('<span>Kasir C Kosong</span>');
        } else if($('#kasirB').children().length == 0){
            $('#pengumuman').html('<span>Kasir B Kosong</span>');
        }

    }

    function apakahMasihAdaTamu(){
        if($('#tunggu').find('.box-wait').length > 0) return true;
        return false;
    }

    function setBorder(id){
        $(id).css({
            'border' : '1px solid',
            'borderColor' : get_random_color()
        });
    }

    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    function get_random_nomor()
    {
        var min = 5000;
        var max = 7000;
        return Math.floor(Math.random() * (max - min) + min);
    }

    function ucfirst(string)
    {
        return string[0].toUpperCase() + string.slice(1);
    }

    //public
    return {
        setSingleChanel : function(){
            multiChanel = false;
        },
        setMultiChanel : function(){
            multiChanel = true;
        },

        getUser : function(){
            var users = ["user.png", "user2.png", "user3.png", "user4.png"];
            return users[Math.floor(Math.random() * users.length)];
        },

        majuPertama : function(firstTime){
            Goooo(firstTime);
        },

        //Reset
        Reset : function(resetCounter){
            kasir1 = false;
            kasir2 = false;
            kasir3 = false;
            posisi = 1;
            step = 1;
            clearInterval(interval);
            tmpImg = null;
            $('.box-kasir').empty();
            generateUser = true;
            if(resetCounter) $('#jml-tamu').val(0);
        }

    }
})();