// Class to handle child process used for running FFmpeg

const child_process = require("child_process");
const { EventEmitter } = require("events");

const { createSdpText } = require("./sdp");
const { convertStringToStream } = require("./utils");

module.exports = class FFmpeg {
  constructor(rtpParameters) {
    this._rtpParameters = rtpParameters;
    this._process = undefined;
    this._observer = new EventEmitter();
    this._createProcess();
  }

  _createProcess() {
    const sdpString = createSdpText(this._rtpParameters);
    const sdpStream = convertStringToStream(sdpString);

    console.log("createProcess() [sdpString:%s]", sdpString);

    this._process = child_process.spawn("ffmpeg", this._commandArgs);

    if (this._process.stderr) {
      this._process.stderr.setEncoding("utf-8");

      this._process.stderr.on("data", (data) =>
        console.log("ffmpeg::process::data [data:%o]", data)
      );
    }

    if (this._process.stdout) {
      this._process.stdout.setEncoding("utf-8");

      this._process.stdout.on("data", (data) =>
        console.log("ffmpeg::process::data [data:%o]", data)
      );
    }

    this._process.on("message", (message) =>
      console.log("ffmpeg::process::message [message:%o]", message)
    );

    this._process.on("error", (error) =>
      console.error("ffmpeg::process::error [error:%o]", error)
    );

    this._process.once("close", () => {
      console.log("ffmpeg::process::close");
      this._observer.emit("process-close");
    });

    sdpStream.on("error", (error) =>
      console.error("sdpStream::error [error:%o]", error)
    );

    // Pipe sdp stream to the ffmpeg process
    sdpStream.resume();
    sdpStream.pipe(this._process.stdin);
  }

  kill() {
    console.log("kill() [pid:%d]", this._process.pid);
    this._process.kill("SIGINT");
  }

  get _commandArgs() {
    let commandArgs = [
      // "-y",
      "-hide_banner",
      "-analyzeduration",
      "2147483647",
      "-probesize",
      "2147483647",
      "-loglevel",
      "debug",
      "-protocol_whitelist",
      "pipe,udp,rtp",
      "-fflags",
      "+genpts",
      "-f",
      "sdp",
      "-i",
      "pipe:0",
    ];

    commandArgs = commandArgs.concat([
      "-vcodec",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-profile:v",
      "baseline",
      "-level",
      "3",
    ]);

    commandArgs = commandArgs.concat([
      "-f",
      "flv",
      "rtmp://live-lhr04.twitch.tv/app/live_473792002_z25hfXSegn5jhqRLDS7XZTq3SYz4OS",
    ]);

    console.log("commandArgs:%o", commandArgs);

    return commandArgs;
  }
};
