/*
 * ===============================================================
 * animasi.js (multi chanel support) :D
 * @ Revisi	: Perbaikan Label menit & penamaan fungsi2
 * @ TODO	:
 * 	- Benerin bug di pengumuman kasir
 * @ AUTHOR	: Tajhul Faijin Aliyudin 2012
 * ===============================================================
 * */
var jmlAntrian = 0;
var generateUser = true; // false, jika tombol tambah user diklik
$(function(){
    Animasi.Reset(true);
    Animasi.setMultiChanel();
    Animasi.setPerbandinganWaktuA( $('#speedA').val() );
    Animasi.setPerbandinganWaktuB( $('#speedB').val() );

    $('#mulai').click(function(){
        var jmlTamu = $('#jml-tamu').val();
        if(jmlTamu > 0){
            jmlAntrian = jmlTamu;
            if(generateUser){
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

            Animasi.Initializer();
        } else {
            alert("Jumlah tamu harus lebih besar dari NOL!");
            $('#jml-tamu').css({
                border : "1px solid red"
            });
            $('#jml-tamu').focus();
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

    var kasir1,kasir2,kasir3 = false;
    var posisiA, posisiB = 1;
    var stepA, stepB = 1;
    var intervalA, intervalB;
    var tmpImg = null;
    var multiChanel = false;
    var jumlahTamu = 0; // counter jumlah tamu yg ada diruang tunggu
    //untuk parameter perbandingan speed intervalA & intervalB
    var waktuA = 1;
    var waktuB = 1;

    // Fungsi Inisialiasi
    // untuk mendeteksi jumlah tamu & mendeteksi metode (single / multi) chanel
    function Inisialiasi(){
        jumlahTamu = $('#tunggu').find('.active_user').length;

        var last = $('#tunggu').find('.box-wait:last');

        //cek apakah ada lebih dari 1 org diruang tunggu
        if(multiChanel){
            if(jumlahTamu > 1){
                last.find('.user').clone()
                .appendTo('#chanelA .box-way:first');

                var last2 = last.prev();
                last2.find('.user').clone()
                .appendTo('#chanelB .box-way:first');

                last.remove();
                last2.remove();
                StartAnimasi();
            } else {
                last.find('.user').clone()
                .appendTo('#chanelA .box-way:first');
                last.remove();
                StartAnimasi();
            }
        }
    }

    // Jalankan Animasi dgn interval
    function StartAnimasi(){

        // mengatur perbandingan speed antara intervalA & intervalA
        // default waktu = 1000 ~ 1 detik dlm javascript/ real-nya
        // default perbandingan 1:1 => 1000:1000 (speed sama)
        var speedA = 1000/waktuA;
        var speedB = 1000/waktuB
        //console.log(speedA);
        intervalA = setInterval (ChanelA, speedA);//Reload 1 detik

        // intervalB hanya dijalakan dlm mode multi chanel & tamu-nya lebih dari 1 Orang
        if(multiChanel && jumlahTamu > 1){
            intervalB = setInterval (ChanelB, speedB);//Reload 1 detik
        }
    }

    // Fungsi untuk memanggil satu orang tamu dari ruang tunggu
    // dan ditunjukan dia harus masuk jalur/jalan/lorong/ chanel mana hehe :D
    function panggilSatu(){

        var last = $('#tunggu').find('.box-wait:last');

        //cek jalur mana yg kosong, jika dua2nya kosong, dahulukan jalur A
        var jalurAkosong = $('#chanelA').find('.active_user').length == 0 ? true : false;
        var jalurBkosong = $('#chanelB').find('.active_user').length == 0 ? true : false;
        if(jalurAkosong){
            console.log("Ke A");
            last.find('.user').clone().appendTo('#chanelA .box-way:first');
        } else if(jalurBkosong){
            console.log("Ke B");
            last.find('.user').clone().appendTo('#chanelB .box-way:first');
        }
        last.remove();
    }

    function ChanelA(){
        var chanelID = 'chanelA';
        stepA++;
        var img = Berjalan(chanelID);
        pintuMasuk(img);
    }

    function ChanelB(){
        var chanelID = 'chanelB';
        stepB++;
        var img = Berjalan(chanelID);
        pintuMasuk(img);
    }

    // fungsi untuk mengatur pergerakan user(org) didalam jalur/ lorong/ chanel :P
    // @return user data
    function Berjalan(chanelID){
        var img = $('#'+chanelID+' .box-way').find('.user');

        var parent = img.parent();
        var nextDiv = parent.next().attr('class') == undefined ? false : true;
        if(nextDiv) {
            parent.next().append(img);
        } else {
            $('#'+chanelID+' .box-way:first').append(img);
        }
        parent.empty();
        return img;
    }

    // Pintu masuk ke kasir & disini diatur queue antrian & prioritasnua
    // Prioritas utama adalah tamu dari jalurA / chanelA
    function pintuMasuk(img){
        if(stepA > 3){
            //console.log("A DULU"+ stepA);
            keKasir(img);
            panggilSatu();
            stepA = 1;
            if(!apakahMasihAdaTamu() && !apakahMasihAdaYgDilorong('chanelA')){
                clearInterval(intervalA);
            }
        } else if(stepB > 3){
            //console.log("B DULU");
            keKasir(img);
            panggilSatu();
            stepB = 1;
            if(!apakahMasihAdaTamu() && !apakahMasihAdaYgDilorong('chanelB')){
                clearInterval(intervalB);
            }
        }
    }

    // FUngsi ini mungkin kedepannya dibuang :D
    function getKasir(cekStep, img){

        if(!cekStep){
            keKasir(img);
            Animasi.Initializer();
        } else {
            if(stepA > 3){
                keKasir(img);
                clearInterval(intervalA);
                $('#chanelA .box-way').empty();
            }
            if(stepB > 3){
                keKasir(img);
                clearInterval(intervalB);
                $('#chanelB .box-way').empty();
            }

        }
    }

    // Fungsi untuk menunjukan user harus ke kasir mana
    function keKasir(img){
        //console.log(img.html());
        //var img = $('.box-way').find('.user');
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

    // fungsi untuk melayani user oleh kasir
    function layani(id){
        var time = get_random_nomor();
        //if(multiChanel) time = time/2;

        var timeID = $('#time'+ ucfirst(id.replace('#','')));

        var timeLabel = (time / 1000).toFixed(1) + "&nbsp;menit";
        timeID.html(timeLabel);
        setTimeout(function(){
            var user = $(id).find('.user').clone();
            keluar(user);
            $(id).empty();
            timeID.empty();
        }, get_random_nomor());
    }

    // fungsi keluar dari bank :D
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

    // fungsi menampilkan pengumuman kasir
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

    // fungsi untuk mengecek tamu di ruang tunggu
    function apakahMasihAdaTamu(){
        if($('#tunggu').find('.box-wait').length > 0) return true;
        return false;
    }

    // fungsi untuk mengecek tamu di lorong / jalan / chanel
    function apakahMasihAdaYgDilorong(chanelID){
        if($('#'+chanelID).find('.active_user').length > 0) return true;
        return false;
    }

    // ~ HELPER Saja :-)
    function setBorder(id){
        $(id).css({
            'border' : '1px solid',
            'borderColor' : get_random_color()
        });
    }

    // Fungsi untuk generate random hexadecimal color
    function get_random_color() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }

    // Fungsi untuk generate random number
    function get_random_nomor()
    {
        var min = 5000;
        var max = 7000;
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Fungsi untuk membuat karakter pertama Uppercase
    function ucfirst(string)
    {
        return string[0].toUpperCase() + string.slice(1);
    }
    // ~ End HELPER

    //public
    return {
        setSingleChanel : function(){
            multiChanel = false;
        },
        setMultiChanel : function(){
            multiChanel = true;
        },
        setPerbandinganWaktuA : function(value){
            waktuA = value;
        },
        setPerbandinganWaktuB : function(value){
            waktuB = value;
        },
        getUser : function(){
            var users = ["user.png", "user2.png", "user3.png", "user4.png"];
            return users[Math.floor(Math.random() * users.length)];
        },

        Initializer : function(){
            Inisialiasi();
        },

        //Reset
        Reset : function(resetCounter){
            kasir1 = false;
            kasir2 = false;
            kasir3 = false;
            posisiA = 1;
            stepA = 1;
            clearInterval(intervalA);
            tmpImg = null;
            $('.box-kasir').empty();
            generateUser = true;
            if(resetCounter) $('#jml-tamu').val(0);
        }

    }
})(Animasi);