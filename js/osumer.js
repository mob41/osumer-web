var endpoint = "https://api.osumer.ml/query";

var results = [];
var currentPage = 1;
var totalPages = -1;

$(document).ready(function () {
    adjustMapListMargin();
    processHash();
    search();
});

$(window).resize(function () {
    adjustMapListMargin();
});

$(window).on("hashchange", function () {
    processHash();
});

$("#keywords").keypress(function (e) {
    if (e.which === 13) {
        search();
        return false;
    }
});

$("#search-btn").on("click", function () {
    search();
});

function processHash() {
    var mep = getParameter("ep");
    if (mep) {
        endpoint = mep;
    }
}

function makeQuery(keywords = false, filters = false, page = 1) {
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
        },
        error: function () {
            alert("Error query");
        }
    });
}

function updateUi() {
    var html;
    $(".map-list").html("");
    for (var result of results) {
        html =
            "<div class=\"col-sm-2\">" +
            "    <div class=\"card bg-dark text-white beatmap-card\">" +
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
            "    <\/div>" +
            "<\/div>";
        $(".map-list").append(html);
    }

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
    makeQuery($("#keywords").val(), false, page);
}

function getParameter(parameterName) {
    var result = null,
        tmp = [];
    location.hash
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function adjustMapListMargin() {
    $(".map-list").css("margin-top", $(".header").height());
    $(".map-list").css("margin-bottom", $(".footer").height());
}