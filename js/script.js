(function($) {
	var url = location.protocol + '//' + location.hostname + ':8080';
	var socket = io.connect(url);
						  // http://127.0.0.1:8080/socket.io/socket.io.js
						  // http://127.0.0.1:8080/socket.io/socket.io.js
    $(document).keypress(function(e) {
        $($("#clavier button")[e.keyCode - 48]).trigger("click")
    })
    /********************/
    /* BOUTON BROADCAST */
    /********************/

     $("#clavier button").click(function(e) {
         e.preventDefault();
         socket.emit('polyphonic-pouic', {'sound': $(this).data("sound")});
         return false;
     });

    /********************/
    /* BOUTON CIBLE */
    /********************/

//    $(".user").droppable({
//        accept: "#gallery > li",
//        activeClass: "ui-state-highlight",
//        drop: function(event, ui) {
//            alert(ui.draggable);
//        }
//    });

    /* boutons du clavier */
    $("#clavier button").draggable({
        distance: 30,
        cancel: "a.ui-icon", // clicking an icon won't initiate dragging
        revert: "invalid", // when not dropped, the item will revert back to its initial position
        containment: "document",
        helper: "clone"
    });



    /***************************/
    /* CHARGé D'EMMETRE LE SON */
    /***************************/

    socket.on('do-pouic', function(data) {
        $("#speaker").append('<audio src="/media/' + data.sound + '" autoplay controls></audio>');
        $("#speaker").hide(100).show(100).hide(100).show(100);
    });

    /*********************************/
    /* GESTION DE L'AUTHENTIFICATION */
    /*********************************/

    $("#loginform").submit(function(e) {
        e.preventDefault();
        /**
         * Lors de la connexion j'emet un signale pour le serveur
         * conetnant les propriétés de l'utilisateur qui se connecte.
         */
        socket.emit("login", {
            username: $('#username').val(),
            avatar: $('#avatar').val()
        });
    })

    /**
     * Le serveur m'informe que je suis bien connectÃ©, je supprime le formulaire
     * de connexion.
     */
    socket.on('logged', function() {
        $("#login").fadeOut();
        $(".modal").fadeOut();
        
    });

    /*************************/
    /* GESTION DES CONNECTES */
    /*************************/

    /**
     * Lorsque le serveur prend en compte un nouvel utilisateur
     * il informe tout le monde de l'arrivÃ©e du nouveau.
     **/
    socket.on('newuser', function(user) {
	console.log(user)
        $("#users")
                .append(
                        $('<div class="user"  alt="qsd" height="150" width="150"></div>')
                        .droppable({
                            accept: "#clavier button",
                            hoverClass: "highlight-user",
                            drop: function(event, ui) {
                                $(event.target).hide(100).show(100).hide(100).show(100);
                                socket.emit("targeted-pouic", {
                                    sid: $(event.target).data('sid'),
                                    sound: ui.draggable.data("sound")
                                });
                            }
                        })
                        .attr("id", "avatar-" + user.id)
                        .text(user.id)
                        .data("sid", user.sid)
						.css({
							backgroundImage:'url("' + user.avatar + '")',
							backgroundSize:'100%'
						})
                        .hide()
                        .fadeIn()
                        )
                ;
    });

    /**
     * Un utiisateur s'en va, le serveur informe tout le monde de la dÃ©connexion.
     * Je supprime l'utilisatur dÃ©connectÃ© de ma liste d'avatars.
     */
    socket.on('disuser', function(user) {
        $("#avatar-" + user.id).remove();
    });
})(jQuery);
