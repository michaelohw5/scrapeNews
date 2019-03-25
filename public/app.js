$(document).ready(function () {

    // getting scrape articles by hitting the /scrape route
    function scrapeArticles() {
        console.log("New Articles being scrapped..");
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).then(function (data) {
            displayArticles()
        })
    }

    // display articles scrapped by function above
    function displayArticles() {
        console.log("Displaying the Articles..")
        $.getJSON("/articles", function (data) {
            for (let i = 0; i < data.length; i++) {
                const artID = data[i]._id;
                const artTitle = data[i].title;
                const artLink = data[i].link;
                const artSumm = data[i].summary

                $("#articles").append(
                    `<div class="row content-box" data-id='${artID}'>
                    <div class="col-md-8 offset-md-2">
                        <p class="content-title" data-id="${artID}">${artTitle}</p>
                        <p class="content-body">${artSumm}</p>
                        <a class="btn btn-outline-primary" href="${artLink}" role="button" id="linkbtn">Link</a>
                        <button class="btn btn-outline-primary" id="notebtn" data-id="${artID}">Note</button>
                    </div>
                </div>`)
            }
        })
    }

    function deleteArticles() {
        $.ajax({
            method: "DELETE",
            url: "/remove"
        }).then(function (data) {
            console.log("ARTICLES REMOVED");
            $("#articles").empty();
        })
    }

    $(document).on("click", "#scrapebtn", function () {
        $("#articles").empty();
        deleteArticles();
        scrapeArticles();
    });

    $(document).on("click", "#deletebtn", function () {
        deleteArticles();
    })

    $(document).on("click", "#notebtn", function () {
        var thisId = $(this).attr("data-id");
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        }).then(function (data) {
            console.log(data);
            $("#noteModal").modal("show");
            $(".modal-title").empty().append(data.title)
            $('#savebtn').attr('data-id', data._id)

            // Catch previous note
            if (data.note) {
                $(".modal-title").val(data.note.title);
                $("#bodyinput").val(data.note.body);
            }
        })
    })

    // MODAL SAVE NOTE
    $(document).on("click", "#savebtn", function () {
        console.log("Saving")
        var thisId = $(this).attr("data-id");
        console.log(thisId)
        $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                body: $("#bodyinput").val()
            }
        })
            .then(function (data) {
                console.log(data);
            });
        // Clear values and hide modal
        $("#bodyinput").val("");
        $('#noteModal').modal('hide');
    });
})



// $.getJSON("/articles", function (data) {
//     // For each one
//     for (var i = 0; i < data.length; i++) {
//         // Display scraped articles on the page
//         console.log("getting json " + i)

//         $("#articles").append(`
//         <div class=<p data-id='${data[i]._id}'>${data[i].title}<br/>${data[i].summary}<br/>
//         <a class="btn btn-outline-primary href=${data[i].link} role="button">Link</a></p>`);
//     }
// });