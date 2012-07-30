/**
 * @fileOverview Represents an album in the user's library
 * Takes an album from the Spotify Apps API, converts its
 * properties to ko.observables and adds some functions for
 * playing/pausing the album, etc.
 */
exports.Album = Album;

var sp = sp || getSpotifyApi(1);

// The image to use for albums that don't get a cover from the API
var defaultAlbumImage = "../images/album.png";

var PlayStates = {
		NONE: 0,
		PLAYING: 1,
		PAUSED: 2
	};

/**
 * Create a new Album from a Spotify Apps API object
 * @constructor
 * @param spotifyAlbum The album object from the API
 */
function Album(spotifyAlbum) {
	this.uri = ko.observable(spotifyAlbum.uri || "#");
	this.cover = ko.observable(spotifyAlbum.cover || defaultAlbumImage);
	this.artist = ko.observable(spotifyAlbum.artist.name || "&lt;unknown artist&gt;");
	this.name = ko.observable(spotifyAlbum.name || "&lt;unknown album&gt;");
	this.playState = ko.observable(PlayStates.NONE);
	
	/**
	 * The CSS class for the album's play button, dependent on the
	 * play state of the album.
	 */
	this.playButtonClass = ko.dependentObservable(function() {
		switch(this.playState())
		{
			case PlayStates.NONE:
				return "playButton play";
				break;
				
			case PlayStates.PLAYING:
				return "playButton pause";
				break;
				
			case PlayStates.PAUSED:
				return "playButton resume";
				break;
		};
	}, this);
}

/**
 * Play, pause or resume the album, based on its current play state.
 */
Album.prototype.playPause = function() {
	switch(this.playState())
	{
		case PlayStates.NONE:
			sp.trackPlayer.playTrackFromUri(this.uri(), { onSuccess: function() {}, onFailure: function() {}, onComplete: function() {} });
			break;
			
		case PlayStates.PLAYING:
			sp.trackPlayer.setIsPlaying(false);
			break;
			
		case PlayStates.PAUSED:
			sp.trackPlayer.setIsPlaying(true);
			break;
	};
};

/**
 * Update the play state of this album.
 * Usually in response to a sp.trackPlayer.playerStateChanged
 * @param current The track now playing (null if none playing) 
 * @param isPlaying True if the current track is playing, false if paused.
 */
Album.prototype.updatePlayState = function(current, isPlaying) {
	if(current && (current.track.album.uri === this.uri())) {
		this.playState(isPlaying === true ? PlayStates.PLAYING : PlayStates.PAUSED);
	} else {
		this.playState(PlayStates.NONE);
	}
};


