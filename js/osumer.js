var endpoint = "https://api.osumer.ml/query";

var results = [];
var currentPage = 1;
var totalPages = -1;
var audioPreview;
var paras = {};

var beatmapAudioPreviewFunc = function () {
    var pause = $(this).hasClass("fa-pause");

    pausePreview();
    resetPreviewIcons();

    if (!pause) {
        playPreview($(this).parent().parent().attr("song-id"));
        $(this).addClass("fa-pause");
        $(this).removeClass("fa-play");
    }
};

$(document).ready(function () {
    adjustMapListMargin();
    processUrl();
});

$(window).resize(function () {
    adjustMapListMargin();
});

$(".view-song-footer .col-sm-3").on("click", function () {
    var id = paras["id"];
    var action = $(this).attr("song-action");
    if (action === "download") {
        if (!window["osuForumLoggedIn"]) {
            $(".modal-header").html("<h5 class=\"modal-title\" id=\"modalLabel\">Downloading from osu! forum</h5><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>");
            $(".modal-body").html("Please confirm you have logged into osu! forum properly. Otherwise, you will not be able to download directly with this link.");
            $(".modal-footer").html("<button type=\"button\" class=\"btn btn-success\" onclick=\"window['osuForumLoggedIn'] = true; window.open('https://osu.ppy.sh/beatmapsets/" + id + "/download')\" data-dismiss=\"modal\">Confirm</button> <button type=\"button\" class=\"btn btn-warning\" onclick=\"window.open('https://osu.ppy.sh/')\">Login right now</button> <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>");
            $(".modal").modal({ backdrop: 'static', keyboard: false });
        } else {
            window.open("https://osu.ppy.sh/beatmapsets/" + id + "/download");
        }
    } else if (action === "queue") {
        $(".modal-header").html("<h5 class=\"modal-title\" id=\"modalLabel\">Not implemented</h5><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>");
        $(".modal-body").html("This will be soon available when osumer 2.0.1 released, that implements WebSockets in the application to allow external connections.");
        $(".modal-footer").html("<button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>");
        $(".modal").modal();
    } else if (action === "osud") {
        if (!window["osuDirectAvailable"]) {
            $(".modal-header").html("<h5 class=\"modal-title\" id=\"modalLabel\">Download using osu!direct</h5><button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>");
            $(".modal-body").html("Please confirm you have subscribed osu!supporter, or properly set up osumer2 as default browser to use this feature. Otherwise, you will be automatically redirected back to the beatmap page instead.");
            $(".modal-footer").html("<button type=\"button\" class=\"btn btn-success\" onclick=\"window['osuDirectAvailable'] = true; window.location = 'osu://dl/" + id + "'\" data-dismiss=\"modal\">Confirm</button> <button type=\"button\" class=\"btn btn-warning\" onclick=\"window.open('https://osu.ppy.sh/home/support')\">Subscribe</button> <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button>");
            $(".modal").modal({ backdrop: 'static', keyboard: false });
        } else {
            window.location = "osu://dl/" + id;
        }
    } else if (action === "page") {
        window.open("https://osu.ppy.sh/s/" + id);
    }
});

function adjustMapListMargin() {
    var hh = $(".header").height();
    var fh = $(".footer").height();
    var vsfh = $(".view-song-footer").height();
    $(".map-list").css("margin-top", hh);
    $(".map-list").css("margin-bottom", fh);
    $(".view-song").css("margin-top", hh);
    $(".view-song").css("height", $(window).height() - hh - vsfh);
    $(".loading-overlay").css("margin-top", hh);
}

function playPreview(id) {
    if (audioPreview) {
        audioPreview.pause();
    }
    audioPreview = new Audio("https://b.ppy.sh/preview/" + id + ".mp3");
    audioPreview.volume = 0;
    audioPreview.play();
    $(audioPreview).animate({ volume: 1 }, 500);
    audioPreview.onended = function () {
        resetPreviewIcons();
    };
}

function pausePreview() {
    if (audioPreview) {
        audioPreview.pause();
    }
}

function resetPreviewIcons() {
    var running = $(".beatmap-audio-preview.fa-pause");
    running.addClass("fa-play");
    running.removeClass("fa-pause");
}

function getSong(id) {
    for (var result of results) {
        if (result.id == id) {
            return result;
        }
    }
    return false;
}

function returnToSearch() {
    delete paras["id"];
    forwardUrl();

    $(".view-song-footer").fadeTo(500, 0);
    $(".view-song").fadeOut(500, function () {
        $(".view-song").html("");
    });
    $(".search-panel").fadeIn(500, function () {
        adjustMapListMargin();
        $(".map-list").fadeIn(250);
    });
    $(".footer").fadeIn(500);

}

function viewSong(id) {
    paras["id"] = id;
    forwardUrl();

    $(".search-panel").fadeOut(500);
    $(".map-list").fadeOut(500);
    $(".footer").fadeOut(500);

    $(".view-song").html("");

    var song = getSong(id);

    var html =
        "<div class=\"card view-song-card\" song-id=\"" + song.id + "\">" +
        "    <img src=\"https://assets.ppy.sh/beatmaps/" + song.id + "/covers/card.jpg\" class=\"card-img-top\" alt=\"" + song.title + "\">" +
        "    <div class=\"card-body\">" +
        "        <h5 class=\"card-title\">" + song.artist + " - " + song.title + "</h5>" +
        "        <p class=\"card-text\"><span class=\"result-map-tags\">";

    for (var tag of song.tags) {
        html += "<span class=\"badge badge-secondary\">" + tag + "</span> ";
    }

    html +=
        "</span><\/p>" +
        "    <\/div>" +
        "    <div class=\"view-song-toolbar\"><i class=\"view-song-back fas fa-arrow-left fa-2x\"></i> <i class=\"beatmap-audio-preview fas fa-play fa-2x\"></i></div>" +
        "<\/div>";
    $(".view-song").html(html);

    setTimeout(function () {
        adjustMapListMargin();
        $(".view-song").fadeTo(500, 1);
        $(".view-song-footer").fadeTo(500, 1);

        $(".view-song-toolbar .beatmap-audio-preview").on("click", beatmapAudioPreviewFunc);
        $(".view-song-toolbar .view-song-back").on("click", returnToSearch);
    }, 600);
}

$("#keywords").keypress(function (e) {
    if (e.which === 13) {
        search();
        return false;
    }
});

$("#search-btn").on("click", function () {
    search();
});

function processUrl() {
    var ps = location.search.substr(1).split("&");
    var values;
    for (var p of ps) {
        values = p.split("=");
        if (!values[0] || values[0] === "") {
            continue;
        }
        paras[values[0]] = decodeURIComponent(values[1]);
    }

    var mep = paras["ep"];
    if (mep) {
        endpoint = mep;
    }

    var keywords = paras["q"];
    var page = paras["p"];
    var id = paras["id"];
    if (keywords) {
        if (Number.isNaN(page)) {
            page = 1;
        }
        $("#keywords").val(keywords);

        var success = false;
        if (id) {
            success = function () {
                viewSong(paras["id"]);
            }
        }

        makeQuery(keywords, false, page, success);
    } else {
        search();
    }
}

function forwardUrl() {
    var queryStr = "";
    var i = 0;
    for (var key in paras) {
        if (i !== 0) {
            queryStr += "&";
        }
        queryStr += key + "=" + encodeURIComponent(paras[key]);
        i++;
    }
    window.history.pushState({}, "osumerWeb", window.location.origin + window.location.pathname + "?" + queryStr);
}

function makeQuery(keywords = false, filters = false, page = 1, success = false) {
    $(this).css("display", "block");
    $(".loading-overlay").fadeTo(500, 1);

    if (keywords && keywords !== "") {
        paras["q"] = keywords;
        paras["p"] = page;
        forwardUrl();
    }

    var queryStr = "?i=48&p=" + page;
    if (keywords) {
        queryStr += "&k=" + encodeURIComponent(keywords);
    }
    $.ajax({
        url: endpoint + queryStr,
        method: "GET",
        dataType: "json",
        headers: {
            "X-Requested-With": "osumerWeb/0.1"
        },
        success: function (data) {
            results = data.output;
            currentPage = data.currentPage;
            totalPages = data.totalPages;
            updateUi();
            $(".loading-overlay").fadeTo(500, 0, function () {
                $(this).css("display", "none");
            });
            if (success) {
                success();
            }
        },
        error: function (xhr, status, error) {
            $(".loading-overlay").fadeTo(500, 0, function () {
                $(this).css("display", "none");
            });
            $(".map-list").css("opacity", 0);
            $(".map-list").fadeTo(500, 1);
            var html =
                "<div class=\"card text-white bg-danger mb-3\" style=\"margin: 30px;\">" +
                "  <div class=\"card-header\"><i class=\"fas fa-times\"></i> Error</div>" +
                "  <div class=\"card-body\">" +
                "    <h5 class=\"card-title\">Connection Error</h5>" +
                "    <p class=\"card-text\">osumerWeb could not connect to target server. <br /><br /><b>Status Code:</b> " + xhr.status + " " + status + "<br /><b>Message:</b> " + error + "</p>" +
                "  </div>" +
                "</div>";
            $(".map-list").html(html);
            $(".map-list").addClass("justify-content-center");
        }
    });
}

function updateUi() {
    var html;
    $(".map-list").html("");
    for (var result of results) {
        html =
            "<div class=\"col-sm-2\">" +
            "    <div class=\"card bg-dark text-white beatmap-card\" song-id=\"" + result.id + "\">" +
            "        <img src=\"https://b.ppy.sh/thumb/" + result.id + "l.jpg\" class=\"card-img\" alt=\"" + result.title + "\">" +
            "        <div class=\"card-img-overlay\">" +
            "            <h5 class=\"card-title\">" + result.artist + " - " + result.title + "</h5>" +
            "            <p class=\"card-text\"><span class=\"result-map-tags\">";

        for (var tag of result.tags) {
            html += "<span class=\"badge badge-secondary\">" + tag + "</span> ";
        }

        html +=
            "</span><\/p>" +
            "        <\/div>" +
            "        <div class=\"beatmap-card-toolbar\"><i class=\"beatmap-audio-preview fas fa-play fa-lg\"></i></div>" +
            "    <\/div>" +
            "<\/div>";
        $(".map-list").append(html);
    }

    $("img").on("error", function () {
        $(this).attr("src", "https://via.placeholder.com/160x120");
    });

    $(".beatmap-card .card-img-overlay").on("click", function () {
        viewSong($(this).parent().attr("song-id"));
    });

    $(".beatmap-audio-preview").on("click", beatmapAudioPreviewFunc);

    $(".pagination").html("");

    var i;
    if (totalPages > 10) {
        if (currentPage > 8 && currentPage < totalPages - 8) {
            for (i = 1; i <= 3; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }

            $(".pagination").append("<li class=\"page-item disabled\"><a class=\"page-link\" href=\"#\" aria-disabled=\"true\">...</a></li>");

            for (i = currentPage - 2; i <= currentPage + 2; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }
        } else if (currentPage > totalPages - 9) {
            for (i = 1; i <= 3; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }
        } else {
            for (i = 1; i <= 10; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }
        }

        $(".pagination").append("<li class=\"page-item disabled\"><a class=\"page-link\" href=\"#\" aria-disabled=\"true\">...</a></li>");

        if (currentPage > totalPages - 9) {
            for (i = totalPages - 10; i <= totalPages; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }
        } else {
            for (i = totalPages - 2; i <= totalPages; i++) {
                $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
            }
        }
    } else {
        for (i = 1; i <= totalPages; i++) {
            $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">" + i + "</a></li>");
        }
    }

    $(".page-link").each(function () {
        var page = $(this).html();
        if (page == currentPage) {
            $(this).attr("aria-current", "page");
            $(this).parent().addClass("active");
        }
    });

    if (currentPage === 1) {
        $(".pagination").prepend("<li class=\"page-item disabled\"><a class=\"page-link\" href=\"#\" tabindex=\"-1\" aria-disabled=\"true\">Previous</a></li>");
    } else {
        $(".pagination").prepend("<li class=\"page-item\"><a class=\"page-link\" href=\"#\" tabindex=\"-1\">Previous</a></li>");
    }

    if (currentPage === totalPages) {
        $(".pagination").append("<li class=\"page-item disabled\"><a class=\"page-link\" href=\"#\" aria-disabled=\"true\">Next</a></li>");
    } else {
        $(".pagination").append("<li class=\"page-item\"><a class=\"page-link\" href=\"#\">Next</a></li>");
    }

    $(".page-link:not(.disabled)").on("click", function () {
        var page = $(this).html();
        if (page === "Previous") {
            page = currentPage - 1;
        } else if (page === "Next") {
            page = currentPage + 1;
        }
        search(page);
    });
}

function search(page = 1) {
    var keyword = $("#keywords");
    keyword.blur();
    makeQuery(keyword.val(), false, page);
}

function getParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}