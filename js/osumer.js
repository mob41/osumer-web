$(document).ready(function () {
    $(".info-download,.info-release").click(function () {
        window.open("https://github.com/mob41/osumer/releases/latest");
    });
});

$(window).resize(function () {
    adjustInfoMargin();
});

function about() {
    $(".modal-header").html("<h5 class=\"modal-title\" id=\"modalLabel\">About</h5><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>");
    $(".modal-body").html("<p>osumer2 is an application that allows osu! players download and search beatmaps conveniently. This website allows users to search for any beatmaps that is cached by all osumer clients previously.</p><p>You might not be able to find some beatmaps in this website because some of them might not be already cached and uploaded by our clients.</p>");
    $(".modal-footer").html("<button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>");
    $(".modal").modal();
}