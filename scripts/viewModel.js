/**
 * @fileOverview The main viewModel
 */
exports.ViewModel = ViewModel;

var sp = sp || getSpotifyApi(1);
var nsRepeater = sp.require('scripts/repeater');

// Missing ko utility?
// See http://groups.google.com/group/knockoutjs/browse_thread/thread/cbea28c3b6732e3a
ko.utils.stringStartsWith = function (string, startsWith) {         
    string = string || ""; 
    if (startsWith.length > string.length) 
        return false; 
    return string.substring(0, startsWith.length) === startsWith; 
};

ko.utils.arrayLast = function (array, predicate, predicateOwner) {
    for (var i = array.length - 1; i >= 0; i--)
        if (predicate.call(predicateOwner, array[i]))
            return array[i];
    return null;
};
    
/**
 * Creates the view model
 * @constructor
 */
function ViewModel() {
    this.albums = ko.observableArray([]);
    this.selectedIndex = ko.observable(-1);
    this.itemSize = ko.observable(300);  // TODO: this value is duplicated in the css (.item)!
    this.displayWidth = ko.observable(0);
    this.displayHeight = ko.observable(0);
    
    this.oldSelectedIndex = -1;

    /**
     * The current album
     */
    this.currentAlbum = ko.dependentObservable(function() {
        return this.albums()[this.selectedIndex()];
    }, this);

    /**
     * The name of the artist for the current album
     */
    this.currentArtist = ko.dependentObservable(function() {
        return this.currentAlbum() ? this.currentAlbum().artist() : "";
    }, this);
    
    /**
     * The name of the current album
     */
    this.currentAlbumName = ko.dependentObservable(function() {
        return this.currentAlbum() ? this.currentAlbum().name() : "";
    }, this);

    /**
     * The required width of the container to hold all of the albums...
     */
    this.requiredWidth = ko.dependentObservable(function() {
        return this.itemSize() * this.albums().length;
    }, this);
    
    /**
     * Scale the album list container based on the current display size
     */
    this.currentZoom = ko.dependentObservable(function() {
        var currentWidth = this.displayWidth();
        var currentHeight = this.displayHeight();
        
        if(currentHeight < 370) {
            return 0.5;
        }
        
        if(currentHeight < 475) {
            return 2/3;
        }
        
        if(currentWidth > 600) {
            return 1;
        }
        
        if(currentWidth > 400) {
            return 2/3;
        }
        
        return 0.5;
    }, this);

    /**
     * How far to move the container to show the currently selected album
     */
    this.currentPosition = ko.dependentObservable(function() {
        var itemWidth = this.itemSize();
        
        // Item spacing is itemWidth less the negative margin used
        // for pinching in the scaled items (100)...
        // TODO: Shame it's hard-coded here?
        var itemSpacing = itemWidth - 100;
        
        // Offset to keep the selected one centralised...
        var windowWidthUnzoomed = this.displayWidth() / this.currentZoom();
        var centeringOffset = (windowWidthUnzoomed - itemWidth)/2;
        
        return Math.round(-this.selectedIndex() * itemSpacing + centeringOffset);
    }, this);
    
    // 'Throttle' the number of updates to the item class names...
    // ...otherwise it spends all it's time in updateActiveContainer
    // and the UI never updates.
    var timeout = null;
    this.selectedIndex.subscribe(function(newValue) {
        var _this = this;
        if(timeout) {
            // There's a timer going. Stop it & restart it,
            // then don't do the update until it completes.
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                updateActiveContainer(newValue, _this);
                timeout = null;
            }, 50);
        } else {
            // There's no timer going. Do the update immediately
            // and start a timer.
            updateActiveContainer(newValue, _this);
            
            // Just reset the timer when it times out...don't do
            // the update again!
            timeout = setTimeout(function() {timeout = null;}, 50);
        }
    }, this);
}

/**
 * Move to the next album in the library
 */
ViewModel.prototype.nextAlbum = function() {
    // Make sure currentIndex is a number to prevent
    // string concatenation...
    // (...it can end up as a string if it gets set from the
    // slider - the value in the input element is a string!)
    var currentIndex = Number(this.selectedIndex());
    if(currentIndex < this.albums().length - 1) {
        this.selectedIndex(currentIndex + 1);
    }
};

/**
 * Move to the previous album in the library 
 */
ViewModel.prototype.previousAlbum = function() {
    var currentIndex = this.selectedIndex();
    if(currentIndex > 0) {
        this.selectedIndex(currentIndex - 1);
    }
};
        
/**
 * Move to the first album in the library 
 */
ViewModel.prototype.firstAlbum = function() {
    this.selectedIndex(0);
};

/**
 * Move to the last album in the library 
 */
ViewModel.prototype.lastAlbum = function() {
    this.selectedIndex(this.albums().length - 1);
};

ViewModel.prototype.previousAlbumRepeat = function() {
    var _this = this;
    var action = function() {
        _this.previousAlbum();
    };
    
    nsRepeater.start(action);
};

ViewModel.prototype.nextAlbumRepeat = function() {
    var _this = this;
    var action = function() {
        _this.nextAlbum();
    };
    
    nsRepeater.start(action);
};

ViewModel.prototype.cancelRepeat = function() {
    nsRepeater.stop();
};

/**
 * Move to an artist beginning with the given initial.
 * If the current artist begins with the given initial
 * then it will jump to the next artist with that initial.
 * If there is no next artist with the initial then it will
 * jump to the first artist with that initial.
 * @param initial The initial of the artist to jump to
 */
ViewModel.prototype.jumpToArtistByInitial = function(initial) {
    var currentArtist = this.currentArtist().sortable();
    var currentArtistStartsWithInitial = ko.utils.stringStartsWith(currentArtist.toUpperCase(), initial.toUpperCase());
    
    var foundAlbum = null;
    
    // The current artist starts with the given initial, so look for the next one
    // with the initial that comes AFTER the current artist...
    if(currentArtistStartsWithInitial === true) {
        foundAlbum = ko.utils.arrayFirst(this.albums(), function(album) {
            return ko.utils.stringStartsWith(album.artist().sortable().toUpperCase(), initial.toUpperCase())
                && album.artist().sortable().localeCompare(currentArtist) > 0;
        });
    }
    
    // Either nothing was found above or the current artist starts with a different initial...
    // ...either way, just look for the FIRST artist with the given initial.
    if(foundAlbum == null) {
        foundAlbum = ko.utils.arrayFirst(this.albums(), function(album) {
            return ko.utils.stringStartsWith(album.artist().sortable().toUpperCase(), initial.toUpperCase());
        });
    }
    
    if(foundAlbum != null) {
        this.selectedIndex(foundAlbum.index());
    }
};

/**
 * Move to the first album of the next artist in the library
 */
ViewModel.prototype.nextArtist = function() {
    var currentArtist = this.currentArtist().sortable();

    var foundAlbum = ko.utils.arrayFirst(this.albums(), function(album) {
        return album.artist().sortable().localeCompare(currentArtist) > 0;
    });
    
    if(foundAlbum != null) {
        this.selectedIndex(foundAlbum.index());
    }
};

/**
 * Move to the first album of the previous artist in the library
 */
ViewModel.prototype.previousArtist = function() {
    var currentArtist = this.currentArtist().sortable();

    var foundAlbum = ko.utils.arrayLast(this.albums(), function(album) {
        return album.artist().sortable().localeCompare(currentArtist) < 0;
    });
    
    if(foundAlbum != null) {
        // Found the 'last' album of the previous artist...
        // ...now need to find the 'first' album of that artist!
        foundAlbum = ko.utils.arrayFirst(this.albums(), function(album) {
            return album.artist().sortable().localeCompare(foundAlbum.artist().sortable()) == 0;
        });
        
        this.selectedIndex(foundAlbum.index());
    }
};

/**
 * Helper function: remove the active class from the previous selection
 * and add it to the new selected item
 * @param newValue The index of the newly selected item
 * @param viewModel
 */
function updateActiveContainer(newValue, viewModel) {
    var albumListItems = $('#albumList > li');
    
    if(viewModel.oldSelectedIndex >= 0 && viewModel.oldSelectedIndex < viewModel.albums().length) {
        albumListItems.eq(viewModel.oldSelectedIndex).removeClass('active');
    }

    if(newValue >= 0 && newValue < viewModel.albums().length) {
        albumListItems.eq(newValue).addClass('active');
        viewModel.oldSelectedIndex = newValue;
    }	
};