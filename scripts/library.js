/**
 * @fileOverview Main entry point for the application
 */
exports.init = init;

var sp = sp || getSpotifyApi(1);
var nsViewModel = sp.require('scripts/viewModel');
var nsAlbum = sp.require('scripts/album');

/**
 * String utility function used for sorting and comparing
 * artist names
 * @returns the string with any leading a, an, or the
 * removed
 */
String.prototype.sortable = function() {
    return this.replace(/^a |an |the /i, '');
};

function init() {
    setUpCustomBindings();
    
    var viewModel = initViewModel();

    // Pass on window size changes to the viewModel...
    // ...this way layout dependent on window size can be
    // re-calculated in dependentObservables.
    $(window).bind("resize", onResize);
    function onResize() {
        viewModel.displayWidth($(window).width());
        viewModel.displayHeight($(window).height());
    }

    onResize(); // so the viewModel gets the initial window size
    setUpKeyHandler(viewModel);
    setUpMouseHandler(viewModel);

    // Listen to the trackPlayer state changes to update play state
    // of the albums in the viewModel...
    sp.trackPlayer.addEventListener("playerStateChanged", function (event) {
        if (event.data.playstate === true) {
            updateViewModelFromPlayState(viewModel);
        }
    });
}

function setUpCustomBindings() {
    // A custom binding for binding the max value in a range type input
    ko.bindingHandlers.rangeMax = {
        update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
            element.setAttribute("max", valueAccessor());
        }
    };
}

function initViewModel() {
    // Set up the view model...
    var viewModel = new nsViewModel.ViewModel();

    // Add all the albums in the library to the view model...
    addAlbums(viewModel);

    ko.applyBindings(viewModel);
    updateViewModelFromPlayState(viewModel);

    // Start with the first album selected
    viewModel.selectedIndex(0);
    
    return viewModel;
}

function setUpKeyHandler(viewModel) {
    document.onkeydown = function(event) {
        switch(event.keyCode)
        {
            case 39: // Right Arrow
                if(event.shiftKey === true) {
                    viewModel.nextArtist();
                } else {
                    viewModel.nextAlbum();
                }
                break;
            
            case 37: // Left Arrow
                if(event.shiftKey === true) {
                    viewModel.previousArtist();
                } else {
                    viewModel.previousAlbum();
                }
                break;
            
            case 36: // Home
                viewModel.firstAlbum();
                break;
            
            case 35: // End
                viewModel.lastAlbum();
                break;
            
            default:
                viewModel.jumpToArtistByInitial(String.fromCharCode(event.keyCode));
        }
    };
}

function setUpMouseHandler(viewModel) {
    document.onmousewheel = function(event) {
        if(event.wheelDelta < 0) {
            viewModel.previousAlbum();
        } else {
            viewModel.nextAlbum();
        }
    };
}

function updateViewModelFromPlayState(viewModel) {
    var current = sp.trackPlayer.getNowPlayingTrack();
    var isPlaying = sp.trackPlayer.getIsPlaying();
    
    ko.utils.arrayForEach(viewModel.albums(), function(item) {
        item.updatePlayState(current, isPlaying);
    });
}

function addAlbums(viewModel) {
    
    // Get all the albums in the user's library, sorted by artist
    var albums = sp.core.library.getAlbums();
    albums.sort(function(a,b) {
        return a.artist.name.sortable().localeCompare(b.artist.name.sortable());
    });
    
    ko.utils.arrayForEach(albums, function(item) {
        // Only add the items that have a uri
        // (in other words, local albums are not included for now)
        if(item.uri) {
            var observableAlbum = new nsAlbum.Album(item);
            viewModel.albums.push(observableAlbum);
            
            // An album is aware of its index in the array so it can get
            // scaled (etc?) appropriately!
            observableAlbum.index = ko.dependentObservable(function() {
                    return viewModel.albums.indexOf(observableAlbum);
                });
        }
    });
}