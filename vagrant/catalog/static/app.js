$(function () {
        "use strict";

    var bindEvents = function () {
        $("#appetizer-section").click(function () {
            $("#appetizer-row").slideToggle();
            if ($("#appetizer-toggle").hasClass("fa-chevron-up")) {
                $("#appetizer-toggle").toggleClass("fa-chevron-up");
                $("#appetizer-toggle").toggleClass("fa-chevron-down");
            } else {
                $("#appetizer-toggle").toggleClass("fa-chevron-down");
                $("#appetizer-toggle").toggleClass("fa-chevron-up");
            }
        });
        $("#entree-section").click(function () {
            $("#entree-row").slideToggle();
            if ($("#entree-toggle").hasClass("fa-chevron-up")) {
                $("#entree-toggle").toggleClass("fa-chevron-up");
                $("#entree-toggle").toggleClass("fa-chevron-down");
            } else {
                $("#entree-toggle").toggleClass("fa-chevron-down");
                $("#entree-toggle").toggleClass("fa-chevron-up");
            }
        });
        $("#dessert-section").click(function () {
            $("#dessert-row").slideToggle();
            if ($("#dessert-toggle").hasClass("fa-chevron-up")) {
                $("#dessert-toggle").toggleClass("fa-chevron-up");
                $("#dessert-toggle").toggleClass("fa-chevron-down");
            } else {
                $("#dessert-toggle").toggleClass("fa-chevron-down");
                $("#dessert-toggle").toggleClass("fa-chevron-up");
            }
        });
        $("#beverage-section").click(function () {
            $("#beverage-row").slideToggle();
            if ($("#beverage-toggle").hasClass("fa-chevron-up")) {
                $("#beverage-toggle").toggleClass("fa-chevron-up");
                $("#beverage-toggle").toggleClass("fa-chevron-down");
            } else {
                $("#beverage-toggle").toggleClass("fa-chevron-down");
                $("#beverage-toggle").toggleClass("fa-chevron-up");
            }
        });
        $("#icon-sort").click(function () {
            sortListDir();
        });
    };

    var bindFormEvents = function () {

        var imageNode = $(".img_tn");
        var current;
        var imagesArr = [];
        var imgDefault = $('#img_tn_1').attr('src');
        var oldImage, oldIcon;


        // Grab the filenames and push it to an array.
        // We need to store an array of the images because a lot of the code for the manipulation of images is
        // client-side.
        imageNode.map(function (index, item) {
            if ($(this).attr('data-fn')) {
                imagesArr.push($(this).attr('data-fn'));
            }
        });

        // Set the current based on the form.
        if ($("#newRestForm").length) {
            current = 1;
        } else {
            // If this is edit restaurant, get the index of the selected img_thumbnail.
            current = $('.img_thumbnail.selected').attr('data-index');
        }

        // Set the action for the click on thumbnail.
        $(".img_thumbnail").click(function () {
            selectImage();
        });

        // Set the action for the click on delete icon.
        $(".i_delete").click(function (e) {
            if ($(e.target).hasClass('icon_show')) {
                deleteImg();
            }
        });

        // Set the action for the set button image selection.
        $(".btn-set").on("click", function () {
            console.log('Image has been set.');
            // Change the image on the form circle to be the selected image
            var newImg = $('#img_tn_' + current).attr('data-imgpath');
            // This gets set to the default image when deleted.
            if (!newImg) {
                newImg = $('#image_tn_1').attr('data-imgpath');

            }
            $('#rest_img').attr('src', '/static/' + newImg);

        });

        // Upload file change
        $("#upload").change(function (e) {
            var f = this.files[0];
            var sizeInMb = f.size / 1024;
            var sizeLimit = 1024 * 1;
            // If sise is larger than allowed size, alert an error and reset the file dialog.
            if (sizeInMb > sizeLimit) {
                alert('Sorry the file exceeds the maximum size of 1 MB!');
                $('#upload').val("");
            }
            else {
                // Check for duplicates based on filename.
                if (checkDuplicate(f.name)) {
                    $('#upload').val("");
                    alert("File is already uploaded!");
                } else {
                    // No duplicates found, let's hide the upload container.
                    $(".file_container").css("display", "none");
                    var formData = new FormData();
                    formData.append('image', f, f.name);
                    // Lets make the ajax call to upload the file.
                    $.ajax({
                        url: '/uploadImage',
                        data: formData,
                        processData: false,
                        contentType: false,
                        type: 'POST',
                        success: function (response) {
                            // Reset the upload divs
                            $('#upload').val("");
                            $('.file_container').css("display", "block");
                            var returnedData = JSON.parse(response);
                            if ('status' in returnedData && returnedData.status == "OK") {
                                // Grab the index of the new element
                                var idx = returnedData.index;
                                // Grab the path of the file
                                var path = returnedData.path;
                                var HTMLimage = '<li class="img_thumbnail selected" id="img_thumbnail_%data%" data-index=' +
                                    '"%data%" ><img id="img_tn_%data%" class="img_tn img_tn_ul" data-imgpath=' +
                                    '"%path%" data-index="%data%" src="" alt="img"></li>';
                                var formattedHTML = HTMLimage.replace(/%data%/g, idx).replace(/%path%/g, path);
                                // Add the image thumbnail node
                                $('.img_gallery').append(formattedHTML);
                                var node = $('.img_tn_ul').last();
                                var reader = new FileReader();
                                reader.readAsDataURL(f);
                                // Add click listener
                                $('#img_thumbnail_' + idx).click(function() {
                                    selectImage();
                                });

                                $("#btn-set").removeAttr("disabled");
                                $('#i_delete_' + idx).toggleClass('icon_show');
                                // Add the icon node
                                var HTMLicon = '<div class="icons_delete" id="icons_delete_%data%" data-index="%data%">' +
                                    '<i id="i_delete_%data%" data-index="%data%" data-tn="img_thumbnail_%data%" data-parent=' +
                                    '"icons_delete_%data%" class="fa fa-times-circle i_delete icon_show" aria-hidden=' +
                                    '"true"></i></div>';
                                var formattedIcon = HTMLicon.replace(/%data%/g, idx);
                                $('.image_container').append(formattedIcon);
                                // Add click listener
                                $('#i_delete_' + idx).click(function (e) {
                                    deleteImg();
                                });
                                // Set the value of #target to the idx of new uploaded image
                                $('#target').val(idx);
                                // Use the reader to load the image on the client.
                                reader.onloadend = function () {
                                    node.attr("src", reader.result);
                                    imagesArr.push(f);
                                    if (current != idx) {
                                        oldImage = $('#img_thumbnail_' + current);
                                        oldIcon = $('#i_delete_' + current);
                                        toggleElements(oldImage, oldIcon);
                                        // Toggling selected from previously selected.
                                        if (oldImage.hasClass('selected')) {
                                            oldImage.toggleClass('selected');
                                        }
                                        // Toggle icon_show from previously selected.
                                        if (oldIcon.hasClass('icon_show')) {
                                            oldIcon.toggleClass('icon_show');
                                        }
                                        // Set the new current.
                                        current = idx;
                                    }

                                    // Finally, check to see if we are at the max 5 images
                                    countImages();

                                };
                            }
                        },
                        error: function (error) {
                            console.log(error);
                        }
                    });

                }

            }
        });


        var checkDuplicate = function (filename) {
            if (imagesArr.indexOf(filename) == -1) {
                // No duplicates found.  Returning false.
                return false;
            }
            // Duplicate found. Return true.
            return true;
        };

        var countImages = function () {
            if (imagesArr.length) {
                if (imagesArr.length >= 5) {
                    $(".file_container").css('display', 'none');
                    $(".no_upload").css("display", "block");
                }
            }
        };

        var deleteImg = function () {
            //Grab the data-parent attribute which stores the ID of the parent
            var iconID = '#' + ($(event.target).attr("data-parent"));
            // Grab the index of the imagge
            var imgIndex = ($(event.target).attr("data-index"));
            // Grab the data-tn attribute which stores the ID of the img_thumbnail
            var imgID = '#' + ($(event.target).attr("data-tn"));
            var fn = ($(event.target).attr("data-fn"));
            var fullPath = ($(event.target).attr("data-imgpath"));
            // Grab the node objects
            var imgNode = $(imgID);
            var iNode = $(iconID);

            var data = {"image_index": imgIndex};
            // Make ajax call to delete image.
            $.ajax({
                url: '/deleteImage',
                contentType: 'application/json',
                data: JSON.stringify(data),
                dataType: 'json',
                type: 'POST',
                success: function (response) {
                    // Remove the image from the page
                    $(iNode).remove();
                    $(imgNode).remove();
                    var idx = imagesArr.indexOf(fn);
                    if (idx > -1) {
                        imagesArr.splice(idx, 1);
                    }
                    console.log('Images can be added');
                    $(".file_container").css("display", "block");
                    $(".no_upload").css("display", "none");
                    // Check to see if the circle ld image is the one just deleted.
                    // If so, then switch it back to default image
                    if (('#rest_img').src == fullPath || ('#rest_img').src == fn) {
                        // Set the circle to the default img
                        $('#rest_img').attr('src', imgDefault);
                        $("#btn-set").attr("disabled", "disabled");

                    }
                },
                error: function (error) {
                    console.log(error);
                    console.log("Error. Cannot Remove image from DOM.");
                }
            });
        };

        var selectImage = function () {
            var oldImage, oldIcon, newImage, newIcon;
            if ($(event.target).hasClass('img_thumbnail')) {
                // User clicks the thumbnail frame
                if ($(event.target).hasClass('selected')) {
                    // do nothing
                } else {
                    // Let's toggle the old selection
                    toggleOld(event.target);
                    $(event.target).toggleClass('selected');
                    // Assign el to the target's associated icon
                    var el = $('#i_delete_' + current);
                    // Check if there is an icon associated with the thumbnail
                    if (el.hasClass('i_delete')) {
                        el.toggleClass('icon_show');
                    }
                    $('#target').children().val('');
                    // Enabled the submit button
                    $("#btn-set").removeAttr("disabled");
                }
            }
            // User clicks the image. Happens most of the time
            else {
                if ($(event.target).parent().hasClass('selected')) {
                    // do nothing
                } else {
                    // Let's toggle the old selection
                    toggleOld(event.target);

                    newImage = $('#img_thumbnail_' + current);
                    newIcon = $('#i_delete_' + current);
                    //
                    toggleElements(newImage, 'selected', 1);
                    toggleElements(newIcon, 'icon_show', 1);

                    // Grab the filename and assign it to the target value.
                    var path = newImage.children().attr('data-index');
                    $('#target').val(path);

                    // Remove the disabled property from the button.
                    $("#btn-set").removeAttr("disabled");
                }
            }

        };

        var toggleElements = function (el, className, isNot) {
            if (isNot) {
                if (el.not(className)) {
                    el.toggleClass(className);
                }
            } else if (el.hasClass(className)) {
                el.toggleClass(className);
            }

        };


        var toggleOld = function(el) {
            oldImage = $('#img_thumbnail_' + current);
            oldIcon = $('#i_delete_' + current);

            toggleElements(oldImage, 'selected', 0);
            toggleElements(oldIcon, 'icon_show', 0);

            current = $(el).attr('data-index');

        };
        // Main execution
        // Start off by counting the images
        countImages();


    };


    bindEvents();
    // Check to see if this is the newRestForm or editForm.
    if (($("#editRestForm").length) || ($("#newRestForm").length)) {
        // If so, bind form events.
        bindFormEvents();
    }


});
