class Quality {
    static lowest = new Quality("lowest");
    static highest = new Quality("highest");

    constructor(quality){
        this.quality = quality;
    }
};

class VideoQualityLabel {
    static p144 = new VideoQualityLabel("144p");
    static p240 = new VideoQualityLabel("240p");
    static p360 = new VideoQualityLabel("360p");
    static p480 = new VideoQualityLabel("480p");
    static p720 = new VideoQualityLabel("720p");
    static p1080 = new VideoQualityLabel("1080p");
    static p1440 = new VideoQualityLabel("1440p");
    static p2160 = new VideoQualityLabel("2160p");
    static p4320 = new VideoQualityLabel("4320p");

    constructor(label){
        this.label = label;
    }
};

class AudioFormat {
    static aac = new AudioFormat("aac");
    static mp3 = new AudioFormat("mp3");
    static any = new AudioFormat("any");

    constructor(format){
        this.format = format;
    }
};

class VideoFormat {
    static webm = new VideoFormat("webm");
    static mp4 = new VideoFormat("mp4");
    static any = new VideoFormat("any");


    constructor(format){
        this.format = format;
    }
};

module.exports = { Quality, VideoQualityLabel, AudioFormat, VideoFormat }
