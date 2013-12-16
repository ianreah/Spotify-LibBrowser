describe("Album model", function () {
    it("should set name when constructed from a spotify album", function () {
        var mockSpotifyAlbum = {			
            artist: "Led Zeppelin",
            cover: "spotify:image:c89be3d95870abb652c16deef6e3d3e5174710ff",
            name: "Led Zeppelin IV",
            uri: "spotify:album:1Ugdi2OTxKopVVqsprp5pb"
        };
        
        var album = new Album(mockSpotifyAlbum);
        expect(album.name()).toBe("Led Zeppelin IV");
    });
});